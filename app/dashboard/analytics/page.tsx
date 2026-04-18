"use client";
// =============================================================================
// app/dashboard/analytics/page.tsx — Painel de Analytics
// =============================================================================
// Esta página mostra gráficos e estatísticas para o síndico.
// Usamos a biblioteca "recharts" para os gráficos — é a mais popular
// para React e é fácil de usar.
//
// Gráficos disponíveis:
//   - Receita mensal (barras)
//   - Taxa de adimplência (donut)
//   - Evolução de pagamentos (linha)
//   - Ocorrências por categoria (barras horizontais)
// =============================================================================

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { createClient } from "@/lib/supabase";
import { formatKz, formatMesRef } from "@/lib/utils";

// ── CORES DOS GRÁFICOS ────────────────────────────────────────────────────────
// Mantemos as cores do design system do Dikuiza nos gráficos

const CORES = {
  gold:   "#E8A030",
  terra:  "#C0522A",
  sage:   "#3D6B58",
  cream:  "#FAF7F2",
  muted:  "#706A61",
};

// ── TOOLTIP PERSONALIZADO ─────────────────────────────────────────────────────
// O tooltip é a caixa que aparece ao passar o rato num gráfico

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink-soft border border-gold/20 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-cream-dim mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-cream-mute">{p.name}:</span>
          <span className="text-cream font-bold">
            {typeof p.value === "number" && p.value > 1000 ? formatKz(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const supabase = createClient();
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(6); // meses a mostrar

  useEffect(() => {
    const carregar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("condominio_id, condominio:condominios(total_unidades, valor_quota)")
        .eq("id", user.id)
        .single();

      if (!perfil?.condominio_id) return;

      const condoId = perfil.condominio_id;

      // Busca dados dos últimos N meses
      const evolucao = [];
      for (let i = periodo - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mes = d.toISOString().substring(0, 7);

        const { data: pags } = await supabase
          .from("pagamentos")
          .select("status, valor")
          .eq("condominio_id", condoId)
          .eq("mes_referencia", mes);

        const pago     = (pags || []).filter(p => p.status === "pago").reduce((a, p) => a + p.valor, 0);
        const pendente = (pags || []).filter(p => p.status === "pendente").length;
        const atrasado = (pags || []).filter(p => p.status === "atrasado").length;

        evolucao.push({
          mes: formatMesRef(mes).substring(0, 3) + " " + mes.substring(2, 4),
          receita: pago,
          pendentes: pendente,
          atrasados: atrasado,
          pagos: (pags || []).filter(p => p.status === "pago").length,
        });
      }

      // Dados do mês actual para o donut
      const mesAtual = new Date().toISOString().substring(0, 7);
      const { data: pagsAtual } = await supabase
        .from("pagamentos")
        .select("status")
        .eq("condominio_id", condoId)
        .eq("mes_referencia", mesAtual);

      const totalUnidades = (perfil.condominio as any)?.total_unidades || 0;
      const pago = (pagsAtual || []).filter(p => p.status === "pago").length;
      const pendente = (pagsAtual || []).filter(p => p.status === "pendente").length;
      const atrasado = (pagsAtual || []).filter(p => p.status === "atrasado").length;
      const semRegisto = totalUnidades - pago - pendente - atrasado;

      const donutData = [
        { name: "Pago",         value: pago,       cor: CORES.sage  },
        { name: "Pendente",     value: pendente,    cor: CORES.gold  },
        { name: "Atrasado",     value: atrasado,    cor: CORES.terra },
        { name: "Sem Registo",  value: semRegisto > 0 ? semRegisto : 0, cor: "#2A2723" },
      ];

      // Ocorrências por categoria
      const { data: ocCats } = await supabase
        .from("ocorrencias")
        .select("categoria")
        .eq("condominio_id", condoId);

      const catCount: Record<string, number> = {};
      (ocCats || []).forEach(o => {
        const labels: Record<string, string> = {
          eletrico: "Eléctrico", hidraulico: "Hidráulico",
          estrutural: "Estrutural", limpeza: "Limpeza",
          seguranca: "Segurança", outro: "Outro"
        };
        const label = labels[o.categoria] || o.categoria;
        catCount[label] = (catCount[label] || 0) + 1;
      });

      const ocorrenciasCat = Object.entries(catCount)
        .map(([categoria, total]) => ({ categoria, total }))
        .sort((a, b) => b.total - a.total);

      setDados({ evolucao, donutData, ocorrenciasCat, totalUnidades, pago, pendente, atrasado });
      setLoading(false);
    };

    carregar();
  }, [periodo]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-ink-soft rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-ink-soft rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const taxaAdimplencia = dados.totalUnidades > 0
    ? Math.round((dados.pago / dados.totalUnidades) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">📊 Analytics</h1>
          <p className="text-cream-mute text-sm mt-1">Visão financeira e operacional do condomínio</p>
        </div>
        {/* Selector de período */}
        <div className="flex gap-2">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setPeriodo(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                periodo === m
                  ? "bg-gold text-ink font-bold"
                  : "bg-ink-soft border border-gold/10 text-cream-mute hover:border-gold/30 hover:text-cream"
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* KPIs de topo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Taxa de Adimplência", valor: `${taxaAdimplencia}%`, icon: "📊", cor: taxaAdimplencia >= 80 ? "text-sage-lite" : taxaAdimplencia >= 60 ? "text-gold" : "text-terra-lite" },
          { label: "Quotas Pagas", valor: `${dados.pago}`, icon: "✅", cor: "text-sage-lite" },
          { label: "Quotas Pendentes", valor: `${dados.pendente}`, icon: "⏳", cor: "text-gold" },
          { label: "Quotas Atrasadas", valor: `${dados.atrasado}`, icon: "⚠️", cor: "text-terra-lite" },
        ].map((k) => (
          <div key={k.label} className="bg-ink-soft border border-gold/10 rounded-2xl p-5">
            <div className="text-2xl mb-3">{k.icon}</div>
            <div className={`font-display text-3xl font-extrabold ${k.cor} mb-1`}>{k.valor}</div>
            <div className="text-xs text-cream-mute">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Gráficos linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de barras — Receita mensal */}
        <div className="lg:col-span-2 bg-ink-soft border border-gold/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-cream mb-6">Receita Mensal (Kz)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dados.evolucao} barSize={28}>
              {/* Grid subtil */}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,160,48,0.06)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: CORES.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: CORES.muted, fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="receita" name="Receita" fill={CORES.gold} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico donut — Distribuição do mês */}
        <div className="bg-ink-soft border border-gold/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-cream mb-2">Estado do Mês Actual</h2>
          <p className="text-cream-mute text-xs mb-6">{dados.totalUnidades} unidades no total</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={dados.donutData.filter((d: any) => d.value > 0)}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {dados.donutData.filter((d: any) => d.value > 0).map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda manual */}
          <div className="space-y-2 mt-2">
            {dados.donutData.filter((d: any) => d.value > 0).map((d: any) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.cor }} />
                  <span className="text-cream-mute">{d.name}</span>
                </div>
                <span className="text-cream font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos linha 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Linha — Evolução pagos vs atrasados */}
        <div className="bg-ink-soft border border-gold/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-cream mb-6">Evolução de Pagamentos</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dados.evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,160,48,0.06)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: CORES.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CORES.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: CORES.muted, fontSize: 11 }}>{v}</span>} />
              <Line type="monotone" dataKey="pagos"     name="Pagos"     stroke={CORES.sage}  strokeWidth={2} dot={{ fill: CORES.sage, r: 4 }} />
              <Line type="monotone" dataKey="pendentes" name="Pendentes" stroke={CORES.gold}  strokeWidth={2} dot={{ fill: CORES.gold, r: 4 }} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="atrasados" name="Atrasados" stroke={CORES.terra} strokeWidth={2} dot={{ fill: CORES.terra, r: 4 }} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Barras horizontais — Ocorrências por categoria */}
        <div className="bg-ink-soft border border-gold/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-cream mb-6">Ocorrências por Categoria</h2>
          {dados.ocorrenciasCat.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-cream-mute text-sm">
              Sem ocorrências registadas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dados.ocorrenciasCat} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,160,48,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: CORES.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="categoria" tick={{ fill: CORES.muted, fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Ocorrências" fill={CORES.terra} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

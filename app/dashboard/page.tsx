"use client";
// =============================================================================
// app/dashboard/page.tsx — Página Principal do Dashboard
// =============================================================================
// Esta é a primeira página que o utilizador vê após o login.
// Mostra um resumo de tudo: KPIs, pagamento pendente, avisos, ocorrências.
// Adapta-se ao role do utilizador (síndico vê mais, condómino vê o seu).
// =============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatKz, formatData, gerarReferenciaMulticaixa, corPagamento } from "@/lib/utils";
import type { Pagamento, Aviso, Ocorrencia, Usuario } from "@/types";

// ── COMPONENTE CARD KPI ───────────────────────────────────────────────────────
// Componente pequeno e reutilizável para os cartões de estatística no topo.
// Em React, podemos criar componentes dentro do ficheiro para organização.

function KpiCard({
  icon, label, valor, sub, cor
}: {
  icon: string; label: string; valor: string; sub?: string; cor?: string;
}) {
  return (
    <div className={`
      relative bg-ink-soft border rounded-2xl p-5 overflow-hidden
      hover:shadow-lg hover:shadow-gold/5 transition-all duration-300
      ${cor === "gold"  ? "border-gold/20" :
        cor === "terra" ? "border-terra/20" :
        cor === "sage"  ? "border-sage/20"  : "border-gold/10"}
    `}>
      {/* Círculo decorativo de fundo */}
      <div className={`
        absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10
        ${cor === "gold" ? "bg-gold" : cor === "terra" ? "bg-terra" : cor === "sage" ? "bg-sage" : "bg-gold"}
      `} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>

      <div className="font-display text-2xl font-bold text-cream mb-1">{valor}</div>
      <div className="text-xs text-cream-mute">{label}</div>
      {sub && <div className={`text-xs mt-1 ${cor === "terra" ? "text-terra-lite" : "text-gold"}`}>{sub}</div>}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function DashboardHome() {
  const supabase = createClient();

  // Estado: dados do utilizador e do condomínio
  const [usuario, setUsuario] = useState<Partial<Usuario> | null>(null);
  const [pagamentoPendente, setPagamentoPendente] = useState<Pagamento | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [stats, setStats] = useState({
    totalPago: 0, totalPendente: 0, totalAtrasado: 0, totalUnidades: 0
  });
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);

  // ── CARREGAR DADOS ────────────────────────────────────────────────────────

  useEffect(() => {
    const carregar = async () => {
      // 1. Obtém o utilizador autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Obtém o perfil do utilizador (role, unidade, etc.)
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("*, condominio:condominios(*)")
        .eq("id", user.id)
        .single();

      if (!perfil) return;
      setUsuario(perfil);

      const condoId = perfil.condominio_id;
      const mesAtual = new Date().toISOString().substring(0, 7); // "2025-06"

      // 3. Se é condómino, busca o seu pagamento do mês
      if (perfil.role === "condominino" && perfil.unidade_id) {
        const { data: pag } = await supabase
          .from("pagamentos")
          .select("*")
          .eq("unidade_id", perfil.unidade_id)
          .eq("mes_referencia", mesAtual)
          .maybeSingle(); // maybeSingle = pode não existir (retorna null em vez de erro)

        setPagamentoPendente(pag);
      }

      // 4. Busca avisos do condomínio (os mais recentes)
      const { data: av } = await supabase
        .from("avisos")
        .select("*")
        .eq("condominio_id", condoId)
        .order("fixado", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);

      setAvisos(av || []);

      // 5. Busca ocorrências (para o síndico, todas; para condómino, as suas)
      const ocQuery = supabase
        .from("ocorrencias")
        .select("*, unidade:unidades(numero, bloco:blocos(nome))")
        .eq("condominio_id", condoId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (perfil.role === "condominino") {
        ocQuery.eq("usuario_id", user.id);
      }

      const { data: oc } = await ocQuery;
      setOcorrencias(oc || []);

      // 6. Estatísticas de pagamentos do mês (síndico vê tudo)
      if (perfil.role !== "condominino") {
        const { data: pags } = await supabase
          .from("pagamentos")
          .select("status")
          .eq("condominio_id", condoId)
          .eq("mes_referencia", mesAtual);

        setStats({
          totalPago:      (pags || []).filter(p => p.status === "pago").length,
          totalPendente:  (pags || []).filter(p => p.status === "pendente").length,
          totalAtrasado:  (pags || []).filter(p => p.status === "atrasado").length,
          totalUnidades:  perfil.condominio?.total_unidades || 0,
        });
      }

      setLoading(false);
    };

    carregar();
  }, []);

  // ── COPIAR REFERÊNCIA ─────────────────────────────────────────────────────

  const copiarRef = (chave: string, valor: string) => {
    navigator.clipboard?.writeText(valor);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  };

  // Gera referência Multicaixa para o mês actual
  const mesAtual = new Date().toISOString().substring(0, 7);
  const refMulticaixa = usuario?.unidade_id
    ? gerarReferenciaMulticaixa(usuario.unidade_id, mesAtual)
    : "000000000";

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-ink-soft rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-ink-soft rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const isSindico = usuario?.role === "sindico" || usuario?.role === "admin";
  const nomeExibido = usuario?.nome?.split(" ")[0] || "Utilizador";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── BANNER DE BOAS-VINDAS ─────────────────────────────────────────── */}
      <div className="relative bg-ink-soft border border-gold/15 rounded-2xl p-6 overflow-hidden">
        {/* Gradiente decorativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gold/5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold via-terra to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <p className="text-cream-mute text-sm mb-1">Bom dia 👋</p>
            <h1 className="font-display text-2xl font-bold text-cream">
              {nomeExibido} <span className="text-gold">·</span>{" "}
              <span className="text-gold">{(usuario as any)?.condominio?.nome || "Dikuiza"}</span>
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-cream-mute">
              {usuario?.role === "condominino" && (
                <span>🚪 {(usuario as any)?.unidade?.bloco?.nome} · Apto {(usuario as any)?.unidade?.numero}</span>
              )}
              <span>📅 {new Date().toLocaleDateString("pt-AO", { weekday: "long", day: "numeric", month: "long" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-sage/10 border border-sage/20 rounded-full px-4 py-2 text-sage-lite text-xs font-medium">
              <span className="status-dot" />
              Condomínio Activo
            </div>
          </div>
        </div>
      </div>

      {/* ── ACÇÕES RÁPIDAS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "💳", label: "Pagar Quota",    href: "/dashboard/pagamentos",  cor: "rgba(232,160,48,0.12)"  },
          { icon: "🔧", label: "Ocorrência",      href: "/dashboard/ocorrencias", cor: "rgba(192,82,42,0.12)"  },
          { icon: "🏊", label: "Reservar Área",   href: "/dashboard/areas",       cor: "rgba(61,107,88,0.12)"  },
          { icon: "🗳️", label: "Votar",           href: "/dashboard/assembleias", cor: "rgba(232,192,48,0.12)" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-2 bg-ink-soft border border-gold/10 rounded-2xl p-4 text-cream-mute text-xs font-medium hover:border-gold/30 hover:text-cream hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: a.cor }}>
              {a.icon}
            </div>
            {a.label}
          </Link>
        ))}
      </div>

      {/* ── KPIs (diferentes para síndico e condómino) ──────────────────────── */}
      {isSindico ? (
        // Síndico: estatísticas do condomínio todo
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon="✅" label="Pagamentos do Mês" valor={`${stats.totalPago}`} sub={`de ${stats.totalUnidades} unidades`} cor="sage" />
          <KpiCard icon="⏳" label="Quotas Pendentes" valor={`${stats.totalPendente}`} cor="gold" />
          <KpiCard icon="⚠️" label="Em Atraso" valor={`${stats.totalAtrasado}`} cor="terra" />
          <KpiCard icon="📊" label="Taxa Adimplência" valor={`${stats.totalUnidades > 0 ? Math.round((stats.totalPago / stats.totalUnidades) * 100) : 0}%`} cor="sage" />
        </div>
      ) : (
        // Condómino: situação pessoal
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon="💳" label="Quota de Junho" valor="50.000 Kz" sub="Vence dia 10" cor="gold" />
          <KpiCard icon="✅" label="Pagas em 2025" valor="5/5" sub="Em dia" cor="sage" />
          <KpiCard icon="🔧" label="Ocorrências" valor={`${ocorrencias.length}`} sub="Abertas" cor="terra" />
          <KpiCard icon="📢" label="Avisos" valor={`${avisos.length}`} sub="Não lidos" cor="gold" />
        </div>
      )}

      {/* ── CONTEÚDO PRINCIPAL (duas colunas) ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna esquerda (maior) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Cartão de Pagamento Multicaixa (só condómino) */}
          {!isSindico && (
            <div className="relative bg-ink-mid border border-gold/30 rounded-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-dim" />

              <div className="relative z-10">
                <p className="text-cream-mute text-xs uppercase tracking-widest mb-1">Quota Condominial — Junho 2025</p>
                <div className="font-display text-4xl font-extrabold text-gold mb-1">
                  <span className="text-xl font-semibold mr-1">Kz</span>50.000
                </div>
                <p className="text-cream-mute text-sm mb-6">
                  Vencimento: <strong className="text-terra-lite">10 de Junho de 2025</strong>
                </p>

                {/* Referência Multicaixa */}
                <div className="mb-1 flex items-center gap-2 text-xs text-cream-mute">
                  <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded">MULTICAIXA</span>
                  Referência de Pagamento
                </div>

                <div className="bg-ink border border-gold/15 rounded-xl p-4 mb-4 space-y-3">
                  {[
                    { chave: "Entidade", valor: "11547" },
                    { chave: "Referência", valor: refMulticaixa.replace(/(.{3})(.{3})(.{3})/, "$1 $2 $3") },
                    { chave: "Montante", valor: "50.000,00 Kz" },
                  ].map((item) => (
                    <div key={item.chave} className="flex items-center justify-between">
                      <span className="text-xs text-cream-mute">{item.chave}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-cream tracking-wider text-sm">
                          {item.chave === "Montante" ? <span className="text-gold">{item.valor}</span> : item.valor}
                        </span>
                        {item.chave !== "Montante" && (
                          <button
                            onClick={() => copiarRef(item.chave, item.valor.replace(/ /g, ""))}
                            className="text-cream-mute hover:text-gold transition-colors text-xs"
                          >
                            {copiado === item.chave ? "✓" : "📋"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gold text-ink font-display font-bold text-sm py-3 rounded-xl hover:bg-gold-lite transition-all duration-200 hover:shadow-lg hover:shadow-gold/20">
                    💳 Pagar via Multicaixa
                  </button>
                  <Link
                    href="/dashboard/pagamentos"
                    className="border border-gold/20 text-cream text-sm font-medium py-3 rounded-xl hover:border-gold/40 hover:bg-gold/5 transition-all text-center"
                  >
                    Ver Histórico →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Ocorrências Recentes */}
          <div className="bg-ink-soft border border-gold/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
              <h2 className="font-display font-bold text-cream flex items-center gap-2">
                🔧 Ocorrências Recentes
              </h2>
              <Link href="/dashboard/ocorrencias" className="text-xs text-gold hover:text-gold-lite transition-colors">
                Ver todas →
              </Link>
            </div>

            {ocorrencias.length === 0 ? (
              <div className="px-6 py-8 text-center text-cream-mute text-sm">
                Sem ocorrências registadas
              </div>
            ) : (
              ocorrencias.map((oc) => {
                const cores = {
                  aberta: "text-gold bg-gold/10",
                  em_andamento: "text-sage-lite bg-sage/10",
                  resolvida: "text-green-400 bg-green-900/20",
                  cancelada: "text-cream-mute bg-ink-mid",
                };
                const labels = { aberta: "Aberta", em_andamento: "Em Andamento", resolvida: "Resolvida", cancelada: "Cancelada" };

                return (
                  <div key={oc.id} className="px-6 py-4 border-b border-gold/5 last:border-0 hover:bg-white/2 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-sm font-medium text-cream">{oc.titulo}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cores[oc.status]}`}>
                        {labels[oc.status]}
                      </span>
                    </div>
                    <p className="text-xs text-cream-mute line-clamp-1">{oc.descricao}</p>
                    <div className="flex gap-3 mt-1 text-xs text-cream-mute">
                      {oc.unidade && <span>📍 {(oc.unidade as any).bloco?.nome} · {oc.unidade.numero}</span>}
                      <span>📅 {formatData(oc.created_at, "dd MMM yyyy")}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-6">

          {/* Mural de Avisos */}
          <div className="bg-ink-soft border border-gold/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10">
              <h2 className="font-display font-bold text-cream">📢 Avisos</h2>
              <Link href="/dashboard/avisos" className="text-xs text-gold hover:text-gold-lite transition-colors">
                Ver todos →
              </Link>
            </div>

            {avisos.map((aviso) => {
              const catCores = {
                urgente:    { bg: "bg-red-900/20",   text: "text-red-400",    label: "🔴 Urgente"     },
                informacao: { bg: "bg-gold/10",       text: "text-gold",       label: "📋 Info"        },
                manutencao: { bg: "bg-terra/10",      text: "text-terra-lite", label: "🔧 Manutenção"  },
                assembleia: { bg: "bg-sage/10",       text: "text-sage-lite",  label: "🗳️ Assembleia"  },
                financeiro: { bg: "bg-gold/10",       text: "text-gold",       label: "💰 Financeiro"  },
              };
              const cat = catCores[aviso.categoria] || catCores.informacao;

              return (
                <div key={aviso.id} className="px-5 py-4 border-b border-gold/5 last:border-0 hover:bg-white/2 transition-colors">
                  <div className={`text-xs font-bold mb-1.5 ${cat.text}`}>{cat.label}</div>
                  <p className="text-sm text-cream font-medium leading-snug mb-1">{aviso.titulo}</p>
                  <p className="text-xs text-cream-mute">{formatData(aviso.created_at, "dd MMM · HH:mm")}</p>
                </div>
              );
            })}

            {avisos.length === 0 && (
              <div className="px-5 py-8 text-center text-cream-mute text-sm">Sem avisos</div>
            )}
          </div>

          {/* Link rápido para criar ocorrência */}
          <Link
            href="/dashboard/ocorrencias"
            className="flex items-center gap-4 bg-terra/5 border border-terra/20 rounded-2xl p-5 hover:border-terra/40 hover:bg-terra/10 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-terra/15 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-terra/25 transition-colors">
              🔧
            </div>
            <div>
              <p className="font-display font-bold text-cream text-sm">Reportar Problema</p>
              <p className="text-xs text-cream-mute mt-0.5">Envie uma ocorrência ao síndico</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

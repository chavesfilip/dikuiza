"use client";
// =============================================================================
// app/dashboard/condominios/page.tsx — Painel de Administração
// =============================================================================
// Síndico: gere blocos e unidades do seu condomínio
// Admin do sistema: vê todos os condomínios registados (visão global)
// =============================================================================

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { formatKz, formatData } from "@/lib/utils";
import type { Condominio, Bloco, Unidade, Usuario } from "@/types";

// ── PAINEL DO SÍNDICO ─────────────────────────────────────────────────────────
function PainelSindico({ condoId }: { condoId: string }) {
  const supabase = createClient();
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [blocoSelec, setBlocoSelec] = useState<string | null>(null);
  const [condo, setCondo] = useState<Condominio | null>(null);
  const [loading, setLoading] = useState(true);
  const [formBloco, setFormBloco] = useState({ nome: "", total_andares: "1" });
  const [formUnidade, setFormUnidade] = useState({ numero: "", andar: "1", tipo: "T2", area_m2: "" });
  const [mostrarFormBloco, setMostrarFormBloco] = useState(false);
  const [mostrarFormUnidade, setMostrarFormUnidade] = useState(false);

  const carregar = async () => {
    const { data: c } = await supabase.from("condominios").select("*").eq("id", condoId).single();
    const { data: b } = await supabase.from("blocos").select("*").eq("condominio_id", condoId).order("nome");
    setCondo(c);
    setBlocos(b || []);
    if (!blocoSelec && b && b.length > 0) setBlocoSelec(b[0].id);
    setLoading(false);
  };

  const carregarUnidades = async () => {
    if (!blocoSelec) return;
    const { data } = await supabase
      .from("unidades")
      .select("*, morador:usuarios(nome, email)")
      .eq("bloco_id", blocoSelec)
      .order("andar")
      .order("numero");
    setUnidades(data || []);
  };

  useEffect(() => { carregar(); }, []);
  useEffect(() => { carregarUnidades(); }, [blocoSelec]);

  const criarBloco = async () => {
    if (!formBloco.nome) { toast.error("Insira o nome do bloco"); return; }
    const { error } = await supabase.from("blocos").insert({
      condominio_id: condoId,
      nome: formBloco.nome,
      total_andares: parseInt(formBloco.total_andares),
    });
    if (error) toast.error(error.message);
    else { toast.success("Bloco criado!"); setMostrarFormBloco(false); setFormBloco({ nome: "", total_andares: "1" }); carregar(); }
  };

  const criarUnidade = async () => {
    if (!formUnidade.numero || !blocoSelec) { toast.error("Seleccione o bloco e insira o número"); return; }
    const { error } = await supabase.from("unidades").insert({
      bloco_id: blocoSelec,
      condominio_id: condoId,
      numero: formUnidade.numero,
      andar: parseInt(formUnidade.andar),
      tipo: formUnidade.tipo,
      area_m2: formUnidade.area_m2 ? parseFloat(formUnidade.area_m2) : null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Unidade criada!"); setMostrarFormUnidade(false); setFormUnidade({ numero: "", andar: "1", tipo: "T2", area_m2: "" }); carregarUnidades(); }
  };

  if (loading) return <div className="h-64 bg-ink-soft rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-6">
      {/* Info do condomínio */}
      {condo && (
        <div className="bg-ink-soft border border-gold/15 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-cream">{condo.nome}</h2>
              <p className="text-cream-mute text-sm mt-1">📍 {condo.endereco}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${condo.plano === "gratuito" ? "border-gold/20 text-gold" : "border-sage/30 text-sage-lite"}`}>
              {condo.plano === "gratuito" ? "🎁 Trial" : "⭐ Profissional"}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Unidades", valor: condo.total_unidades },
              { label: "Total Blocos",   valor: condo.total_blocos   },
              { label: "Quota Mensal",   valor: formatKz(condo.valor_quota) },
              { label: "Trial termina",  valor: condo.trial_termina_em ? formatData(condo.trial_termina_em, "dd/MM/yyyy") : "—" },
            ].map((item) => (
              <div key={item.label} className="bg-ink rounded-xl p-3">
                <div className="text-cream-mute text-xs mb-1">{item.label}</div>
                <div className="font-display font-bold text-cream">{item.valor}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gestão de Blocos */}
      <div className="bg-ink-soft border border-gold/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
          <h3 className="font-display font-bold text-cream">🏢 Blocos</h3>
          <button onClick={() => setMostrarFormBloco(!mostrarFormBloco)} className="bg-gold text-ink font-display font-bold text-xs px-4 py-2 rounded-lg hover:bg-gold-lite transition-all">
            + Adicionar Bloco
          </button>
        </div>

        {/* Formulário novo bloco */}
        {mostrarFormBloco && (
          <div className="px-6 py-4 bg-ink border-b border-gold/10">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-cream-mute mb-1">Nome do Bloco</label>
                <input type="text" placeholder="Ex: Bloco A, Torre 1" value={formBloco.nome}
                  onChange={(e) => setFormBloco({ ...formBloco, nome: e.target.value })} className="w-full px-3 py-2 text-sm" />
              </div>
              <div className="w-32">
                <label className="block text-xs text-cream-mute mb-1">Andares</label>
                <input type="number" value={formBloco.total_andares}
                  onChange={(e) => setFormBloco({ ...formBloco, total_andares: e.target.value })} className="w-full px-3 py-2 text-sm" />
              </div>
              <button onClick={criarBloco} className="bg-gold text-ink text-sm font-bold px-4 py-2 rounded-lg hover:bg-gold-lite transition-all">Criar</button>
              <button onClick={() => setMostrarFormBloco(false)} className="border border-gold/15 text-cream-mute text-sm px-3 py-2 rounded-lg hover:border-gold/30 transition-all">✕</button>
            </div>
          </div>
        )}

        {/* Lista de blocos */}
        <div className="flex flex-wrap gap-2 p-4">
          {blocos.map((b) => (
            <button key={b.id} onClick={() => setBlocoSelec(b.id)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${blocoSelec === b.id ? "bg-gold/10 border-gold text-gold" : "bg-ink border-gold/10 text-cream-mute hover:border-gold/30 hover:text-cream"}`}>
              {b.nome} <span className="text-xs opacity-60">({b.total_unidades} aptos)</span>
            </button>
          ))}
          {blocos.length === 0 && <p className="text-cream-mute text-sm p-2">Nenhum bloco criado ainda</p>}
        </div>
      </div>

      {/* Gestão de Unidades */}
      {blocoSelec && (
        <div className="bg-ink-soft border border-gold/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
            <h3 className="font-display font-bold text-cream">🚪 Unidades — {blocos.find(b => b.id === blocoSelec)?.nome}</h3>
            <button onClick={() => setMostrarFormUnidade(!mostrarFormUnidade)} className="bg-gold text-ink font-display font-bold text-xs px-4 py-2 rounded-lg hover:bg-gold-lite transition-all">
              + Adicionar Unidade
            </button>
          </div>

          {/* Formulário nova unidade */}
          {mostrarFormUnidade && (
            <div className="px-6 py-4 bg-ink border-b border-gold/10">
              <div className="flex gap-3 items-end flex-wrap">
                <div>
                  <label className="block text-xs text-cream-mute mb-1">Número *</label>
                  <input type="text" placeholder="3B" value={formUnidade.numero}
                    onChange={(e) => setFormUnidade({ ...formUnidade, numero: e.target.value })} className="w-24 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-cream-mute mb-1">Andar</label>
                  <input type="number" value={formUnidade.andar}
                    onChange={(e) => setFormUnidade({ ...formUnidade, andar: e.target.value })} className="w-20 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-cream-mute mb-1">Tipologia</label>
                  <select value={formUnidade.tipo} onChange={(e) => setFormUnidade({ ...formUnidade, tipo: e.target.value })} className="px-3 py-2 text-sm">
                    {["T1", "T2", "T3", "T4", "PH"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-cream-mute mb-1">Área (m²)</label>
                  <input type="number" placeholder="85" value={formUnidade.area_m2}
                    onChange={(e) => setFormUnidade({ ...formUnidade, area_m2: e.target.value })} className="w-24 px-3 py-2 text-sm" />
                </div>
                <button onClick={criarUnidade} className="bg-gold text-ink text-sm font-bold px-4 py-2 rounded-lg hover:bg-gold-lite transition-all">Criar</button>
                <button onClick={() => setMostrarFormUnidade(false)} className="border border-gold/15 text-cream-mute text-sm px-3 py-2 rounded-lg transition-all">✕</button>
              </div>
            </div>
          )}

          {/* Tabela de unidades */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10">
                  {["Nº Apto", "Andar", "Tipo", "Área", "Morador", "Estado"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-cream-mute font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unidades.map((u) => (
                  <tr key={u.id} className="border-b border-gold/5 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-display font-bold text-cream">{u.numero}</td>
                    <td className="px-5 py-3 text-cream-mute">{u.andar}º</td>
                    <td className="px-5 py-3 text-cream-dim">{u.tipo}</td>
                    <td className="px-5 py-3 text-cream-mute">{u.area_m2 ? `${u.area_m2}m²` : "—"}</td>
                    <td className="px-5 py-3">
                      {(u as any).morador ? (
                        <span className="text-cream">{(u as any).morador.nome}</span>
                      ) : (
                        <span className="text-cream-mute italic text-xs">Sem morador</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(u as any).morador ? "bg-sage/10 text-sage-lite" : "bg-ink-mid text-cream-mute"}`}>
                        {(u as any).morador ? "Ocupado" : "Vago"}
                      </span>
                    </td>
                  </tr>
                ))}
                {unidades.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-cream-mute text-sm">Nenhuma unidade criada neste bloco</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAINEL DO ADMIN GLOBAL ────────────────────────────────────────────────────
function PainelAdmin() {
  const supabase = createClient();
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const { data } = await supabase
        .from("condominios")
        .select("*")
        .order("created_at", { ascending: false });
      setCondominios(data || []);
      setLoading(false);
    };
    carregar();
  }, []);

  if (loading) return <div className="h-64 bg-ink-soft rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Condomínios", valor: condominios.length },
          { label: "Em Trial",          valor: condominios.filter(c => c.plano === "gratuito").length },
          { label: "Pagos",             valor: condominios.filter(c => c.plano !== "gratuito").length },
        ].map((k) => (
          <div key={k.label} className="bg-ink-soft border border-gold/10 rounded-2xl p-5">
            <div className="font-display text-3xl font-bold text-gold mb-1">{k.valor}</div>
            <div className="text-xs text-cream-mute">{k.label}</div>
          </div>
        ))}
      </div>

      {condominios.map((c) => (
        <div key={c.id} className="bg-ink-soft border border-gold/10 rounded-2xl p-5 hover:border-gold/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-cream">{c.nome}</h3>
              <p className="text-cream-mute text-sm mt-0.5">📍 {c.endereco} · {c.total_unidades} unidades</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${c.plano === "gratuito" ? "border-gold/20 text-gold" : "border-sage/30 text-sage-lite"}`}>
                {c.plano === "gratuito" ? "🎁 Trial" : "⭐ Pro"}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${c.ativo ? "bg-sage/10 text-sage-lite" : "bg-red-900/20 text-red-400"}`}>
                {c.ativo ? "Activo" : "Inactivo"}
              </span>
              <span className="text-xs text-cream-mute">{formatData(c.created_at, "dd/MM/yyyy")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function CondominiosPage() {
  const supabase = createClient();
  const [usuario, setUsuario] = useState<Partial<Usuario> | null>(null);

  useEffect(() => {
    const carregar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
      setUsuario(data);
    };
    carregar();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">🏢 Condomínio</h1>
        <p className="text-cream-mute text-sm mt-1">
          {usuario?.role === "admin" ? "Visão global de todos os condomínios" : "Gestão de blocos e unidades"}
        </p>
      </div>

      {usuario?.role === "admin" ? (
        <PainelAdmin />
      ) : usuario?.condominio_id ? (
        <PainelSindico condoId={usuario.condominio_id} />
      ) : (
        <div className="bg-ink-soft border border-gold/10 rounded-2xl p-16 text-center">
          <p className="text-cream-mute">Nenhum condomínio associado</p>
        </div>
      )}
    </div>
  );
}

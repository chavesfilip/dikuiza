"use client";
// =============================================================================
// app/dashboard/avisos/page.tsx — Mural de Avisos
// =============================================================================
// Moradores: lêem os avisos do condomínio
// Síndico: cria, fixa e remove avisos
// =============================================================================

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { formatData } from "@/lib/utils";
import type { Aviso, Usuario, AvisoCategoria } from "@/types";

const CATEGORIAS_AVISO: { value: AvisoCategoria; label: string; icon: string; cls: string }[] = [
  { value: "urgente",    label: "Urgente",     icon: "🔴", cls: "text-red-400 bg-red-900/20 border-red-800/30" },
  { value: "informacao", label: "Informação",  icon: "📋", cls: "text-gold bg-gold/10 border-gold/20"        },
  { value: "manutencao", label: "Manutenção",  icon: "🔧", cls: "text-terra-lite bg-terra/10 border-terra/20" },
  { value: "assembleia", label: "Assembleia",  icon: "🗳️", cls: "text-sage-lite bg-sage/10 border-sage/20"   },
  { value: "financeiro", label: "Financeiro",  icon: "💰", cls: "text-gold bg-gold/10 border-gold/20"        },
];

function getCatConfig(cat: AvisoCategoria) {
  return CATEGORIAS_AVISO.find(c => c.value === cat) || CATEGORIAS_AVISO[1];
}

// ── MODAL NOVO AVISO ──────────────────────────────────────────────────────────
function ModalNovoAviso({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    titulo: "", conteudo: "", categoria: "informacao" as AvisoCategoria,
    fixado: false, expira_em: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.titulo.trim() || !form.conteudo.trim()) { toast.error("Preencha título e conteúdo"); return; }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase.from("usuarios").select("condominio_id").eq("id", user!.id).single();

    const { error } = await supabase.from("avisos").insert({
      condominio_id: perfil?.condominio_id,
      autor_id: user!.id,
      titulo: form.titulo,
      conteudo: form.conteudo,
      categoria: form.categoria,
      fixado: form.fixado,
      expira_em: form.expira_em || null,
    });

    if (error) toast.error(error.message);
    else { toast.success("Aviso publicado! ✅"); onSuccess(); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-ink-soft border border-gold/20 rounded-2xl p-6 w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-cream text-lg">📢 Novo Aviso</h2>
          <button onClick={onClose} className="w-8 h-8 bg-ink-mid border border-gold/10 rounded-lg flex items-center justify-center text-cream-mute hover:text-cream text-sm">✕</button>
        </div>

        <div className="space-y-4">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-cream-dim mb-2">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_AVISO.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setForm({ ...form, categoria: c.value })}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    form.categoria === c.value ? c.cls : "border-gold/10 text-cream-mute hover:border-gold/30"
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cream-dim mb-2">Título *</label>
            <input type="text" placeholder="Título do aviso" value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full px-4 py-2.5 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-cream-dim mb-2">Conteúdo *</label>
            <textarea placeholder="Detalhe o aviso aqui..." value={form.conteudo}
              onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
              className="w-full px-4 py-2.5 text-sm resize-none" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-cream-dim mb-2">Expira em (opcional)</label>
              <input type="date" value={form.expira_em}
                onChange={(e) => setForm({ ...form, expira_em: e.target.value })}
                className="w-full px-4 py-2.5 text-sm" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, fixado: !form.fixado })}
                  className={`w-10 h-6 rounded-full transition-all flex items-center px-1 ${form.fixado ? "bg-gold" : "bg-ink-mid"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${form.fixado ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-cream-dim">Fixar no topo</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-gold/15 text-cream-mute text-sm py-3 rounded-xl hover:border-gold/30 transition-all">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gold text-ink font-display font-bold text-sm py-3 rounded-xl hover:bg-gold-lite disabled:opacity-50 transition-all">
              {loading ? "A publicar..." : "Publicar Aviso →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function AvisosPage() {
  const supabase = createClient();
  const [usuario, setUsuario] = useState<Partial<Usuario> | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [modalNovo, setModalNovo] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
    setUsuario(perfil);

    let query = supabase
      .from("avisos")
      .select("*, autor:usuarios(nome)")
      .eq("condominio_id", perfil?.condominio_id)
      .order("fixado", { ascending: false })
      .order("created_at", { ascending: false });

    if (filtro !== "todos") query = query.eq("categoria", filtro);

    const { data } = await query;
    setAvisos(data || []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, [filtro]);

  const isSindico = usuario?.role === "sindico" || usuario?.role === "admin";

  const apagarAviso = async (id: string) => {
    if (!confirm("Apagar este aviso?")) return;
    const { error } = await supabase.from("avisos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Aviso removido"); carregar(); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">📢 Mural de Avisos</h1>
          <p className="text-cream-mute text-sm mt-1">Comunicados do condomínio</p>
        </div>
        {isSindico && (
          <button
            onClick={() => setModalNovo(true)}
            className="bg-gold text-ink font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-lite transition-all hover:shadow-lg hover:shadow-gold/20"
          >
            + Novo Aviso
          </button>
        )}
      </div>

      {/* Filtros por categoria */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltro("todos")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === "todos" ? "bg-gold text-ink font-bold" : "bg-ink-soft border border-gold/10 text-cream-mute hover:border-gold/30 hover:text-cream"}`}>
          Todos
        </button>
        {CATEGORIAS_AVISO.map((c) => (
          <button key={c.value} onClick={() => setFiltro(c.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === c.value ? "bg-gold text-ink font-bold" : "bg-ink-soft border border-gold/10 text-cream-mute hover:border-gold/30 hover:text-cream"}`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Lista de avisos */}
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-ink-soft rounded-2xl animate-pulse" />)}</div>
      ) : avisos.length === 0 ? (
        <div className="bg-ink-soft border border-gold/10 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">📢</div>
          <p className="text-cream-mute">Sem avisos encontrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {avisos.map((aviso) => {
            const cat = getCatConfig(aviso.categoria);
            return (
              <div key={aviso.id} className={`relative bg-ink-soft border rounded-2xl p-6 transition-all hover:border-gold/20 ${aviso.fixado ? "border-gold/25" : "border-gold/10"}`}>
                {/* Pin de fixado */}
                {aviso.fixado && (
                  <div className="absolute top-4 right-4 text-gold text-xs font-bold">📌 Fixado</div>
                )}
                {/* Linha de cor no topo */}
                <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-50 ${cat.cls.includes("red") ? "bg-red-500" : cat.cls.includes("sage") ? "bg-sage" : "bg-gold"}`} />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full border mb-3 ${cat.cls}`}>
                      {cat.icon} {cat.label}
                    </div>
                    <h3 className="font-display font-bold text-cream text-lg mb-2">{aviso.titulo}</h3>
                    <p className="text-cream-dim text-sm leading-relaxed">{aviso.conteudo}</p>
                    <div className="flex gap-4 mt-4 text-xs text-cream-mute">
                      <span>✍️ {(aviso as any).autor?.nome || "Administração"}</span>
                      <span>📅 {formatData(aviso.created_at, "dd 'de' MMMM 'de' yyyy")}</span>
                      {aviso.expira_em && <span>⏰ Expira {formatData(aviso.expira_em, "dd/MM/yyyy")}</span>}
                    </div>
                  </div>

                  {isSindico && (
                    <button onClick={() => apagarAviso(aviso.id)} className="flex-shrink-0 border border-red-800/30 text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-all">
                      🗑 Apagar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalNovo && <ModalNovoAviso onClose={() => setModalNovo(false)} onSuccess={() => { setModalNovo(false); carregar(); }} />}
    </div>
  );
}

"use client";
// =============================================================================
// app/dashboard/ocorrencias/page.tsx — Gestão de Ocorrências
// =============================================================================
// Moradores: criam ocorrências com título, descrição, categoria e foto via URL
// Síndico: vê todas, actualiza status (aberta → em andamento → resolvida)
// =============================================================================

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { formatData, corOcorrencia, LABEL_STATUS_OCORRENCIA, LABEL_CATEGORIA_OCORRENCIA, isValidUrl } from "@/lib/utils";
import type { Ocorrencia, Usuario, OcorrenciaCategoria, OcorrenciaStatus } from "@/types";

const ICONES_CAT: Record<OcorrenciaCategoria, string> = {
  eletrico: "⚡", hidraulico: "💧", estrutural: "🏗️",
  limpeza: "🧹", seguranca: "🛡️", outro: "📋",
};

// ── MODAL ─────────────────────────────────────────────────────────────────────

function ModalOcorrencia({ ocorrencia, isSindico, onClose, onSuccess }: {
  ocorrencia: Ocorrencia | null; isSindico: boolean;
  onClose: () => void; onSuccess: () => void;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<OcorrenciaCategoria>("outro");
  const [fotoUrl, setFotoUrl] = useState("");
  const [notas, setNotas] = useState(ocorrencia?.notas_admin || "");
  const [status, setStatus] = useState<OcorrenciaStatus>(ocorrencia?.status || "aberta");

  const handleCriar = async () => {
    if (!titulo.trim() || !descricao.trim()) { toast.error("Preencha o título e a descrição"); return; }
    if (fotoUrl && !isValidUrl(fotoUrl)) { toast.error("URL da foto inválido"); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: perfil } = await supabase.from("usuarios").select("condominio_id, unidade_id").eq("id", user.id).single();
      const { error } = await supabase.from("ocorrencias").insert({
        condominio_id: perfil?.condominio_id, unidade_id: perfil?.unidade_id,
        usuario_id: user.id, titulo, descricao, categoria,
        foto_url: fotoUrl || null, status: "aberta",
      });
      if (error) throw error;
      toast.success("Ocorrência submetida! 🔧");
      onSuccess(); onClose();
    } catch (err: any) { toast.error(err.message || "Erro"); }
    finally { setLoading(false); }
  };

  const handleActualizar = async () => {
    if (!ocorrencia) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("ocorrencias").update({
        status, notas_admin: notas || null,
        data_resolucao: status === "resolvida" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", ocorrencia.id);
      if (error) throw error;
      toast.success("Actualizada!");
      onSuccess(); onClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-ink-soft border border-gold/30 rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-cream">
            {ocorrencia ? "🔧 Detalhes da Ocorrência" : "🔧 Reportar Problema"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-ink-mid border border-gold/10 rounded-lg flex items-center justify-center text-cream-mute hover:text-cream">✕</button>
        </div>

        {ocorrencia ? (
          <div className="space-y-4">
            <div className="bg-ink border border-gold/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display font-bold text-cream">{ocorrencia.titulo}</h3>
                <span className="text-2xl">{ICONES_CAT[ocorrencia.categoria]}</span>
              </div>
              <p className="text-sm text-cream-dim leading-relaxed">{ocorrencia.descricao}</p>
              <div className="flex flex-wrap gap-3 text-xs text-cream-mute">
                <span>📅 {formatData(ocorrencia.created_at, "dd/MM/yyyy HH:mm")}</span>
                <span>🏷️ {LABEL_CATEGORIA_OCORRENCIA[ocorrencia.categoria]}</span>
              </div>
              {ocorrencia.foto_url && (
                <a href={ocorrencia.foto_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-lite transition-colors">📷 Ver foto →</a>
              )}
            </div>
            {isSindico && (
              <>
                <div>
                  <label className="block text-xs font-medium text-cream-dim mb-2">Estado</label>
                  <select value={status} onChange={e => setStatus(e.target.value as OcorrenciaStatus)} className="w-full px-4 py-3 text-sm rounded-xl">
                    <option value="aberta">Aberta</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="resolvida">Resolvida</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream-dim mb-2">Notas Internas</label>
                  <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ex: Técnico agendado para amanhã..." rows={3} className="w-full px-4 py-3 text-sm rounded-xl resize-none" />
                </div>
                <button onClick={handleActualizar} disabled={loading} className="w-full bg-gold text-ink font-display font-bold py-3 rounded-xl hover:bg-gold-lite transition-all disabled:opacity-60">
                  {loading ? "A guardar..." : "Guardar Alterações"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-cream-dim mb-2">Categoria *</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ICONES_CAT) as OcorrenciaCategoria[]).map(cat => (
                  <button key={cat} onClick={() => setCategoria(cat)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all ${categoria === cat ? "bg-gold/10 border-gold text-gold" : "bg-ink border-gold/10 text-cream-mute hover:border-gold/30 hover:text-cream"}`}>
                    <span className="text-xl">{ICONES_CAT[cat]}</span>
                    {LABEL_CATEGORIA_OCORRENCIA[cat]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-cream-dim mb-2">Título *</label>
              <input type="text" placeholder="Ex: Lâmpada queimada no corredor" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cream-dim mb-2">Descrição *</label>
              <textarea placeholder="Descreva o problema com detalhes..." value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} className="w-full px-4 py-3 text-sm rounded-xl resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cream-dim mb-2">URL da Foto (opcional)</label>
              <input type="url" placeholder="https://photos.google.com/... ou https://drive.google.com/..." value={fotoUrl} onChange={e => setFotoUrl(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl" />
              <p className="text-xs text-cream-mute mt-1">💡 Google Fotos, Drive ou WhatsApp Web</p>
            </div>
            <button onClick={handleCriar} disabled={loading} className="w-full bg-gold text-ink font-display font-bold py-3.5 rounded-xl hover:bg-gold-lite transition-all disabled:opacity-60">
              {loading ? "A submeter..." : "Submeter Ocorrência →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PÁGINA ────────────────────────────────────────────────────────────────────

export default function OcorrenciasPage() {
  const supabase = createClient();
  const [usuario, setUsuario] = useState<Partial<Usuario> | null>(null);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<Ocorrencia | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todas");

  const carregar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: perfil } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
    setUsuario(perfil);
    let query = supabase.from("ocorrencias").select("*, unidade:unidades(numero, bloco:blocos(nome)), usuario:usuarios(nome, email)").order("created_at", { ascending: false });
    if (perfil?.role === "condominino") {
      query = query.eq("usuario_id", user.id);
    } else {
      query = query.eq("condominio_id", perfil?.condominio_id);
    }
    const { data } = await query;
    setOcorrencias(data || []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const isSindico = usuario?.role === "sindico" || usuario?.role === "admin";
  const ocFiltradas = filtroStatus === "todas" ? ocorrencias : ocorrencias.filter(o => o.status === filtroStatus);

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-ink-soft rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">🔧 Ocorrências</h1>
          <p className="text-cream-mute text-sm mt-1">{isSindico ? "Gerir problemas reportados pelos moradores" : "Reporte e acompanhe os seus problemas"}</p>
        </div>
        {!isSindico && (
          <button onClick={() => { setOcorrenciaSelecionada(null); setModalAberto(true); }} className="bg-gold text-ink font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-lite transition-all hover:shadow-lg hover:shadow-gold/20">+ Nova</button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Abertas",      status: "aberta",       cor: "text-gold",      count: ocorrencias.filter(o => o.status === "aberta").length },
          { label: "Em Andamento", status: "em_andamento", cor: "text-sage-lite", count: ocorrencias.filter(o => o.status === "em_andamento").length },
          { label: "Resolvidas",   status: "resolvida",    cor: "text-green-400", count: ocorrencias.filter(o => o.status === "resolvida").length },
          { label: "Total",        status: "todas",        cor: "text-cream",     count: ocorrencias.length },
        ].map(s => (
          <button key={s.status} onClick={() => setFiltroStatus(s.status)} className={`bg-ink-soft border rounded-xl p-4 text-left transition-all ${filtroStatus === s.status ? "border-gold/40 bg-gold/5" : "border-gold/10 hover:border-gold/20"}`}>
            <div className={`font-display text-2xl font-bold ${s.cor}`}>{s.count}</div>
            <div className="text-xs text-cream-mute mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-ink-soft border border-gold/10 rounded-2xl overflow-hidden">
        {ocFiltradas.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🔧</div>
            <p className="text-cream-mute text-sm">Nenhuma ocorrência encontrada</p>
          </div>
        ) : ocFiltradas.map(oc => {
          const cores = corOcorrencia(oc.status);
          return (
            <div key={oc.id} onClick={() => { setOcorrenciaSelecionada(oc); setModalAberto(true); }} className="flex items-start gap-4 px-6 py-5 border-b border-gold/5 last:border-0 hover:bg-white/2 cursor-pointer transition-colors group">
              <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-ink-mid transition-colors">
                {ICONES_CAT[oc.categoria]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-medium text-cream text-sm">{oc.titulo}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cores.bg} ${cores.text} border ${cores.border}`}>
                    {LABEL_STATUS_OCORRENCIA[oc.status]}
                  </span>
                </div>
                <p className="text-xs text-cream-mute line-clamp-1 mb-2">{oc.descricao}</p>
                <div className="flex flex-wrap gap-3 text-xs text-cream-mute">
                  {isSindico && oc.usuario && <span>👤 {(oc.usuario as any).nome}</span>}
                  {oc.unidade && <span>📍 {(oc.unidade as any).bloco?.nome} · {oc.unidade.numero}</span>}
                  <span>📅 {formatData(oc.created_at, "dd/MM/yyyy")}</span>
                  {oc.foto_url && <span className="text-gold">📷 Foto</span>}
                </div>
              </div>
              <span className="text-cream-mute text-xs group-hover:text-cream transition-colors flex-shrink-0 mt-1">→</span>
            </div>
          );
        })}
      </div>

      {modalAberto && (
        <ModalOcorrencia
          ocorrencia={ocorrenciaSelecionada}
          isSindico={isSindico}
          onClose={() => setModalAberto(false)}
          onSuccess={carregar}
        />
      )}
    </div>
  );
}

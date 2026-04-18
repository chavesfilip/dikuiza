"use client";
// =============================================================================
// app/dashboard/pagamentos/page.tsx — Módulo de Pagamentos
// =============================================================================
// CONDÓMINO: referência Multicaixa + submissão de comprovativo via URL + histórico
// SÍNDICO: lista todos os pagamentos, confirma/rejeita comprovativos
// =============================================================================

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import {
  formatKz, formatMesRef, formatData,
  gerarReferenciaMulticaixa, corPagamento,
  LABEL_STATUS_PAGAMENTO, isValidUrl
} from "@/lib/utils";
import type { Pagamento, Usuario } from "@/types";

// ── MODAL COMPROVATIVO ────────────────────────────────────────────────────────

function ModalComprovativo({ pagamento, valorQuota, onClose, onSuccess }: {
  pagamento: Pagamento | null; valorQuota: number;
  onClose: () => void; onSuccess: () => void;
}) {
  const supabase = createClient();
  const [url, setUrl] = useState(pagamento?.comprovativo_url || "");
  const [notas, setNotas] = useState(pagamento?.notas || "");
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    if (!url) { toast.error("Insira o URL do comprovativo"); return; }
    if (!isValidUrl(url)) { toast.error("URL inválido. Use https://..."); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: perfil } = await supabase.from("usuarios").select("condominio_id, unidade_id").eq("id", user.id).single();
      const mesAtual = new Date().toISOString().substring(0, 7);
      const { error } = await supabase.from("pagamentos").upsert({
        condominio_id: perfil?.condominio_id,
        unidade_id: perfil?.unidade_id,
        usuario_id: user.id,
        mes_referencia: mesAtual,
        valor: valorQuota,
        status: "pendente",
        comprovativo_url: url,
        notas: notas || null,
        data_vencimento: mesAtual + "-10",
        multicaixa_entidade: "11547",
      }, { onConflict: "unidade_id,mes_referencia" });
      if (error) throw error;
      toast.success("Comprovativo submetido! O síndico irá verificar. ✅");
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao submeter");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-ink-soft border border-gold/30 rounded-2xl p-6 w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-cream">💳 Submeter Comprovativo</h2>
          <button onClick={onClose} className="w-8 h-8 bg-ink-mid border border-gold/10 rounded-lg flex items-center justify-center text-cream-mute hover:text-cream">✕</button>
        </div>
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-5 text-xs text-cream-mute leading-relaxed">
          <p className="font-medium text-gold mb-2">📱 Como pagar via Multicaixa Express</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra a app Multicaixa Express</li>
            <li>Seleccione "Pagar Serviços"</li>
            <li>Introduza a Entidade e Referência</li>
            <li>Tire foto ao comprovativo e carregue para Google Drive</li>
            <li>Cole o link aqui em baixo</li>
          </ol>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-cream-dim mb-2">URL do Comprovativo *</label>
          <input type="url" placeholder="https://drive.google.com/file/..." value={url} onChange={e => setUrl(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl" />
          <p className="text-xs text-cream-mute mt-1">💡 Google Drive, WhatsApp Web, Dropbox, ou qualquer link público</p>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-medium text-cream-dim mb-2">Notas (opcional)</label>
          <textarea placeholder="Ex: Pago em 05/06/2025 via Multicaixa Express..." value={notas} onChange={e => setNotas(e.target.value)} rows={2} className="w-full px-4 py-3 text-sm rounded-xl resize-none" />
        </div>
        <button onClick={handleSubmeter} disabled={loading} className="w-full bg-gold text-ink font-display font-bold py-3.5 rounded-xl hover:bg-gold-lite transition-all disabled:opacity-60">
          {loading ? "A submeter..." : "Submeter Comprovativo →"}
        </button>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function PagamentosPage() {
  const supabase = createClient();
  const [usuario, setUsuario] = useState<Partial<Usuario> | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagamentoMes, setPagamentoMes] = useState<Pagamento | null>(null);
  const [valorQuota, setValorQuota] = useState(50000);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [copiado, setCopiado] = useState<string | null>(null);
  const mesAtual = new Date().toISOString().substring(0, 7);

  const carregar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: perfil } = await supabase.from("usuarios").select("*, condominio:condominios(valor_quota, multicaixa_entidade)").eq("id", user.id).single();
    if (!perfil) return;
    setUsuario(perfil);
    setValorQuota((perfil.condominio as any)?.valor_quota || 50000);

    let query = supabase.from("pagamentos").select("*, unidade:unidades(numero, bloco:blocos(nome)), usuario:usuarios(nome, email, telefone)").order("mes_referencia", { ascending: false });
    if (perfil.role === "condominino") {
      query = query.eq("unidade_id", perfil.unidade_id);
    } else {
      query = query.eq("condominio_id", perfil.condominio_id);
    }
    const { data: pags } = await query;
    setPagamentos(pags || []);
    if (perfil.role === "condominino") {
      setPagamentoMes((pags || []).find(p => p.mes_referencia === mesAtual) || null);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const confirmarPagamento = async (id: string, status: "pago" | "atrasado") => {
    const { error } = await supabase.from("pagamentos").update({ status, data_pagamento: status === "pago" ? new Date().toISOString() : null }).eq("id", id);
    if (error) { toast.error("Erro ao actualizar"); return; }
    toast.success(status === "pago" ? "✅ Confirmado!" : "⚠️ Marcado como atrasado");
    carregar();
  };

  const copiar = (chave: string, valor: string) => {
    navigator.clipboard?.writeText(valor);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  };

  const pagamentosFiltrados = filtroStatus === "todos" ? pagamentos : pagamentos.filter(p => p.status === filtroStatus);
  const isSindico = usuario?.role === "sindico" || usuario?.role === "admin";
  const refMulticaixa = usuario?.unidade_id ? gerarReferenciaMulticaixa(usuario.unidade_id, mesAtual) : "000000000";

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 bg-ink-soft rounded-2xl" />
      <div className="h-64 bg-ink-soft rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">💳 Pagamentos</h1>
          <p className="text-cream-mute text-sm mt-1">{isSindico ? "Gestão de quotas condominiais" : "As suas quotas e comprovativos"}</p>
        </div>
        {isSindico && (
          <button onClick={() => toast.info("Exportação em breve")} className="border border-gold/20 text-cream-mute text-sm px-4 py-2 rounded-xl hover:border-gold/40 hover:text-cream transition-all">
            📥 Exportar
          </button>
        )}
      </div>

      {/* Cartão Multicaixa — só condómino */}
      {!isSindico && (
        <div className="relative bg-ink-mid border border-gold/30 rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold via-gold-dim to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-cream-mute text-xs uppercase tracking-widest mb-1">Quota — {formatMesRef(mesAtual)}</p>
                <div className="font-display text-4xl font-extrabold text-gold"><span className="text-xl font-semibold mr-1">Kz</span>{valorQuota.toLocaleString("pt-AO")}</div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${pagamentoMes ? `${corPagamento(pagamentoMes.status).bg} ${corPagamento(pagamentoMes.status).text} border ${corPagamento(pagamentoMes.status).border}` : "bg-gold/10 text-gold border border-gold/30"}`}>
                {pagamentoMes ? LABEL_STATUS_PAGAMENTO[pagamentoMes.status] : "Por Pagar"}
              </div>
            </div>
            <p className="text-cream-mute text-sm mb-6">Vencimento: <strong className="text-terra-lite">dia 10 do mês</strong></p>
            <div className="flex items-center gap-2 text-xs text-cream-mute mb-2">
              <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded tracking-wide">MULTICAIXA</span>
              Dados para Pagamento
            </div>
            <div className="bg-ink border border-gold/15 rounded-xl p-4 mb-5 space-y-3">
              {[
                { label: "Entidade", val: "11547", copiavel: true },
                { label: "Referência", val: refMulticaixa.replace(/(.{3})(.{3})(.{3})/, "$1 $2 $3"), copiavel: true },
                { label: "Montante", val: `${valorQuota.toLocaleString("pt-AO")},00 Kz`, copiavel: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-cream-mute">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-bold tracking-wider text-sm ${item.label === "Montante" ? "text-gold" : "text-cream"}`}>{item.val}</span>
                    {item.copiavel && (
                      <button onClick={() => copiar(item.label, item.val.replace(/ /g, ""))} className="text-cream-mute hover:text-gold transition-colors text-xs p-1">
                        {copiado === item.label ? "✓" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setModalAberto(true)} className="bg-gold text-ink font-display font-bold text-sm py-3 rounded-xl hover:bg-gold-lite transition-all hover:shadow-lg hover:shadow-gold/20">
                📎 Submeter Comprovativo
              </button>
              {pagamentoMes?.comprovativo_url && (
                <a href={pagamentoMes.comprovativo_url} target="_blank" rel="noopener noreferrer" className="border border-gold/20 text-cream text-sm font-medium py-3 rounded-xl hover:border-gold/40 hover:bg-gold/5 transition-all text-center">
                  👁️ Ver Comprovativo
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabela de pagamentos */}
      <div className="bg-ink-soft border border-gold/10 rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gold/10">
          <h2 className="font-display font-bold text-cream">{isSindico ? "Todos os Pagamentos" : "Histórico de Quotas"}</h2>
          <div className="flex gap-2 flex-wrap">
            {["todos", "pago", "pendente", "atrasado"].map(s => (
              <button key={s} onClick={() => setFiltroStatus(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${filtroStatus === s ? "bg-gold text-ink font-bold" : "bg-ink border border-gold/10 text-cream-mute hover:border-gold/30 hover:text-cream"}`}>
                {s === "todos" ? "Todos" : LABEL_STATUS_PAGAMENTO[s as any]}
              </button>
            ))}
          </div>
        </div>

        {pagamentosFiltrados.length === 0 ? (
          <div className="py-16 text-center text-cream-mute text-sm">Nenhum pagamento encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  {isSindico && <th className="text-left px-6 py-3 text-xs text-cream-mute font-medium">Unidade</th>}
                  <th className="text-left px-6 py-3 text-xs text-cream-mute font-medium">Mês</th>
                  <th className="text-left px-6 py-3 text-xs text-cream-mute font-medium">Valor</th>
                  <th className="text-left px-6 py-3 text-xs text-cream-mute font-medium">Vencimento</th>
                  <th className="text-left px-6 py-3 text-xs text-cream-mute font-medium">Estado</th>
                  <th className="text-left px-6 py-3 text-xs text-cream-mute font-medium">Comprovativo</th>
                  {isSindico && <th className="px-6 py-3 text-xs text-cream-mute font-medium">Acções</th>}
                </tr>
              </thead>
              <tbody>
                {pagamentosFiltrados.map(p => {
                  const cores = corPagamento(p.status);
                  return (
                    <tr key={p.id} className="border-b border-gold/5 last:border-0 hover:bg-white/2 transition-colors">
                      {isSindico && (
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-cream">{(p.usuario as any)?.nome}</div>
                          <div className="text-xs text-cream-mute">{(p.unidade as any)?.bloco?.nome} · {(p.unidade as any)?.numero}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-cream">{formatMesRef(p.mes_referencia)}</td>
                      <td className="px-6 py-4 font-display font-bold text-cream text-sm">{formatKz(p.valor)}</td>
                      <td className="px-6 py-4 text-sm text-cream-mute">{formatData(p.data_vencimento, "dd/MM/yyyy")}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cores.bg} ${cores.text} border ${cores.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cores.dot}`} />
                          {LABEL_STATUS_PAGAMENTO[p.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.comprovativo_url ? (
                          <a href={p.comprovativo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:text-gold-lite transition-colors underline underline-offset-2">Ver →</a>
                        ) : <span className="text-xs text-cream-mute">—</span>}
                      </td>
                      {isSindico && (
                        <td className="px-6 py-4">
                          {p.status === "pendente" && (
                            <div className="flex gap-2">
                              <button onClick={() => confirmarPagamento(p.id, "pago")} className="text-xs bg-sage/10 text-sage-lite border border-sage/20 px-3 py-1.5 rounded-lg hover:bg-sage/20 transition-colors font-medium">✓ Confirmar</button>
                              <button onClick={() => confirmarPagamento(p.id, "atrasado")} className="text-xs bg-terra/10 text-terra-lite border border-terra/20 px-3 py-1.5 rounded-lg hover:bg-terra/20 transition-colors font-medium">✗ Rejeitar</button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAberto && <ModalComprovativo pagamento={pagamentoMes} valorQuota={valorQuota} onClose={() => setModalAberto(false)} onSuccess={carregar} />}
    </div>
  );
}

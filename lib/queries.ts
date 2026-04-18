// =============================================================================
// lib/queries.ts — Todas as consultas à base de dados (Supabase)
// =============================================================================
// Aqui centralizamos TODAS as funções que comunicam com o Supabase.
// Em vez de escrever queries espalhadas pelo código, importamos daqui.
//
// Como funciona uma query Supabase:
//   const { data, error } = await supabase
//     .from("tabela")           // selecciona a tabela
//     .select("coluna1, coluna2") // escolhe as colunas
//     .eq("coluna", valor)      // filtra onde coluna = valor
//     .order("created_at")      // ordena
//     .limit(10)                // limita resultados
//
// É parecido com SQL mas em JavaScript/TypeScript.
// =============================================================================

import { createClient } from "./supabase";
import type {
  Condominio, Unidade, Pagamento, Ocorrencia,
  Aviso, AnalyticsData, NovaOcorrenciaForm,
  NovoPagamentoForm, NovoAvisoForm
} from "@/types";

// ── CONDOMÍNIOS ───────────────────────────────────────────────────────────────

// Busca o condomínio do utilizador autenticado
export async function getCondominioDoUsuario(): Promise<Condominio | null> {
  const supabase = createClient();

  // Primeiro descobrimos quem está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Depois buscamos o perfil desse utilizador para saber o condominio_id
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("condominio_id")
    .eq("id", user.id)
    .single(); // .single() porque esperamos exactamente 1 resultado

  if (!perfil?.condominio_id) return null;

  // Finalmente buscamos os dados do condomínio
  const { data } = await supabase
    .from("condominios")
    .select("*")
    .eq("id", perfil.condominio_id)
    .single();

  return data;
}

// Busca todos os condomínios (só admin do sistema vê isto)
export async function getTodosCondominios(): Promise<Condominio[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("condominios")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

// ── PAGAMENTOS ────────────────────────────────────────────────────────────────

// Busca pagamentos de uma unidade específica (para o morador ver os seus)
export async function getPagamentosUnidade(unidadeId: string): Promise<Pagamento[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("pagamentos")
    .select(`
      *,
      unidade:unidades(numero, bloco:blocos(nome)),
      usuario:usuarios(nome, email, telefone)
    `)
    .eq("unidade_id", unidadeId)
    .order("mes_referencia", { ascending: false });
  return data || [];
}

// Busca TODOS os pagamentos de um condomínio (para o síndico gerir)
export async function getPagamentosCondominio(
  condominioId: string,
  mes?: string // ex: "2025-06" — opcional para filtrar por mês
): Promise<Pagamento[]> {
  const supabase = createClient();

  let query = supabase
    .from("pagamentos")
    .select(`
      *,
      unidade:unidades(numero, bloco:blocos(nome)),
      usuario:usuarios(nome, email, telefone)
    `)
    .eq("condominio_id", condominioId)
    .order("created_at", { ascending: false });

  // Adiciona filtro de mês apenas se fornecido
  if (mes) query = query.eq("mes_referencia", mes);

  const { data } = await query;
  return data || [];
}

// Cria ou actualiza um pagamento (quando o morador submete comprovativo)
export async function submeterComprovativo(
  condominioId: string,
  usuarioId: string,
  form: NovoPagamentoForm
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // "upsert" = insert ou update se já existir (com base no unique constraint)
  const { error } = await supabase
    .from("pagamentos")
    .upsert({
      condominio_id: condominioId,
      unidade_id: form.unidade_id,
      usuario_id: usuarioId,
      mes_referencia: form.mes_referencia,
      valor: form.valor,
      comprovativo_url: form.comprovativo_url,
      notas: form.notas,
      status: "pendente", // fica pendente até o síndico confirmar
      data_vencimento: form.mes_referencia + "-10", // dia 10 de cada mês
    }, {
      onConflict: "unidade_id,mes_referencia", // chave única para evitar duplicados
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Síndico confirma/rejeita um pagamento
export async function actualizarStatusPagamento(
  pagamentoId: string,
  status: "pago" | "atrasado" | "cancelado",
  notas?: string
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pagamentos")
    .update({
      status,
      notas,
      data_pagamento: status === "pago" ? new Date().toISOString() : null,
    })
    .eq("id", pagamentoId);
  return { success: !error };
}

// ── OCORRÊNCIAS ───────────────────────────────────────────────────────────────

export async function getOcorrenciasCondominio(condominioId: string): Promise<Ocorrencia[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ocorrencias")
    .select(`
      *,
      usuario:usuarios(nome, email),
      unidade:unidades(numero, bloco:blocos(nome))
    `)
    .eq("condominio_id", condominioId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getOcorrenciasUsuario(usuarioId: string): Promise<Ocorrencia[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ocorrencias")
    .select("*, unidade:unidades(numero, bloco:blocos(nome))")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function criarOcorrencia(
  condominioId: string,
  unidadeId: string,
  usuarioId: string,
  form: NovaOcorrenciaForm
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("ocorrencias").insert({
    condominio_id: condominioId,
    unidade_id: unidadeId,
    usuario_id: usuarioId,
    titulo: form.titulo,
    descricao: form.descricao,
    categoria: form.categoria,
    foto_url: form.foto_url || null,
    status: "aberta",
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function actualizarOcorrencia(
  ocorrenciaId: string,
  updates: Partial<Pick<Ocorrencia, "status" | "notas_admin" | "atribuido_a" | "data_resolucao">>
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("ocorrencias")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", ocorrenciaId);
  return { success: !error };
}

// ── AVISOS ────────────────────────────────────────────────────────────────────

export async function getAvisosCondominio(condominioId: string): Promise<Aviso[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("avisos")
    .select("*, autor:usuarios(nome)")
    .eq("condominio_id", condominioId)
    .or("expira_em.is.null,expira_em.gt." + new Date().toISOString()) // não mostrar expirados
    .order("fixado", { ascending: false })  // fixados primeiro
    .order("created_at", { ascending: false });
  return data || [];
}

export async function criarAviso(
  condominioId: string,
  autorId: string,
  form: NovoAvisoForm
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const { error } = await supabase.from("avisos").insert({
    condominio_id: condominioId,
    autor_id: autorId,
    ...form,
  });
  return { success: !error };
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
// Agrega dados para o painel de estatísticas

export async function getAnalytics(
  condominioId: string,
  mes: string // ex: "2025-06"
): Promise<AnalyticsData> {
  const supabase = createClient();

  // Busca contagem de unidades por status de pagamento no mês
  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("status, valor")
    .eq("condominio_id", condominioId)
    .eq("mes_referencia", mes);

  // Conta o condomínio para saber total de unidades
  const { data: condo } = await supabase
    .from("condominios")
    .select("total_unidades, valor_quota")
    .eq("id", condominioId)
    .single();

  // Calcula totais a partir dos dados recebidos
  const pagos     = pagamentos?.filter(p => p.status === "pago") || [];
  const pendentes = pagamentos?.filter(p => p.status === "pendente") || [];
  const atrasados = pagamentos?.filter(p => p.status === "atrasado") || [];

  const receitaMes = pagos.reduce((acc, p) => acc + p.valor, 0);
  const totalUnidades = condo?.total_unidades || 0;
  const receitaEsperada = totalUnidades * (condo?.valor_quota || 0);

  // Busca ocorrências
  const { count: ocAbertas } = await supabase
    .from("ocorrencias")
    .select("*", { count: "exact", head: true })
    .eq("condominio_id", condominioId)
    .eq("status", "aberta");

  const { count: ocResolvidasMes } = await supabase
    .from("ocorrencias")
    .select("*", { count: "exact", head: true })
    .eq("condominio_id", condominioId)
    .eq("status", "resolvida")
    .gte("updated_at", mes + "-01");

  // Evolução dos últimos 6 meses
  const evolucao = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toISOString().substring(0, 7); // "YYYY-MM"
    const { data: mp } = await supabase
      .from("pagamentos")
      .select("status, valor")
      .eq("condominio_id", condominioId)
      .eq("mes_referencia", m);
    evolucao.push({
      mes: m,
      pago:     (mp || []).filter(p => p.status === "pago").reduce((a, p) => a + p.valor, 0),
      pendente: (mp || []).filter(p => p.status === "pendente").length,
      atrasado: (mp || []).filter(p => p.status === "atrasado").length,
    });
  }

  return {
    total_unidades:            totalUnidades,
    unidades_pagas:            pagos.length,
    unidades_pendentes:        pendentes.length,
    unidades_atrasadas:        atrasados.length,
    receita_mes:               receitaMes,
    receita_esperada:          receitaEsperada,
    taxa_adimplencia:          totalUnidades > 0 ? Math.round((pagos.length / totalUnidades) * 100) : 0,
    ocorrencias_abertas:       ocAbertas || 0,
    ocorrencias_resolvidas_mes: ocResolvidasMes || 0,
    evolucao_pagamentos:       evolucao,
  };
}

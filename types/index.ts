// =============================================================================
// types/index.ts — Tipos TypeScript de toda a aplicação
// =============================================================================
// TypeScript é uma extensão do JavaScript que adiciona "tipos".
// Um "tipo" define a forma de um objecto — quais campos tem e que tipo de
// valor cada campo aceita. Isto evita erros em tempo de execução.
//
// Exemplo: se definimos que "valor" é um número, o TypeScript avisa-nos
// se tentarmos pôr uma palavra lá.
// =============================================================================

// ── ENUMS ─────────────────────────────────────────────────────────────────────
// Enums são listas de valores fixos possíveis. Assim não erramos ao escrever
// um estado — o TypeScript avisa se escrevemos "Pago" em vez de "pago".

export type UserRole = "admin" | "sindico" | "condominino" | "seguranca" | "fornecedor";

export type PagamentoStatus = "pendente" | "pago" | "atrasado" | "cancelado";

export type OcorrenciaStatus = "aberta" | "em_andamento" | "resolvida" | "cancelada";

export type OcorrenciaCategoria =
  | "eletrico"
  | "hidraulico"
  | "estrutural"
  | "limpeza"
  | "seguranca"
  | "outro";

export type AvisoCategoria = "urgente" | "informacao" | "manutencao" | "assembleia" | "financeiro";

export type PlanoTipo = "gratuito" | "basico" | "profissional";

// ── ENTIDADES PRINCIPAIS ──────────────────────────────────────────────────────

// Um Condomínio é o topo da hierarquia: tem blocos, que têm unidades, que têm moradores
export interface Condominio {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  total_unidades: number;
  total_blocos: number;
  sindico_id: string;
  plano: PlanoTipo;
  valor_quota: number;           // em Kwanzas
  trial_termina_em: string | null; // data ISO
  ativo: boolean;
  logo_url: string | null;
  multicaixa_entidade: string | null;
  created_at: string;
}

export interface Bloco {
  id: string;
  condominio_id: string;
  nome: string;                  // ex: "Bloco A", "Torre 1"
  total_andares: number;
  total_unidades: number;
  created_at: string;
}

export interface Unidade {
  id: string;
  bloco_id: string;
  condominio_id: string;
  numero: string;                // ex: "3B", "101"
  andar: number;
  tipo: string;                  // ex: "T2", "T3"
  area_m2: number | null;
  morador_id: string | null;     // null = unidade vazia
  created_at: string;
}

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  telefone: string | null;
  role: UserRole;
  condominio_id: string | null;
  unidade_id: string | null;
  avatar_url: string | null;
  ativo: boolean;
  created_at: string;
}

// ── PAGAMENTOS ────────────────────────────────────────────────────────────────

export interface Pagamento {
  id: string;
  condominio_id: string;
  unidade_id: string;
  usuario_id: string;
  mes_referencia: string;        // ex: "2025-06"
  valor: number;
  status: PagamentoStatus;
  multicaixa_referencia: string | null;
  multicaixa_entidade: string | null;
  comprovativo_url: string | null; // URL online do comprovativo (não upload)
  data_vencimento: string;
  data_pagamento: string | null;
  notas: string | null;
  created_at: string;
  // Relações (quando fazemos JOIN no Supabase)
  unidade?: Unidade;
  usuario?: Pick<Usuario, "nome" | "email" | "telefone">;
}

// ── OCORRÊNCIAS ───────────────────────────────────────────────────────────────

export interface Ocorrencia {
  id: string;
  condominio_id: string;
  unidade_id: string;
  usuario_id: string;
  titulo: string;
  descricao: string;
  categoria: OcorrenciaCategoria;
  status: OcorrenciaStatus;
  foto_url: string | null;       // URL online da foto (não upload directo)
  atribuido_a: string | null;    // ID do fornecedor responsável
  data_resolucao: string | null;
  notas_admin: string | null;
  created_at: string;
  updated_at: string;
  usuario?: Pick<Usuario, "nome" | "email">;
  unidade?: Pick<Unidade, "numero"> & { bloco?: Pick<Bloco, "nome"> };
}

// ── AVISOS ────────────────────────────────────────────────────────────────────

export interface Aviso {
  id: string;
  condominio_id: string;
  autor_id: string;
  titulo: string;
  conteudo: string;
  categoria: AvisoCategoria;
  fixado: boolean;               // aparece sempre no topo
  expira_em: string | null;      // data de expiração do aviso
  created_at: string;
  autor?: Pick<Usuario, "nome">;
}

// ── ASSEMBLEIAS ───────────────────────────────────────────────────────────────

export interface Assembleia {
  id: string;
  condominio_id: string;
  titulo: string;
  descricao: string;
  opcoes: string[];              // ex: ["Sim", "Não", "Abstenção"]
  votos: Record<string, number>; // ex: { "Sim": 12, "Não": 3 }
  termina_em: string;
  ativa: boolean;
  created_at: string;
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  total_unidades: number;
  unidades_pagas: number;
  unidades_pendentes: number;
  unidades_atrasadas: number;
  receita_mes: number;
  receita_esperada: number;
  taxa_adimplencia: number;      // percentagem de pagamentos em dia
  ocorrencias_abertas: number;
  ocorrencias_resolvidas_mes: number;
  evolucao_pagamentos: Array<{
    mes: string;
    pago: number;
    pendente: number;
    atrasado: number;
  }>;
}

// ── FORMULÁRIOS ───────────────────────────────────────────────────────────────
// Tipos para os dados dos formulários (sem o "id" e campos gerados automaticamente)

export type NovaOcorrenciaForm = {
  titulo: string;
  descricao: string;
  categoria: OcorrenciaCategoria;
  foto_url: string;              // URL online
};

export type NovoPagamentoForm = {
  unidade_id: string;
  mes_referencia: string;
  valor: number;
  comprovativo_url: string;      // URL online do comprovativo
  notas?: string;
};

export type NovoAvisoForm = {
  titulo: string;
  conteudo: string;
  categoria: AvisoCategoria;
  fixado: boolean;
  expira_em?: string;
};

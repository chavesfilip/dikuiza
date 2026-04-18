// =============================================================================
// lib/utils.ts — Funções utilitárias reutilizáveis
// =============================================================================
// Pequenas funções que usamos em muitos sítios diferentes da aplicação.
// Em vez de repetir o mesmo código, importamos daqui.
// =============================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { pt } from "date-fns/locale";
import type { PagamentoStatus, OcorrenciaStatus } from "@/types";

// ── CLASSES CSS ───────────────────────────────────────────────────────────────
// cn() combina classes Tailwind de forma inteligente, evitando conflitos.
// Exemplo: cn("p-2", condition && "bg-gold") → "p-2 bg-gold" ou "p-2"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── FORMATAÇÃO DE MOEDA ───────────────────────────────────────────────────────
// Formata números como moeda angolana (Kwanzas)
// Exemplo: formatKz(50000) → "50.000 Kz"

export function formatKz(valor: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor) + " Kz";
}

// ── FORMATAÇÃO DE DATAS ───────────────────────────────────────────────────────
// Formata datas em português angolano
// Exemplo: formatData("2025-06-10") → "10 de Junho de 2025"

export function formatData(data: string, formato = "dd 'de' MMMM 'de' yyyy"): string {
  try {
    return format(parseISO(data), formato, { locale: pt });
  } catch {
    return data;
  }
}

// Formata mês de referência de pagamento
// Exemplo: formatMesRef("2025-06") → "Junho 2025"
export function formatMesRef(mesRef: string): string {
  try {
    return format(parseISO(mesRef + "-01"), "MMMM yyyy", { locale: pt });
  } catch {
    return mesRef;
  }
}

// ── GERAÇÃO DE REFERÊNCIA MULTICAIXA ─────────────────────────────────────────
// Gera uma referência bancária pseudo-aleatória para pagamento via Multicaixa.
// Em produção real, esta referência viria da API da EMIS Angola.
// Por agora, geramos um número baseado no ID da unidade + mês.

export function gerarReferenciaMulticaixa(unidadeId: string, mesRef: string): string {
  // Converte os primeiros caracteres do ID para número
  const base = unidadeId.replace(/-/g, "").substring(0, 8);
  const mesNum = mesRef.replace("-", "");
  // Cria uma referência de 9 dígitos (formato Multicaixa)
  const ref = (parseInt(base, 16) + parseInt(mesNum)).toString().substring(0, 9);
  return ref.padStart(9, "0");
}

// ── CORES POR STATUS ──────────────────────────────────────────────────────────
// Retorna classes Tailwind de cor consoante o estado do pagamento/ocorrência.
// Assim não repetimos estas condições em cada componente.

export function corPagamento(status: PagamentoStatus): {
  bg: string; text: string; border: string; dot: string;
} {
  const map = {
    pago:      { bg: "bg-sage/10",  text: "text-sage-lite",  border: "border-sage/30",  dot: "bg-sage-lite"  },
    pendente:  { bg: "bg-gold/10",  text: "text-gold",       border: "border-gold/30",  dot: "bg-gold"       },
    atrasado:  { bg: "bg-red-900/20", text: "text-red-400", border: "border-red-800/30", dot: "bg-red-400"  },
    cancelado: { bg: "bg-ink-mid",  text: "text-cream-mute", border: "border-ink-mid",  dot: "bg-cream-mute" },
  };
  return map[status];
}

export function corOcorrencia(status: OcorrenciaStatus): {
  bg: string; text: string; border: string;
} {
  const map = {
    aberta:       { bg: "bg-gold/10",    text: "text-gold",       border: "border-gold/30"    },
    em_andamento: { bg: "bg-sage/10",    text: "text-sage-lite",  border: "border-sage/30"    },
    resolvida:    { bg: "bg-green-900/20", text: "text-green-400", border: "border-green-800/30" },
    cancelada:    { bg: "bg-ink-mid",    text: "text-cream-mute", border: "border-ink-mid"    },
  };
  return map[status];
}

// ── LABELS LEGÍVEIS ───────────────────────────────────────────────────────────

export const LABEL_STATUS_PAGAMENTO: Record<PagamentoStatus, string> = {
  pago:      "Pago",
  pendente:  "Pendente",
  atrasado:  "Em Atraso",
  cancelado: "Cancelado",
};

export const LABEL_STATUS_OCORRENCIA: Record<OcorrenciaStatus, string> = {
  aberta:       "Aberta",
  em_andamento: "Em Andamento",
  resolvida:    "Resolvida",
  cancelada:    "Cancelada",
};

export const LABEL_CATEGORIA_OCORRENCIA = {
  eletrico:   "Eléctrico",
  hidraulico: "Hidráulico",
  estrutural: "Estrutural",
  limpeza:    "Limpeza",
  seguranca:  "Segurança",
  outro:      "Outro",
};

// ── VALIDAÇÃO DE URL ──────────────────────────────────────────────────────────
// Valida se uma string é uma URL válida (para comprovativos e fotos)

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch {
    return false;
  }
}

// ── TRUNCAR TEXTO ─────────────────────────────────────────────────────────────
// Corta texto longo e adiciona "..." no fim
// Exemplo: truncate("Texto muito longo aqui", 10) → "Texto muit..."

export function truncate(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + "...";
}

// ── CALCULAR TAXA DE ADIMPLÊNCIA ──────────────────────────────────────────────
// Percentagem de pagamentos em dia num condomínio

export function calcularAdimplencia(pagos: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((pagos / total) * 100);
}

// ── DIAS ATÉ VENCIMENTO ───────────────────────────────────────────────────────

export function diasAteVencimento(dataVencimento: string): number {
  const hoje = new Date();
  const vencimento = parseISO(dataVencimento);
  const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

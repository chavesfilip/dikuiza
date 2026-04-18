// =============================================================================
// lib/supabase.ts — Clientes do Supabase
// =============================================================================
// O Supabase é a nossa base de dados + autenticação + armazenamento.
// Precisamos de DOIS clientes diferentes:
//
// 1. Cliente do BROWSER (client-side): usado nos componentes React
//    — corre no telemóvel/computador do utilizador
//
// 2. Cliente do SERVIDOR (server-side): usado nas API Routes do Next.js
//    — corre no servidor Vercel, nunca exposto ao utilizador
//    — tem acesso a operações mais poderosas (service_role)
//
// As variáveis de ambiente (process.env.NEXT_PUBLIC_...) são valores
// secretos guardados no Vercel/Supabase que não colocamos no código.
// =============================================================================

import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── VARIÁVEIS DE AMBIENTE ─────────────────────────────────────────────────────
// Estas variáveis são definidas no ficheiro .env.local (desenvolvimento)
// e no painel do Vercel (produção). NUNCA as coloque directamente no código!

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ── CLIENTE DO BROWSER ────────────────────────────────────────────────────────
// Usado em componentes com "use client" — corre no browser do utilizador.
// Usa a chave "anon" (pública) que tem permissões limitadas pelo RLS.

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ── CLIENTE DO SERVIDOR ───────────────────────────────────────────────────────
// Usado em Server Components e API Routes do Next.js.
// Lê os cookies da sessão para saber quem está autenticado.

export async function createServerActionClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}

// ── CLIENTE ADMIN (SERVICE ROLE) ──────────────────────────────────────────────
// Usado APENAS em operações administrativas no servidor.
// Ignora as políticas de segurança RLS — usar com muito cuidado!
// Nunca expor esta chave ao browser.

export function createAdminClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

"use client";
// =============================================================================
// app/dashboard/layout.tsx — Layout do Dashboard
// =============================================================================
// Este layout envolve TODAS as páginas do dashboard (/dashboard/*).
// Contém:
//   - Sidebar de navegação (esquerda)
//   - Topbar (topo)
//   - Área de conteúdo (direita)
//
// É um "use client" porque precisamos de:
//   - useState para o menu mobile (aberto/fechado)
//   - usePathname para saber qual página está activa
// =============================================================================

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import type { Usuario } from "@/types";

// ── ITENS DE NAVEGAÇÃO ────────────────────────────────────────────────────────
// Cada item tem: ícone, rótulo, URL, e opcionalmente um badge de notificação.
// O array é diferente por role — síndico vê mais opções que condómino.

const NAV_CONDOMININO = [
  { icon: "🏠", label: "Início",        href: "/dashboard" },
  { icon: "💳", label: "Pagamentos",    href: "/dashboard/pagamentos", badge: "1" },
  { icon: "📢", label: "Avisos",        href: "/dashboard/avisos",     badge: "3" },
  { icon: "🔧", label: "Ocorrências",   href: "/dashboard/ocorrencias" },
  { icon: "🏊", label: "Áreas Comuns",  href: "/dashboard/areas" },
  { icon: "🗳️", label: "Assembleias",   href: "/dashboard/assembleias" },
  { icon: "👤", label: "Perfil",        href: "/dashboard/perfil" },
];

const NAV_SINDICO = [
  { icon: "🏠", label: "Dashboard",     href: "/dashboard" },
  { icon: "💰", label: "Financeiro",    href: "/dashboard/financeiro" },
  { icon: "🏢", label: "Condomínio",    href: "/dashboard/condominios" },
  { icon: "👥", label: "Moradores",     href: "/dashboard/usuarios" },
  { icon: "🔧", label: "Ocorrências",   href: "/dashboard/ocorrencias", badge: "2" },
  { icon: "📢", label: "Avisos",        href: "/dashboard/avisos" },
  { icon: "🗳️", label: "Assembleias",   href: "/dashboard/assembleias" },
  { icon: "📊", label: "Analytics",     href: "/dashboard/analytics" },
  { icon: "⚙️", label: "Configurações", href: "/dashboard/configuracoes" },
];

const NAV_ADMIN = [
  { icon: "🌐", label: "Visão Global",  href: "/dashboard" },
  { icon: "🏢", label: "Condomínios",   href: "/dashboard/condominios" },
  { icon: "👥", label: "Utilizadores",  href: "/dashboard/usuarios" },
  { icon: "💰", label: "Financeiro",    href: "/dashboard/financeiro" },
  { icon: "📊", label: "Analytics",     href: "/dashboard/analytics" },
  { icon: "⚙️", label: "Sistema",       href: "/dashboard/configuracoes" },
];

// ── COMPONENTE ────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [sidebarOpen, setSidebarOpen] = useState(false); // controlo mobile
  const [usuario, setUsuario] = useState<Partial<Usuario> | null>(null);
  const [loading, setLoading] = useState(true);

  // ── VERIFICAR SESSÃO ─────────────────────────────────────────────────────────
  // Quando o componente carrega, verificamos se há um utilizador autenticado.
  // Se não houver, redireccionamos para o login.

  useEffect(() => {
    const carregarUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Busca o perfil completo do utilizador na nossa tabela
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      setUsuario(perfil || { email: user.email, nome: user.email?.split("@")[0], role: "condominino" });
      setLoading(false);
    };

    carregarUsuario();
  }, []);

  // ── LOGOUT ───────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão terminada");
    router.push("/auth");
  };

  // ── MENU CONSOANTE O ROLE ─────────────────────────────────────────────────────

  const navItems =
    usuario?.role === "admin"   ? NAV_ADMIN :
    usuario?.role === "sindico" ? NAV_SINDICO :
    NAV_CONDOMININO;

  // ── INITIAIS DO AVATAR ────────────────────────────────────────────────────────
  const iniciais = usuario?.nome
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-display font-bold text-ink animate-pulse">DK</div>
          <p className="text-cream-mute text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex">

      {/* ── OVERLAY MOBILE ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-60
        bg-ink-soft border-r border-gold/10
        flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gold/10 flex-shrink-0">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-display font-bold text-ink text-sm">DK</div>
          <span className="font-display font-bold text-cream">Dikuiza</span>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="text-xs text-cream-mute uppercase tracking-widest px-3 py-2 mt-2">
            {usuario?.role === "admin" ? "Administração" :
             usuario?.role === "sindico" ? "Gestão" : "Principal"}
          </div>

          {navItems.map((item) => {
            // Verifica se é o item activo comparando o URL actual
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1
                  text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-gold/10 text-gold"
                    : "text-cream-mute hover:bg-white/5 hover:text-cream"
                  }
                `}
              >
                {/* Barra lateral quando activo */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r" />
                )}

                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>

                {/* Badge de notificação */}
                {item.badge && (
                  <span className="bg-terra text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Perfil do utilizador no fundo */}
        <div
          className="flex items-center gap-3 p-4 border-t border-gold/10 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={handleLogout}
          title="Clique para sair"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-dim to-terra flex items-center justify-center font-display font-bold text-xs text-cream flex-shrink-0">
            {iniciais}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-cream truncate">{usuario?.nome}</div>
            <div className="text-xs text-gold capitalize">{usuario?.role}</div>
          </div>
          <span className="text-cream-mute text-xs">↩</span>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">

        {/* ── TOPBAR ── */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6
          bg-ink/80 backdrop-blur-md border-b border-gold/10">

          {/* Botão menu mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-cream-mute hover:text-cream transition-colors"
          >
            ☰
          </button>

          {/* Título da página actual */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-cream-mute">Dikuiza</span>
            <span className="text-cream-mute">›</span>
            <span className="font-display font-bold text-cream capitalize">
              {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
            </span>
          </div>

          {/* Acções do topo */}
          <div className="flex items-center gap-3">
            {/* Sino de notificações */}
            <button className="relative w-9 h-9 rounded-xl bg-ink-soft border border-gold/10 flex items-center justify-center text-base hover:border-gold/30 transition-colors">
              🔔
              {/* Ponto vermelho quando há notificações */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terra rounded-full border-2 border-ink" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-dim to-terra flex items-center justify-center font-display font-bold text-xs text-cream">
              {iniciais}
            </div>
          </div>
        </header>

        {/* ── CONTEÚDO DA PÁGINA ── */}
        {/* "children" é substituído pela página actual (/dashboard, /dashboard/pagamentos, etc.) */}
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

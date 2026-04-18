// =============================================================================
// app/layout.tsx — Layout Raiz da Aplicação
// =============================================================================
// Este é o componente que envolve TODAS as páginas da aplicação.
// Tudo o que aqui colocamos aparece em todas as páginas:
//   - Fontes (Syne e DM Sans do Google Fonts)
//   - Metadados PWA (para instalar no telemóvel)
//   - Providers (Tanstack Query para gestão de dados)
//   - Toaster (notificações tipo "toast" no canto do ecrã)
// =============================================================================

import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// ── FONTES DO GOOGLE ──────────────────────────────────────────────────────────
// Next.js faz download das fontes automaticamente e serve-as localmente.
// Isto é mais rápido e não depende do Google (privacidade).

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",   // torna disponível como variável CSS
  weight: ["400", "600", "700", "800"],
  display: "swap",           // mostra texto com fonte de sistema enquanto carrega
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
  display: "swap",
});

// ── METADADOS ─────────────────────────────────────────────────────────────────
// Estes metadados aparecem no Google, nas partilhas nas redes sociais,
// e quando se "instala" a app no telemóvel (PWA).

export const metadata: Metadata = {
  title: {
    default: "Dikuiza — Gestão de Condomínios",
    template: "%s | Dikuiza",  // %s será substituído pelo título de cada página
  },
  description: "A plataforma SaaS de gestão de condomínios feita para Angola. Transparência financeira, comunicação eficiente e controlo total do seu condomínio.",
  keywords: ["condomínio", "angola", "kilamba", "gestão", "sindico", "quota"],
  authors: [{ name: "Dikuiza" }],

  // Ícones da PWA (os ficheiros ficam em /public/icons/)
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },

  // Manifest da PWA (ficheiro que descreve a "app" ao browser)
  manifest: "/manifest.json",

  // Open Graph: como a página aparece quando partilhada no WhatsApp, etc.
  openGraph: {
    title: "Dikuiza — Gestão de Condomínios",
    description: "A plataforma SaaS para condomínios em Angola",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Dikuiza",
    locale: "pt_AO",
    type: "website",
  },
};

// ── VIEWPORT / PWA ────────────────────────────────────────────────────────────
// Configurações visuais para telemóvel

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,           // impede zoom involuntário em iOS
  themeColor: "#0F0E0D",    // cor da barra do browser no telemóvel
};

// ── COMPONENTE DE LAYOUT ──────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-body bg-ink text-cream antialiased">
        {/* children = conteúdo da página actual */}
        {children}

        {/* Toaster: notificações "toast" que aparecem no canto */}
        {/* sonner é uma biblioteca de notificações elegante */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1C1A17",
              border: "1px solid rgba(232,160,48,0.2)",
              color: "#FAF7F2",
              fontFamily: "var(--font-dm-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}

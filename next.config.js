// =============================================================================
// next.config.js — Configuração principal do Next.js
// =============================================================================
// Este ficheiro controla o comportamento do Next.js.
// Usamos o "next-pwa" para transformar o site numa Progressive Web App (PWA),
// ou seja, o utilizador pode "instalar" o Dikuiza no telemóvel sem passar
// pela Play Store, directamente pelo browser.
// =============================================================================

const withPWA = require("next-pwa")({
  dest: "public",           // onde o next-pwa guarda os ficheiros de cache
  register: true,           // regista automaticamente o service worker
  skipWaiting: true,        // actualiza a PWA imediatamente quando há nova versão
  disable: process.env.NODE_ENV === "development", // desliga PWA em desenvolvimento
  runtimeCaching: [
    // Cache de páginas visitadas — o utilizador pode abrir mesmo sem internet
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "dikuiza-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 }, // 1 dia
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite imagens de qualquer domínio HTTPS (para URLs de comprovativos)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Variáveis de ambiente expostas ao browser (prefixo NEXT_PUBLIC_)
  // As outras variáveis (sem NEXT_PUBLIC_) ficam só no servidor — mais seguro
  env: {
    NEXT_PUBLIC_APP_NAME: "Dikuiza",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = withPWA(nextConfig);

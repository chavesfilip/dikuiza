// =============================================================================
// app/page.tsx — Landing Page do Dikuiza
// =============================================================================
// Esta é a página principal pública (dikuiza.ao ou dikuiza.vercel.app).
// É um Server Component (sem "use client") — corre no servidor e envia
// HTML já pronto para o browser. Isto é mais rápido para o Google indexar.
// =============================================================================

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dikuiza — Gestão de Condomínios em Angola",
  description: "Plataforma SaaS que simplifica a gestão de condomínios. Pagamentos Multicaixa, comunicação com moradores e controlo financeiro. Experimente 3 meses grátis.",
};

// ── DADOS DAS FUNCIONALIDADES ─────────────────────────────────────────────────
const funcionalidades = [
  {
    icon: "💳",
    titulo: "Pagamentos Multicaixa",
    desc: "Referências automáticas para cada morador. Conciliação bancária sem complicações. Histórico completo de quotas.",
  },
  {
    icon: "📢",
    titulo: "Comunicação Total",
    desc: "Mural digital de avisos, notificações push no telemóvel e assembleias virtuais para votar sem sair de casa.",
  },
  {
    icon: "🔧",
    titulo: "Gestão de Ocorrências",
    desc: "Moradores reportam problemas com foto (via URL). Acompanhe o estado em tempo real até à resolução.",
  },
  {
    icon: "🛡️",
    titulo: "Controlo de Acesso",
    desc: "Registo de visitantes pela segurança. Notificação instantânea ao morador quando chega uma visita.",
  },
  {
    icon: "📊",
    titulo: "Painel Financeiro",
    desc: "Taxa de adimplência, receita por mês, unidades em atraso. Todos os números num único ecrã.",
  },
  {
    icon: "🏢",
    titulo: "Multi-Edifício",
    desc: "Um único painel para gerir vários blocos e torres. Escala do Kilamba — preparado para 710 edifícios.",
  },
];

const testemunhos = [
  {
    nome: "Carlos Mendes",
    cargo: "Síndico · Condomínio Kilamba Prime",
    texto: "Antes usávamos WhatsApp e papéis. Agora temos tudo organizado: os moradores pagam, eu vejo em tempo real. O Dikuiza mudou a nossa gestão.",
    avatar: "CM",
  },
  {
    nome: "Ana Ferreira",
    cargo: "Moradora · Bloco A, Apto 3B",
    texto: "Finalmente sei exactamente quanto devo e quando pagar. A app instalei no telemóvel e uso como qualquer outra app — super fácil.",
    avatar: "AF",
  },
  {
    nome: "David Nkosi",
    cargo: "Síndico · Residencial Talatona",
    texto: "O controlo de visitantes pela segurança e a notificação automática ao morador foi o que mais nos impressionou. Moderno e seguro.",
    avatar: "DN",
  },
];

const planos = [
  {
    nome: "Trial Gratuito",
    preco: "0 Kz",
    periodo: "durante 3 meses",
    destaque: false,
    features: [
      "Até 50 unidades",
      "Pagamentos Multicaixa",
      "Mural de avisos",
      "Ocorrências básicas",
      "Suporte por e-mail",
    ],
  },
  {
    nome: "Profissional",
    preco: "1.111 Kz",
    periodo: "por apartamento / mês",
    destaque: true,
    features: [
      "Unidades ilimitadas",
      "Todos os módulos activos",
      "Assembleias virtuais",
      "Controlo de acesso",
      "Analytics avançado",
      "Notificações push/SMS",
      "Suporte prioritário",
      "Multi-bloco / multi-torre",
    ],
  },
];

const faqs = [
  {
    q: "O que é o Dikuiza?",
    a: "O Dikuiza é uma plataforma digital (web + app) para gerir condomínios em Angola. Centraliza pagamentos, comunicações, ocorrências e controlo de acesso num único sistema.",
  },
  {
    q: "Como funciona o período gratuito?",
    a: "Os primeiros 3 meses são completamente gratuitos, sem necessidade de cartão de crédito. Depois, o custo é de 1.111 Kz por apartamento/mês.",
  },
  {
    q: "Posso usar no telemóvel?",
    a: "Sim! O Dikuiza é uma PWA (Progressive Web App). Basta abrir o site no Chrome/Safari e instalar directamente no ecrã principal do telemóvel — funciona como uma app nativa.",
  },
  {
    q: "Os dados são seguros?",
    a: "Sim. Cada condomínio tem os seus dados completamente isolados (multi-tenant). Usamos Supabase com PostgreSQL e autenticação JWT. Nenhum condomínio vê dados de outro.",
  },
  {
    q: "A integração com o Multicaixa é real?",
    a: "Geramos as referências bancárias segundo o formato da EMIS. A integração completa com a API da EMIS está no roadmap — por agora, os comprovativos são submetidos via URL.",
  },
];

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink">

      {/* ── NAVEGAÇÃO ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gold/10 bg-ink/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center font-display font-bold text-ink text-sm">
              DK
            </div>
            <span className="font-display font-bold text-lg text-cream">Dikuiza</span>
          </div>

          {/* Links de navegação — ocultos em mobile */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm text-cream-mute hover:text-cream transition-colors">Funcionalidades</a>
            <a href="#precos" className="text-sm text-cream-mute hover:text-cream transition-colors">Preços</a>
            <a href="#faq" className="text-sm text-cream-mute hover:text-cream transition-colors">FAQ</a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-cream-dim hover:text-cream transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link
              href="/auth/registo"
              className="bg-gold text-ink font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-lite transition-all duration-200 hover:shadow-lg hover:shadow-gold/20"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 bg-geo-pattern overflow-hidden">
        {/* Decoração geométrica de fundo */}
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full border border-gold/10 -translate-y-1/2 translate-x-1/3 animate-spin-slow" />
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full border border-gold/5 -translate-y-1/3 translate-x-1/4" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 text-gold text-sm font-medium mb-8">
            <span className="status-dot" />
            Disponível para toda Angola · Kilamba, Talatona, Luanda
          </div>

          {/* Título principal */}
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            O seu condomínio,{" "}
            <span className="text-gradient-gold">finalmente</span>{" "}
            organizado.
          </h1>

          <p className="text-lg md:text-xl text-cream-dim max-w-2xl mx-auto leading-relaxed mb-12">
            Dikuiza é a plataforma SaaS de gestão de condomínios feita para Angola.
            Pagamentos Multicaixa, comunicação com moradores, controlo de acesso
            e finanças transparentes — tudo no telemóvel ou computador.
          </p>

          {/* CTAs principais */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/registo"
              className="bg-gold text-ink font-display font-bold text-base px-8 py-4 rounded-2xl hover:bg-gold-lite transition-all duration-200 hover:shadow-xl hover:shadow-gold/25 hover:-translate-y-0.5"
            >
              Experimentar Grátis — 3 Meses 🎉
            </Link>
            <Link
              href="/auth/login"
              className="border border-gold/20 text-cream font-medium text-base px-8 py-4 rounded-2xl hover:border-gold/40 hover:bg-gold/5 transition-all duration-200"
            >
              Já tenho conta →
            </Link>
          </div>

          {/* Estatísticas sociais */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { num: "710", label: "Edifícios no Kilamba" },
              { num: "3 meses", label: "Grátis para começar" },
              { num: "1.111 Kz", label: "Por apartamento/mês" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-gold">{s.num}</div>
                <div className="text-sm text-cream-mute mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ───────────────────────────────────────────────────── */}
      <section id="funcionalidades" className="py-24 px-6 bg-ink-soft">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
              Tudo o que precisa,<br />
              <span className="text-gold">num só lugar</span>
            </h2>
            <p className="text-cream-dim text-lg max-w-xl mx-auto">
              Desenvolvido especificamente para o ecossistema angolano.
              Não é um software genérico — tem o DNA de Luanda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funcionalidades.map((f) => (
              <div
                key={f.titulo}
                className="relative bg-ink border border-gold/10 rounded-2xl p-6 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-lg font-bold text-cream mb-2 group-hover:text-gold transition-colors">
                  {f.titulo}
                </h3>
                <p className="text-cream-mute text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-extrabold mb-4">
              Em produção em <span className="text-gold">menos de 1 dia</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { step: "01", titulo: "Registe o seu condomínio", desc: "Crie a conta, adicione os blocos e as unidades. O Dikuiza gera automaticamente o perfil de cada morador." },
              { step: "02", titulo: "Convide os moradores", desc: "Enviamos e-mail automático para cada morador com link de acesso. Em 5 minutos já estão na plataforma." },
              { step: "03", titulo: "Gerencie tudo digitalmente", desc: "Quotas, ocorrências, avisos, assembleias — tudo centralizado. Receba notificações em tempo real." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start bg-ink-soft border border-gold/10 rounded-2xl p-6">
                <div className="font-display text-4xl font-extrabold text-gold/30 w-16 flex-shrink-0">{item.step}</div>
                <div>
                  <h3 className="font-display text-xl font-bold text-cream mb-2">{item.titulo}</h3>
                  <p className="text-cream-mute leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTEMUNHOS ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-ink-soft">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl font-extrabold text-center mb-16">
            O que dizem os <span className="text-gold">síndicos</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testemunhos.map((t) => (
              <div key={t.nome} className="bg-ink border border-gold/10 rounded-2xl p-6">
                <p className="text-cream-dim leading-relaxed mb-6 text-sm italic">"{t.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dim to-terra flex items-center justify-center font-display font-bold text-sm text-cream flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-cream text-sm">{t.nome}</div>
                    <div className="text-cream-mute text-xs">{t.cargo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇOS ────────────────────────────────────────────────────────────── */}
      <section id="precos" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-extrabold mb-4">
              Simples e <span className="text-gold">transparente</span>
            </h2>
            <p className="text-cream-dim">Sem taxas escondidas. Sem contratos anuais forçados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {planos.map((p) => (
              <div
                key={p.nome}
                className={`relative rounded-2xl p-8 border ${
                  p.destaque
                    ? "bg-gold/5 border-gold/40 ring-1 ring-gold/20"
                    : "bg-ink-soft border-gold/10"
                }`}
              >
                {p.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-ink text-xs font-display font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-cream-mute text-sm mb-2">{p.nome}</div>
                  <div className="font-display text-4xl font-extrabold text-cream">
                    {p.preco}
                  </div>
                  <div className="text-cream-mute text-sm mt-1">{p.periodo}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-cream-dim">
                      <span className="text-gold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/registo"
                  className={`block text-center font-display font-bold text-sm py-3 rounded-xl transition-all duration-200 ${
                    p.destaque
                      ? "bg-gold text-ink hover:bg-gold-lite hover:shadow-lg hover:shadow-gold/20"
                      : "border border-gold/20 text-cream hover:border-gold/40 hover:bg-gold/5"
                  }`}
                >
                  {p.destaque ? "Começar Agora →" : "Experimentar Grátis"}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-cream-mute text-sm mt-8">
            Exemplo: condomínio com 40 apartamentos = <strong className="text-cream">44.440 Kz/mês</strong> para gerir tudo.
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-ink-soft">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-extrabold text-center mb-16">
            Perguntas <span className="text-gold">frequentes</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-ink border border-gold/10 rounded-2xl p-6">
                <h3 className="font-display font-bold text-cream mb-3">{f.q}</h3>
                <p className="text-cream-mute text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-ink-soft to-ink border border-gold/20 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-geo-pattern" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-cream-dim text-lg mb-8 max-w-xl mx-auto">
                Junte-se aos síndicos que já digitalizam os seus condomínios com o Dikuiza.
                3 meses grátis, sem compromisso.
              </p>
              <Link
                href="/auth/registo"
                className="inline-block bg-gold text-ink font-display font-bold text-lg px-10 py-4 rounded-2xl hover:bg-gold-lite transition-all duration-200 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-1"
              >
                Criar Conta Gratuita →
              </Link>
              <p className="text-cream-mute text-sm mt-4">Sem cartão de crédito · Configuração em 10 minutos</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RODAPÉ ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gold/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-display font-bold text-ink text-xs">DK</div>
            <span className="font-display font-bold text-cream">Dikuiza</span>
          </div>
          <div className="text-cream-mute text-sm text-center">
            © 2025 Dikuiza · Feito com 🇦🇴 para Angola · Todos os direitos reservados
          </div>
          <div className="flex gap-4 text-sm text-cream-mute">
            <a href="#" className="hover:text-cream transition-colors">Privacidade</a>
            <a href="#" className="hover:text-cream transition-colors">Termos</a>
            <a href="mailto:suporte@dikuiza.ao" className="hover:text-cream transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

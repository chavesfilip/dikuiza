"use client";
// =============================================================================
// app/auth/page.tsx — Página de Autenticação (Login + Registo)
// =============================================================================
// "use client" significa que este componente corre no BROWSER do utilizador,
// não no servidor. Precisamos disto porque usa useState e eventos de formulário.
//
// Esta página tem dois modos:
//   1. Login: utilizadores existentes entram com e-mail + senha
//   2. Registo: síndicos novos criam conta (com período trial de 3 meses)
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

// ── TIPOS DOS FORMULÁRIOS ─────────────────────────────────────────────────────

type Modo = "login" | "registo";

type FormLogin = {
  email: string;
  senha: string;
};

type FormRegisto = {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  nomeCondominio: string;
  enderecoCondominio: string;
  totalUnidades: string;
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  // Estado do modo actual (login ou registo)
  const [modo, setModo] = useState<Modo>("login");
  const [loading, setLoading] = useState(false);

  // Estado dos formulários
  const [formLogin, setFormLogin] = useState<FormLogin>({ email: "", senha: "" });
  const [formRegisto, setFormRegisto] = useState<FormRegisto>({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    nomeCondominio: "",
    enderecoCondominio: "",
    totalUnidades: "",
  });

  // ── LOGIN ───────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!formLogin.email || !formLogin.senha) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      // Chama o Supabase para autenticar
      // O Supabase guarda a sessão em cookies automaticamente
      const { error } = await supabase.auth.signInWithPassword({
        email: formLogin.email,
        password: formLogin.senha,
      });

      if (error) {
        // Traduz mensagens de erro do inglês para português
        const mensagens: Record<string, string> = {
          "Invalid login credentials": "E-mail ou senha incorrectos",
          "Email not confirmed": "Confirme o seu e-mail primeiro",
          "Too many requests": "Demasiadas tentativas. Aguarde um momento.",
        };
        toast.error(mensagens[error.message] || error.message);
        return;
      }

      toast.success("Bem-vindo de volta! 👋");
      // Redireciona para o dashboard após login bem-sucedido
      router.push("/dashboard");
      router.refresh(); // força o Next.js a re-verificar a sessão
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTO ─────────────────────────────────────────────────────────────────

  const handleRegisto = async () => {
    // Validações básicas
    if (!formRegisto.nome || !formRegisto.email || !formRegisto.senha || !formRegisto.nomeCondominio) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (formRegisto.senha.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      // 1. Cria a conta de autenticação no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formRegisto.email,
        password: formRegisto.senha,
        options: {
          // Dados extra que são guardados no metadata do utilizador
          data: {
            nome: formRegisto.nome,
            telefone: formRegisto.telefone,
            role: "sindico",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar utilizador");

      // 2. Cria o registo do condomínio na base de dados
      // A data de trial é hoje + 90 dias (3 meses)
      const trialTermina = new Date();
      trialTermina.setDate(trialTermina.getDate() + 90);

      const { data: condoData, error: condoError } = await supabase
        .from("condominios")
        .insert({
          nome: formRegisto.nomeCondominio,
          endereco: formRegisto.enderecoCondominio,
          cidade: "Luanda",
          total_unidades: parseInt(formRegisto.totalUnidades) || 0,
          sindico_id: authData.user.id,
          plano: "gratuito",
          valor_quota: 50000, // valor padrão, pode ser alterado depois
          trial_termina_em: trialTermina.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (condoError) throw condoError;

      // 3. Cria o perfil do utilizador na tabela "usuarios"
      const { error: userError } = await supabase
        .from("usuarios")
        .insert({
          id: authData.user.id,
          email: formRegisto.email,
          nome: formRegisto.nome,
          telefone: formRegisto.telefone || null,
          role: "sindico",
          condominio_id: condoData.id,
        });

      if (userError) throw userError;

      toast.success("Conta criada! Verifique o seu e-mail para confirmar. 📧");
      setModo("login");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  // ── RENDERIZAÇÃO ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-ink flex">

      {/* ── PAINEL ESQUERDO (marca) — oculto em mobile ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink-soft border-r border-gold/10 p-12 relative overflow-hidden">
        {/* Decoração geométrica */}
        <div className="absolute -top-20 -right-20 w-80 h-80 border border-gold/10 rounded-full animate-spin-slow" />
        <div className="absolute -top-10 -right-10 w-60 h-60 border border-gold/5 rounded-full" />
        <div className="absolute bottom-20 -left-10 w-40 h-40 border border-terra/10 rotate-45" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-display font-bold text-ink">DK</div>
          <div>
            <div className="font-display font-bold text-lg text-cream">Dikuiza</div>
            <div className="text-xs text-cream-mute tracking-widest uppercase">Gestão de Condomínios</div>
          </div>
        </Link>

        {/* Conteúdo central */}
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-extrabold leading-tight mb-4">
            A sua comunidade,<br />
            <span className="text-gold">mais organizada.</span>
          </h2>
          <p className="text-cream-dim leading-relaxed max-w-sm">
            Feito para Angola. Nascido na Centralidade do Kilamba.
            Transparência financeira, comunicação eficiente e controlo total.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="flex gap-10 relative z-10">
          {[
            { num: "710", label: "Edifícios" },
            { num: "12k+", label: "Moradores" },
            { num: "3 meses", label: "Grátis" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl font-bold text-gold">{s.num}</div>
              <div className="text-xs text-cream-mute">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAINEL DIREITO (formulário) ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-display font-bold text-ink text-xs">DK</div>
            <span className="font-display font-bold text-cream">Dikuiza</span>
          </Link>

          {/* Título do formulário */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-cream mb-2">
              {modo === "login" ? "Bem-vindo de volta" : "Criar conta"}
            </h1>
            <p className="text-cream-mute text-sm">
              {modo === "login"
                ? "Aceda à sua área pessoal do condomínio"
                : "3 meses grátis · Sem cartão de crédito"}
            </p>
          </div>

          {/* ── FORMULÁRIO DE LOGIN ── */}
          {modo === "login" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-cream-dim mb-2 tracking-wide">E-mail</label>
                <input
                  type="email"
                  placeholder="o.seu@email.com"
                  value={formLogin.email}
                  onChange={(e) => setFormLogin({ ...formLogin, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-cream-dim tracking-wide">Senha</label>
                  <button className="text-xs text-gold hover:text-gold-lite transition-colors">Esqueceu?</button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formLogin.senha}
                  onChange={(e) => setFormLogin({ ...formLogin, senha: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gold text-ink font-display font-bold py-3.5 rounded-xl hover:bg-gold-lite transition-all duration-200 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "A entrar..." : "Entrar"}
              </button>

              <div className="text-center text-sm text-cream-mute">
                Não tem conta?{" "}
                <button onClick={() => setModo("registo")} className="text-gold hover:text-gold-lite transition-colors font-medium">
                  Registar condomínio
                </button>
              </div>
            </div>
          )}

          {/* ── FORMULÁRIO DE REGISTO ── */}
          {modo === "registo" && (
            <div className="space-y-4">
              {/* Dados pessoais */}
              <div className="text-xs text-cream-mute uppercase tracking-widest mb-1">Dados do Síndico</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cream-dim mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    placeholder="João Silva"
                    value={formRegisto.nome}
                    onChange={(e) => setFormRegisto({ ...formRegisto, nome: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream-dim mb-2">Telefone</label>
                  <input
                    type="tel"
                    placeholder="+244 9XX XXX XXX"
                    value={formRegisto.telefone}
                    onChange={(e) => setFormRegisto({ ...formRegisto, telefone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-cream-dim mb-2">E-mail *</label>
                <input
                  type="email"
                  placeholder="sindico@condominio.ao"
                  value={formRegisto.email}
                  onChange={(e) => setFormRegisto({ ...formRegisto, email: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-cream-dim mb-2">Senha * (mín. 8 caracteres)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formRegisto.senha}
                  onChange={(e) => setFormRegisto({ ...formRegisto, senha: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm"
                />
              </div>

              {/* Dados do condomínio */}
              <div className="text-xs text-cream-mute uppercase tracking-widest pt-2 mb-1">Dados do Condomínio</div>

              <div>
                <label className="block text-xs font-medium text-cream-dim mb-2">Nome do Condomínio *</label>
                <input
                  type="text"
                  placeholder="Kilamba Prime, Residencial Talatona..."
                  value={formRegisto.nomeCondominio}
                  onChange={(e) => setFormRegisto({ ...formRegisto, nomeCondominio: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cream-dim mb-2">Endereço</label>
                  <input
                    type="text"
                    placeholder="Centralidade do Kilamba..."
                    value={formRegisto.enderecoCondominio}
                    onChange={(e) => setFormRegisto({ ...formRegisto, enderecoCondominio: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream-dim mb-2">Nº de Apartamentos</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={formRegisto.totalUnidades}
                    onChange={(e) => setFormRegisto({ ...formRegisto, totalUnidades: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleRegisto}
                disabled={loading}
                className="w-full bg-gold text-ink font-display font-bold py-3.5 rounded-xl hover:bg-gold-lite transition-all duration-200 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "A criar conta..." : "Criar Conta Grátis →"}
              </button>

              <div className="text-center text-sm text-cream-mute">
                Já tem conta?{" "}
                <button onClick={() => setModo("login")} className="text-gold hover:text-gold-lite transition-colors font-medium">
                  Entrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

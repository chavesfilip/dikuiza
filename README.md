# 🏢 Dikuiza — Plataforma SaaS de Gestão de Condomínios

> Feito para Angola. Nascido na Centralidade do Kilamba.

O **Dikuiza** digitaliza a gestão de condomínios: pagamentos Multicaixa, comunicação com moradores, ocorrências e relatórios financeiros — web + mobile (PWA).

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Estrutura do Projecto](#2-estrutura-do-projecto)
3. [Configurar o Supabase](#3-configurar-o-supabase-base-de-dados)
4. [Instalar e Correr Localmente](#4-instalar-e-correr-localmente)
5. [Publicar no GitHub](#5-publicar-no-github)
6. [Deploy no Vercel](#6-deploy-no-vercel)
7. [Configurar PWA](#7-configurar-a-pwa-app-mobile)
8. [Analytics](#8-analytics)
9. [Variáveis de Ambiente](#9-variáveis-de-ambiente)
10. [Manual do Utilizador](#10-manual-do-utilizador)
11. [Arquitectura Técnica](#11-arquitectura-técnica)
12. [Resolução de Problemas](#12-resolução-de-problemas)

---

## 1. Pré-requisitos

### Node.js (obrigatório)
1. Vá a **https://nodejs.org** → descarregue a versão **LTS**
2. Instale normalmente
3. Verifique no terminal:
```bash
node -v   # deve mostrar v20.x.x ou superior
npm -v    # deve mostrar 10.x.x ou superior
```

### VS Code + Extensões recomendadas
- Download: **https://code.visualstudio.com**
- `Ctrl+Shift+X` → instale:
  - **Tailwind CSS IntelliSense** — autocomplete de classes CSS
  - **ES7+ React/Redux Snippets** — atalhos para React
  - **Prettier** — formata código automaticamente
  - **GitLens** — integração visual com Git
  - **Error Lens** — mostra erros directamente no código

### Git
- Windows: **https://git-scm.com/download/win**
- Mac: já vem instalado

---

## 2. Estrutura do Projecto

```
dikuiza/
├── app/                          ← Páginas (Next.js App Router)
│   ├── layout.tsx                ← Layout raiz (fontes, PWA, toaster)
│   ├── globals.css               ← Estilos globais e variáveis CSS
│   ├── page.tsx                  ← Landing page pública (/)
│   ├── auth/page.tsx             ← Login e registo (/auth)
│   └── dashboard/
│       ├── layout.tsx            ← Sidebar + topbar do dashboard
│       ├── page.tsx              ← Página inicial (/dashboard)
│       ├── pagamentos/page.tsx   ← Módulo Multicaixa
│       ├── ocorrencias/page.tsx  ← Reporte de problemas
│       ├── avisos/page.tsx       ← Mural de comunicados
│       └── analytics/page.tsx   ← Gráficos e estatísticas
│
├── lib/
│   ├── supabase.ts               ← Clientes Supabase (browser + servidor)
│   ├── queries.ts                ← Consultas à base de dados
│   └── utils.ts                  ← Funções utilitárias
│
├── types/index.ts                ← Tipos TypeScript de toda a app
├── supabase/migrations/
│   └── 001_schema_inicial.sql   ← SQL de criação de todas as tabelas
├── public/manifest.json          ← Configuração PWA
├── package.json                  ← Dependências
├── next.config.js                ← Config Next.js + PWA
└── tailwind.config.ts            ← Sistema de design (cores, fontes)
```

**Como funciona o Next.js App Router:**
- Cada pasta com `page.tsx` é uma página acessível pelo browser
- `layout.tsx` envolve todas as páginas na mesma pasta e sub-pastas
- `"use client"` no topo = corre no browser do utilizador
- Sem `"use client"` = corre no servidor (mais rápido para SEO)

---

## 3. Configurar o Supabase (Base de Dados)

### 3.1 Criar conta e projecto

1. Vá a **https://supabase.com** → "Start your project"
2. Registe com a conta GitHub
3. Clique **"New Project"**:
   - **Name:** `dikuiza`
   - **Database Password:** crie uma senha forte (guarde-a!)
   - **Region:** EU West (Europa — mais próximo de Angola)
4. Aguarde ~2 minutos

### 3.2 Executar o Schema SQL

Cria todas as tabelas da base de dados:

1. Supabase → **"SQL Editor"** → **"New Query"**
2. Copie TODO o conteúdo de `supabase/migrations/001_schema_inicial.sql`
3. Cole no editor e clique **"Run"** (`Ctrl+Enter`)
4. Deve aparecer: "Success. No rows returned."

### 3.3 Obter as credenciais

1. Supabase → **"Project Settings"** → **"API"**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (nunca expor!)

### 3.4 Configurar URLs de redireccão

1. Supabase → **"Authentication"** → **"URL Configuration"**
2. **Site URL:** `https://dikuiza.vercel.app` (ou `http://localhost:3000` em dev)
3. **Redirect URLs:** adicione `https://dikuiza.vercel.app/**` e `http://localhost:3000/**`

### 3.5 Email (opcional mas recomendado em produção)

1. Crie conta em **https://resend.com** (100 emails/dia grátis)
2. Obtenha a API Key
3. Supabase → **"Authentication"** → **"SMTP Settings"** → configure o Resend

---

## 4. Instalar e Correr Localmente

### 4.1 Abrir o projecto no VS Code

```bash
# Entre na pasta do projecto
cd dikuiza

# Abra no VS Code
code .
```

### 4.2 Instalar dependências

No terminal do VS Code (`Ctrl+~`):
```bash
npm install
```
Aguarde 1-2 minutos. Cria a pasta `node_modules/` com todas as bibliotecas.

### 4.3 Criar ficheiro de ambiente

Crie `.env.local` na raiz da pasta (ao lado do `package.json`):

```env
# ── SUPABASE (obrigatório) ────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── APP ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Dikuiza
```

⚠️ Substitua os valores pelos da sua conta Supabase. **Nunca publique este ficheiro no GitHub** (já está no `.gitignore`).

### 4.4 Arrancar o servidor

```bash
npm run dev
```

Abra **http://localhost:3000** no browser. A landing page deve aparecer.

### 4.5 Criar o primeiro utilizador (Síndico)

1. Vá a **http://localhost:3000/auth**
2. Clique **"Registar condomínio"**
3. Preencha todos os campos
4. Verifique o email → clique no link de confirmação
5. Faça login → verá o dashboard completo do síndico

---

## 5. Publicar no GitHub

### 5.1 Criar repositório

1. **https://github.com** → **"+"** → **"New repository"**
2. Nome: `dikuiza`, visibilidade: **Private**
3. **NÃO** inicialize com README
4. Clique **"Create repository"**

### 5.2 Enviar código

```bash
# Na pasta do projecto, no terminal:

git init
git add .
git commit -m "feat: dikuiza v1.0 - sistema completo"
git branch -M main
git remote add origin https://github.com/SEU_USERNAME/dikuiza.git
git push -u origin main
```

> Se pedir password, use um **Personal Access Token**:
> GitHub → Settings → Developer Settings → Tokens (classic) → Generate → seleccione `repo` → copie e use como password

### 5.3 Workflow diário

```bash
git add .
git commit -m "feat: descrição do que fiz"
git push
```

**Prefixos úteis nos commits:**
- `feat:` — nova funcionalidade
- `fix:` — correcção de bug
- `style:` — alteração visual
- `docs:` — documentação

---

## 6. Deploy no Vercel

### 6.1 Criar conta

1. **https://vercel.com** → "Start Deploying"
2. Registe com a conta **GitHub**

### 6.2 Importar projecto

1. Vercel → **"Add New..."** → **"Project"**
2. Encontre o repositório `dikuiza` → **"Import"**

### 6.3 Adicionar variáveis de ambiente ⚠️ OBRIGATÓRIO

Na página de configuração (antes de clicar Deploy):
1. Expanda **"Environment Variables"**
2. Adicione uma a uma:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role |
| `NEXT_PUBLIC_APP_URL` | `https://dikuiza.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `Dikuiza` |

3. Clique **"Deploy"** → aguarde ~2 minutos → 🎉 online!

### 6.4 Domínio personalizado

1. Vercel → **Settings** → **Domains** → adicione `dikuiza.ao`
2. No DNS do seu domínio, adicione:
   - `CNAME www → cname.vercel-dns.com`
   - `A @ → 76.76.21.21`
3. SSL configurado automaticamente (HTTPS grátis)

### 6.5 Deploy automático

Cada `git push` faz deploy automático em ~1 minuto. Para preview antes de publicar:
```bash
git checkout -b develop
git push origin develop
# Vercel cria uma URL de preview automática para este branch
```

---

## 7. Configurar a PWA (App Mobile)

### 7.1 Criar os ícones

Ferramentas gratuitas:
1. **https://www.canva.com** — crie o logo (fundo dourado #E8A030, letras "DK" a preto)
2. Exporte como PNG 512x512
3. **https://www.pwabuilder.com/imageGenerator** — gera todos os tamanhos

Coloque os ficheiros em `public/icons/`:
```
icon-72.png, icon-96.png, icon-128.png, icon-144.png,
icon-152.png, icon-192.png, icon-384.png, icon-512.png,
apple-touch-icon.png (180x180)
```

### 7.2 Testar instalação

**Android (Chrome):** Menu (⋮) → "Adicionar ao ecrã inicial"

**iPhone (Safari):** Botão partilha → "Adicionar ao Ecrã de Início"

**Computador (Chrome):** Ícone de instalação na barra de endereço

### 7.3 Testar modo offline

Chrome DevTools (F12) → Application → Service Workers → marque "Offline" → recarregue. A app deve funcionar com os dados em cache.

---

## 8. Analytics

### Analytics internos (incluídos)
O painel `/dashboard/analytics` mostra directamente da base de dados:
- Taxa de adimplência, receita vs esperada, ocorrências por categoria

### PostHog (comportamento dos utilizadores — grátis até 1M eventos/mês)

```bash
npm install posthog-js
```

Adicione ao `.env.local` e ao Vercel:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_SUA_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Em `app/layout.tsx`, dentro do `<body>`:
```tsx
import posthog from "posthog-js";
// antes do return:
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
  });
}
```

### Google Analytics (alternativa)

No `app/layout.tsx`, adicione no `<head>`:
```tsx
import Script from "next/script";
// dentro do <html>:
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
<Script id="ga">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');`}</Script>
```

---

## 9. Variáveis de Ambiente

### Desenvolvimento — `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Dikuiza
```

### Produção — Vercel → Settings → Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://dikuiza.vercel.app
NEXT_PUBLIC_APP_NAME=Dikuiza
```

> `NEXT_PUBLIC_` = visível no browser (seguro para URLs e chaves públicas)
> Sem prefixo = só no servidor (para chaves secretas)

---

## 10. Manual do Utilizador

### Síndico

| Acção | Como fazer |
|-------|-----------|
| Registar condomínio | `/auth` → "Registar" → preencher dados |
| Adicionar blocos/unidades | Dashboard → "Condomínio" → "Novo Bloco" |
| Convidar morador | Dashboard → "Moradores" → "Convidar" → email + unidade |
| Confirmar pagamento | Dashboard → "Pagamentos" → ver comprovativo → "✓ Confirmar" |
| Publicar aviso | Dashboard → "Avisos" → "Publicar Aviso" |
| Gerir ocorrência | Dashboard → "Ocorrências" → clicar → actualizar estado |
| Ver analytics | Dashboard → "Analytics" |

### Condómino (Morador)

| Acção | Como fazer |
|-------|-----------|
| Primeiro acesso | Email de convite → definir senha → fazer login |
| Ver quota do mês | Dashboard → ver cartão Multicaixa |
| Pagar quota | Pagar no ATM/Multicaixa Express com Entidade + Referência |
| Submeter comprovativo | Dashboard → "Pagamentos" → "Submeter Comprovativo" → colar URL da foto |
| Reportar problema | Dashboard → "Ocorrências" → "+ Nova" |
| Ver avisos | Dashboard → "Avisos" |
| Instalar no telemóvel | Chrome/Safari → menu → "Adicionar ao ecrã inicial" |

---

## 11. Arquitectura Técnica

### Stack

| Camada | Tecnologia | Porquê |
|--------|-----------|--------|
| Frontend | Next.js 14 (App Router) | SSR + CSR, SEO, PWA |
| Estilos | Tailwind CSS | Mobile-first, classes utilitárias |
| Base de Dados | Supabase (PostgreSQL) | Realtime, Auth, RLS, plano grátis |
| Auth | Supabase Auth (JWT) | Seguro, suporta magic links |
| Deploy | Vercel | Deploy automático, CDN global |
| PWA | next-pwa | Service Worker, modo offline |
| Gráficos | Recharts | Leve, nativo React |
| Linguagem | TypeScript | Tipos fortes, menos bugs |

### Multi-tenancy (isolamento de dados)

Cada condomínio é um "tenant" separado. Isolamento garantido por:
1. Coluna `condominio_id` em todas as tabelas
2. **Row Level Security (RLS)** do Supabase — cada query filtra automaticamente pelo condomínio do utilizador
3. Funções `get_my_condominio_id()` e `get_my_role()` nas políticas RLS

### Roles (RBAC)

| Role | Permissões |
|------|-----------|
| `admin` | Acesso total — todos os condomínios |
| `sindico` | Gestão completa do seu condomínio |
| `condominino` | Só os seus dados (pagamentos, ocorrências) |
| `seguranca` | Módulo de controlo de acesso |
| `fornecedor` | Ordens de serviço atribuídas |

### Fluxo de Pagamento

```
Morador → paga no Multicaixa → tira foto do comprovativo
    ↓
Carrega foto para Google Drive/WhatsApp Web → copia link
    ↓
Cola o link no Dikuiza → status: "pendente"
    ↓
Síndico vê o link, verifica → clica "Confirmar" → status: "pago"
```

---

## 12. Resolução de Problemas

### "Module not found" ou erros de instalação
```bash
rm -rf node_modules
npm install
```

### Erro de autenticação Supabase ("Invalid API key")
- Verifique se as variáveis de ambiente estão correctas
- Confirme que não há espaços antes/depois dos valores

### RLS a bloquear queries
Se receber `row-level security policy violation`:
1. Verifique se o utilizador tem `condominio_id` preenchido na tabela `usuarios`
2. SQL Editor do Supabase:
```sql
SELECT * FROM usuarios WHERE email = 'email@do.utilizador';
```

### Build a falhar no Vercel
```bash
npm run build   # teste localmente primeiro
```
Corrija os erros TypeScript que aparecerem.

### PWA não instala
1. O site deve estar em HTTPS (Vercel garante isso)
2. Os ícones devem existir em `public/icons/`
3. Chrome DevTools → Application → Manifest → verifique erros

### Emails de confirmação não chegam
1. Supabase → Authentication → SMTP Settings → configure Resend ou Gmail
2. Verifique a pasta de spam do email

---

## 🗺️ Roadmap

- [ ] Integração real com API EMIS/Multicaixa
- [ ] Notificações push (Web Push API)
- [ ] Notificações SMS Angola Telecom
- [ ] Assembleias virtuais com votação em tempo real
- [ ] App nativa Android via Capacitor.js
- [ ] Controlo de acesso com QR Code para visitantes
- [ ] Relatórios PDF mensais automáticos
- [ ] Modo offline completo com sincronização em background

---

## 💰 Modelo de Negócio

| Plano | Preço | Limite |
|-------|-------|--------|
| Trial | 0 Kz | 3 meses |
| Profissional | 1.111 Kz × apartamentos / mês | Ilimitado |

**Exemplo:** 40 apartamentos = **44.440 Kz/mês**

---

*Dikuiza © 2025 · Feito com 🇦🇴 para Angola · suporte@dikuiza.ao*

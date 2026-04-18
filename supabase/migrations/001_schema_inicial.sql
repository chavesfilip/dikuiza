-- =============================================================================
-- supabase/migrations/001_schema_inicial.sql
-- =============================================================================
-- Este ficheiro cria TODAS as tabelas da base de dados do Dikuiza.
-- É executado uma vez no painel do Supabase (SQL Editor).
--
-- Como funciona SQL:
--   CREATE TABLE nome_tabela (
--     coluna TIPO RESTRIÇÕES,
--     ...
--   );
--
-- UUID = identificador único universal (como um número de série único)
-- TEXT = texto
-- INTEGER = número inteiro
-- NUMERIC = número com decimais (para dinheiro)
-- BOOLEAN = verdadeiro/falso
-- TIMESTAMPTZ = data e hora com fuso horário
-- =============================================================================

-- Activa extensão para gerar UUIDs automaticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELA: condominios
-- O topo da hierarquia. Cada condomínio é um "tenant" independente.
-- =============================================================================
CREATE TABLE condominios (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome                  TEXT NOT NULL,
  endereco              TEXT NOT NULL,
  cidade                TEXT NOT NULL DEFAULT 'Luanda',
  total_unidades        INTEGER NOT NULL DEFAULT 0,
  total_blocos          INTEGER NOT NULL DEFAULT 0,
  sindico_id            UUID,                        -- referenciado depois (FK circular)
  plano                 TEXT NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'basico', 'profissional')),
  valor_quota           NUMERIC(10,2) NOT NULL DEFAULT 50000,  -- em Kwanzas
  trial_termina_em      DATE,                        -- quando termina o período gratuito
  ativo                 BOOLEAN NOT NULL DEFAULT true,
  logo_url              TEXT,
  multicaixa_entidade   TEXT,                        -- código da entidade bancária
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABELA: usuarios
-- Todos os utilizadores do sistema (síndicos, moradores, segurança, fornecedores)
-- =============================================================================
CREATE TABLE usuarios (
  id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  nome              TEXT NOT NULL,
  telefone          TEXT,
  role              TEXT NOT NULL DEFAULT 'condominino'
                    CHECK (role IN ('admin', 'sindico', 'condominino', 'seguranca', 'fornecedor')),
  condominio_id     UUID REFERENCES condominios(id) ON DELETE SET NULL,
  unidade_id        UUID,                            -- referenciado depois
  avatar_url        TEXT,
  ativo             BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Agora podemos adicionar a FK do síndico no condomínio
ALTER TABLE condominios
  ADD CONSTRAINT fk_sindico FOREIGN KEY (sindico_id) REFERENCES usuarios(id);

-- =============================================================================
-- TABELA: blocos
-- Cada condomínio pode ter vários blocos/torres
-- =============================================================================
CREATE TABLE blocos (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  condominio_id     UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  nome              TEXT NOT NULL,                  -- "Bloco A", "Torre 1"
  total_andares     INTEGER NOT NULL DEFAULT 1,
  total_unidades    INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(condominio_id, nome)                       -- dois blocos do mesmo cond. não podem ter o mesmo nome
);

-- =============================================================================
-- TABELA: unidades
-- Cada apartamento/fracção do condomínio
-- =============================================================================
CREATE TABLE unidades (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bloco_id          UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  condominio_id     UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  numero            TEXT NOT NULL,                  -- "3B", "101", "PH"
  andar             INTEGER NOT NULL DEFAULT 1,
  tipo              TEXT NOT NULL DEFAULT 'T2',     -- "T1", "T2", "T3", "T4"
  area_m2           NUMERIC(6,2),
  morador_id        UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bloco_id, numero)
);

-- Agora podemos adicionar a FK de unidade no utilizador
ALTER TABLE usuarios
  ADD CONSTRAINT fk_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id);

-- =============================================================================
-- TABELA: pagamentos
-- Registo de todas as quotas condominiais
-- =============================================================================
CREATE TABLE pagamentos (
  id                        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  condominio_id             UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  unidade_id                UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  usuario_id                UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mes_referencia            TEXT NOT NULL,           -- "2025-06" (ano-mês)
  valor                     NUMERIC(10,2) NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'pendente'
                            CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  multicaixa_referencia     TEXT,
  multicaixa_entidade       TEXT,
  comprovativo_url          TEXT,                    -- URL online do comprovativo (não ficheiro)
  data_vencimento           DATE NOT NULL,
  data_pagamento            TIMESTAMPTZ,
  notas                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unidade_id, mes_referencia)                -- uma unidade paga uma vez por mês
);

-- =============================================================================
-- TABELA: ocorrencias
-- Problemas/manutenções reportados pelos moradores
-- =============================================================================
CREATE TABLE ocorrencias (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  condominio_id     UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  unidade_id        UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  usuario_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo            TEXT NOT NULL,
  descricao         TEXT NOT NULL,
  categoria         TEXT NOT NULL DEFAULT 'outro'
                    CHECK (categoria IN ('eletrico', 'hidraulico', 'estrutural', 'limpeza', 'seguranca', 'outro')),
  status            TEXT NOT NULL DEFAULT 'aberta'
                    CHECK (status IN ('aberta', 'em_andamento', 'resolvida', 'cancelada')),
  foto_url          TEXT,                           -- URL online da foto
  atribuido_a       UUID REFERENCES usuarios(id),   -- fornecedor responsável
  data_resolucao    TIMESTAMPTZ,
  notas_admin       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABELA: avisos
-- Mural de comunicados do condomínio
-- =============================================================================
CREATE TABLE avisos (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  condominio_id     UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  autor_id          UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo            TEXT NOT NULL,
  conteudo          TEXT NOT NULL,
  categoria         TEXT NOT NULL DEFAULT 'informacao'
                    CHECK (categoria IN ('urgente', 'informacao', 'manutencao', 'assembleia', 'financeiro')),
  fixado            BOOLEAN NOT NULL DEFAULT false,
  expira_em         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABELA: assembleias
-- Votações virtuais dos moradores
-- =============================================================================
CREATE TABLE assembleias (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  condominio_id     UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  titulo            TEXT NOT NULL,
  descricao         TEXT NOT NULL,
  opcoes            TEXT[] NOT NULL DEFAULT '{"Sim", "Não", "Abstenção"}',
  termina_em        TIMESTAMPTZ NOT NULL,
  ativa             BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela separada para registar quem votou em quê (evitar votos duplicados)
CREATE TABLE votos_assembleia (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assembleia_id     UUID NOT NULL REFERENCES assembleias(id) ON DELETE CASCADE,
  usuario_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  opcao_escolhida   TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assembleia_id, usuario_id)                 -- cada morador vota uma vez
);

-- =============================================================================
-- TABELA: visitantes
-- Registo de entradas/saídas (usado pela segurança)
-- =============================================================================
CREATE TABLE visitantes (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  condominio_id     UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
  unidade_id        UUID REFERENCES unidades(id),   -- apartamento visitado
  registado_por     UUID NOT NULL REFERENCES usuarios(id), -- segurança que registou
  nome_visitante    TEXT NOT NULL,
  documento         TEXT,                           -- nº do BI/passaporte
  motivo            TEXT,
  entrada_em        TIMESTAMPTZ DEFAULT NOW(),
  saida_em          TIMESTAMPTZ,
  foto_url          TEXT                            -- URL da foto do visitante
);

-- =============================================================================
-- TABELA: analytics_eventos
-- Regista eventos para análise (pageviews, acções, etc.)
-- =============================================================================
CREATE TABLE analytics_eventos (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  condominio_id     UUID REFERENCES condominios(id),
  usuario_id        UUID REFERENCES usuarios(id),
  evento            TEXT NOT NULL,                  -- "login", "pagamento_submetido", etc.
  metadata          JSONB,                          -- dados extras em formato JSON
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ÍNDICES — aceleram as pesquisas mais comuns
-- Um índice é como o índice de um livro: permite encontrar dados mais rápido
-- =============================================================================
CREATE INDEX idx_pagamentos_condominio ON pagamentos(condominio_id);
CREATE INDEX idx_pagamentos_mes ON pagamentos(mes_referencia);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_ocorrencias_condominio ON ocorrencias(condominio_id);
CREATE INDEX idx_ocorrencias_status ON ocorrencias(status);
CREATE INDEX idx_avisos_condominio ON avisos(condominio_id);
CREATE INDEX idx_usuarios_condominio ON usuarios(condominio_id);
CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);
CREATE INDEX idx_analytics_condominio ON analytics_eventos(condominio_id);
CREATE INDEX idx_analytics_created ON analytics_eventos(created_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — Segurança por linha
-- =============================================================================
-- O RLS garante que cada utilizador só vê os dados do SEU condomínio.
-- É como uma parede invisível entre os dados de condomínios diferentes.
-- Sem RLS, um morador poderia (em teoria) ver dados de outro condomínio.

ALTER TABLE condominios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assembleias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitantes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios       ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna o condominio_id do utilizador autenticado
CREATE OR REPLACE FUNCTION get_my_condominio_id()
RETURNS UUID AS $$
  SELECT condominio_id FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função auxiliar: retorna o role do utilizador autenticado
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Política: utilizadores vêem apenas dados do seu condomínio
CREATE POLICY "condominio_isolamento" ON condominios
  FOR ALL USING (id = get_my_condominio_id() OR get_my_role() = 'admin');

CREATE POLICY "pagamentos_isolamento" ON pagamentos
  FOR ALL USING (condominio_id = get_my_condominio_id());

CREATE POLICY "ocorrencias_isolamento" ON ocorrencias
  FOR ALL USING (condominio_id = get_my_condominio_id());

CREATE POLICY "avisos_isolamento" ON avisos
  FOR ALL USING (condominio_id = get_my_condominio_id());

CREATE POLICY "blocos_isolamento" ON blocos
  FOR ALL USING (condominio_id = get_my_condominio_id());

CREATE POLICY "unidades_isolamento" ON unidades
  FOR ALL USING (condominio_id = get_my_condominio_id());

CREATE POLICY "usuarios_isolamento" ON usuarios
  FOR ALL USING (condominio_id = get_my_condominio_id() OR id = auth.uid() OR get_my_role() = 'admin');

-- =============================================================================
-- TRIGGER: actualiza updated_at automaticamente nas ocorrências
-- Um trigger é código que corre automaticamente quando algo acontece na BD
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ocorrencias_updated_at
  BEFORE UPDATE ON ocorrencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- DADOS INICIAIS — Condomínio demo para testes
-- =============================================================================
-- Execute este bloco separadamente após criar o primeiro utilizador admin
-- INSERT INTO condominios (nome, endereco, cidade, total_unidades, total_blocos, valor_quota, trial_termina_em)
-- VALUES ('Kilamba Prime', 'Centralidade do Kilamba, Bloco 1', 'Luanda', 120, 3, 50000, NOW() + INTERVAL '90 days');

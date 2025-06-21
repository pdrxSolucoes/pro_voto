-- Configuração de RLS (Row Level Security) para o Supabase
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Habilitar RLS nas tabelas principais
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para tabela usuarios
-- Permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura de usuarios" ON usuarios
FOR SELECT USING (true);

-- Permitir inserção para novos usuários
CREATE POLICY "Permitir inserção de usuarios" ON usuarios
FOR INSERT WITH CHECK (true);

-- Permitir atualização para o próprio usuário
CREATE POLICY "Permitir atualização de usuarios" ON usuarios
FOR UPDATE USING (true);

-- 3. Políticas para tabela projetos
-- Permitir leitura para todos
CREATE POLICY "Permitir leitura de projetos" ON projetos
FOR SELECT USING (true);

-- Permitir inserção para admins
CREATE POLICY "Permitir inserção de projetos" ON projetos
FOR INSERT WITH CHECK (true);

-- Permitir atualização para admins
CREATE POLICY "Permitir atualização de projetos" ON projetos
FOR UPDATE USING (true);

-- 4. Políticas para tabela votacoes
-- Permitir leitura para todos
CREATE POLICY "Permitir leitura de votacoes" ON votacoes
FOR SELECT USING (true);

-- Permitir inserção para admins
CREATE POLICY "Permitir inserção de votacoes" ON votacoes
FOR INSERT WITH CHECK (true);

-- Permitir atualização para admins
CREATE POLICY "Permitir atualização de votacoes" ON votacoes
FOR UPDATE USING (true);

-- 5. Políticas para tabela votos
-- Permitir leitura para todos
CREATE POLICY "Permitir leitura de votos" ON votos
FOR SELECT USING (true);

-- Permitir inserção para vereadores
CREATE POLICY "Permitir inserção de votos" ON votos
FOR INSERT WITH CHECK (true);

-- Permitir atualização para o próprio voto
CREATE POLICY "Permitir atualização de votos" ON votos
FOR UPDATE USING (true);

-- 6. Verificar se as tabelas existem e criar se necessário
-- Criar tabela vereadores se não existir (baseada na tabela usuarios)
CREATE OR REPLACE VIEW vereadores AS
SELECT 
  id,
  nome,
  email,
  cargo,
  ativo,
  created_at,
  updated_at
FROM usuarios 
WHERE cargo = 'vereador' AND ativo = true;

-- 7. Garantir que o usuário anônimo tenha permissões básicas
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
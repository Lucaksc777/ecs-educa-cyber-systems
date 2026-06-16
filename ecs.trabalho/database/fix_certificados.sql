-- Tornar usuario_id e curso_id nullable na tabela certificados
-- para permitir certificados sem usuário logado no Supabase Auth

ALTER TABLE certificados ALTER COLUMN usuario_id DROP NOT NULL;
ALTER TABLE certificados ALTER COLUMN curso_id DROP NOT NULL;

-- Adicionar colunas extras para armazenar dados do certificado
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS nome_aluno text;
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS curso_nome text;

SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'certificados'
ORDER BY ordinal_position;

-- ═══════════════════════════════════════════════════════════
-- ECS — Fix tabela certificados: tornar campos nullable
-- Execute no Supabase SQL Editor ANTES de testar certificados
-- ═══════════════════════════════════════════════════════════
ALTER TABLE certificados ALTER COLUMN usuario_id DROP NOT NULL;
ALTER TABLE certificados ALTER COLUMN curso_id   DROP NOT NULL;

-- Confirmar
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND column_name IN ('usuario_id', 'curso_id');

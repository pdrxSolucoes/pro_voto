# Correção dos Erros do Supabase na Vercel

## Problemas identificados:
1. ❌ Tabela `vereadores` não existe (erro 404)
2. ❌ Problemas de RLS (Row Level Security) - erros 400/403
3. ❌ Inconsistência nos clientes Supabase
4. ❌ Variáveis de ambiente não configuradas na Vercel

## ✅ Soluções aplicadas:

### 1. Correção dos imports do Supabase
- Unificado o uso do cliente Supabase em todos os serviços
- Melhorada a configuração do cliente com opções de auth e realtime

### 2. Correção da tabela vereadores
- Alterado `dashboardService.ts` para usar `usuarios` com filtro `cargo = 'vereador'`
- Criada view `vereadores` no SQL para compatibilidade

## 🔧 Próximos passos obrigatórios:

### Passo 1: Configurar RLS no Supabase
1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Vá em SQL Editor
3. Execute o script `SUPABASE_RLS_SETUP.sql`

### Passo 2: Configurar variáveis de ambiente na Vercel
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em Settings > Environment Variables
4. Adicione todas as variáveis do arquivo `VERCEL_ENV_SETUP.md`

### Passo 3: Verificar estrutura do banco
Execute no SQL Editor do Supabase:
```sql
-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'projetos', 'votacoes', 'votos');

-- Verificar se há dados de teste
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_projetos FROM projetos;
```

### Passo 4: Redeploy na Vercel
Após configurar as variáveis de ambiente:
```bash
# Opção 1: Via CLI
vercel --prod

# Opção 2: Via Git
git add .
git commit -m "fix: corrigir configurações Supabase"
git push origin main
```

## 🐛 Debug adicional:

Se os erros persistirem, verifique:

1. **Console do navegador**: Procure por erros de CORS
2. **Logs da Vercel**: Verifique se as variáveis estão sendo carregadas
3. **Supabase Logs**: Verifique se as consultas estão chegando ao banco

### Comandos úteis para debug:
```javascript
// Adicione temporariamente no código para debug
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING');
```

## 📋 Checklist final:
- [ ] Script RLS executado no Supabase
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Projeto redeployado
- [ ] Testado login/logout
- [ ] Testado criação de projeto
- [ ] Testado dashboard
- [ ] Testado votação

## 🆘 Se ainda houver problemas:
1. Verifique os logs da Vercel em: https://vercel.com/dashboard/[seu-projeto]/functions
2. Verifique os logs do Supabase em: https://supabase.com/dashboard/project/[seu-projeto]/logs
3. Teste localmente com `npm run dev` para comparar
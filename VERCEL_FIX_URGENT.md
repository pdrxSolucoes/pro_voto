# 🚨 CORREÇÃO URGENTE - API Key Error

## Problema:
```
{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

## ✅ Solução IMEDIATA:

### 1. Configure as variáveis na Vercel AGORA:
1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Settings > Environment Variables
4. Adicione EXATAMENTE estas variáveis:

```
Nome: NEXT_PUBLIC_SUPABASE_URL
Valor: https://rrgfncqdsrmhziwhziqy.supabase.co

Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ2ZuY3Fkc3JtaHppd2h6aXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTc4NzUsImV4cCI6MjA2NjAzMzg3NX0.cgqB_xDmJyTtjLy_D6VWEr1j_wQAYv0SwksZRvruYGQ
```

### 2. Redeploy IMEDIATAMENTE:
```bash
vercel --prod
```

### 3. Se ainda não funcionar, execute no Supabase SQL Editor:
```sql
-- Desabilitar RLS temporariamente para teste
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE votacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE votos DISABLE ROW LEVEL SECURITY;
```

## ⚠️ IMPORTANTE:
- As variáveis DEVEM começar com `NEXT_PUBLIC_`
- Não pode ter espaços extras
- Copie e cole exatamente como mostrado acima
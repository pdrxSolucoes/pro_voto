# Configuração de Variáveis de Ambiente na Vercel

## Passo a passo para configurar as variáveis de ambiente:

1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em "Settings" > "Environment Variables"
4. Adicione as seguintes variáveis:

### Variáveis obrigatórias:

```
NEXT_PUBLIC_SUPABASE_URL=https://rrgfncqdsrmhziwhziqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ2ZuY3Fkc3JtaHppd2h6aXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTc8NzUsImV4cCI6MjA2NjAzMzg3NX0.cgqB_xDmJyTtjLy_D6VWEr1j_wQAYv0SwksZRvruYGQ
DATABASE_TYPE=postgres
DATABASE_HOST=db.rrgfncqdsrmhziwhziqy.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=Pr0_V0t0$
DATABASE_NAME=postgres
JWT_SECRET=/QOtG1W5n03XFe/5KLFnTBm+BB2j2746/LxIT+KxnGqy8cnxc9kzK4p8pX93WyBZ2IO5k3izJ73WWwZ5uwOJOA==
JWT_EXPIRY=86400
NODE_ENV=production
PORT=3000
```

5. Após adicionar todas as variáveis, faça um novo deploy do projeto.

## Comandos para redeploy:
```bash
vercel --prod
```

Ou faça um push para o repositório Git conectado à Vercel.
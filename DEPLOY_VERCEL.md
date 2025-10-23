# Guia Rápido de Deploy na Vercel

## Pré-requisitos Completados ✅

- ✅ `vercel.json` configurado
- ✅ `build.sh` com script de build
- ✅ `runtime.txt` com Python 3.12
- ✅ `requirements.txt` otimizado (9 dependências)
- ✅ WhiteNoise para arquivos estáticos
- ✅ Suporte a PostgreSQL
- ✅ Variáveis de ambiente configuradas
- ✅ Configurações de segurança para produção

## Passo a Passo

### 1. Preparar Banco de Dados

Escolha uma opção de PostgreSQL:

**Opção A: Vercel Postgres (Recomendado)**
1. Acesse seu projeto na Vercel
2. Vá em Storage → Create Database → Postgres
3. Copie a `DATABASE_URL` gerada

**Opção B: Supabase (Grátis)**
1. Crie conta em supabase.com
2. Crie um novo projeto
3. Vá em Settings → Database → Connection String
4. Copie a URL (modo URI)

**Opção C: Neon (Grátis)**
1. Crie conta em neon.tech
2. Crie um novo projeto
3. Copie a connection string

### 2. Gerar SECRET_KEY

Execute no terminal local:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Deploy na Vercel

**Via Interface Web:**
1. Acesse vercel.com/new
2. Importe seu repositório do GitHub
3. Configure as variáveis de ambiente:
   - `SECRET_KEY`: (valor gerado no passo 2)
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.vercel.app`
   - `DATABASE_URL`: (URL do banco PostgreSQL)
4. Clique em Deploy

**Via CLI:**
```bash
npm i -g vercel
vercel login
vercel
```

### 4. Configurar Variáveis de Ambiente na Vercel

Na aba "Settings" → "Environment Variables", adicione:

```
SECRET_KEY=django-insecure-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEBUG=False
ALLOWED_HOSTS=.vercel.app
DATABASE_URL=postgres://usuario:senha@host:5432/database
```

Opcionais (se configurar login social):
```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
```

### 5. Primeira Execução (Pós-Deploy)

Após o primeiro deploy, execute as migrações:

```bash
# Via Vercel CLI
vercel env pull
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser
```

### 6. Acessar o Site

Sua aplicação estará disponível em:
```
https://seu-projeto.vercel.app
```

Admin:
```
https://seu-projeto.vercel.app/admin
```

## Limitações da Vercel

⚠️ **Arquivos de Mídia (uploads)**: Não persistem em ambiente serverless.

**Soluções:**
- **Vercel Blob Storage** (integração nativa)
- **Cloudinary** (grátis até 25GB)
- **AWS S3** (escalável)

## Troubleshooting

### Erro: "Application Error"
```bash
vercel logs <url-do-projeto>
```
Verifique SECRET_KEY e DATABASE_URL nas variáveis de ambiente.

### Erro: "Static files not found"
Execute localmente:
```bash
python manage.py collectstatic --noinput
```

### Erro: "Database connection failed"
Verifique se DATABASE_URL está correta e se o banco PostgreSQL está acessível.

## Comandos Úteis

```bash
# Ver logs em tempo real
vercel logs --follow

# Baixar variáveis de ambiente
vercel env pull

# Ver lista de deploys
vercel ls

# Promover deploy para produção
vercel promote <deployment-url>

# Rollback para deploy anterior
vercel rollback
```

## Checklist Final

Antes de considerar o deploy concluído:

- [ ] Site acessível na URL da Vercel
- [ ] Admin funcionando (`/admin`)
- [ ] Arquivos estáticos carregando corretamente
- [ ] Login/cadastro funcionando
- [ ] Produtos aparecendo no catálogo
- [ ] Carrinho de compras funcionando
- [ ] SECRET_KEY diferente da de desenvolvimento
- [ ] DEBUG=False em produção
- [ ] HTTPS habilitado (automático na Vercel)
- [ ] Backup do banco de dados configurado

## Próximos Passos

1. **Configurar domínio customizado** (opcional)
   - Vercel → Settings → Domains
   
2. **Configurar armazenamento de mídia** (obrigatório para uploads)
   - Recomendado: Cloudinary ou Vercel Blob

3. **Configurar monitoramento**
   - Vercel Analytics (grátis)
   - Sentry para erros (opcional)

4. **Configurar backup automático**
   - Para PostgreSQL (Vercel Postgres tem backup automático)

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Django: https://docs.djangoproject.com
- Issues do projeto: GitHub

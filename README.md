# 🎫 Ingressos Corporativos

Sistema de gestão de ingressos por cota variável para eventos corporativos.

## Stack

- **Frontend:** React 18 + Vite 6 + Tailwind CSS
- **Backend:** Vercel Serverless Functions (Node.js)
- **Banco de dados:** Neon PostgreSQL (São Paulo)
- **Deploy:** Vercel (auto-deploy via GitHub)

## Funcionalidades

### Funcionário
- Login por e-mail + data de nascimento
- Visualizar cota de ingressos disponível
- Emitir ingressos para participantes (titular + dependentes)
- Escolher transporte corporativo
- Ver pedidos e ingressos gerados

### Admin
- Dashboard com métricas em tempo real
- Gestão de pedidos e status
- Impressão em lote
- Controle de retirada
- Check-in por QR Code
- Relatórios e exportação

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis locais
cp .env.example .env.local
# Preencher DATABASE_URL com a connection string do Neon

# Rodar dev server (proxy para a API do Vercel automaticamente)
npm run dev
```

## Deploy

O deploy é automático via GitHub → Vercel.
Todo push na branch `main` gera um novo deploy de produção.

```bash
# Manualmente via CLI
vercel --prod
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Neon PostgreSQL |

## Credenciais de teste

| Campo | Valor |
|---|---|
| E-mail | `felipincouto@gmail.com` |
| Data nascimento | `03/05/1996` |

## Estrutura do banco (Neon)

```
funcionarios   → usuários autorizados
pedidos        → pedidos de emissão
participantes  → dados de cada participante
ingressos      → ingressos individuais com código único
```

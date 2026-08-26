# Barbearia API

API REST da aplicação de barbearia, construída com Express, TypeScript, Prisma e PostgreSQL.

## Funcionalidades

- Cadastro de usuários.
- Senhas armazenadas com hash usando `bcryptjs`.
- Login com emissão de token JWT.
- Consulta do usuário autenticado.
- Cargo padrão `usuario`.
- Catálogo de barbeiros, serviços e horários de funcionamento.
- Criação e consulta dos agendamentos do usuário autenticado.

## Requisitos

- Node.js 20 ou superior.
- PostgreSQL acessível pela aplicação.

## Instalação

```bash
npm install
```

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/barbearia
JWT_SECRET=uma-chave-secreta-forte
PORT=3000
```

`JWT_SECRET` deve ser uma chave longa e exclusiva em ambientes de produção.

## Deploy na Vercel

O entrypoint serverless está em `api/index.ts`. Para publicar pelo terminal:

```bash
npx vercel
npx vercel --prod
```

Configure `DATABASE_URL` e `JWT_SECRET` nas Environment Variables do projeto na Vercel. O banco PostgreSQL precisa aceitar conexões externas; use uma URL com pooler quando o provedor oferecer essa opção.

O arquivo `vercel.json` encaminha todas as requisições para o app Express, mantendo as rotas `/`, `/api/auth/*` e `/api/users/*`.

## Banco de dados

Gere o cliente Prisma e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

O modelo `User` contém `name`, `email`, `passwordHash`, `role` e `createdAt`. A senha nunca é retornada pela API.

O domínio de agendamento também possui os modelos `Barber`, `Service`, `BusinessHour` e `Appointment`. Ao acessar o dashboard pela primeira vez, um catálogo inicial é criado automaticamente caso a base esteja vazia.

## Desenvolvimento e produção

```bash
npm run dev
```

Para compilar e iniciar:

```bash
npm run build
npm start
```

A API fica disponível em [http://localhost:3000](http://localhost:3000), salvo quando outra porta for definida em `PORT`.

## Rotas

### `POST /api/auth/register`

Cria um usuário com cargo `usuario` e retorna um JWT.

```json
{
  "name": "Joao Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

Requer senha com pelo menos 6 caracteres. Retorna `409` quando o email já está cadastrado.

### `POST /api/auth/login`

Autentica um usuário e retorna um JWT.

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

### `GET /api/auth/me`

Retorna os dados do usuário autenticado. Envie o token no header:

```http
Authorization: Bearer <token>
```

### `GET /api/users`

Lista usuários sem expor `passwordHash`.

### `GET /api/dashboard`

Retorna, em uma única resposta autenticada, barbeiros, serviços, horários de funcionamento e os próximos agendamentos.

### `POST /api/appointments`

Cria um agendamento autenticado. Envie `date` no formato `YYYY-MM-DD`, além de `time`, `barberId` e `serviceId`. O endpoint rejeita horários já ocupados pelo mesmo barbeiro.

### `GET /api/appointments/mine`

Lista os agendamentos do usuário autenticado.

### `GET /`

Retorna uma mensagem simples para verificar se a API está funcionando.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor com recarregamento automático |
| `npm run build` | Compila o TypeScript para `dist` |
| `npm start` | Inicia o servidor compilado |

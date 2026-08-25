# Barbearia API

API REST da aplicação de barbearia, construída com Express, TypeScript, Prisma e PostgreSQL.

## Funcionalidades

- Cadastro de usuários.
- Senhas armazenadas com hash usando `bcryptjs`.
- Login com emissão de token JWT.
- Consulta do usuário autenticado.
- Cargo padrão `usuario`.

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

## Banco de dados

Gere o cliente Prisma e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

O modelo `User` contém `name`, `email`, `passwordHash`, `role` e `createdAt`. A senha nunca é retornada pela API.

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

### `GET /`

Retorna uma mensagem simples para verificar se a API está funcionando.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor com recarregamento automático |
| `npm run build` | Compila o TypeScript para `dist` |
| `npm start` | Inicia o servidor compilado |

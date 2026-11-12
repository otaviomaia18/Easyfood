# EasyFood

Sistema de restaurantes e pedidos desenvolvido com Node.js, Express, Prisma e SQLite.

## Requisitos

- Node.js instalado
- npm

## Como executar o projeto

1. Abra a pasta do projeto no terminal.

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie uma cópia do arquivo de exemplo:

   ```bash
   Copy-Item .env.example .env
   ```

4. Confira as variáveis do arquivo `.env`:

   - DATABASE_URL: caminho do banco SQLite.
   - JWT_SECRET: chave secreta para autenticação.
   - MAILER_API: chave da API MailerSend.
   - DOMAIN_MAIL: domínio verificado no MailerSend.

5. Gere o Prisma Client:

   ```bash
   npx prisma generate
   ```

6. Inicie o servidor:

   ```bash
   npm start
   ```

7. Abra o sistema no navegador:

   http://localhost:3000

## Banco de dados

O projeto utiliza SQLite.

O banco de dados atual está em:

   prisma/dev.db

Não execute `npx prisma migrate dev`, `npx prisma migrate reset` ou `npx prisma db push` sem verificar antes o estado do banco.

A migração inicial SQLite está registrada em `prisma/migrations`.

## Envio de e-mails

O envio de e-mails utiliza o MailerSend.

Para utilizar essa funcionalidade, configure `MAILER_API` e `DOMAIN_MAIL` com credenciais próprias e um domínio verificado.

## Endpoints principais

- GET /restaurants — lista restaurantes.
- POST /restaurants — cadastra restaurante.
- POST /auth/register — cadastra usuário.
- POST /auth/login — realiza login.
- GET /auth/me — retorna dados do usuário autenticado.

## Observação

O servidor precisa estar em execução para utilizar o sistema. Não abra `public/index.html` diretamente pelo navegador.

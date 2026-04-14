# jwt-module

Módulo de autenticação para uma API REST, implementado com JSON Web Tokens (JWT). Suporta emissão de Access Tokens de curta duração, Refresh Tokens rotativos e controle de acesso por perfil de usuário.

## Tecnologias

- [Node.js](https://nodejs.org/) com ES Modules
- [Express](https://expressjs.com/) v5
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [dotenv](https://github.com/motdotla/dotenv)

## Estrutura do projeto

```
src/
├── app.js                  # Entry point — servidor Express
├── config/
│   └── env.js              # Validação e exportação de variáveis de ambiente
├── data/
│   └── users.js            # Usuários mockados e funções de busca
├── middleware/
│   └── auth.js             # Middlewares authenticate e authorize
├── routes/
│   ├── auth.js             # POST /auth/login, /auth/refresh, /auth/logout
│   └── protected.js        # GET /usuarios, POST /dados
└── services/
    ├── jwt.service.js      # Geração e verificação de tokens
    └── tokenStore.js       # Armazenamento e revogação de refresh tokens
```

## Instalação

```bash
git clone <url-do-repositorio>
cd jwt-module
npm install
```

## Configuração

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

| Variável                | Descrição                                              | Padrão |
|-------------------------|--------------------------------------------------------|--------|
| `PORT`                  | Porta do servidor                                      | `3000` |
| `NODE_ENV`              | Ambiente de execução                                   | `development` |
| `JWT_SECRET`            | Chave de assinatura dos Access Tokens                  | —      |
| `JWT_REFRESH_SECRET`    | Chave de assinatura dos Refresh Tokens                 | —      |
| `JWT_EXPIRES_IN`        | Duração do Access Token                                | `15m`  |
| `JWT_REFRESH_EXPIRES_IN`| Duração do Refresh Token                               | `7d`   |

Para gerar valores seguros para as chaves:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Execução

```bash
# Desenvolvimento (reinicia automaticamente ao salvar)
npm run dev:server

# Produção
npm run start:server
```

## Endpoints

### Autenticação

#### `POST /auth/login`

Valida credenciais e retorna os tokens.

**Corpo da requisição:**
```json
{ "username": "alice", "password": "admin123" }
```

**Resposta `200`:**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

---

#### `POST /auth/refresh`

Valida o Refresh Token, revoga-o e emite um novo par de tokens (rotação).

**Corpo da requisição:**
```json
{ "refreshToken": "<jwt>" }
```

**Resposta `200`:**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

---

#### `POST /auth/logout`

Revoga o Refresh Token informado.

**Corpo da requisição:**
```json
{ "refreshToken": "<jwt>" }
```

**Resposta:** `204 No Content`

---

### Rotas protegidas

Todas exigem o header:
```
Authorization: Bearer <accessToken>
```

#### `GET /usuarios`

Retorna a lista de usuários. Restrito a `admin` e `moderador`.

**Resposta `200`:**
```json
{
  "data": [
    { "id": 1, "name": "Alice Admin",  "role": "admin"     },
    { "id": 2, "name": "Bob User",     "role": "usuario"   },
    { "id": 3, "name": "Carol Mod",    "role": "moderador" }
  ]
}
```

---

#### `POST /dados`

Retorna dados personalizados de acordo com o perfil do usuário autenticado.

| Perfil      | Dados retornados                          |
|-------------|-------------------------------------------|
| `admin`     | Estatísticas do sistema e eventos recentes |
| `moderador` | Revisões pendentes e flags recentes        |
| `usuario`   | Perfil e pedidos recentes                  |

---

### Healthcheck

#### `GET /health`

**Resposta `200`:**
```json
{ "status": "ok", "uptime": 42.3 }
```

---

## Fluxo de autenticação

```
Cliente                          Servidor
  │                                 │
  │── POST /auth/login ────────────>│
  │<─ { accessToken, refreshToken }─│
  │                                 │
  │── GET /usuarios ───────────────>│  (Authorization: Bearer <accessToken>)
  │<─ { data: [...] } ──────────────│
  │                                 │
  │  (Access Token expira em 15m)   │
  │                                 │
  │── POST /auth/refresh ──────────>│  (envia refreshToken)
  │<─ { accessToken, refreshToken }─│  (token antigo revogado, novo emitido)
  │                                 │
  │── POST /auth/logout ───────────>│  (envia refreshToken)
  │<─ 204 ──────────────────────────│
```

## Usuários de teste

| Username | Password   | Perfil      |
|----------|------------|-------------|
| `alice`  | `admin123` | `admin`     |
| `bob`    | `user456`  | `usuario`   |
| `carol`  | `mod789`   | `moderador` |

## Decisões de segurança

- **Dois segredos distintos** — Access e Refresh Tokens são assinados com chaves diferentes, impedindo que um tipo seja aceito no lugar do outro.
- **Refresh Tokens rotativos** — cada uso do `/refresh` invalida o token anterior. Uma tentativa de reutilização retorna `401`.
- **`jti` (JWT ID)** — cada Refresh Token carrega um identificador único que permite revogação individual sem invalidar outros tokens do mesmo usuário.
- **Respostas genéricas no login** — a API não indica se o usuário existe ou se a senha está errada, dificultando ataques de enumeração.
- **Segredo em variável de ambiente** — nenhuma chave sensível está no código-fonte.

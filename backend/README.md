# Backend - Online Learning Platform

API REST construída com NestJS para gerenciamento de plataforma de educação online.

## 🏗️ Estrutura

```
src/
├── modules/
│   ├── auth/           # Autenticação e autorização
│   ├── users/          # Gerenciamento de usuários
│   ├── courses/        # Cursos e matrículas
│   ├── videos/         # Upload e streaming de vídeos
│   ├── quizzes/        # Quizzes e avaliações
│   ├── certificates/   # Geração de certificados
│   ├── forum/          # Fórum de discussão
│   └── progress/       # Rastreamento de progresso
├── common/
│   ├── entities/       # Entidades base
│   ├── decorators/     # Decoradores customizados
│   ├── filters/        # Filtros de exceção
│   └── guards/         # Guards de autorização
├── config/             # Configurações
│   ├── database.config.ts
│   └── redis.config.ts
├── app.module.ts
└── main.ts
```

## 🚀 Instalação

```bash
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do backend:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=learning_platform

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_CLOUDFRONT_DOMAIN=xxx.cloudfront.net
AWS_S3_BUCKET=your-bucket
```

## 🏃 Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📡 API Endpoints

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login

### Cursos
- `GET /courses` - Listar cursos
- `GET /courses/:id` - Detalhes do curso
- `POST /courses` - Criar curso
- `POST /courses/:id/enroll` - Matricular

### Vídeos
- `POST /videos/upload` - Upload de vídeo
- `GET /videos/:id/stream` - Streaming URL

### Quizzes
- `POST /quizzes/:id/attempt` - Iniciar quiz
- `POST /quizzes/attempts/:id/submit` - Submeter respostas

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <token>
```

## 📚 Documentação

Acesse a documentação Swagger em:
```
http://localhost:3000/api/docs
```

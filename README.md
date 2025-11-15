# 🎓 Online Learning Platform

Plataforma completa de educação online com recursos avançados de streaming de vídeo, quizzes interativos, certificados automáticos e muito mais.

## ✨ Funcionalidades

### 🎥 Sistema de Vídeo
- **Streaming Adaptativo**: Integração com AWS CloudFront para entrega otimizada de conteúdo
- **Player Avançado**: Video.js com controles personalizados
- **Rastreamento de Progresso**: Acompanhamento automático do progresso do aluno

### 📝 Sistema de Quizzes
- **Múltiplos Tipos de Questões**: Múltipla escolha, verdadeiro/falso, resposta curta
- **Pontuação Automática**: Correção instantânea com feedback
- **Tentativas Limitadas**: Controle de número de tentativas
- **Tempo Limite**: Configurável por quiz

### 🏆 Certificados Automáticos
- **Geração em PDF**: Certificados profissionais gerados automaticamente
- **Verificação**: Sistema de verificação de autenticidade
- **Personalização**: Dados do aluno e curso incluídos

### 💬 Fórum de Discussão
- **Posts e Comentários**: Interação entre alunos e instrutores
- **Sistema de Likes**: Engajamento da comunidade
- **Organização por Curso**: Discussões categorizadas

### 📊 Dashboard de Progresso
- **Métricas Visuais**: Gráficos de progresso e estatísticas
- **Cursos em Andamento**: Visão geral de todos os cursos
- **Histórico de Aprendizado**: Acompanhamento completo

### 🔐 Autenticação Segura
- **JWT**: Autenticação baseada em tokens
- **Roles e Permissões**: Sistema de controle de acesso (Student, Instructor, Admin)
- **Sessões Seguras**: Proteção contra ataques comuns

## 🛠️ Tecnologias

### Backend
- **NestJS**: Framework Node.js progressivo
- **TypeORM**: ORM para TypeScript/JavaScript
- **PostgreSQL**: Banco de dados relacional
- **Redis**: Cache e gerenciamento de sessões
- **AWS SDK**: Integração com serviços AWS
- **PDFKit**: Geração de certificados em PDF
- **Jest**: Framework de testes

### Frontend
- **Angular 17**: Framework frontend moderno
- **TypeScript**: Linguagem tipada
- **RxJS**: Programação reativa
- **Video.js**: Player de vídeo HTML5
- **Chart.js**: Gráficos e visualizações
- **Jasmine/Karma**: Testes unitários

### Infraestrutura
- **Docker & Docker Compose**: Containerização
- **AWS CloudFront**: CDN para streaming
- **AWS S3**: Armazenamento de vídeos
- **Nginx**: Servidor web para produção

## 📋 Pré-requisitos

- Node.js >= 18
- Docker & Docker Compose
- AWS Account (para recursos de streaming)
- Git

## 🚀 Instalação e Execução

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/online-learning-platform.git
cd online-learning-platform
```

### 2. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=learning_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
AWS_S3_BUCKET=your-bucket-name
```

### 3. Inicie com Docker Compose

```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- Backend NestJS (porta 3000)
- Frontend Angular (porta 4200)

### 4. Acesse a Aplicação

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger em:

```
http://localhost:3000/api/docs
```

### Principais Endpoints

#### Autenticação
```
POST /auth/register - Registrar novo usuário
POST /auth/login - Login de usuário
```

#### Cursos
```
GET /courses - Listar cursos
GET /courses/:id - Detalhes do curso
POST /courses - Criar curso (Instructor/Admin)
POST /courses/:id/enroll - Matricular em curso
GET /courses/my/enrollments - Meus cursos
```

#### Vídeos
```
POST /videos/upload - Upload de vídeo
GET /videos/:id/stream - URL de streaming
PUT /videos/:id/progress - Atualizar progresso
```

#### Quizzes
```
GET /quizzes/:id - Detalhes do quiz
POST /quizzes/:id/attempt - Iniciar tentativa
POST /quizzes/attempts/:id/submit - Submeter respostas
```

#### Certificados
```
POST /certificates/generate - Gerar certificado
GET /certificates/verify/:number - Verificar certificado
GET /certificates/my - Meus certificados
```

## 🧪 Testes

### Backend

```bash
# Testes unitários
cd backend
npm test

# Cobertura de testes
npm run test:cov

# Testes E2E
npm run test:e2e
```

### Frontend

```bash
# Testes unitários
cd frontend
npm test

# Cobertura de testes
npm run test:coverage
```

## 📦 Build para Produção

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
```

Os arquivos de produção estarão em `frontend/dist`.

## 🏗️ Arquitetura

```
online-learning-platform/
├── backend/                 # Microserviço NestJS
│   ├── src/
│   │   ├── modules/        # Módulos da aplicação
│   │   │   ├── auth/       # Autenticação
│   │   │   ├── users/      # Usuários
│   │   │   ├── courses/    # Cursos
│   │   │   ├── videos/     # Streaming de vídeo
│   │   │   ├── quizzes/    # Quizzes e avaliações
│   │   │   ├── certificates/ # Certificados
│   │   │   ├── forum/      # Fórum de discussão
│   │   │   └── progress/   # Progresso do aluno
│   │   ├── common/         # Componentes compartilhados
│   │   └── config/         # Configurações
│   └── test/               # Testes
├── frontend/               # Microserviço Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Serviços e guards
│   │   │   ├── shared/     # Componentes compartilhados
│   │   │   └── features/   # Features da aplicação
│   │   └── environments/   # Ambientes
└── docker-compose.yml      # Orquestração de containers
```

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros com expiração
- **Bcrypt**: Hash de senhas
- **CORS**: Configurado para origens permitidas
- **Validação de Input**: Class-validator no backend
- **SQL Injection**: Proteção via TypeORM
- **XSS**: Sanitização automática do Angular

## 🌐 Deploy

### AWS (Recomendado)

1. **Backend**: Deploy no AWS ECS/Fargate ou EC2
2. **Frontend**: Build estático no S3 + CloudFront
3. **Database**: AWS RDS PostgreSQL
4. **Cache**: AWS ElastiCache Redis
5. **Storage**: AWS S3 para vídeos
6. **CDN**: CloudFront para streaming

### Docker

```bash
# Build de produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@seudominio.com ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ para a comunidade de educação online
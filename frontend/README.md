# Frontend - Online Learning Platform

Interface web construída com Angular 17 para plataforma de educação online.

## 🏗️ Estrutura

```
src/
├── app/
│   ├── core/               # Serviços e funcionalidades core
│   │   ├── models/         # Interfaces e tipos
│   │   ├── services/       # Serviços da aplicação
│   │   ├── guards/         # Route guards
│   │   └── interceptors/   # HTTP interceptors
│   ├── shared/             # Componentes compartilhados
│   ├── features/           # Features da aplicação
│   │   ├── auth/          # Autenticação (login, registro)
│   │   ├── dashboard/     # Dashboard do usuário
│   │   ├── courses/       # Listagem e detalhes de cursos
│   │   ├── video-player/  # Player de vídeo
│   │   ├── quiz/          # Interface de quizzes
│   │   ├── forum/         # Fórum de discussão
│   │   └── certificates/  # Visualização de certificados
│   ├── app.component.ts
│   ├── app.routes.ts
│   └── app.config.ts
└── environments/           # Configurações de ambiente
```

## 🚀 Instalação

```bash
npm install
```

## ⚙️ Configuração

Configure o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

Para produção (`environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com'
};
```

## 🏃 Executar

```bash
# Desenvolvimento
npm start
# Acesse http://localhost:4200

# Build de produção
npm run build
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage
```

## 🎨 Componentes Principais

### Dashboard
- Visão geral de cursos matriculados
- Estatísticas de progresso
- Cursos em andamento e completados

### Cursos
- Listagem de cursos disponíveis
- Detalhes do curso
- Sistema de matrícula
- Módulos e lições

### Video Player
- Player integrado com Video.js
- Rastreamento de progresso
- Controles personalizados

### Quizzes
- Interface de quiz interativa
- Temporizador
- Feedback imediato

## 🔐 Autenticação

A aplicação usa JWT tokens armazenados no localStorage. O AuthInterceptor adiciona automaticamente o token a todas as requisições.

## 📱 Responsividade

A interface é totalmente responsiva e funciona em:
- Desktop (> 1024px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🎨 Estilização

- CSS moderno com Flexbox e Grid
- Gradientes e animações suaves
- Design system consistente
- Variáveis CSS para temas

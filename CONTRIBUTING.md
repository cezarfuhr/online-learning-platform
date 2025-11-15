# Guia de Contribuição

Obrigado por considerar contribuir para o Online Learning Platform! 🎉

## Como Contribuir

### 1. Fork o Projeto

Faça um fork do repositório e clone para sua máquina local:

```bash
git clone https://github.com/seu-usuario/online-learning-platform.git
cd online-learning-platform
```

### 2. Crie uma Branch

Crie uma branch para sua feature ou correção:

```bash
git checkout -b feature/nova-feature
# ou
git checkout -b fix/correcao-bug
```

### 3. Faça suas Alterações

- Siga os padrões de código do projeto
- Adicione testes para novas funcionalidades
- Atualize a documentação se necessário
- Mantenha commits pequenos e descritivos

### 4. Padrões de Código

#### Backend (NestJS)
- Use TypeScript
- Siga o ESLint configurado
- Adicione decoradores do Swagger para novos endpoints
- Escreva testes unitários para serviços
- Use DTOs para validação de input

#### Frontend (Angular)
- Use TypeScript strict mode
- Componentes standalone
- Services injetáveis
- RxJS para programação reativa
- Escreva testes para componentes

### 5. Commits

Use mensagens de commit descritivas:

```
feat: adiciona sistema de notificações
fix: corrige erro de autenticação
docs: atualiza README com novas instruções
test: adiciona testes para CourseService
refactor: melhora performance do video player
```

### 6. Testes

Certifique-se de que todos os testes passam:

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### 7. Pull Request

- Faça push da sua branch
- Abra um Pull Request
- Descreva suas alterações
- Referencie issues relacionadas

## Estrutura de PR

```markdown
## Descrição
Breve descrição das alterações

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Comentários foram adicionados onde necessário
- [ ] Documentação foi atualizada
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam
```

## Reportar Bugs

Use o template de issue para reportar bugs:

```markdown
**Descrição do Bug**
Descrição clara do bug

**Como Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer

**Screenshots**
Se aplicável

**Ambiente**
- OS: [ex. Windows 10]
- Browser: [ex. Chrome 91]
- Versão: [ex. 1.0.0]
```

## Sugerir Features

Use o template de feature request:

```markdown
**Problema**
Descrição do problema que a feature resolve

**Solução Proposta**
Como a feature funcionaria

**Alternativas**
Outras soluções consideradas

**Contexto Adicional**
Qualquer informação relevante
```

## Dúvidas?

- Abra uma issue com a tag `question`
- Entre em contato: suporte@seudominio.com

Obrigado por contribuir! 🚀

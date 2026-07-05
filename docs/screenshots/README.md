# 📸 Screenshots & Documentação Visual

## 🎯 Guia para Capturar Screenshots

Siga os passos abaixo para capturar screenshots de cada funcionalidade:

---

## 1️⃣ Modal de Criação de Card

### Passos para capturar:

1. **Acesse o sistema:**
   - URL: `http://localhost:8081`
   - Login: admin@example.com / admin123

2. **Capture a tela inicial:**
   - Arquivo: `01-home-inicial.png`
   - Descrição: Kanban board com 6 colunas

3. **Clique em "+ Nova Atividade":**
   - Arquivo: `02-modal-criacao-aberta.png`
   - Descrição: Modal de criação com campos

4. **Preencha campos:**
   - Título: "Feature X - Implementar Dashboard"
   - Descrição: "Criar novo dashboard de analytics"
   - Responsável: Selecione "João"
   - Arquivo: `03-modal-preenchida.png`

5. **Validação:**
   - Tente enviar vazio (mostra erro)
   - Arquivo: `04-modal-validacao-erro.png`

6. **Após criar:**
   - Arquivo: `05-card-em-backlog.png`
   - Descrição: Card criado aparece em Backlog

---

## 2️⃣ Drag-Drop com Cores Visuais

### Passos para capturar:

1. **Card em Backlog:**
   - Arquivo: `06-drag-drop-inicio.png`
   - Descrição: Card pronto para arrastar

2. **Movimento para frente (A Fazer):**
   - Arquivo: `07-drag-drop-forward.png`
   - Descrição: Card sendo arrastado (visualmente)

3. **Após mover:**
   - Arquivo: `08-card-em-ufazer.png`
   - Descrição: Card em nova coluna, sem modal

4. **Movimento para trás (Backlog):**
   - Arquivo: `09-modal-justificativa-aparece.png`
   - Descrição: Modal de justificativa aberta

5. **Preenchendo justificativa:**
   - Arquivo: `10-justificativa-preenchida.png`
   - Descrição: Campo preenchido

6. **Card com justificativa:**
   - Arquivo: `11-card-justificado.png`

---

## 3️⃣ Filtro por Responsável

### Passos para capturar:

1. **Dropdown "Responsável" com "Todos":**
   - Arquivo: `12-filtro-todos.png`
   - Descrição: 6 colunas com cards de todos

2. **Abrindo dropdown:**
   - Arquivo: `13-dropdown-responsaveis.png`
   - Descrição: Opções: Todos, João, Maria, Pedro

3. **Selecionando "João":**
   - Arquivo: `14-filtro-joao-selecionado.png`
   - Descrição: Apenas cards de João visíveis

4. **Selecionando "Maria":**
   - Arquivo: `15-filtro-maria-selecionado.png`
   - Descrição: Apenas cards de Maria visíveis

5. **Voltando para "Todos":**
   - Arquivo: `16-filtro-todos-novamente.png`
   - Descrição: Todos os cards aparecem

---

## 4️⃣ Drawer com Detalhes

### Passos para capturar:

1. **Clique em um card:**
   - Arquivo: `17-drawer-abrindo.png`
   - Descrição: Animação de abertura

2. **Drawer aberto com informações:**
   - Arquivo: `18-drawer-informacoes.png`
   - Descrição: ID, Status, Descrição, Data criação

3. **Com justificativa visível:**
   - Arquivo: `19-drawer-justificativa.png`
   - Descrição: Campo de justificativa (readonly)

4. **Seção de comentários:**
   - Arquivo: `20-drawer-comentarios.png`
   - Descrição: Lista de comentários + campo novo

5. **Seção de anexos:**
   - Arquivo: `21-drawer-anexos.png`
   - Descrição: Anexos + botão upload

---

## 5️⃣ Fluxo Completo

### Passos para capturar:

1. **Tela inicial:**
   - Arquivo: `22-fluxo-inicio.png`

2. **Após criar card:**
   - Arquivo: `23-fluxo-card-criado.png`

3. **Após filtrar:**
   - Arquivo: `24-fluxo-filtrado.png`

4. **Após mover:**
   - Arquivo: `25-fluxo-movido.png`

5. **Drawer final:**
   - Arquivo: `26-fluxo-drawer-final.png`

---

## 🎬 Usando Cypress para Capturar

O Cypress pode capturar screenshots automaticamente:

```bash
cd frontend

# Capturar durante testes
npm run cy:run

# Videos salvos em: cypress/videos/
# Screenshots em: cypress/screenshots/
```

### Configuração Cypress

No `cypress.config.ts`:

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    screenshotOnRunFailure: true,
    video: true,
    videoUploadOnPasses: false,
  }
});
```

### Capturar via teste

```typescript
it('Deve criar card via modal', () => {
  cy.visit('/home');
  cy.screenshot('01-home-inicial');
  
  cy.get('button').contains('Nova Atividade').click();
  cy.screenshot('02-modal-aberta');
  
  cy.get('input[type="text"]').type('Feature X');
  cy.screenshot('03-modal-preenchida');
  
  cy.get('button').contains('Criar').click();
  cy.screenshot('04-card-criado');
});
```

---

## 📋 Checklist de Screenshots

### Funcionalidade: Modal
- [ ] Modal fechada (inicial)
- [ ] Modal aberta (vazia)
- [ ] Modal preenchida
- [ ] Validação (erro)
- [ ] Após criar (modal fechada)

### Funcionalidade: Drag-Drop
- [ ] Card inicial em Backlog
- [ ] Arrastando card
- [ ] Card em nova coluna (forward)
- [ ] Modal de justificativa aparecendo
- [ ] Modal preenchida
- [ ] Card com justificativa

### Funcionalidade: Filtro
- [ ] Dropdown "Todos" (padrão)
- [ ] Dropdown aberto
- [ ] Filtro "João" aplicado
- [ ] Filtro "Maria" aplicado
- [ ] Voltando para "Todos"

### Funcionalidade: Drawer
- [ ] Drawer abrindo
- [ ] Seção informações
- [ ] Seção comentários
- [ ] Seção anexos
- [ ] Drawer fechando

---

## 🎨 Recomendações de Captura

### Resolução
- Desktop: 1920x1080 (HD)
- Tablet: 768x1024
- Mobile: 375x667

### Iluminação
- Luz natural quando possível
- Evitar reflexos de tela
- Contraste adequado

### Composição
- Centralizar elemento principal
- Incluir contexto (header, navegação)
- Sem informações sensíveis

### Formato
- PNG para qualidade
- JPG para galeria
- SVG para diagramas

---

## 📁 Estrutura de Pastas

```
docs/screenshots/
├── README.md (este arquivo)
├── 01-modals/
│   ├── 01-home-inicial.png
│   ├── 02-modal-criacao-aberta.png
│   ├── 03-modal-preenchida.png
│   ├── 04-modal-validacao-erro.png
│   └── 05-card-em-backlog.png
├── 02-drag-drop/
│   ├── 06-drag-drop-inicio.png
│   ├── 07-drag-drop-forward.png
│   ├── 08-card-em-ufazer.png
│   ├── 09-modal-justificativa-aparece.png
│   ├── 10-justificativa-preenchida.png
│   └── 11-card-justificado.png
├── 03-filtros/
│   ├── 12-filtro-todos.png
│   ├── 13-dropdown-responsaveis.png
│   ├── 14-filtro-joao-selecionado.png
│   ├── 15-filtro-maria-selecionado.png
│   └── 16-filtro-todos-novamente.png
├── 04-drawer/
│   ├── 17-drawer-abrindo.png
│   ├── 18-drawer-informacoes.png
│   ├── 19-drawer-justificativa.png
│   ├── 20-drawer-comentarios.png
│   └── 21-drawer-anexos.png
├── 05-fluxo-completo/
│   ├── 22-fluxo-inicio.png
│   ├── 23-fluxo-card-criado.png
│   ├── 24-fluxo-filtrado.png
│   ├── 25-fluxo-movido.png
│   └── 26-fluxo-drawer-final.png
└── diagramas/
    ├── arquitetura.svg
    ├── fluxo-usuarios.svg
    └── estados-card.svg
```

---

## 🎥 Gravações em Vídeo (Cypress)

Após rodar `npm run cy:run`, encontre em:

```
frontend/cypress/videos/
├── rf-004-cadastro-card-modal.cy.ts.mp4
├── rf-002-drag-drop-justificativa.cy.ts.mp4
├── rf-003-filtro-responsavel.cy.ts.mp4
├── rf-009-justificativa.cy.ts.mp4
└── fluxo-integrado-novo.cy.ts.mp4
```

Estes vídeos mostram **automaticamente** todas as interações!

---

## 📸 Ferramentas Recomendadas

### Captura
- **Mac**: Cmd+Shift+4
- **Windows**: Win+Shift+S
- **Linux**: PrintScreen

### Edição
- **Figma**: Design online
- **Canva**: Templates prontos
- **GIMP**: Editor gratuito

### Hospedagem
- **GitHub**: Directly em `/docs/screenshots/`
- **Imgur**: Hotlinking
- **Cloudinary**: CDN para imagens

---

## 🔗 Links Úteis

- [Cypress Screenshots](https://docs.cypress.io/guides/tooling/screenshots-and-videos)
- [Figma](https://www.figma.com)
- [Markdown Image Syntax](https://www.markdownguide.org/basic-syntax/#images-1)

---

## ✅ Próximas Ações

1. [ ] Subir Docker: `docker compose up -d`
2. [ ] Capturar screenshots manualmente
3. [ ] Ou executar: `npm run cy:run` para gerar vídeos
4. [ ] Salvar em `docs/screenshots/`
5. [ ] Atualizar README com imagens
6. [ ] Comprimir imagens (tinypng.com)

---

**Última atualização**: Julho 2026  
**Status**: Guia pronto para coleta de imagens reais

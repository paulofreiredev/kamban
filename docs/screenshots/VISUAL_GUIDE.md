# 📸 Guia Visual Rápido - Funcionalidades do Kamban

Referência visual rápida de como usar cada funcionalidade.

---

## 🎯 1. Criar Nova Atividade

### ✓ Como usar:
1. Clique em **"+ Nova Atividade"** no header
2. Preencha o **Título** (obrigatório)
3. Adicione **Descrição** (opcional, suporta Markdown)
4. Selecione **Responsável** (dropdown)
5. Escolha **Prioridade** (Baixa, Média, Alta)
6. Defina **Data de Vencimento** (opcional)
7. Clique em **"Criar Atividade"**

### 📋 Campos:
- **Título** ✓ Obrigatório (min 5 caracteres)
- **Descrição** - Markdown suportado
- **Responsável** - Dropdown com membros do time
- **Prioridade** - Radio buttons (Baixa/Média/Alta)
- **Data de Vencimento** - Date picker

### 🎨 Modal:
[Ver imagem: 02-modal-criar-atividade.svg](docs/screenshots/02-modal-criar-atividade.svg)

### 🧪 Teste correspondente:
```bash
npm run cy:run -- --spec "cypress/e2e/rf-004-cadastro-card-modal.cy.ts"
```

### ❌ Erros comuns:
- Campo "Título" vazio → Erro de validação
- ESC key fecha modal sem salvar
- Clique fora do modal (backdrop) também fecha

---

## 🔄 2. Mover Atividades (Drag-Drop)

### ✓ Como usar:

**Movimento Forward** (sem justificativa)
```
A Fazer → Em Progresso → Em Revisão → Concluído
```
- Arraste para a direita → Move instantaneamente
- Sem necessidade de justificativa

**Movimento Backward** (com justificativa obrigatória)
```
Concluído → Em Revisão → Em Progresso → A Fazer
```
- Arraste para a esquerda → Modal de justificativa aparece
- Preencha o motivo do retrocesso
- Clique "Confirmar Retrocesso"

### 🎯 Regras:
- **Forward**: Automático, sem modal ⚡
- **Backward**: Requer justificativa ⚠️
- **Para Cancelado**: Sempre com modal
- **De Cancelado**: Não permite movimento (readonly)

### 📊 Fluxo Visual:
[Ver imagem: 05-fluxo-drag-drop.svg](docs/screenshots/05-fluxo-drag-drop.svg)

### 🧪 Testes correspondentes:
```bash
npm run cy:run -- --spec "cypress/e2e/rf-002-drag-drop-justificativa.cy.ts"
npm run cy:run -- --spec "cypress/e2e/fluxo-integrado-novo.cy.ts"
```

---

## ⚠️ 3. Justificativa de Retrocesso

### ✓ Como usar:

1. Tente mover uma atividade para **trás**
2. Modal aparece: **"Retrocesso Detectado!"**
3. Preencha o campo **"Justificativa"** (obrigatório)
   - Mínimo 10 caracteres
   - Explique o motivo
4. (Opcional) Selecione **Categoria**:
   - Bug encontrado
   - Feedback do cliente
   - Requisito não atendido
   - Dependência bloqueada
5. Clique **"Confirmar Retrocesso"**

### 📋 Validações:
- **Justificativa** é obrigatória ✓
- Mínimo 10 caracteres ✓
- Suporta caracteres especiais, emojis, etc. ✓
- Registrada no histórico do card ✓

### 📸 Modal:
[Ver imagem: 03-modal-justificativa-retrocesso.svg](docs/screenshots/03-modal-justificativa-retrocesso.svg)

### 🧪 Teste correspondente:
```bash
npm run cy:run -- --spec "cypress/e2e/rf-009-justificativa.cy.ts"
```

### 📝 Exemplos de justificativas:
- "Feedback adicional do cliente, precisa de ajustes"
- "Bug encontrado durante testes, retornando"
- "Dependência da tarefa X ainda não concluída"
- "Mudança de prioridades do projeto"

---

## 🔍 4. Filtrar por Responsável

### ✓ Como usar:

1. Localize o dropdown **"Responsável"** no header (ao lado do filtro de datas)
2. Clique para abrir
3. Selecione uma opção:
   - **Todos** (padrão) → Mostra todas as atividades
   - **João Silva** → Mostra apenas atividades de João
   - **Maria Costa** → Apenas de Maria
   - **Pedro Santos** → Apenas de Pedro
   - **Ana Oliveira** → Apenas de Ana

### 🎯 Comportamentos:
- Atualiza o board em **tempo real** ⚡
- Mostra **contagem** de atividades por responsável
- Combinável com **filtro de datas**
- Ordenação alfabética ✓

### 📊 Dropdown Visual:
[Ver imagem: 04-filtro-responsavel.svg](docs/screenshots/04-filtro-responsavel.svg)

### 🧪 Teste correspondente:
```bash
npm run cy:run -- --spec "cypress/e2e/rf-003-filtro-responsavel.cy.ts"
```

### 💡 Dicas:
- Use para acompanhar carga de trabalho por membro
- Combine com filtro de datas para períodos específicos
- Útil em standups e reuniões de sincronização

---

## 📊 5. Board Kanban (Visão Geral)

### ✓ Estrutura:

```
┌─────────────────────────────────────────────────────────────────┐
│  Kamban Board                                                    │
├─────────────────────────────────────────────────────────────────┤
│  De: 2026-06-05  │  Até: 2026-07-05  │  Responsável: Todos ▼ │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Backlog  │  A Fazer  │  Em Prog.  │  Em Rev.  │  Concluído    │
│     3     │     2     │     1      │     1     │      4        │
│  ┌─────┐  │  ┌─────┐  │  ┌─────┐  │  ┌─────┐  │  ┌─────┐      │
│  │Card1│  │  │Card2│  │  │Card3│  │  │Card4│  │  │Card5│      │
│  │João │  │  │João │  │  │Pedro│  │  │Maria│  │  │João │      │
│  └─────┘  │  └─────┘  │  └─────┘  │  └─────┘  │  └─────┘      │
│           │           │           │           │                │
│  ┌─────┐  │  ┌─────┐  │           │  ┌─────┐  │  ┌─────┐      │
│  │Card6│  │  │Card7│  │           │  │Card8│  │  │Card9│      │
│  │Maria│  │  │Pedro│  │           │  │João │  │  │Ana  │      │
│  └─────┘  │  └─────┘  │           │  └─────┘  │  └─────┘      │
│           │           │           │           │  ┌─────┐      │
└─────────────────────────────────────────────────│  │ ⚠️  │      │
                                                  │  │Justif│    │
                                                  │  └─────┘      │
                                                  │                │
                                                  └──────────────────┘
```

### 🎯 Colunas:
- **Backlog** - Novas atividades, ainda não começadas
- **A Fazer** - Priorizado para fazer
- **Em Progresso** - Sendo trabalhado agora
- **Em Revisão** - Aguardando revisão/aprovação
- **Concluído** - Finalizadas ✓
- **Cancelado** - Canceladas (com justificativa) ⚠️

### 📊 Board Visual:
[Ver imagem: 01-kanban-board-novo.svg](docs/screenshots/01-kanban-board-novo.svg)

### 🧪 Teste correspondente:
```bash
npm run cy:run -- --spec "cypress/e2e/rf-001-kanban-board.cy.ts"
npm run cy:run -- --spec "cypress/e2e/fluxo-integrado-novo.cy.ts"
```

---

## 🔄 Fluxo Completo (Exemplo)

### Cenário: Implementar Feature X

**Passo 1: Criar Atividade**
```
1. Clique "+ Nova Atividade"
2. Título: "Implementar autenticação 2FA"
3. Responsável: "João Silva"
4. Prioridade: "Alta"
5. Clique "Criar"
→ Card aparece em BACKLOG
```

**Passo 2: Iniciar Trabalho**
```
1. Arraste card de BACKLOG para A FAZER
→ Move sem modal (forward)
```

**Passo 3: Começar Implementação**
```
1. Arraste de A FAZER para EM PROGRESSO
→ Move sem modal (forward)
```

**Passo 4: Problemas Encontrados (Retrocesso)**
```
1. Arraste de EM PROGRESSO para A FAZER
→ Modal aparece: "Retrocesso Detectado!"
2. Justificativa: "Encontrado bug na API de SMS"
3. Clique "Confirmar Retrocesso"
→ Card volta para A FAZER com justificativa registrada
```

**Passo 5: Reiniciar**
```
1. Corrija o problema
2. Arraste de A FAZER para EM PROGRESSO
→ Move sem modal (forward)
```

**Passo 6: Revisar**
```
1. Arraste de EM PROGRESSO para EM REVISÃO
→ Move sem modal (forward)
```

**Passo 7: Aprovação**
```
1. Arraste de EM REVISÃO para CONCLUÍDO
→ Move sem modal (forward)
✓ Feature implementada!
```

---

## 🎨 Legenda Visual

### Cores
```
🔵 Azul (#2456ff)      = Ações, cliques, destaque
⚪ Branco (#ffffff)    = Cards, modais
🔘 Cinza (#f8f9fa)    = Backgrounds, colunas
🟡 Amarelo (#ffc107)   = Aviso, retrocesso
🟢 Verde (#28a745)    = Sucesso, confirmação
🔴 Vermelho (#dc3545)  = Perigo, cancel
```

### Símbolos
```
✓ = Confirmado, sucesso
✕ = Cancelar, fechar
⚠️ = Aviso, atenção
→ = Forward (para frente)
← = Backward (para trás)
🔄 = Ciclo, repetição
```

---

## 🧪 Rodar Todos os Testes

### Opção 1: Interface Cypress (Recomendado para aprender)
```bash
cd frontend
npm run cy:open

# Selecione cada teste e veja funcionando
```

### Opção 2: Linha de comando (CI/CD)
```bash
cd frontend
npm run cy:run

# Rodar teste específico:
npm run cy:run -- --spec "cypress/e2e/fluxo-integrado-novo.cy.ts"
```

### Opção 3: Watch mode (Desenvolvimento)
```bash
cd frontend
npm run cy:watch
```

---

## 📚 Documentação Relacionada

- [INDEX.md](docs/screenshots/INDEX.md) - Índice completo de imagens
- [TESTES_E2E_REPORT.md](TESTES_E2E_REPORT.md) - Relatório completo de testes
- [FLUXO_TESTES_COMPLETO.md](FLUXO_TESTES_COMPLETO.md) - Detalhes de cada teste
- [TESTES_SUMMARY.md](TESTES_SUMMARY.md) - Referência rápida
- [SCREENSHOTS_DIAGRAMS.md](SCREENSHOTS_DIAGRAMS.md) - Diagramas em ASCII

---

## ❓ Dúvidas Frequentes

**P: O que é um "movimento forward"?**
R: Mover uma atividade para a direita (próxima coluna). Ex: A Fazer → Em Progresso. Acontece automaticamente sem modal.

**P: E um "movimento backward"?**
R: Mover uma atividade para a esquerda (coluna anterior). Ex: Em Progresso → A Fazer. Requer justificativa.

**P: A justificativa é obrigatória?**
R: Sim, para qualquer movimento para trás. Mínimo 10 caracteres. Fica registrada no histórico.

**P: Posso editar a justificativa depois?**
R: Não, a justificativa é imutável uma vez salva (para auditoria).

**P: E se cancelar o retrocesso?**
R: Clique "Manter em Revisão" (ou status anterior). Card não se move.

**P: Como filtrar por múltiplos responsáveis?**
R: Atualmente o filtro é por um responsável ou "Todos". Se quiser vários, use "Todos" + filtro de datas.

---

## 🚀 Próximas Features (Roadmap)

- [ ] Filtro por múltiplos responsáveis
- [ ] Busca por título de atividade
- [ ] Tags e categorias
- [ ] Notifications em tempo real
- [ ] Relatórios e analytics
- [ ] Integração com Slack/Teams

---

**Versão**: 1.0
**Última atualização**: 2026-07-05
**Status**: ✓ Completo e testado

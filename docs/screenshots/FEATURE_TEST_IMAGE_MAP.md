# 🗺️ Mapa Visual: Features → Testes → Imagens

Guia de referência cruzada conectando funcionalidades, testes e visualizações.

---

## 📌 Mapeamento Completo

### Feature 1: Modal de Criar Atividade

**RF-004: Cadastro de Card Modal**

**Imagens:**
- 📊 [02-modal-criar-atividade.svg](02-modal-criar-atividade.svg)
- 📊 [01-kanban-board-novo.svg](01-kanban-board-novo.svg) - Botão de acionamento
- 📊 [INFOGRAFICO_VISUAL.svg](INFOGRAFICO_VISUAL.svg) - Seção 1

**Suite de Testes:**
```
frontend/cypress/e2e/rf-004-cadastro-card-modal.cy.ts
```

**Test Cases:**
1. ✅ CA-004.1 - Abrir modal com "+ Nova Atividade"
2. ✅ CA-004.2 - Validar título obrigatório
3. ✅ CA-004.3 - Criar card com título e descrição
4. ✅ CA-004.4 - Atribuir responsável ao criar
5. ✅ CA-004.5 - Múltiplas criações em sequência
6. ✅ CA-004.6 - Fechar modal com ESC key
7. ✅ CA-004.7 - Fechar modal com click no backdrop

**Campos de Input:**
- `title`: Título do card (obrigatório)
- `description`: Descrição em Markdown (opcional)
- `assigneeId`: Responsável (dropdown)
- `priority`: Prioridade (radio: low/medium/high)
- `dueDate`: Data de vencimento (date picker)

**Validações Testadas:**
- ✓ Título é obrigatório
- ✓ Modal abre/fecha corretamente
- ✓ Form clearance após criação
- ✓ Card aparece em Backlog
- ✓ Responsável é atribuído corretamente

**Flow Integrado:**
- `fluxo-integrado-novo.cy.ts` (passo 1-3)

---

### Feature 2: Drag-Drop com Justificativa

**RF-002: Home Kanban com Drag-Drop + Justificativa**

**Imagens:**
- 📊 [05-fluxo-drag-drop.svg](05-fluxo-drag-drop.svg) - Fluxo completo
- 📊 [01-kanban-board-novo.svg](01-kanban-board-novo.svg) - Board com cards
- 📊 [INFOGRAFICO_VISUAL.svg](INFOGRAFICO_VISUAL.svg) - Seção 2

**Suites de Testes:**
```
frontend/cypress/e2e/rf-002-drag-drop-justificativa.cy.ts
frontend/cypress/e2e/rf-009-justificativa.cy.ts (validação)
```

**Test Cases - Movimento Forward (sem modal):**
1. ✅ CA-002.1 - Mover card de A Fazer para Em Progresso
2. ✅ CA-002.2 - Mover card de Em Progresso para Em Revisão
3. ✅ CA-002.3 - Mover card de Em Revisão para Concluído
4. ✅ CA-002.4 - Status persiste após refresh

**Test Cases - Movimento Backward (com modal):**
5. ✅ CA-002.5 - Mover card para trás → modal aparece
6. ✅ CA-002.6 - Modal não permite vazio → validação
7. ✅ CA-002.7 - Confirmar retrocesso com justificativa

**Regras de Movimento:**
- Forward (→): A Fazer → Em Progresso → Em Revisão → Concluído ⚡
- Backward (←): Qualquer para esquerda com modal ⚠️
- Cancelado: Sempre requer modal, nunca para fora
- Readonly: De Cancelado não pode mover

**Validações Testadas:**
- ✓ Forward move sem modal
- ✓ Backward exige justificativa
- ✓ Justificativa min 10 chars
- ✓ Status persiste no DB
- ✓ Histórico registra movimento

---

### Feature 3: Justificativa em Card

**RF-009: Campo Justificativa**

**Imagens:**
- 📊 [03-modal-justificativa-retrocesso.svg](03-modal-justificativa-retrocesso.svg) - Modal completo
- 📊 [05-fluxo-drag-drop.svg](05-fluxo-drag-drop.svg) - Fluxo Backward
- 📊 [INFOGRAFICO_VISUAL.svg](INFOGRAFICO_VISUAL.svg) - Seção 3

**Suite de Testes:**
```
frontend/cypress/e2e/rf-009-justificativa.cy.ts
```

**Test Cases:**
1. ✅ CA-009.1 - Modal aparece ao retroceder
2. ✅ CA-009.2 - Validação: campo obrigatório
3. ✅ CA-009.3 - Validação: mínimo 10 caracteres
4. ✅ CA-009.4 - Suporta caracteres especiais
5. ✅ CA-009.5 - Justificativa persiste no DB
6. ✅ CA-009.6 - Display em drawer do card (readonly)
7. ✅ CA-009.7 - Histórico mostra autor/timestamp
8. ✅ CA-009.8 - Cancelamento sem validação
9. ✅ CA-009.9 - Múltiplas justificativas no histórico
10. ✅ CA-009.10 - Categoria é salva (opcional)

**Modal Validações:**
- ✓ Justificativa obrigatória
- ✓ Mínimo 10 caracteres
- ✓ Máximo 500 caracteres
- ✓ Aceita emojis e caracteres especiais

**Campos:**
- `justification`: Texto (min 10, max 500, obrigatório)
- `category`: Enum (bug, feedback, requirement, blocker - opcional)
- `movedBy`: Usuário que justificou
- `movedAt`: Timestamp do movimento
- `fromStatus`: Status anterior
- `toStatus`: Status novo

**Persistência:**
- Salvo em Card.justification
- Histórico em CardHistory
- Display readonly no drawer

---

### Feature 4: Filtro por Responsável

**RF-003: Filtro por Responsável**

**Imagens:**
- 📊 [04-filtro-responsavel.svg](04-filtro-responsavel.svg) - Dropdown e filtro
- 📊 [01-kanban-board-novo.svg](01-kanban-board-novo.svg) - Board filtrado
- 📊 [INFOGRAFICO_VISUAL.svg](INFOGRAFICO_VISUAL.svg) - Seção 4

**Suite de Testes:**
```
frontend/cypress/e2e/rf-003-filtro-responsavel.cy.ts
```

**Test Cases:**
1. ✅ CA-003.1 - Dropdown "Responsável" visível
2. ✅ CA-003.2 - Opção "Todos" padrão
3. ✅ CA-003.3 - Listar todos os responsáveis
4. ✅ CA-003.4 - Selecionar responsável filtra board
5. ✅ CA-003.5 - Mostrar contagem por responsável
6. ✅ CA-003.6 - Ordenação alfabética
7. ✅ CA-003.7 - Combinável com filtro de datas
8. ✅ CA-003.8 - Cards desaparecem ao filtrar
9. ✅ CA-003.9 - Contadores de coluna atualizam
10. ✅ CA-003.10 - Criação com assignee atualiza filtro
11. ✅ CA-003.11 - Persistência ao refresh
12. ✅ CA-003.12 - API call com assigneeId param

**API Behavior:**
- GET `/api/cards?assigneeId={id}&dateFrom=...&dateTo=...`
- Retorna apenas cards do responsável
- Contadores por coluna refletem filtro
- Estado URL-friendly (query params)

**Dropdown:**
- Todos (5) - Default
- João Silva (2) - Contador
- Maria Costa (1)
- Pedro Santos (1)
- Ana Oliveira (1)

---

### Feature 5: Board Kanban

**RF-001: Tela Home Kanban**

**Imagens:**
- 📊 [01-kanban-board-novo.svg](01-kanban-board-novo.svg) - Board completo
- 📊 [INFOGRAFICO_VISUAL.svg](INFOGRAFICO_VISUAL.svg) - Seção 5

**Suite de Testes:**
```
frontend/cypress/e2e/rf-001-kanban-board.cy.ts
frontend/cypress/e2e/fluxo-integrado-novo.cy.ts
```

**Test Cases - Board:**
1. ✅ CA-001.1 - Todos as 6 colunas visíveis
2. ✅ CA-001.2 - Contadores corretos por coluna
3. ✅ CA-001.3 - Cards ordenados por data
4. ✅ CA-001.4 - Responsável mostrado em cada card
5. ✅ CA-001.5 - Prioridade visível (cor)
6. ✅ CA-001.6 - Filtros funcionando
7. ✅ CA-001.7 - Drag-drop habilitado
8. ✅ CA-001.8 - Refresh atualiza board

**Colunas:**
| Coluna | Status | Desc |
|--------|--------|------|
| Backlog | BACKLOG | Novas ideias |
| A Fazer | TODO | Priorizado |
| Em Progresso | IN_PROGRESS | Em trabalho |
| Em Revisão | IN_REVIEW | Aguardando QA |
| Concluído | DONE | Finalizado |
| Cancelado | CANCELLED | Com justificativa |

**Contadores:**
- Dinâmicos por filtro aplicado
- Real-time ao mover
- Mostram (N) após nome da coluna

---

## 🔄 Fluxo Integrado Completo

**fluxo-integrado-novo.cy.ts** (10 test cases)

**Sequência:**
```
1. Login (admin@kamban.local / admin123)
   └─ Testa: Autenticação

2. Clica "+ Nova Atividade"
   └─ Testa: Feature 1 (Modal)

3. Preenche: Título + Responsável
   └─ Testa: Validação form

4. Clica "Criar"
   └─ Resultado: Card em Backlog

5. Filtra por Responsável
   └─ Testa: Feature 4 (Filtro)

6. Arrasta card para Em Progresso
   └─ Testa: Feature 2 (Forward)
   └─ Resultado: Move sem modal

7. Arrasta para Backlog (backward)
   └─ Testa: Feature 2+3 (Backward)
   └─ Resultado: Modal aparece

8. Preenche justificativa
   └─ Testa: Feature 3 (Justificativa)

9. Confirma retrocesso
   └─ Resultado: Card em Backlog com justificativa

10. Filtra "Todos"
    └─ Resultado: Board volta ao normal
```

**Testes:**
1. ✅ CA-INT.1 - Login funciona
2. ✅ CA-INT.2 - Criar card via modal
3. ✅ CA-INT.3 - Card aparece em Backlog
4. ✅ CA-INT.4 - Filtro por responsável
5. ✅ CA-INT.5 - Forward movement
6. ✅ CA-INT.6 - Backward com modal
7. ✅ CA-INT.7 - Justificativa persistida
8. ✅ CA-INT.8 - Drawer mostra dados
9. ✅ CA-INT.9 - Múltiplas criações
10. ✅ CA-INT.10 - Estado persiste

---

## 🧪 Matriz Resumida

| Feature | RF | Testes | Cases | Imagens | Status |
|---------|----|----|-------|--------|--------|
| Modal Criar | RF-004 | rf-004-cadastro-card-modal.cy.ts | 7 | 02, 01, Infog | ✅ |
| Drag-Drop | RF-002 | rf-002-drag-drop-justificativa.cy.ts | 7 | 05, 01, Infog | ✅ |
| Justificativa | RF-009 | rf-009-justificativa.cy.ts | 10 | 03, 05, Infog | ✅ |
| Filtro Responsável | RF-003 | rf-003-filtro-responsavel.cy.ts | 12 | 04, 01, Infog | ✅ |
| Board Kanban | RF-001 | rf-001-kanban-board.cy.ts | 8 | 01, Infog | ✅ |
| Integrado | - | fluxo-integrado-novo.cy.ts | 10 | Todas | ✅ |
| **TOTAL** | **6** | **6 suites** | **54+ cases** | **6 images** | **✅** |

---

## 📖 Como Usar Este Mapa

### Cenário 1: Estou vendo uma imagem, quero saber o teste
```
1. Identifique a imagem (ex: 03-modal-justificativa.svg)
2. Procure em "Feature" correspondente
3. Veja "Suite de Testes" e "Test Cases"
4. Execute: npm run cy:run -- --spec "<suite>"
```

### Cenário 2: Vejo um test falhando, preciso entender o fluxo
```
1. Pegue o nome do teste (ex: rf-009-justificativa)
2. Procure em "Feature 3" neste documento
3. Veja imagens associadas
4. Consulte [VISUAL_GUIDE.md](VISUAL_GUIDE.md) para como usar
```

### Cenário 3: Preciso documentar uma feature para novos devs
```
1. Encontre a Feature neste documento
2. Mostre as imagens SVG (visualização clara)
3. Aponte para [VISUAL_GUIDE.md](VISUAL_GUIDE.md)
4. Execute o test junto: npm run cy:open
```

---

## 🔗 Links Relacionados

- [INDEX.md](INDEX.md) - Índice geral com checklist
- [VISUAL_GUIDE.md](VISUAL_GUIDE.md) - Guia como usar
- [INFOGRAFICO_VISUAL.svg](INFOGRAFICO_VISUAL.svg) - One-pager visual
- [../SCREENSHOTS_DIAGRAMS.md](../SCREENSHOTS_DIAGRAMS.md) - ASCII art
- [../TESTES_E2E_REPORT.md](../TESTES_E2E_REPORT.md) - Teste completo
- [../FLUXO_TESTES_COMPLETO.md](../FLUXO_TESTES_COMPLETO.md) - Detalhes

---

**Versão**: 1.0
**Última atualização**: 2026-07-05
**Status**: ✓ Completo

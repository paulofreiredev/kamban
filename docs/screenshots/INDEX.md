# 📊 Screenshots e Diagramas - Kanban Kamban

Documentação visual das funcionalidades implementadas com testes E2E.

## 📁 Estrutura de Imagens

```
docs/screenshots/
├── 01-kanban-board-novo.svg          # Overview do board com todas as novas features
├── 02-modal-criar-atividade.svg      # Modal para criar nova atividade
├── 03-modal-justificativa-retrocesso.svg  # Modal para justificar retrocesso
├── 04-filtro-responsavel.svg         # Dropdown de filtro por responsável
├── 05-fluxo-drag-drop.svg            # Diagrama de fluxo forward vs retrocesso
└── README.md                         # Este arquivo
```

## 🎯 Funcionalidades Ilustradas

### 1. **Kanban Board Renovado** (01-kanban-board-novo.svg)
**Visualiza**: O board completo com todas as colunas e funcionalidades integradas

**Features demonstradas:**
- 5 colunas: Backlog, A Fazer, Em Progresso, Em Revisão, Concluído, Cancelado
- Cards com informações de responsável
- Contador de cards por coluna
- Cards com justificativa (coluna Cancelado)
- Botão "+ Nova Atividade" destacado
- Filtros de data e responsável funcionando

**Testes relacionados:**
- `rf-001-kanban-board.cy.ts`
- `fluxo-integrado-novo.cy.ts`

---

### 2. **Modal de Criar Atividade** (02-modal-criar-atividade.svg)
**Visualiza**: O formulário completo para criar nova atividade

**Fields do Modal:**
- Título (obrigatório) ✓
- Descrição (com suporte a Markdown)
- Responsável (dropdown com usuários)
- Prioridade (radio buttons: Baixa, Média, Alta)
- Data de Vencimento (date picker)

**Comportamentos:**
- Validação em tempo real
- Cancelamento com ESC ou botão "Cancelar"
- Criação ao clicar "Criar Atividade"
- Suporte a múltiplas criações em sequência

**Testes relacionados:**
- `rf-004-cadastro-card-modal.cy.ts` (7 test cases)
  - Modal open/close
  - Form validation
  - Card creation with assignee
  - Multiple creations
  - ESC key close
  - Backdrop close

---

### 3. **Modal de Justificativa (Retrocesso)** (03-modal-justificativa-retrocesso.svg)
**Visualiza**: Modal que aparece quando usuário tenta retroceder uma atividade

**Informações mostradas:**
- Ícone de aviso (⚠️)
- De qual status para qual status
- Nome e ID da atividade
- Responsável atual

**Campos obrigatórios:**
- Justificativa (textarea com min 10 caracteres)
- Categoria (dropdown opcional): Bug, Feedback, Requisito, Dependência

**Validações:**
- Justificativa é obrigatória
- Mínimo 10 caracteres
- Suporta caracteres especiais
- Registrada no histórico

**Testes relacionados:**
- `rf-009-justificativa.cy.ts` (10 test cases)
- `rf-002-drag-drop-justificativa.cy.ts` (7 test cases)
  - Modal trigger on regression
  - Validation enforcement
  - Persistence to database
  - Readonly after save
  - Special characters support
  - Minimum length validation

---

### 4. **Filtro por Responsável** (04-filtro-responsavel.svg)
**Visualiza**: O dropdown de filtro com lista de responsáveis

**Funcionalidades:**
- Dropdown com opção "Todos" (padrão)
- Lista de usuários com avatares (iniciadas)
- Cores diferentes para cada avatar
- Contagem de atividades por responsável
- Filtro em tempo real no board
- Ordenação alfabética

**Opções de filtro:**
- Todos (5 atividades)
- João Silva (2)
- Maria Costa (1)
- Pedro Santos (1)
- Ana Oliveira (1)

**Comportamentos:**
- Ao selecionar um responsável, board atualiza em tempo real
- Combinável com filtro de data
- Mostra apenas cards do responsável selecionado

**Testes relacionados:**
- `rf-003-filtro-responsavel.cy.ts` (12 test cases)
  - Dropdown display
  - Single user filtering
  - Multiple user filtering (if enabled)
  - Alphabetical ordering
  - Count validation
  - Combined with date filter
  - Board update in real-time
  - API call with assigneeId parameter

---

### 5. **Fluxo de Drag-Drop** (05-fluxo-drag-drop.svg)
**Visualiza**: Os dois cenários de movimento de cards

**Cenário 1: Movimento Forward (sem modal)**
```
A Fazer → Em Progresso (✓ Imediato)
Em Progresso → Em Revisão (✓ Imediato)
Em Revisão → Concluído (✓ Imediato)
```
- Movimento automático sem interrupção
- Sem necessidade de justificativa
- Atualização imediata do board

**Cenário 2: Retrocesso (com modal)**
```
Concluído → Em Revisão (⚠️ Modal)
Em Revisão → Em Progresso (⚠️ Modal)
Em Progresso → A Fazer (⚠️ Modal)
```
- Modal aparece pedindo justificativa
- Usuário preenche motivo
- Justificativa registrada no histórico
- Card salvo com novo status

**Regras especiais:**
- Para Cancelado: sempre requer modal
- De Cancelado: não permite movimento (readonly)
- Justificativa é salva no histórico do card

**Testes relacionados:**
- `rf-002-drag-drop-justificativa.cy.ts` (7 test cases)
- `fluxo-integrado-novo.cy.ts` (10 test cases)
  - Forward movement without modal
  - Backward movement with modal
  - Modal cancellation
  - State persistence
  - History tracking
  - Complete workflow integration

---

## 🔄 Fluxo Integrado Completo

**Sequência de uso:**
1. Usuário clica "+ Nova Atividade"
2. Modal abre com formulário
3. Preenchimento de dados e seleção de responsável
4. Criação do card
5. Card aparece no board (Backlog)
6. Filtro por responsável pode ser aplicado
7. Movimento para direita (forward) sem modal
8. Ao mover para esquerda, modal de justificativa aparece
9. Justificativa é salva e card muda de status
10. Histórico registra todas as mudanças

---

## 📊 Matriz de Testes por Imagem

| Imagem | Funcionalidade | Testes | Casos |
|--------|----------------|--------|-------|
| 01-kanban-board-novo.svg | Board Layout | rf-001, fluxo-integrado | 2 suites |
| 02-modal-criar-atividade.svg | Modal Creation | rf-004-cadastro-card-modal | 7 cases |
| 03-modal-justificativa-retrocesso.svg | Justification | rf-009-justificativa, rf-002 | 17 cases |
| 04-filtro-responsavel.svg | Assignee Filter | rf-003-filtro-responsavel | 12 cases |
| 05-fluxo-drag-drop.svg | Drag-Drop Flow | rf-002, fluxo-integrado | 17 cases |

**Total de cobertura:** 5 imagens • 5 suites • 55+ test cases

---

## 🎨 Legendas das Imagens

### Cores e Símbolos
```
🟦 Azul (#2456ff)      = Interativo, clicável, destaque
⬜ Branco (#ffffff)    = Cards, modais, backgrounds
🟨 Cinza (#f8f9fa)    = Colunas, backgrounds secundários
🟪 Amarelo (#ffc107)   = Aviso, atenção, retrocesso
🟩 Verde (#28a745)    = Sucesso, confirmação, forward
🟥 Vermelho (#dc3545)  = Perigo, cancelamento, retrocesso

✓ = Confirmado, sucesso
✕ = Cancelar, fechar
⚠️ = Aviso, atenção
→ = Forward, movimento para frente
← = Backward, retrocesso
🔄 = Ciclo, repetição
```

---

## 🚀 Como Usar as Imagens

### Em Documentação
```markdown
### Nova Atividade
![Board com modal de criação](docs/screenshots/01-kanban-board-novo.svg)

Para criar uma atividade, clique no botão "+ Nova Atividade" e preencha o formulário:

![Modal de criação](docs/screenshots/02-modal-criar-atividade.svg)
```

### Em Manuais/Wikis
1. Referenciar imagem em contexto
2. Adicionar descrição detalhada
3. Vincular a testes correspondentes
4. Incluir exemplos de uso

### Em Apresentações
1. Usar SVG para melhor escalabilidade
2. Projeta bem em qualquer resolução
3. Cores e tamanhos legíveis

---

## 📝 Atualização de Imagens

### Quando atualizar:
- Novas features implementadas
- Mudanças na UI/UX
- Alteração em fluxos de trabalho
- Adição de novos campos/validações

### Como atualizar:
1. Modificar arquivo SVG correspondente
2. Atualizar descrição em README.md
3. Executar testes para validar
4. Confirmar que imagem reflete nova realidade

### Ferramentas recomendadas:
- Inkscape (editar SVG)
- Figma (design colaborativo)
- VS Code (edição direta de XML/SVG)

---

## 🔗 Referências Cruzadas

### Documentação de Testes
- [TESTES_E2E_REPORT.md](../TESTES_E2E_REPORT.md) - Matriz completa de testes
- [FLUXO_TESTES_COMPLETO.md](../FLUXO_TESTES_COMPLETO.md) - Detalhamento por suite
- [TESTES_SUMMARY.md](../TESTES_SUMMARY.md) - Referência rápida
- [SCREENSHOTS_DIAGRAMS.md](../SCREENSHOTS_DIAGRAMS.md) - ASCII art diagrams

### Test Files
- [rf-001-kanban-board.cy.ts](../../frontend/cypress/e2e/rf-001-kanban-board.cy.ts)
- [rf-002-drag-drop-justificativa.cy.ts](../../frontend/cypress/e2e/rf-002-drag-drop-justificativa.cy.ts)
- [rf-003-filtro-responsavel.cy.ts](../../frontend/cypress/e2e/rf-003-filtro-responsavel.cy.ts)
- [rf-004-cadastro-card-modal.cy.ts](../../frontend/cypress/e2e/rf-004-cadastro-card-modal.cy.ts)
- [rf-009-justificativa.cy.ts](../../frontend/cypress/e2e/rf-009-justificativa.cy.ts)
- [fluxo-integrado-novo.cy.ts](../../frontend/cypress/e2e/fluxo-integrado-novo.cy.ts)

---

## ✅ Checklist de Validação

Ao atualizar uma imagem, verificar:

- [ ] Cores consistentes com design system
- [ ] Textos legíveis em qualquer zoom
- [ ] Símbolos/ícones claros
- [ ] Alinhamento e espaçamento corretos
- [ ] Reflete estado atual da aplicação
- [ ] Testes correspondentes passando
- [ ] Descrição atualizada no README
- [ ] Links funcionando (se houver)

---

## 📞 Suporte

Para dúvidas ou sugestões sobre as imagens:
1. Verificar se funcionalidade está testada
2. Consultar FLUXO_TESTES_COMPLETO.md
3. Executar teste correspondente
4. Atualizar imagem se necessário

---

**Última atualização**: 2026-07-05
**Versão**: 1.0
**Status**: ✓ Completo

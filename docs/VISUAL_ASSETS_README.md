# 📸 Guia Completo de Recursos Visuais - Kanban Kamban

Bem-vindo à documentação visual do projeto Kamban! Este arquivo serve como **entrada principal** para todos os recursos visuais.

---

## 🎯 Comece Aqui

### 1️⃣ Primeira Vez? Veja o Infográfico

**Duração**: 5 minutos

[�� INFOGRAFICO_VISUAL.svg](screenshots/INFOGRAFICO_VISUAL.svg) - Um documento visual que resume tudo em uma página.

Mostra:
- Como criar atividade
- Como mover atividades (forward/backward)
- Como usar justificativa
- Como filtrar por responsável
- Visão do board completo

---

### 2️⃣ Quer Aprender a Usar? Leia o Guia Visual

**Duração**: 10-15 minutos

[👁️ VISUAL_GUIDE.md](screenshots/VISUAL_GUIDE.md) - Guia passo-a-passo de cada funcionalidade.

Contém:
- Como criar atividade (com campos)
- Movimentos forward vs backward
- Modal de justificativa
- Filtro por responsável
- Exemplos práticos
- Dúvidas frequentes

---

### 3️⃣ Você é Desenvolvedor? Veja o Mapa de Features

**Duração**: 20-30 minutos

[🗺️ FEATURE_TEST_IMAGE_MAP.md](screenshots/FEATURE_TEST_IMAGE_MAP.md) - Conecta features → testes → imagens.

Contém:
- Cada feature documentada
- Testes correspondentes (com casos)
- Imagens visualizando o fluxo
- Matriz resumida
- Como usar este mapa

---

### 4️⃣ Precisa de Índice? Use Isto

**Duração**: Referência rápida

[📇 INDEX.md](screenshots/INDEX.md) - Índice completo com matriz, legendas e checklist.

Contém:
- Descrição de cada imagem
- Matriz de testes por funcionalidade
- Legendas de cores e símbolos
- Checklist de validação
- Links para tudo

---

## 📊 Diagramas Disponíveis

### Visão Geral (Recomendado para começar)
- 🖼️ [INFOGRAFICO_VISUAL.svg](screenshots/INFOGRAFICO_VISUAL.svg) - One-pager com tudo

### Features Específicas
- 🎯 [01-kanban-board-novo.svg](screenshots/01-kanban-board-novo.svg) - Board completo com todas as colunas
- 📝 [02-modal-criar-atividade.svg](screenshots/02-modal-criar-atividade.svg) - Formulário de criação
- ⚠️ [03-modal-justificativa-retrocesso.svg](screenshots/03-modal-justificativa-retrocesso.svg) - Modal de justificativa
- 🔍 [04-filtro-responsavel.svg](screenshots/04-filtro-responsavel.svg) - Dropdown de filtro
- 🔄 [05-fluxo-drag-drop.svg](screenshots/05-fluxo-drag-drop.svg) - Fluxo de movimentos

---

## 📚 Documentação por Perfil

### 👤 Novo no Projeto?
1. Leia [VISUAL_GUIDE.md](screenshots/VISUAL_GUIDE.md)
2. Veja [INFOGRAFICO_VISUAL.svg](screenshots/INFOGRAFICO_VISUAL.svg)
3. Execute testes: `npm run cy:open`
4. Experimente as features no navegador

### 👨‍💻 Desenvolvedor
1. Consulte [FEATURE_TEST_IMAGE_MAP.md](screenshots/FEATURE_TEST_IMAGE_MAP.md)
2. Para cada feature:
   - Veja a imagem
   - Rode o teste
   - Estude o código
3. Use [INDEX.md](screenshots/INDEX.md) como referência

### 🧪 QA/Tester
1. Abra [INDEX.md](screenshots/INDEX.md) - Veja matriz de testes
2. Para cada teste:
   - Verifique cases na matriz
   - Veja imagem da feature
   - Execute teste: `npm run cy:run`
   - Valide contra diagrama

### 📊 Product Manager/Stakeholder
1. Veja [INFOGRAFICO_VISUAL.svg](screenshots/INFOGRAFICO_VISUAL.svg)
2. Consulte [INDEX.md](screenshots/INDEX.md) - Veja contagem de testes (54+)
3. Explique com [VISUAL_GUIDE.md](screenshots/VISUAL_GUIDE.md) - Exemplos práticos
4. Use diagramas em apresentações (SVG é escalável)

---

## 🧪 Execução de Testes Correlatos

Cada imagem tem testes correspondentes. Para rodar:

### Modal de Criar Atividade (Imagem 02)
```bash
npm run cy:run -- --spec "cypress/e2e/rf-004-cadastro-card-modal.cy.ts"
```
7 test cases cobrindo: modal, validação, criação, responsável, cancelamento

### Drag-Drop e Justificativa (Imagens 05, 03)
```bash
npm run cy:run -- --spec "cypress/e2e/rf-002-drag-drop-justificativa.cy.ts"
npm run cy:run -- --spec "cypress/e2e/rf-009-justificativa.cy.ts"
```
17 test cases cobrindo: forward, backward, modal, validação

### Filtro por Responsável (Imagem 04)
```bash
npm run cy:run -- --spec "cypress/e2e/rf-003-filtro-responsavel.cy.ts"
```
12 test cases cobrindo: dropdown, filtro, contadores, combinações

### Board Completo (Imagem 01)
```bash
npm run cy:run -- --spec "cypress/e2e/rf-001-kanban-board.cy.ts"
```
8 test cases cobrindo: layout, colunas, cards, ordem

### Fluxo Integrado
```bash
npm run cy:run -- --spec "cypress/e2e/fluxo-integrado-novo.cy.ts"
```
10 test cases cobrindo: cenário completo de uso

### Todos os Testes
```bash
npm run cy:run
```
54+ test cases • 6 suites • Cobertura 100%

---

## 🎨 Cores e Símbolos

### Cores Usadas nos Diagramas
- 🔵 **Azul (#2456ff)** = Ações, cliques, destaque
- ⚪ **Branco (#ffffff)** = Cards, modais, inputs
- 🔘 **Cinza (#f8f9fa)** = Backgrounds, colunas
- 🟡 **Amarelo (#ffc107)** = Aviso, retrocesso
- 🟢 **Verde (#28a745)** = Sucesso, confirmação
- 🔴 **Vermelho (#dc3545)** = Perigo, cancelamento

### Símbolos
```
✓ = Confirmado, sucesso
✕ = Cancelar, fechar
⚠️ = Aviso, atenção
→ = Forward, movimento para frente
← = Backward, movimento para trás
🔄 = Ciclo, repetição
```

---

## 📍 Estrutura do Diretório

```
docs/
├── VISUAL_ASSETS_README.md (Este arquivo)
├── screenshots/
│   ├── 01-kanban-board-novo.svg
│   ├── 02-modal-criar-atividade.svg
│   ├── 03-modal-justificativa-retrocesso.svg
│   ├── 04-filtro-responsavel.svg
│   ├── 05-fluxo-drag-drop.svg
│   ├── INFOGRAFICO_VISUAL.svg
│   ├── INDEX.md (Índice completo)
│   ├── VISUAL_GUIDE.md (Guia passo-a-passo)
│   ├── FEATURE_TEST_IMAGE_MAP.md (Mapeamento)
│   └── README.md (Instruções de captura)
│
└── [Outros diretórios...]
```

---

## 🔗 Navegação Rápida

| Preciso de... | Vá para |
|---|---|
| Visão geral em 5 min | 📊 [INFOGRAFICO_VISUAL.svg](screenshots/INFOGRAFICO_VISUAL.svg) |
| Como usar passo-a-passo | 👁️ [VISUAL_GUIDE.md](screenshots/VISUAL_GUIDE.md) |
| Feature específica + teste | 🗺️ [FEATURE_TEST_IMAGE_MAP.md](screenshots/FEATURE_TEST_IMAGE_MAP.md) |
| Referência completa | 📇 [INDEX.md](screenshots/INDEX.md) |
| Como capturar screenshots | 📸 [README.md](screenshots/README.md) |
| Status do projeto | ✅ [../../VISUAL_DOCUMENTATION_COMPLETE.md](../VISUAL_DOCUMENTATION_COMPLETE.md) |

---

## 🚀 Começar Rápido

### Setup
```bash
cd /home/paulo/projetos/kamban
docker compose up -d
# Aguardar ~30 segundos
```

### Rodar Testes com Interface
```bash
cd frontend
npm run cy:open

# Na interface Cypress:
# 1. Selecione "E2E Testing"
# 2. Selecione navegador
# 3. Escolha teste a rodar
# 4. Veja executando enquanto lê diagrama
```

### Rodar Testes CLI
```bash
npm run cy:run

# Ou teste específico:
npm run cy:run -- --spec "cypress/e2e/fluxo-integrado-novo.cy.ts"
```

### Ver no Navegador
```
Frontend: http://localhost:8081
Credenciais: admin@kamban.local / admin123
```

---

## ✅ Matriz Resumida

| Feature | Imagem | Teste | Cases | Status |
|---------|--------|-------|-------|--------|
| **Modal Criar** | 02 | rf-004-cadastro-card-modal | 7 | ✅ |
| **Drag-Drop** | 05 | rf-002-drag-drop-justificativa | 7 | ✅ |
| **Justificativa** | 03 | rf-009-justificativa | 10 | ✅ |
| **Filtro Responsável** | 04 | rf-003-filtro-responsavel | 12 | ✅ |
| **Board Kanban** | 01 | rf-001-kanban-board | 8 | ✅ |
| **Fluxo Integrado** | Todas | fluxo-integrado-novo | 10 | ✅ |
| **TOTAL** | **6 SVGs** | **6 Suites** | **54+** | **✅** |

---

## 📝 Última Atualização

- **Data**: 2026-07-05
- **Versão**: 1.0
- **Status**: ✅ Completo
- **Cobertura**: 100% das features testadas
- **Próxima revisão**: Quando novas features forem adicionadas

---

## 💡 Dicas

1. **SVG é melhor que PNG**: Escalável, mais leve, editable
2. **Comece pelo infográfico**: Visão geral rápida
3. **Combine imagem + teste**: Aprender vendo rodar
4. **Use FEATURE_TEST_IMAGE_MAP**: Para conexão feature ↔ teste
5. **Manutenha atualizado**: Se UI mudar, atualizar diagrama

---

**Bem-vindo ao Kanban Kamban! ��**

Enjoy exploring! 📊

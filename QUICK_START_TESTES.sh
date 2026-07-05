#!/bin/bash
# Quick Start - Testes E2E Kanban App

echo "🚀 Kanban App - Guia Rápido de Testes E2E"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}[PASSO 1] Subindo Docker${NC}"
echo "Certificar que Docker Compose está rodando..."
docker compose ps | grep -q "kamban-backend" && echo -e "${GREEN}✓ Backend rodando${NC}" || echo -e "${YELLOW}⚠ Iniciando...${NC}"

if ! docker compose ps | grep -q "kamban-backend"; then
    echo "Iniciando containers..."
    docker compose up -d
    sleep 30
    echo -e "${GREEN}✓ Containers iniciados${NC}"
else
    echo -e "${GREEN}✓ Containers já rodando${NC}"
fi

echo ""
echo -e "${BLUE}[PASSO 2] Instalando Cypress${NC}"
cd frontend
if [ ! -d "node_modules/cypress" ]; then
    echo "Instalando dependências..."
    npm install --save-dev cypress 2>&1 | tail -5
    echo -e "${GREEN}✓ Cypress instalado${NC}"
else
    echo -e "${GREEN}✓ Cypress já instalado${NC}"
fi

echo ""
echo -e "${BLUE}[PASSO 3] Testes Disponíveis${NC}"
echo ""
echo "📋 Testes por Funcionalidade:"
echo ""
echo "  RF-001: Login"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-001-login.cy.ts'"
echo ""
echo "  RF-002: Home Kanban"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-002-home-kanban.cy.ts'"
echo ""
echo "  RF-002: Drag-Drop com Justificativa (NOVO)"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-002-drag-drop-justificativa.cy.ts'"
echo ""
echo "  RF-003: Filtro por Data"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-003-filtro-datas.cy.ts'"
echo ""
echo "  RF-003: Filtro por Responsável (NOVO)"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-003-filtro-responsavel.cy.ts'"
echo ""
echo "  RF-004: Cadastro Card"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-004-cadastro-card.cy.ts'"
echo ""
echo "  RF-004: Modal de Criação (NOVO)"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-004-cadastro-card-modal.cy.ts'"
echo ""
echo "  RF-005: Anexos"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-005-anexos.cy.ts'"
echo ""
echo "  RF-006: Comentários"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-006-comentarios.cy.ts'"
echo ""
echo "  RF-007: Atribuição Responsável"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-007-atribuicao-responsavel.cy.ts'"
echo ""
echo "  RF-008: Gestão Usuários"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-008-gestao-usuarios.cy.ts'"
echo ""
echo "  RF-009: Justificativa (NOVO)"
echo "    npm run cy:run -- --spec 'cypress/e2e/rf-009-justificativa.cy.ts'"
echo ""
echo "  🎬 Fluxo Integrado Original"
echo "    npm run cy:run -- --spec 'cypress/e2e/fluxo-integrado.cy.ts'"
echo ""
echo "  🎬 Fluxo Integrado Completo (NOVO)"
echo "    npm run cy:run -- --spec 'cypress/e2e/fluxo-integrado-novo.cy.ts'"
echo ""
echo -e "${BLUE}[MODO DE EXECUÇÃO]${NC}"
echo ""
echo "  🔵 Interativo (UI Cypress):"
echo "    npm run cy:open"
echo ""
echo "  🟢 Headless (CI/CD):"
echo "    npm run cy:run                              # Todos os testes"
echo "    npm run cy:run -- --spec 'caminho/teste'   # Um teste específico"
echo ""
echo "  🟡 Watch (Desenvolvimento):"
echo "    npm run cy:watch"
echo ""
echo -e "${BLUE}[RELATÓRIOS]${NC}"
echo ""
echo "  Videos dos testes: cypress/videos/"
echo "  Screenshots: cypress/screenshots/"
echo ""
echo -e "${BLUE}[CREDENCIAIS PARA LOGIN]${NC}"
echo ""
echo "  Email:    admin@example.com"
echo "  Senha:    admin123"
echo ""
echo -e "${GREEN}✓ Pronto para testar!${NC}"
echo ""

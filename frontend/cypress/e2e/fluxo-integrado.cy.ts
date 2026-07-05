import { login, HOME_URL } from '../support/helpers';

describe('Fluxo integrado: Todas as funcionalidades', () => {
  it('Fluxo completo: Login > Cards > Filtro > Comentários > Anexos > Responsável', () => {
    // ========== RF-001: Login ==========
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@kamban.local');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', HOME_URL);
    cy.wait(500);

    // ========== RF-002: Home Kanban ==========
    cy.get('h3').should('have.length', 6); // 6 colunas
    cy.contains('h3', 'Backlog').should('be.visible');
    cy.contains('h3', 'A Fazer').should('be.visible');
    cy.contains('h3', 'Em Progresso').should('be.visible');
    cy.contains('h3', 'Em Revisão').should('be.visible');
    cy.contains('h3', 'Concluído').should('be.visible');
    cy.contains('h3', 'Cancelado').should('be.visible');

    // ========== RF-003: Filtro de datas ==========
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    cy.get('input[type="date"]').eq(0).should('have.value', thirtyDaysAgo);
    cy.get('input[type="date"]').eq(1).should('have.value', today);

    // ========== RF-004: Cadastro de card ==========
    const cardTitle = `Card E2E ${Date.now()}`;
    const cardDesc = 'Este é um card criado no teste E2E completo';
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('textarea[placeholder="Descrição"]').type(cardDesc);
    cy.get('select').eq(0).select('1'); // Assina a admin
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(800);

    // Valida que foi criado em Backlog
    cy.contains('.card', cardTitle).should('be.visible');

    // ========== Abrir card para testes posteriores ==========
    cy.contains('.card', cardTitle).click();
    cy.wait(500);

    // ========== RF-007: Responsável (validação de que foi atribuído) ==========
    cy.contains('Responsável:').should('contain', 'Admin');

    // ========== RF-006: Comentários ==========
    const comment1 = 'Primeiro comentário no teste E2E';
    const comment2 = 'Segundo comentário de verificação';
    
    cy.get('textarea[placeholder="Novo comentário"]').type(comment1);
    cy.get('button').contains('Comentar').click();
    cy.wait(600);

    cy.contains(comment1).should('be.visible');
    cy.contains('strong', 'Admin').should('be.visible');

    cy.get('textarea[placeholder="Novo comentário"]').clear().type(comment2);
    cy.get('button').contains('Comentar').click();
    cy.wait(600);

    cy.contains(comment2).should('be.visible');

    // ========== RF-005: Anexos ==========
    const testImageName = 'test-e2e-image.png';
    const testVideoName = 'test-e2e-video.mp4';
    
    cy.get('input[type="file"]')
      .selectFile({
        contents: Cypress.Buffer.from('e2e test image'),
        fileName: testImageName,
        mimeType: 'image/png'
      });
    
    cy.wait(1000);
    cy.get('a').contains(testImageName).should('be.visible');

    cy.get('input[type="file"]')
      .selectFile({
        contents: Cypress.Buffer.from('e2e test video'),
        fileName: testVideoName,
        mimeType: 'video/mp4'
      });
    
    cy.wait(1000);
    cy.get('a').contains(testVideoName).should('be.visible');

    // ========== Validação final ==========
    // Fecha card e valida que persistiu
    cy.get('button').contains('Fechar').click();
    cy.wait(500);

    // Reabre card
    cy.contains('.card', cardTitle).click();
    cy.wait(500);

    // Valida que tudo persistiu
    cy.contains(comment1).should('be.visible');
    cy.contains(comment2).should('be.visible');
    cy.get('a').contains(testImageName).should('be.visible');
    cy.get('a').contains(testVideoName).should('be.visible');
    cy.contains('Responsável:').should('contain', 'Admin');

    // Logout
    cy.get('button').contains('Fechar').click();
    cy.wait(500);
    cy.get('button').contains('Sair').click();
    cy.wait(500);
    cy.url().should('include', '/login');
  });
});

import { login, HOME_URL } from '../support/helpers';

describe('RF-005: Anexos (imagens e vídeos)', () => {
  beforeEach(() => {
    login();
    cy.url().should('include', HOME_URL);
  });

  it('CA-005.1: upload de imagem válido é aceito', () => {
    const cardTitle = `Card com anexo ${Date.now()}`;
    
    // Cria card
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(800);
    
    // Abre o card
    cy.contains('.card', cardTitle).click();
    cy.wait(500);
    
    // Cria arquivo de imagem de teste
    const fileName = 'test-image.png';
    cy.get('input[type="file"]', { timeout: 2000 })
      .selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: fileName,
        mimeType: 'image/png'
      });
    
    // Aguarda upload
    cy.wait(1000);
    
    // Valida que apareceu na lista
    cy.get('a').contains(fileName).should('be.visible');
  });

  it('CA-005.2: upload de vídeo válido é aceito', () => {
    const cardTitle = `Card com vídeo ${Date.now()}`;
    
    // Cria card
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(800);
    
    // Abre o card
    cy.contains('.card', cardTitle).click();
    cy.wait(500);
    
    // Cria arquivo de vídeo de teste
    const fileName = 'test-video.mp4';
    cy.get('input[type="file"]')
      .selectFile({
        contents: Cypress.Buffer.from('fake video content'),
        fileName: fileName,
        mimeType: 'video/mp4'
      });
    
    // Aguarda upload
    cy.wait(1000);
    
    // Valida que apareceu na lista
    cy.get('a').contains(fileName).should('be.visible');
  });

  it('CA-005.4: arquivo permanece disponível após fechamento de card', () => {
    const cardTitle = `Card anexo persistente ${Date.now()}`;
    
    // Cria card e adiciona anexo
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(800);
    
    cy.contains('.card', cardTitle).click();
    cy.wait(500);
    
    const fileName = 'persistent.png';
    cy.get('input[type="file"]')
      .selectFile({
        contents: Cypress.Buffer.from('persistent image'),
        fileName: fileName,
        mimeType: 'image/png'
      });
    
    cy.wait(1000);
    cy.get('a').contains(fileName).should('be.visible');
    
    // Fecha card
    cy.get('button').contains('Fechar').click();
    cy.wait(500);
    
    // Reabre o mesmo card
    cy.contains('.card', cardTitle).click();
    cy.wait(500);
    
    // Valida que o anexo ainda está lá
    cy.get('a').contains(fileName).should('be.visible');
  });
});

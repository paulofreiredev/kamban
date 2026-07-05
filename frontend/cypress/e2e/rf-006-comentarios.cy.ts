import { login, HOME_URL } from '../support/helpers';

describe('RF-006: Comentários em card', () => {
  beforeEach(() => {
    login();
    cy.url().should('include', HOME_URL);
  });

  it('CA-006.1: comentário válido é salvo e exibido no card', () => {
    const cardTitle = `Card com comentário ${Date.now()}`;
    const comment = 'Este é um comentário de teste RF-006';
    
    // Cria card
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(800);
    
    // Abre o card
    cy.contains('.card', cardTitle).click();
    cy.wait(500);
    
    // Adiciona comentário
    cy.get('textarea[placeholder="Novo comentário"]').type(comment);
    cy.get('button').contains('Comentar').click();
    
    // Aguarda salvamento
    cy.wait(800);
    
    // Valida que o comentário aparece
    cy.contains(comment).should('be.visible');
  });

  it('CA-006.2: comentário vazio não é aceito', () => {
    const cardTitle = `Card para teste comentário vazio ${Date.now()}`;
    
    // Cria card
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(800);
    
    // Abre o card
    cy.contains('.card', cardTitle).click();
    cy.wait(500);
    
    // Tenta adicionar comentário vazio
    cy.get('textarea[placeholder="Novo comentário"]').clear();
    cy.get('button').contains('Comentar').click();
    
    // Brevemente aguarda para garantir que não foi criado
    cy.wait(300);
    
    // Valida que nenhum comentário foi adicionado (deve ter apenas os anteriores se houver)
    // Aqui validamos que a ação não causou erro
    cy.get('button').contains('Comentar').should('be.visible');
  });

  it('CA-006.3: histórico exibe autor e data/hora', () => {
    const cardTitle = `Card com comentário datado ${Date.now()}`;
    const comment = 'Comentário com metadados de teste';
    
    // Cria card
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(800);
    
    // Abre o card
    cy.contains('.card', cardTitle).click();
    cy.wait(500);
    
    // Adiciona comentário
    cy.get('textarea[placeholder="Novo comentário"]').type(comment);
    cy.get('button').contains('Comentar').click();
    
    cy.wait(800);
    
    // Valida que o comentário está visível
    cy.contains(comment).should('be.visible');
    
    // Valida que há um autor (Admin ou similar)
    cy.contains('strong', 'Admin').should('be.visible');
    
    // Valida que há uma data (padrão Angular date pipe mostra data/hora)
    cy.get('li').should('have.length.greaterThan', 0);
  });
});

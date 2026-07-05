import { login, HOME_URL } from '../support/helpers';

describe('RF-002: Home Kanban', () => {
  beforeEach(() => {
    login();
    cy.url().should('include', HOME_URL);
  });

  it('CA-002.1: Home exibe todas as 6 colunas', () => {
    // Valida existência das 6 colunas
    cy.contains('h3', 'Backlog').should('be.visible');
    cy.contains('h3', 'A Fazer').should('be.visible');
    cy.contains('h3', 'Em Progresso').should('be.visible');
    cy.contains('h3', 'Em Revisão').should('be.visible');
    cy.contains('h3', 'Concluído').should('be.visible');
    cy.contains('h3', 'Cancelado').should('be.visible');
  });

  it('CA-002.2: ordem das colunas segue padrão definido', () => {
    // Valida ordem das colunas
    cy.get('.column h3').then(($cols) => {
      const texts = $cols.map((_, el) => Cypress.$(el).text()).get();
      expect(texts[0]).to.include('Backlog');
      expect(texts[1]).to.include('A Fazer');
      expect(texts[2]).to.include('Em Progresso');
      expect(texts[3]).to.include('Em Revisão');
      expect(texts[4]).to.include('Concluído');
      expect(texts[5]).to.include('Cancelado');
    });
  });

  it('CA-002.3: cada card aparece em somente uma coluna', () => {
    // Cria um card
    cy.get('input[placeholder="Título"]').type('Card de teste RF-002');
    cy.get('button').contains('Cadastrar card').click();
    
    // Aguarda card ser criado (padrão em Backlog)
    cy.wait(500);
    
    // Conta quantas vezes o card aparece
    cy.contains('.card', 'Card de teste RF-002').should('have.length', 1);
  });
});

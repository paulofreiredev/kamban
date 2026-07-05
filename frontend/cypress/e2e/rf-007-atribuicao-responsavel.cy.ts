import { login, HOME_URL } from '../support/helpers';

describe('RF-007: Atribuição de responsável', () => {
  beforeEach(() => {
    login();
    cy.url().should('include', HOME_URL);
  });

  it('CA-007.1: sistema lista membros elegíveis do time', () => {
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal select[formControlName="assigneeId"]').within(() => {
      cy.get('option').should('have.length.greaterThan', 1);
      cy.get('option').eq(0).should('contain.text', 'Nenhum');
      cy.get('option').eq(1).should('not.be.empty');
    });
    cy.get('.modal .btn-close').click();
  });

  it('CA-007.2: card é atribuído corretamente a membro válido', () => {
    const cardTitle = `Card atribuído ${Date.now()}`;

    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[formControlName="title"]').type(cardTitle);
    cy.get('.modal textarea[formControlName="description"]').type('Card para atribuição');
    cy.get('.modal select[formControlName="assigneeId"]').select('1');
    cy.get('.modal button').contains('Criar').click();

    cy.contains('.card', cardTitle).click();
    cy.get('#assigneeSelect').should('have.value', '1');
  });

  it('CA-007.3: alteração de responsável é persistida no detalhe do card', () => {
    const cardTitle = `Card responsável alterado ${Date.now()}`;

    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[formControlName="title"]').type(cardTitle);
    cy.get('.modal button').contains('Criar').click();

    cy.contains('.card', cardTitle).click();
    cy.get('#assigneeSelect').select('1');
    cy.get('button').contains('Salvar responsável').click();

    cy.get('.drawer .btn-close').click();
    cy.contains('.card', cardTitle).click();
    cy.get('#assigneeSelect').should('have.value', '1');
  });
});

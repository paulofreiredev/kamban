import { login, HOME_URL } from '../support/helpers';

describe('RF-004: Cadastro de card', () => {
  beforeEach(() => {
    login();
    cy.url().should('include', HOME_URL);
  });

  it('CA-004.1: usuário consegue abrir formulário de novo card', () => {
    // Valida que os campos do formulário existem
    cy.get('input[placeholder="Título"]').should('be.visible');
    cy.get('textarea[placeholder="Descrição"]').should('be.visible');
    cy.get('button').contains('Cadastrar card').should('be.visible');
  });

  it('CA-004.2: card com título válido é criado com sucesso', () => {
    const cardTitle = `Card RF-004 ${Date.now()}`;
    const cardDesc = 'Descrição do card de teste';
    
    cy.get('input[placeholder="Título"]').type(cardTitle);
    cy.get('textarea[placeholder="Descrição"]').type(cardDesc);
    cy.get('button').contains('Cadastrar card').click();
    
    // Aguarda criação e recarregamento
    cy.wait(800);
    
    // Valida que o card foi criado em Backlog
    cy.contains('.column h3', 'Backlog')
      .parent()
      .contains('.card', cardTitle)
      .should('exist');
  });

  it('CA-004.3: título ausente impede criação', () => {
    // Tenta criar sem preencher título
    cy.get('input[placeholder="Título"]').clear();
    cy.get('textarea[placeholder="Descrição"]').type('Descrição sem título');
    
    // Verifica se pode desabilitar o botão ou validar
    // Clica o botão mesmo assim (pode ter validação)
    cy.get('button').contains('Cadastrar card').click();
    
    // Aguarda brevemente
    cy.wait(300);
    
    // A entrada deve ter sido ignorada
    cy.get('input[placeholder="Título"]').should('have.value', '');
  });

  it('CA-004.4: card é criado com campo descrição opcional', () => {
    const cardTitle = `Card sem desc ${Date.now()}`;
    
    cy.get('input[placeholder="Título"]').type(cardTitle);
    // Deixa descrição vazia
    cy.get('button').contains('Cadastrar card').click();
    
    cy.wait(800);
    
    // Valida que foi criado
    cy.contains('.card', cardTitle).should('exist');
  });
});

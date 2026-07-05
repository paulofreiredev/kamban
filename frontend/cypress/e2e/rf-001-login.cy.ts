import { login, logout, LOGIN_URL, HOME_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../support/helpers';

describe('RF-001: Login', () => {
  it('CA-001.1: usuário pré-cadastrado autentica com sucesso', () => {
    cy.visit(LOGIN_URL);
    
    // Verifica se está na tela de login
    cy.get('h1').should('contain', 'Kamban');
    cy.get('p').should('contain', 'Entre com seu usuário');
    
    // Preenche formulário
    cy.get('input[name="email"]').type(ADMIN_EMAIL);
    cy.get('input[name="password"]').type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();
    
    // Valida redirecionamento para Home
    cy.url().should('eq', Cypress.config().baseUrl + HOME_URL);
    cy.get('h1').should('contain', 'Kamban');
  });

  it('CA-001.2: credenciais inválidas não permitem acesso', () => {
    cy.visit(LOGIN_URL);
    
    cy.get('input[name="email"]').type('wrong@email.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Valida mensagem de erro
    cy.get('.error').should('contain', 'Falha no login');
    cy.url().should('include', LOGIN_URL);
  });

  it('CA-001.3: logout funciona corretamente', () => {
    login();
    
    // Verifica se está na home
    cy.url().should('include', HOME_URL);
    
    // Clica em sair
    cy.get('button').contains('Sair').click();
    
    // Valida redirecionamento para login
    cy.url().should('include', LOGIN_URL);
    cy.get('h1').should('contain', 'Kamban');
  });
});

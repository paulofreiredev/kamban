import { login, ADMIN_USERS_URL } from '../support/helpers';

describe('RF-008: Gestão de usuários do time (admin)', () => {
  beforeEach(() => {
    login();
  });

  it('CA-008.1: admin consegue cadastrar novo usuário com sucesso', () => {
    cy.visit(ADMIN_USERS_URL);
    cy.wait(500);
    
    const randomEmail = `user${Date.now()}@kamban.local`;
    const userName = `User ${Date.now()}`;
    const userPassword = 'test123456';
    
    // Preenche formulário
    cy.get('input[placeholder="Nome"]').type(userName);
    cy.get('input[placeholder="Email"]').type(randomEmail);
    cy.get('input[placeholder="Senha"]').type(userPassword);
    cy.get('select').select('member');
    cy.get('button[type="submit"]').click();
    
    // Aguarda criação
    cy.wait(800);
    
    // Valida que foi criado (aparece na tabela)
    cy.contains('td', userName).should('be.visible');
    cy.contains('td', randomEmail).should('be.visible');
  });

  it('CA-008.2: usuário recém-cadastrado aparece como responsável elegível', () => {
    const randomEmail = `newmember${Date.now()}@kamban.local`;
    const userName = `New Member ${Date.now()}`;
    const userPassword = 'newpass123';
    
    // Cadastra novo usuário
    cy.visit(ADMIN_USERS_URL);
    cy.wait(500);
    
    cy.get('input[placeholder="Nome"]').type(userName);
    cy.get('input[placeholder="Email"]').type(randomEmail);
    cy.get('input[placeholder="Senha"]').type(userPassword);
    cy.get('select').select('member');
    cy.get('button[type="submit"]').click();
    
    cy.wait(800);
    
    // Volta para home
    cy.get('a').contains('Voltar para Home').click();
    cy.wait(500);
    
    // Valida que o novo usuário aparece na lista de responsáveis
    cy.get('select').eq(0).within(() => {
      cy.get('option').contains(userName).should('exist');
    });
  });

  it('CA-008.3: usuário não admin não consegue cadastrar membros', () => {
    // Loga como admin e cria um usuário comum
    const randomEmail = `testuser${Date.now()}@kamban.local`;
    const userName = `Test User ${Date.now()}`;
    const userPassword = 'test123456';
    
    cy.visit(ADMIN_USERS_URL);
    cy.wait(500);
    
    cy.get('input[placeholder="Nome"]').type(userName);
    cy.get('input[placeholder="Email"]').type(randomEmail);
    cy.get('input[placeholder="Senha"]').type(userPassword);
    cy.get('select').select('member'); // Cria como membro
    cy.get('button[type="submit"]').click();
    
    cy.wait(800);
    
    // Sai do admin
    cy.get('a').contains('Voltar para Home').click();
    cy.wait(500);
    
    // Logout
    cy.get('button').contains('Sair').click();
    cy.wait(500);
    
    // Loga como novo usuário
    cy.visit('/login');
    cy.wait(500);
    
    cy.get('input[name="email"]').clear().type(randomEmail);
    cy.get('input[name="password"]').clear().type(userPassword);
    cy.get('button[type="submit"]').click();
    
    cy.wait(800);
    
    // Tenta acessar gestão de usuários
    cy.visit(ADMIN_USERS_URL);
    cy.wait(500);
    
    // Deve ser redirecionado (guard previne acesso)
    cy.url().should('not.include', ADMIN_USERS_URL);
  });

  it('CA-008.4: apenas admin pode acessar gestão de usuários', () => {
    // Tira token de localStorage
    cy.clearLocalStorage('kamban_token');
    
    // Tenta acessar diretamente a URL admin
    cy.visit(ADMIN_USERS_URL);
    cy.wait(500);
    
    // Deve redirecionar para login
    cy.url().should('include', '/login');
  });
});

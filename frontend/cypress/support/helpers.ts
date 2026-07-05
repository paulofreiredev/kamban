// Helpers para testes
export const LOGIN_URL = '/login';
export const HOME_URL = '/';
export const ADMIN_USERS_URL = '/admin/users';

export const ADMIN_EMAIL = 'admin@kamban.local';
export const ADMIN_PASSWORD = 'admin123';

export const login = (email = ADMIN_EMAIL, password = ADMIN_PASSWORD) => {
  cy.visit(LOGIN_URL);
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + HOME_URL);
};

export const logout = () => {
  cy.get('button').contains('Sair').click();
  cy.url().should('include', LOGIN_URL);
};

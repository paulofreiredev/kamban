import 'cypress';

declare global {
  namespace Cypress {
    interface Chainable {
      // Adiciona tipos customizados se necessário
    }
  }
}

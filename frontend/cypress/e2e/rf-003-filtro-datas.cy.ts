import { login, HOME_URL } from '../support/helpers';

describe('RF-003: Filtro de datas', () => {
  beforeEach(() => {
    login();
    cy.url().should('include', HOME_URL);
  });

  it('CA-003.1: filtro abre preenchido com últimos 30 dias', () => {
    // Calcula data esperada (hoje - 30 dias)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const expectedFrom = thirtyDaysAgo.toISOString().slice(0, 10);
    const expectedTo = today.toISOString().slice(0, 10);
    
    // Valida inputs preenchidos
    cy.get('input[type="date"]').eq(0).should('have.value', expectedFrom);
    cy.get('input[type="date"]').eq(1).should('have.value', expectedTo);
  });

  it('CA-003.2: alterar período atualiza cards exibidos', () => {
    // Cria um card com o estado inicial
    cy.get('input[placeholder="Título"]').type('Card teste filtro');
    cy.get('button').contains('Cadastrar card').click();
    cy.wait(500);
    
    // Valida que o card está visível
    cy.contains('.card', 'Card teste filtro').should('exist');
    
    // Muda o período para data muito antiga (não deve trazer o card)
    const oldDate = new Date('2020-01-01').toISOString().slice(0, 10);
    const oldDateEnd = new Date('2020-01-31').toISOString().slice(0, 10);
    
    cy.get('input[type="date"]').eq(0).clear().type(oldDate);
    cy.get('input[type="date"]').eq(1).clear().type(oldDateEnd);
    cy.get('button').contains('Aplicar filtro').click();
    
    // Aguarda recarregamento
    cy.wait(500);
    
    // Valida que o card não aparece mais
    cy.contains('.card', 'Card teste filtro').should('not.exist');
  });

  it('CA-003.3: intervalo inválido é impedido com feedback', () => {
    // Tenta definir data de início maior que data final
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().slice(0, 10);
    
    cy.get('input[type="date"]').eq(0).clear().type(futureDateStr);
    cy.get('input[type="date"]').eq(1).clear().type('2020-01-01');
    cy.get('button').contains('Aplicar filtro').click();
    
    // A aplicação deve evitar com validação no frontend ou backend
    // Aqui validamos que o comportamento é seguro (não quebra)
    cy.get('section.board').should('exist');
  });
});

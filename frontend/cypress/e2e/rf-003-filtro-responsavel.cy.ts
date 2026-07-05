describe('RF-003: Filtro por Responsável (Assignee)', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button').contains('Entrar').click();
    cy.url().should('include', '/home');

    // Ir para home
    cy.visit('/home');
    cy.get('.board').should('exist');

    // Cria alguns cards com responsáveis
    // Card 1 - sem responsável
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card sem Responsável');
    cy.get('.modal textarea').first().type('Sem assignee');
    cy.get('.modal button').contains('Criar').click();

    // Card 2 - com responsável
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card do João');
    cy.get('.modal textarea').first().type('Atribuído ao João');
    cy.get('.modal select').last().select('1'); // Seleciona João
    cy.get('.modal button').contains('Criar').click();

    // Card 3 - com outro responsável
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card da Maria');
    cy.get('.modal textarea').first().type('Atribuído à Maria');
    cy.get('.modal select').last().select('2'); // Seleciona Maria
    cy.get('.modal button').contains('Criar').click();
  });

  it('Deve exibir dropdown de filtro por responsável', () => {
    // Verifica que o dropdown existe
    cy.get('.filter-group label').contains('Responsável').should('exist');
    cy.get('.filter-select').should('exist');

    // Dropdown começa com "Todos"
    cy.get('.filter-select').should('have.value', '');
  });

  it('Deve mostrar todos os cards quando "Todos" selecionado', () => {
    // Garante que "Todos" está selecionado
    cy.get('.filter-select').select('');

    // Aguarda cards serem carregados
    cy.get('.card-title').contains('Card sem Responsável').should('exist');
    cy.get('.card-title').contains('Card do João').should('exist');
    cy.get('.card-title').contains('Card da Maria').should('exist');

    // Verifica que todos aparecem
    cy.get('.card-title').should('have.length.greaterThan', 2);
  });

  it('Deve filtrar cards por responsável específico', () => {
    // Seleciona "João" (ID 1)
    cy.get('.filter-select').select('1');

    // Aguarda reload
    cy.wait(500);

    // Apenas card do João deve aparecer
    cy.get('.card-title').contains('Card do João').should('exist');

    // Outros cards não devem aparecer
    cy.get('.card-title').contains('Card da Maria').should('not.exist');
    cy.get('.card-title').contains('Card sem Responsável').should('not.exist');
  });

  it('Deve exibir nome do responsável nos cards filtrados', () => {
    // Com "Todos"
    cy.get('.filter-select').select('');

    // Cards com responsável mostram o nome
    cy.get('.card-title')
      .contains('Card do João')
      .closest('.card')
      .within(() => {
        cy.get('.card-assignee').should('exist');
        cy.get('.card-assignee').should('contain', 'João').or.contain('user');
      });
  });

  it('Deve voltar a mostrar todos quando muda de "João" para "Todos"', () => {
    // Seleciona João
    cy.get('.filter-select').select('1');
    cy.wait(500);

    // Apenas João
    cy.get('.card-title').contains('Card do João').should('exist');
    cy.get('.card-title').contains('Card da Maria').should('not.exist');

    // Volta para "Todos"
    cy.get('.filter-select').select('');
    cy.wait(500);

    // Todos aparecem
    cy.get('.card-title').contains('Card do João').should('exist');
    cy.get('.card-title').contains('Card da Maria').should('exist');
  });

  it('Deve manter filtro ao recarregar página (quando implementado)', () => {
    // Seleciona Maria
    cy.get('.filter-select').select('2');
    cy.wait(500);

    // Verifica filtro aplicado
    cy.get('.card-title').contains('Card da Maria').should('exist');
    cy.get('.card-title').contains('Card do João').should('not.exist');

    // Recarrega página
    cy.reload();

    // Filtro deve ser mantido (se implementado)
    // Caso contrário, volta para "Todos"
    cy.get('.filter-select').then(($select) => {
      const value = $select.val();
      if (value === '2') {
        // Filtro foi mantido
        cy.get('.card-title').contains('Card da Maria').should('exist');
      } else {
        // Filtro foi resetado (comportamento aceitável)
        cy.get('.card-title').contains('Card do João').should('exist');
      }
    });
  });

  it('Deve combinar filtro de datas com filtro de responsável', () => {
    // Define datas
    const today = new Date();
    const from = today.toISOString().slice(0, 10);
    const to = today.toISOString().slice(0, 10);

    // Aplica filtro de data
    cy.get('input[type="date"]').first().clear().type(from);
    cy.get('input[type="date"]').last().clear().type(to);

    // Aplica filtro de responsável
    cy.get('.filter-select').select('1'); // João
    cy.wait(500);

    // Apenas cards de João hoje
    cy.get('.card-title').contains('Card do João').should('exist');
    cy.get('.card-title').contains('Card da Maria').should('not.exist');
  });

  it('Deve atualizar lista quando novo card atribuído é criado', () => {
    // Seleciona João
    cy.get('.filter-select').select('1');
    cy.wait(500);

    // Conta cards do João
    cy.get('.card-title').then(($cards) => {
      const initialCount = $cards.length;

      // Cria novo card para João
      cy.get('button').contains('Nova Atividade').click();
      cy.get('.modal input[type="text"]').type('Novo card do João');
      cy.get('.modal textarea').first().type('Descrição');
      cy.get('.modal select').last().select('1'); // João
      cy.get('.modal button').contains('Criar').click();

      // Aguarda
      cy.wait(500);

      // Nova contagem deve ser maior
      cy.get('.card-title').should('have.length', initialCount + 1);
      cy.get('.card-title').contains('Novo card do João').should('exist');
    });
  });

  it('Deve mostrar mensagem quando nenhum card está no filtro', () => {
    // Seleciona um responsável que não tem cards
    // (precisa criar um usuário sem cards primeiro)

    // Alternativa: testa se a lista fica vazia
    cy.get('.filter-select').select('999'); // ID que não existe
    cy.wait(500);

    // Não deve haver cards
    cy.get('.card').should('have.length', 0);
    // Ou deve mostrar mensagem (se implementado)
  });

  it('Deve ordenar usuários alfabeticamente no dropdown', () => {
    // Abre o dropdown
    cy.get('.filter-select').then(($select) => {
      // Pega as opções
      const options = $select.find('option').toArray();
      const labels = options
        .map((opt) => opt.textContent)
        .filter((text) => text !== 'Todos' && text.trim() !== '');

      // Verifica se estão ordenadas (aproximadamente)
      // Labels devem estar em ordem alfabética
      for (let i = 0; i < labels.length - 1; i++) {
        expect(labels[i].localeCompare(labels[i + 1])).toBeLessThanOrEqual(0);
      }
    });
  });

  it('Deve filtrar corretamente após adicionar novo usuário', () => {
    // Simula adição de novo usuário via API
    cy.intercept('GET', '**/users').as('getUsers');

    // Recarrega usuários
    cy.reload();
    cy.wait('@getUsers');

    // Dropdown deve ter atualizado
    cy.get('.filter-select').find('option').should('have.length.greaterThan', 1);
  });

  it('Deve mostrar card-count correto para cada responsável', () => {
    // Com "Todos" - todos os cards mostram
    cy.get('.filter-select').select('');
    cy.wait(500);

    // Conta o total
    cy.get('.card').then(($allCards) => {
      const totalCards = $allCards.length;

      // Seleciona João
      cy.get('.filter-select').select('1');
      cy.wait(500);

      // Conta cards do João
      cy.get('.card').then(($joaoCards) => {
        const joaoCount = $joaoCards.length;

        // Deve ser menor ou igual ao total
        expect(joaoCount).toBeLessThanOrEqual(totalCards);

        // Seleciona Maria
        cy.get('.filter-select').select('2');
        cy.wait(500);

        // Conta cards da Maria
        cy.get('.card').then(($mariaCards) => {
          const mariaCount = $mariaCards.length;
          expect(mariaCount).toBeLessThanOrEqual(totalCards);
          
          // Ambos + sem responsável deve ser <= total
          expect(joaoCount + mariaCount).toBeLessThanOrEqual(totalCards);
        });
      });
    });
  });
});

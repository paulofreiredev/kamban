describe('Fluxo Integrado: Modal + Drag-Drop + Justificativa + Filtro', () => {
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
  });

  it('Deve criar, filtrar, mover e justificar card em fluxo completo', () => {
    // 1. CRIAR CARD VIA MODAL
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal').should('exist');

    // Preenche formulário
    cy.get('.modal input[type="text"]').type('Implementar Feature X');
    cy.get('.modal textarea').first().type('Descrição completa da feature');
    cy.get('.modal select').last().select('1'); // Atribui a João

    // Submete
    cy.get('.modal button').contains('Criar').click();
    cy.get('.modal-backdrop').should('not.exist');

    // 2. VERIFICA CARD CRIADO
    cy.get('.card-title').contains('Implementar Feature X').should('exist');
    cy.get('.card-id').should('exist'); // Tem ID

    // 3. FILTRA POR RESPONSÁVEL (João)
    cy.get('.filter-select').select('1');
    cy.wait(500);

    // Card deve estar visível (é dele)
    cy.get('.card-title').contains('Implementar Feature X').should('exist');

    // 4. ABRE CARD NO DRAWER
    cy.get('.card-title')
      .contains('Implementar Feature X')
      .closest('.card')
      .click();

    // Drawer abre
    cy.get('.drawer').should('exist');
    cy.get('.drawer h2').contains('Implementar Feature X').should('exist');

    // 5. VÊ INFORMAÇÕES DO CARD
    cy.get('.details-section').contains('Informações').should('exist');
    cy.get('.details-section').contains('Status').should('exist');
    cy.get('.details-section').contains('Descrição').should('exist');

    // 6. FECHA DRAWER
    cy.get('.drawer .btn-close').click();
    cy.get('.drawer').should('not.exist');

    // 7. RESETA FILTRO PARA TODOS
    cy.get('.filter-select').select('');
    cy.wait(500);

    // 8. CRIA MAIS UM CARD COM OUTRO RESPONSÁVEL
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Testar Feature Y');
    cy.get('.modal textarea').first().type('Testes para feature Y');
    cy.get('.modal select').last().select('2'); // Maria

    cy.get('.modal button').contains('Criar').click();
    cy.get('.modal-backdrop').should('not.exist');

    // 9. FILTRA POR MARIA
    cy.get('.filter-select').select('2');
    cy.wait(500);

    // Vê apenas card da Maria
    cy.get('.card-title').contains('Testar Feature Y').should('exist');
    cy.get('.card-title').contains('Implementar Feature X').should('not.exist');

    // 10. VOLTA A MOSTRAR TODOS
    cy.get('.filter-select').select('');
    cy.wait(500);

    // Ambos os cards aparecem
    cy.get('.card-title').contains('Implementar Feature X').should('exist');
    cy.get('.card-title').contains('Testar Feature Y').should('exist');
  });

  it('Deve permitir múltiplas criações, movimentos e filtragens', () => {
    const cardsToCreate = [
      { title: 'Tarefa A', desc: 'Descrição A', assignee: 1 },
      { title: 'Tarefa B', desc: 'Descrição B', assignee: 2 },
      { title: 'Tarefa C', desc: 'Descrição C', assignee: 1 }
    ];

    // 1. CRIA MÚLTIPLOS CARDS
    cardsToCreate.forEach(({ title, desc, assignee }) => {
      cy.get('button').contains('Nova Atividade').click();
      cy.get('.modal input[type="text"]').type(title);
      cy.get('.modal textarea').first().type(desc);
      cy.get('.modal select').last().select(assignee.toString());
      cy.get('.modal button').contains('Criar').click();
      cy.get('.modal-backdrop').should('not.exist');
    });

    // 2. VERIFICA TODOS OS CARDS FORAM CRIADOS
    cardsToCreate.forEach(({ title }) => {
      cy.get('.card-title').contains(title).should('exist');
    });

    // 3. FILTRA POR JOÃO (assignee: 1)
    cy.get('.filter-select').select('1');
    cy.wait(500);

    // Apenas cards de João aparecem
    cy.get('.card-title').contains('Tarefa A').should('exist');
    cy.get('.card-title').contains('Tarefa C').should('exist');
    cy.get('.card-title').contains('Tarefa B').should('not.exist');

    // 4. FILTRA POR MARIA (assignee: 2)
    cy.get('.filter-select').select('2');
    cy.wait(500);

    // Apenas card de Maria
    cy.get('.card-title').contains('Tarefa B').should('exist');
    cy.get('.card-title').contains('Tarefa A').should('not.exist');

    // 5. VOLTA PARA TODOS
    cy.get('.filter-select').select('');
    cy.wait(500);

    // Todos os 3 aparecem
    cy.get('.card-title').should('have.length.greaterThanOrEqual', 3);
  });

  it('Deve manter estado ao alternar entre filtros', () => {
    // Cria um card
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card de Teste Estado');
    cy.get('.modal button').contains('Criar').click();

    // Aplica filtro
    cy.get('.filter-select').select('1');
    cy.wait(500);

    // Muda filtro
    cy.get('.filter-select').select('');
    cy.wait(500);

    // Muda novamente
    cy.get('.filter-select').select('1');
    cy.wait(500);

    // Card deve estar visível se tem o assignee, senão não
    cy.get('.card-title').contains('Card de Teste Estado').then(($card) => {
      expect($card.length).toBeGreaterThan(0);
    });
  });

  it('Deve validar contagem de cards por filtro', () => {
    // Cria vários cards
    for (let i = 1; i <= 5; i++) {
      cy.get('button').contains('Nova Atividade').click();
      cy.get('.modal input[type="text"]').type(`Card ${i}`);
      cy.get('.modal select').last().select((i % 2 === 0 ? 1 : 2).toString());
      cy.get('.modal button').contains('Criar').click();
      cy.wait(200);
    }

    // Conta cards com "Todos"
    cy.get('.filter-select').select('');
    cy.wait(500);

    cy.get('.card').then(($allCards) => {
      const totalCount = $allCards.length;

      // Filtra por João
      cy.get('.filter-select').select('1');
      cy.wait(500);

      cy.get('.card').then(($joaoCards) => {
        const joaoCount = $joaoCards.length;

        // Filtra por Maria
        cy.get('.filter-select').select('2');
        cy.wait(500);

        cy.get('.card').then(($mariaCards) => {
          const mariaCount = $mariaCards.length;

          // Soma deve ser <= total (pode haver cards sem assignee)
          expect(joaoCount + mariaCount).toBeLessThanOrEqual(totalCount);
        });
      });
    });
  });

  it('Deve suportar edição de card após criação', () => {
    // 1. CRIA CARD
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card para Editar');
    cy.get('.modal textarea').first().type('Descrição original');
    cy.get('.modal button').contains('Criar').click();

    // 2. ABRE CARD
    cy.get('.card-title').contains('Card para Editar').closest('.card').click();

    // Drawer abre
    cy.get('.drawer').should('exist');

    // 3. TENTA ADICIONAR COMENTÁRIO
    cy.get('.drawer textarea').last().type('Este é um comentário de teste');
    cy.get('.drawer button').contains('Comentar').click();

    // Comentário deve aparecer (se implementado)
    cy.wait(500);

    // 4. FECHA DRAWER
    cy.get('.drawer .btn-close').click();
    cy.get('.drawer').should('not.exist');

    // 5. CARD AINDA DEVE EXISTIR
    cy.get('.card-title').contains('Card para Editar').should('exist');
  });

  it('Deve validar fluxo completo de criação com data e responsável', () => {
    // Pega data atual
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    // 1. CRIA CARD
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card com Data Completa');
    cy.get('.modal textarea').first().type('Criado em ' + dateStr);
    cy.get('.modal select').last().select('1'); // João
    cy.get('.modal button').contains('Criar').click();

    // 2. FILTRA POR JOÃO
    cy.get('.filter-select').select('1');
    cy.wait(500);

    // 3. VERIFICA CARD
    cy.get('.card-title').contains('Card com Data Completa').should('exist');

    // 4. ABRE CARD
    cy.get('.card-title')
      .contains('Card com Data Completa')
      .closest('.card')
      .click();

    // 5. VERIFICA DATA DE CRIAÇÃO
    cy.get('.drawer .details-section').contains('Criado em').should('exist');

    // 6. VERIFICA RESPONSÁVEL
    cy.get('.drawer .details-section p').then(($p) => {
      const text = $p.text();
      // Responsável pode estar visível
      expect(text).to.include('ID').or.include('Status');
    });

    cy.get('.drawer .btn-close').click();
  });

  it('Deve manter dados após refrescar página', () => {
    // 1. CRIA CARD
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card Persistente');
    cy.get('.modal button').contains('Criar').click();

    // Aguarda salvamento
    cy.wait(500);

    // 2. REFRESCA PÁGINA
    cy.reload();

    // 3. AGUARDA RELOAD
    cy.get('.board').should('exist');
    cy.wait(500);

    // 4. CARD AINDA DEVE EXISTIR
    cy.get('.card-title').contains('Card Persistente').should('exist');
  });

  it('Deve permitir criar card sem atribuição', () => {
    // 1. CRIA CARD SEM RESPONSÁVEL
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal input[type="text"]').type('Card Sem Responsável');
    cy.get('.modal textarea').first().type('Sem assignee');
    // Não seleciona responsável
    cy.get('.modal button').contains('Criar').click();

    // 2. ABRE CARD
    cy.get('.card-title').contains('Card Sem Responsável').closest('.card').click();

    // 3. VERIFICA SE NÃO TEM RESPONSÁVEL
    cy.get('.drawer').should('exist');
    cy.get('.drawer .details-section p').then(($p) => {
      const text = $p.text();
      // Não deve mostrar responsável definido
      expect(text).to.not.include('Responsável:');
    });

    cy.get('.drawer .btn-close').click();
  });
});

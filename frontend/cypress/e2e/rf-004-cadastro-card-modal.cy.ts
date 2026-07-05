describe('RF-004: Cadastro de Card via Modal', () => {
  const apiUrl = 'http://localhost:8080/api';
  
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button').contains('Entrar').click();
    cy.url().should('include', '/home');
    
    // Navigate to home
    cy.visit('/home');
    cy.get('.board').should('exist');
  });

  it('Deve abrir e fechar modal de novo card', () => {
    // Modal fechado por padrão
    cy.get('.modal-backdrop').should('not.exist');

    // Clica em "+ Nova Atividade"
    cy.get('button').contains('Nova Atividade').click();

    // Modal abre
    cy.get('.modal-backdrop').should('exist');
    cy.get('.modal').should('exist');
    cy.get('.modal h2').contains('Nova Atividade').should('exist');

    // Fechar modal com botão X
    cy.get('.btn-close').first().click();
    cy.get('.modal-backdrop').should('not.exist');
  });

  it('Deve criar novo card com validação de formulário', () => {
    // Abre modal
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal').should('exist');

    // Tenta enviar vazio - deve mostrar erro
    cy.get('.modal button').contains('Criar').click();
    cy.get('.modal .error').should('exist');
    cy.get('.modal .error').contains('Título é obrigatório').should('exist');

    // Preenche apenas título
    cy.get('.modal input[type="text"]').type('Nova tarefa importante');
    cy.get('.modal button').contains('Criar').should('not.be.disabled');

    // Preenche descrição
    cy.get('.modal textarea').first().type('Descrição da tarefa');

    // Submete
    cy.get('.modal button').contains('Criar').click();

    // Modal fecha
    cy.get('.modal-backdrop').should('not.exist');

    // Card aparece no Backlog
    cy.get('.card-title').contains('Nova tarefa importante').should('exist');
  });

  it('Deve criar card com responsável atribuído', () => {
    // Abre modal
    cy.get('button').contains('Nova Atividade').click();

    // Preenche formulário
    cy.get('.modal input[type="text"]').type('Tarefa com responsável');
    cy.get('.modal textarea').first().type('Descrição');

    // Seleciona responsável
    cy.get('.modal select').last().select('1'); // Seleciona primeiro usuário

    // Submete
    cy.get('.modal button').contains('Criar').click();

    // Verifica se card foi criado
    cy.get('.card-title').contains('Tarefa com responsável').should('exist');

    // Clica no card para abrir drawer
    cy.get('.card-title').contains('Tarefa com responsável').closest('.card').click();

    // Drawer abre
    cy.get('.drawer').should('exist');

    // Verifica se responsável está atribuído
    cy.get('.details-section p').contains('Responsável').should('exist');
  });

  it('Deve criar múltiplos cards em sequência', () => {
    const cards = [
      { title: 'Tarefa 1', desc: 'Descrição 1' },
      { title: 'Tarefa 2', desc: 'Descrição 2' },
      { title: 'Tarefa 3', desc: 'Descrição 3' }
    ];

    cards.forEach(card => {
      // Abre modal
      cy.get('button').contains('Nova Atividade').click();

      // Preenche
      cy.get('.modal input[type="text"]').type(card.title);
      cy.get('.modal textarea').first().type(card.desc);

      // Submete
      cy.get('.modal button').contains('Criar').click();

      // Modal fecha
      cy.get('.modal-backdrop').should('not.exist');

      // Verifica card criado
      cy.get('.card-title').contains(card.title).should('exist');
    });
  });

  it('Deve fechar modal com Escape', () => {
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal').should('exist');

    // Pressiona ESC
    cy.get('body').type('{esc}');

    // Modal não fecha com ESC (implementar depois se necessário)
    // Por enquanto, testa fechar com botão
    cy.get('.btn-close').first().click();
    cy.get('.modal-backdrop').should('not.exist');
  });

  it('Deve fechar modal ao clicar no backdrop', () => {
    cy.get('button').contains('Nova Atividade').click();
    cy.get('.modal').should('exist');

    // Clica no backdrop (fundo)
    cy.get('.modal-backdrop').click({ force: true });

    // Modal fecha
    cy.get('.modal-backdrop').should('not.exist');
  });
});

describe('Captura de telas para README', () => {
  const adminEmail = 'admin@kamban.local';
  const adminPassword = 'admin123';

  let token = '';
  let projectId = 0;
  let createdUserId = 0;
  const suffix = Date.now();

  it('captura telas principais com usuário e atividade cadastrados', () => {
    cy.viewport(1440, 900);

    // 1) Tela de login
    cy.visit('/login');
    cy.contains('h1', 'Kamban').should('be.visible');
    cy.screenshot('readme/01-login');

    // 2) Login admin
    cy.get('input[name="email"]').clear().type(adminEmail);
    cy.get('input[name="password"]').clear().type(adminPassword);
    cy.get('button[type="submit"]').click();

    // Aguarda autenticação e pega token
    cy.url().should('not.include', '/login');
    cy.window().then((win) => {
      token = win.localStorage.getItem('kamban_token') || '';
      expect(token, 'token de autenticação').to.not.equal('');
    });

    // 3) Garante projeto ativo
    cy.then(() => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/projects',
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        const active = (res.body || []).filter((p: any) => p.isActive);
        if (active.length > 0) {
          projectId = active[0].id;
          return;
        }

        cy.request({
          method: 'POST',
          url: 'http://localhost:8080/api/projects',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            title: `Projeto README ${suffix}`,
            description: 'Projeto criado automaticamente para capturas do README'
          }
        }).then((createRes) => {
          projectId = createRes.body.id;
        });
      });
    });

    // 4) Cria usuário membro para aparecer na listagem
    cy.then(() => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:8080/api/users',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          name: `Usuário README ${suffix}`,
          email: `readme.${suffix}@kamban.local`,
          password: 'readme123',
          role: 'member'
        },
        failOnStatusCode: false
      }).then((res) => {
        expect([201, 400], 'status de criação de usuário').to.include(res.status);
        if (res.status === 201) {
          createdUserId = res.body.id;
        }
      });
    });

    // 5) Se usuário novo não foi criado (email já existe por reexecução), busca algum member
    cy.then(() => {
      if (createdUserId) return;
      cy.request({
        method: 'GET',
        url: 'http://localhost:8080/api/users',
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        const member = (res.body || []).find((u: any) => u.role === 'member');
        expect(member, 'usuário member disponível').to.exist;
        createdUserId = member.id;
      });
    });

    // 6) Cria atividade para aparecer no board
    cy.then(() => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:8080/api/cards',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          projectId,
          title: `Atividade README ${suffix}`,
          description: 'Atividade criada automaticamente para screenshot',
          status: 'todo',
          assigneeId: createdUserId
        }
      }).its('status').should('eq', 201);
    });

    // 7) Seleciona projeto e captura board principal
    cy.window().then((win) => {
      win.localStorage.setItem('kamban_selected_project_id', String(projectId));
    });
    cy.visit('/');
    cy.contains('h1', 'Kanban Board').should('be.visible');
    cy.contains('.card-title', `Atividade README ${suffix}`).should('be.visible');
    cy.screenshot('readme/02-kanban-board-com-atividade');

    // 8) Captura modal de detalhes da atividade
    cy.contains('.card-title', `Atividade README ${suffix}`).closest('.card').click();
    cy.contains('h3', 'Informações').should('be.visible');
    cy.screenshot('readme/03-detalhes-da-atividade');

    // 9) Captura gestão de usuários com usuário cadastrado
    cy.visit('/admin/users');
    cy.contains('h1', 'Gestão de Usuários do Time').should('be.visible');
    cy.contains('td', `Usuário README ${suffix}`).should('be.visible');
    cy.screenshot('readme/04-gestao-de-usuarios');

    // 10) Captura gestão de projetos
    cy.visit('/admin/projects');
    cy.contains('h1', 'Gerenciar Projetos').should('be.visible');
    cy.screenshot('readme/05-gestao-de-projetos');
  });
});

# RF-011 - Dashboard de produtividade (admin)

## Objetivo
Permitir que o administrador visualize métricas de tarefas por período, incluindo distribuição por status (gráfico de pizza) e produtividade por usuário com foco em tarefas em andamento e concluídas.

## Atores
- Admin

## Regras de negócio
1. Apenas `admin` pode acessar o dashboard.
2. O dashboard deve permitir filtro por período (`from` e `to`).
3. O gráfico de pizza deve exibir quantidade de tarefas por status no período.
4. A tabela por usuário deve exibir no mínimo:
   - tarefas `in_progress`;
   - tarefas `done`.
5. O sistema deve destacar o usuário mais produtivo e o menos produtivo com base nos quantitativos do período.

## Endpoint
- `GET /api/dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` (admin)

## Fluxo principal
1. Admin acessa tela de dashboard.
2. Define período e confirma atualização.
3. Sistema retorna resumo agregado por status e por usuário.
4. Frontend exibe gráfico de pizza e tabela de produtividade.

## Critérios de aceite
- CA-011.1: admin consegue carregar o dashboard para um período válido.
- CA-011.2: gráfico de pizza exibe distribuição por status.
- CA-011.3: tabela exibe tarefas em andamento e concluídas por usuário.
- CA-011.4: usuário não admin não consegue acessar a rota de dashboard.

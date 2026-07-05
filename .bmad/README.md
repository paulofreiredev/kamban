# BMAD Agents Setup

Este projeto foi configurado com 5 agentes especializados, seguindo um fluxo BMAD (Business -> Modeling -> Architecture -> Delivery).

## Agentes

1. Project Manager
2. Developer
3. QA
4. Security
5. Code Reviewer

## Fluxo recomendado (BMAD)

1. **Business/Discovery**: Project Manager define escopo, critérios de aceite e riscos.
2. **Modeling/Design**: Project Manager + Developer refinam histórias técnicas e plano de implementação.
3. **Architecture/Build**: Developer implementa em pequenos incrementos.
4. **Delivery/Validation**: QA valida funcionalidade e regressão; Security verifica riscos e hardening.
5. **Code Review/Gate**: Code Reviewer aplica checklist final e aprova/reprova merge.

## Definição de pronto (DoD)

- Requisitos atendidos.
- Testes automatizados e/ou manuais executados.
- Sem vulnerabilidades críticas/altas abertas.
- Revisão de código concluída.
- Documentação atualizada.

## Onde estão os agentes

Os arquivos de agentes estão em:

- `.github/agents/project-manager.agent.md`
- `.github/agents/developer.agent.md`
- `.github/agents/qa.agent.md`
- `.github/agents/security.agent.md`
- `.github/agents/code-reviewer.agent.md`

## Como usar

No VS Code, selecione o agente correspondente ao papel e execute o trabalho por etapa do BMAD.

> Observação: os arquivos legados em `.github/chatmodes` foram removidos.

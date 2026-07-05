# ADR-0003: Ambiente local em Docker com multi-stage build

- Status: Aceito
- Data: 2026-07-05

## Contexto

O time precisa de ambiente reproduzível e simples para subir backend, frontend e banco em qualquer máquina.

## Decisão

Adotar Docker para execução local com build multi-stage para imagens de frontend e backend.

## Consequências

### Positivas
- Reprodutibilidade do ambiente local.
- Imagens menores e mais seguras com multi-stage.
- Padronização de setup para onboarding.

### Negativas
- Tempo inicial para modelar Dockerfiles e orquestração.
- Necessidade de gestão de volumes e variáveis locais.

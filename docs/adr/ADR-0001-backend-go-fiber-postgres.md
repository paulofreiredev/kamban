# ADR-0001: Backend em Go (Golang) com Fiber e PostgreSQL

- Status: Aceito
- Data: 2026-07-05

## Contexto

O sistema precisa de API com boa performance, simplicidade operacional e suporte sólido para persistência relacional.

## Decisão

Adotar:
- Go (Golang) como linguagem backend
- Fiber como framework HTTP
- PostgreSQL como banco relacional principal

## Consequências

### Positivas
- Alta eficiência e bom desempenho em Go.
- Desenvolvimento rápido de APIs com Fiber.
- Robustez transacional e consultas avançadas no PostgreSQL.

### Negativas
- Curva de aprendizado para quem não domina Go.
- Necessidade de padronização de camadas e tratamento de erros.

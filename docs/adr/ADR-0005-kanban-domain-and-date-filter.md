# ADR-0005: Modelo Kanban com 6 colunas e filtro padrão de 30 dias

- Status: Aceito
- Data: 2026-07-05

## Contexto

O produto precisa de visualização padronizada de fluxo e recorte temporal padrão para facilitar acompanhamento.

## Decisão

- Definir colunas fixas do quadro Kanban:
  - Backlog
  - A Fazer
  - Em Progresso
  - Em Revisão
  - Concluído
  - Cancelado
- Aplicar filtro de datas padrão na Home para os últimos 30 dias a partir da data atual.
- Card terá: título, descrição, anexos (imagem/vídeo), comentários e responsável.

## Consequências

### Positivas
- Fluxo de trabalho uniforme para o time.
- Melhor foco operacional com janela temporal padrão.
- Rastreabilidade mínima por comentários e anexos.

### Negativas
- Colunas fixas reduzem flexibilidade inicial.
- Filtro padrão pode não atender todos os contextos sem ajuste manual.

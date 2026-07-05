# RF-005 - Anexos (imagens e vídeos)

## Objetivo
Permitir anexar mídia ao card para complementar contexto da tarefa.

## Atores
- Usuário do time
- Admin

## Regras de negócio
1. Card deve aceitar anexos dos tipos imagem e vídeo.
2. Cada anexo deve ficar associado a um card.
3. Lista de anexos deve ser exibida no detalhe do card.
4. No MVP, arquivo físico deve ser salvo localmente em diretório do backend.
5. Diretório de anexos deve ser mapeado para volume Docker para persistência local.
6. Persistência deve usar abstração de storage para permitir troca futura para AWS S3.

## Tipos aceitos
- Imagens
- Vídeos

## Fluxo principal
1. Usuário abre card.
2. Adiciona arquivo de imagem/vídeo.
3. Sistema valida tipo e associa ao card.
4. Sistema salva arquivo no storage ativo (MVP: local em volume).
5. Sistema persiste metadados do anexo no banco.
6. Anexo aparece na listagem do card.

## Fluxos alternativos e erros
- Tipo não suportado: rejeitar envio e exibir erro.

## Critérios de aceite
- CA-005.1: upload de imagem válido é aceito.
- CA-005.2: upload de vídeo válido é aceito.
- CA-005.3: tipo inválido é rejeitado com feedback.
- CA-005.4: arquivo permanece disponível após reinício de container com volume mapeado.
- CA-005.5: backend usa camada de abstração de storage, sem acoplamento direto ao filesystem nos casos de uso.

## Observações
- Limites de tamanho e quantidade serão definidos em especificação técnica posterior.
- Estratégia atual: local-first (volume Docker), S3-ready.

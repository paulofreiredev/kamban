# ADR-0006: Armazenamento de anexos local (container volume) com preparo para AWS S3

- Status: Aceito
- Data: 2026-07-05

## Contexto

No estágio atual, o projeto rodará em ambiente simples, sem múltiplos containers de aplicação. Ainda assim, os anexos devem ser persistidos de forma estável e com caminho de migração simples para storage em nuvem no futuro.

## Decisão

1. **Curto prazo (MVP):** salvar anexos localmente no backend, em diretório mapeado para volume Docker.
2. **Metadados dos anexos:** persistir no PostgreSQL (nome, tipo, tamanho, caminho lógico/chave, card, autor e timestamps).
3. **Abstração obrigatória de storage:** backend deve adotar uma interface de provedor de armazenamento (ex.: `StorageProvider`) para desacoplar regra de negócio da tecnologia de persistência.
4. **Implementações previstas:**
   - `LocalStorageProvider` (ativo no MVP)
   - `S3StorageProvider` (futuro)

## Consequências

### Positivas
- Simplicidade operacional para ambiente atual.
- Persistência local mantida entre reinícios via volume mapeado.
- Migração futura para AWS S3 com baixo impacto no domínio.

### Negativas
- Escalabilidade horizontal limitada no modo local.
- Dependência de disco local no host durante o MVP.

## Plano de migração futura (S3)

- Adicionar implementação `S3StorageProvider`.
- Trocar provider por configuração de ambiente, sem alterar casos de uso de card/anexo.
- Manter metadados compatíveis (chave do objeto em vez de caminho local).

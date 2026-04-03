# Plan 25-01 Summary

## Goal
Adicionar suporte à escolha de linha psicanalítica e pensador de preferência, permitindo que essa configuração seja salva no perfil do psicólogo.

## Execution
- **Schema**: Adicionados os campos `theoreticalOrientation` e `preferredThinker` na interface e no modelo Prisma `PracticeProfile`.
- **Database**: Criado o SQL de migração manualmente em `prisma/migrations/20260403000000_add_premium_profile_fields/migration.sql` já que o URL do banco é um placeholder (seguindo o padrão de projetos anteriores). O Prisma client foi regenerado com os novos campos.
- **Domínio de Profile**:
  - `DEFAULT_PROFILE_SNAPSHOT` atualizado para incluir os novos campos com o valor `null`.
  - Função `mapProfileRowToSnapshot` atualizada para mapear os dados lidos do banco.
  - Função `buildProfileWriteData` atualizada para mapear os dados para escrita.
  - O parâmetro de entrada e o objeto `next` da função `savePracticeProfile` foram atualizados para permitir atualizar e criar profiles com os campos teóricos e os espaços em branco na atualização foram removidos.
- **Server Action**: Atualizada `savePracticeProfileAction` para extrair os campos teóricos do formulário da UI e enviar para a lógica do backend em `savePracticeProfile`.
- **UI**: Formulário atualizado em `src/app/(vault)/settings/profile/page.tsx` para apresentar um input de linha teórica e um seletor nativo do sistema para o pensador de preferência, exibindo os cinco pensadores padrão da fase de planejamento (Freud, Lacan, Winnicott, Klein, Bion). Também definimos um custom CSS object `selectStyle` para estilizar o campo como os inputs normais mas com dropdown control.
- **Testes**: Atualizado `draftProfile` do setup view e o snapshot mockado para o `setup-readiness.test.ts`, o que garantiu a persistência e validade dos campos com verificação com o comando `npx vitest run`.

## Next Steps
Esta fase foi focada em backend/form. A próxima etapa deste plano `25-02` foca na apresentação conceitual do premium que utilizará esses dados.
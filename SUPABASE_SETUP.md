# Configuração do Supabase para o Gerador de Imagens

## Pré-requisitos
1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Credenciais configuradas no arquivo `.env`

## Configuração das Tabelas

### 1. Acesse o SQL Editor do Supabase
1. Faça login no Supabase Dashboard
2. Selecione seu projeto
3. Vá para "SQL Editor" no menu lateral
4. Clique em "New Query"

### 2. Execute o Script SQL
Copie e cole o conteúdo do arquivo `src/lib/database.sql` no editor SQL e execute.

O script irá criar:
- Tabela `templates` para armazenar os templates de geração
- Tabela `generation_requests` para histórico de gerações
- Triggers para atualização automática de timestamps
- Índices para melhor performance
- Políticas RLS (Row Level Security)
- Dados iniciais de exemplo

### 3. Verificar Criação das Tabelas
Após executar o script, verifique se as tabelas foram criadas:
1. Vá para "Table Editor" no menu lateral
2. Você deve ver as tabelas `templates` e `generation_requests`

### 4. Configurar Políticas RLS (Opcional)
As políticas RLS estão configuradas para permitir acesso público. Para produção, considere:
- Implementar autenticação de usuários
- Criar políticas mais restritivas
- Configurar roles específicos

## Estrutura das Tabelas

### Templates
- `id`: UUID (chave primária)
- `name`: Nome do template
- `description`: Descrição do template
- `example_image`: URL ou data URL da imagem de exemplo
- `prompt`: Prompt para geração de imagem
- `category`: Categoria do template
- `status`: Status (active/inactive)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Generation Requests
- `id`: UUID (chave primária)
- `template_id`: Referência ao template usado
- `template_name`: Nome do template (desnormalizado)
- `user_image`: Imagem enviada pelo usuário
- `prompt`: Prompt final usado na geração
- `status`: Status da requisição (pending/processing/completed/error)
- `generated_image`: URL da imagem gerada
- `error`: Mensagem de erro (se houver)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## Testando a Conexão

Após configurar as tabelas, teste a aplicação:
1. Execute `npm run dev`
2. Acesse `http://localhost:8080`
3. Navegue para "Gerenciar Templates"
4. Teste as operações CRUD:
   - Criar novo template
   - Editar template existente
   - Excluir template
   - Visualizar lista de templates

## Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas no `.env`
- Confirme se o projeto Supabase está ativo
- Verifique se as credenciais têm as permissões necessárias

### Erro de Política RLS
- Desabilite temporariamente o RLS para testes: `ALTER TABLE templates DISABLE ROW LEVEL SECURITY;`
- Ajuste as políticas conforme necessário

### Erro de Schema
- Verifique se todas as tabelas foram criadas corretamente
- Execute novamente o script SQL se necessário
- Confirme se os tipos de dados estão corretos
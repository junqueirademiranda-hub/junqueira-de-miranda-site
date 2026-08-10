# Migração do Portal do Cliente

Este pacote preserva o site institucional, as landing pages, o Google Analytics e o SEO existentes. O portal foi adicionado em `/portal` e o painel administrativo em `/portal/admin`.

## Configuração obrigatória antes de liberar clientes

1. Criar ou vincular um banco Cloudflare D1 ao binding `DB`.
2. Configurar o segredo `GOOGLE_CONFIG_ENCRYPTION_KEY` com uma chave longa e aleatória.
3. Configurar `ADMIN_EMAILS` com os endereços autorizados, separados por vírgula.
4. No Google Cloud, adicionar `https://junqueirademiranda.com.br/api/google/callback` aos URIs de redirecionamento autorizados do cliente OAuth.
5. Acessar `/portal/admin`, fazer login e conectar novamente Google Drive e Gmail. Os tokens do ambiente de testes não fazem parte deste pacote.
6. Fazer um teste completo com dados fictícios antes de liberar o uso real.

## Endereços

- Portal: `https://junqueirademiranda.com.br/portal`
- Painel: `https://junqueirademiranda.com.br/portal/admin`

## Segurança

Não envie arquivos `.env`, segredos do Google, tokens ou credenciais para o GitHub. Configure-os apenas como variáveis protegidas na hospedagem.

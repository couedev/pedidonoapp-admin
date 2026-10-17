# Notificação de nova loja

Esta Edge Function envia Web Push para os administradores inscritos quando recebe um evento `INSERT` da tabela `empresas`.

## Configuração

1. Gere um par VAPID e mantenha a chave privada somente no Supabase:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. Adicione ao ambiente do admin PWA:

   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<Public Key>
   ```

3. Defina os secrets da Edge Function: `VAPID_SUBJECT` (por exemplo, `mailto:suporte@pedidonoapp.com.br`), `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `NEW_STORE_WEBHOOK_SECRET` (valor aleatório forte). `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são disponibilizados no runtime da Supabase.

4. Faça deploy da função:

   ```bash
   supabase functions deploy notificar-nova-loja
   ```

5. No Supabase Dashboard, crie um **Database Webhook** para `INSERT` em `public.empresas`, com a URL da função e header `Authorization: Bearer <NEW_STORE_WEBHOOK_SECRET>`.

6. Execute a migration `202610170005_admin_push_subscriptions.sql`, instale o PWA do AdminNoApp e toque em **Ativar notificações**.

O webhook é a etapa que liga o cadastro real ao envio. Sem ele, a assinatura é salva, mas nenhuma notificação é disparada.

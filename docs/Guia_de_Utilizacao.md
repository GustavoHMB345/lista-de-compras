# Guia de Utilização — SuperLista

Bem-vindo! Este guia rápido explica como usar o aplicativo para organizar suas compras, colaborar com a família e acompanhar preços.

## Visão geral

- Autenticação: entre com seu e-mail e senha ou use o usuário de teste.
- Famílias: crie ou entre em uma família para compartilhar listas.
- Listas e Itens: crie listas, adicione itens, marque concluídos e acompanhe preços.
- Offline: funciona sem internet e sincroniza quando a conexão volta.

## Acesso e cadastro

- Tela de Boas-vindas: toque em "Entrar" ou "Criar conta".
- Entrar: informe e-mail e senha. O botão desabilita e mostra carregando durante o login.
- Usuário de teste: disponível na tela de login para explorar rapidamente.
- Cadastro: informe nome, e-mail e senha. Erros de validação aparecem abaixo dos campos.

## Famílias

- Criar família: defina um nome. Você será administrador por padrão.
- Entrar por código: informe o código compartilhado (menu de compartilhamento mostra o código).
- Gerenciamento: administradores podem promover/remover admins e aprovar convites.
- Sair da família: confirme antes de sair; você perde acesso às listas compartilhadas.

## Listas de compras

- Criar nova lista: informe nome e (opcional) família destino.
- Itens: adicione com nome, quantidade e preço. Marque como comprado para concluir.
- Ações da lista: concluir lista, excluir lista (ação destrutiva pede confirmação), compartilhar.
- Filtros e busca: filtre por status, família e intervalo de datas; limpe filtros com o botão "Limpar".

## Detalhe do item e preços

- Histórico de preços: cada compra registra um snapshot com preço e data.
- Tendência: gráfico exibe médias diárias e permite filtrar por período (7, 30, 90 dias).
- Agregação: os valores são calculados por dia para facilitar a leitura (média por unidade).

## Sincronização e offline

- Modo offline: ações entram numa fila de mutações e são aplicadas quando a rede volta.
- Conflitos: usamos política "última escrita vence"; snapshots de preço sempre são somados (nunca sobrescrevem).
- Tempo: se o servidor rejeitar por desatualização, o app tenta novamente com o novo `updated_at`.

## Dicas rápidas

- Toque longo em um item para editar/excluir.
- Deslize um item para revelar ações rápidas.
- Use o botão principal (azul) para ações primárias; cinza/claro para secundárias; vermelho para destrutivas.

---

Dúvidas ou sugestões? Abra um issue no repositório ou envie feedback pelo app.

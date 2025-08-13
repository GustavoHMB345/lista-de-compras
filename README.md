# SuperLista - App de Lista de Compras Familiar 🛒


SuperLista é um aplicativo móvel completo, desenvolvido em React Native, para gerenciar listas de compras de forma colaborativa e inteligente. Ele permite que famílias criem e compartilhem listas, adicionem itens com preços e quantidades, e o mais importante: analisem a evolução dos preços dos produtos ao longo do tempo, ajudando a economizar e a fazer compras mais conscientes.

O projeto foi desenvolvido com foco em uma experiência de usuário fluida e funciona de forma totalmente offline, salvando todos os dados localmente no dispositivo.

✨ Funcionalidades Principais
👨‍👩‍👧‍👦 Gestão de Família: Crie um grupo familiar e convide membros para participar.

🛒 Listas Compartilhadas: Crie listas de compras que podem ser editadas por múltiplos membros da família em tempo real (na mesma rede ou no mesmo dispositivo, já que é local).

➕ Adição de Itens: Adicione produtos com nome, quantidade e preço (opcional).

✔️ Marcação de Compras: Marque itens como "comprados" com uma animação suave.

📊 Dashboard Inteligente: Uma tela inicial que mostra os 5 itens mais comprados pela família e a média de preço de cada um.

📈 Histórico de Preços: Consulte a média de preço de todos os produtos já comprados, ordenados do mais barato para o mais caro.

📉 Análise Avançada por Item: Toque em um item no histórico para ver um gráfico detalhado da flutuação de seu preço ao longo do tempo.

👤 Perfil Pessoal: Gerencie seu nome de exibição.

📱 Interface Fluida: Animações e transições que tornam a experiência de uso mais agradável e profissional.

🔒 Armazenamento Local: Todos os dados são salvos de forma segura no dispositivo usando AsyncStorage, garantindo o funcionamento offline.

📸 Telas do Aplicativo
(Aqui você pode adicionar screenshots do seu aplicativo em funcionamento)

Dashboard

Histórico de Preços

Detalhe do Item

[Imagem do Dashboard]

[Imagem da tela de Histórico de Preços]

[Imagem do gráfico de flutuação de preço]

Listas Ativas

Detalhe da Lista

Gestão Familiar

[Imagem da tela de Listas]

[Imagem da tela de Detalhe da Lista]

[Imagem da tela de Família]

🛠️ Tecnologias Utilizadas
React Native: Framework para desenvolvimento de aplicativos móveis multiplataforma.

Expo: Plataforma e conjunto de ferramentas para facilitar o desenvolvimento e a execução de apps React Native.

AsyncStorage: Para armazenamento de dados localmente no dispositivo.

React Context API: Para gerenciamento de estado global de forma simples e eficiente.

React Native Gifted Charts: Para a criação de gráficos interativos de barra e linha.

📂 Estrutura do Projeto
O código-fonte está organizado na pasta src para facilitar a manutenção e escalabilidade:

/src
|-- /components     # Componentes reutilizáveis (NavBar, Ícones)
|-- /contexts       # Gerenciamento de estado global (DataContext)
|-- /navigation     # Lógica de navegação entre telas (MainNavigator)
|-- /screens        # Componentes de cada tela do app
|-- /styles         # Arquivo de estilos globais

🚀 Como Rodar o Projeto
Siga os passos abaixo para executar o projeto localmente:

Clone o repositório:

git clone https://github.com/seu-usuario/nome-do-repositorio.git

Navegue até a pasta do projeto:

cd nome-do-repositorio

Instale as dependências:
Este comando irá baixar todas as bibliotecas necessárias para o projeto.

npm install

Inicie o servidor de desenvolvimento do Expo:

npx expo start

Execute o aplicativo:

No seu celular: Baixe o app Expo Go (Android/iOS) e escaneie o QR Code que aparecerá no terminal.

No emulador: Com o servidor rodando, pressione a para o emulador Android ou i para o simulador iOS (macOS).

🔮 Próximos Passos e Melhorias
[ ] Implementar um leitor de código de barras para adicionar itens rapidamente.

[ ] Adicionar categorias para os itens (ex: "higiene", "alimentos", "limpeza").

[ ] Criar um sistema de notificações para avisar quando um membro adiciona um item a uma lista.

[ ] Opção de backup dos dados na nuvem (ex: Google Drive, iCloud).

[ ] Modo escuro (Dark Mode).
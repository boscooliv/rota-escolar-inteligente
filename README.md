# Rota Escolar Inteligente

Sistema de Gestão do Transporte Escolar por NFC



COSTA L. E. S. ¹, NETO J. B. O. ¹, NASCIMENTO K. B. S. ¹ e SOUZAY. V. F. ¹

1 IFRN – Campus Pau dos Ferros

ÁREA TEMÁTICA: (Eletricidade Instrumental e Programação para Internet).

ORIENTADORES: FILHO  L. R. S. ¹ e PEREIRA J. Q. ¹



RESUMO





O Sistema de Gestão do Transporte Escolar por NFC consiste no desenvolvimento de uma plataforma digital, podendo ser disponibilizada por meio de um aplicativo ou site, com o objetivo de melhorar a organização, o acompanhamento e o controle do transporte utilizado pelos estudantes da instituição.



Atualmente, grande parte da comunicação relacionada ao transporte escolar acontece por meio de grupos de WhatsApp, o que pode ocasionar dificuldades na confirmação dos passageiros, falta de informações organizadas e problemas no controle de quem realmente utilizará o transporte em determinado dia.







PALAVRAS-CHAVE: Transporte Escolar. NFC. Organização



ABSTRACT





The School Transportation Management System Using NFC consists of the development of a digital platform designed to improve the organization, monitoring, and control of school transportation used by students at the Federal Institute of Education, Science and Technology of Rio Grande do Norte (IFRN). Currently, much of the communication regarding school transportation takes place through WhatsApp groups, which can lead to difficulties in confirming passengers, organizing information, and controlling student attendance. Therefore, this project aims to develop a centralized system that allows students to confirm their daily transportation needs, select boarding and drop-off points, and monitor the vehicle's location in real time. The proposed methodology is applied, exploratory, and descriptive, with a qualitative approach, based on identifying existing problems and planning technological solutions. The theoretical framework includes concepts related to information systems, Near Field Communication (NFC), and Global Positioning System (GPS). The platform is expected to enable automatic student identification through individual NFC tags, record boarding times, send notifications regarding unconfirmed attendance, and provide real-time bus location tracking. Thus, the proposed system seeks to reduce communication failures, improve passenger management, and provide greater efficiency, organization, and transparency in school transportation services.







KEYWORDS: School Transportation. NFC. Organization..





INTRODUÇÃO

Nas prefeituras municipais do Alto Oeste a organização do transporte escolar é uma atividade que exige comunicação constante entre os estudantes e os responsáveis pelo serviço. Atualmente, parte dessas informações é compartilhada por meio de grupos de WhatsApp, situação que pode ocasionar dificuldades na confirmação dos passageiros, desorganização das informações e imprecisões no controle dos alunos que realmente utilizarão o transporte em determinado dia.

Diante dessa problemática, surgiu a proposta de desenvolver um Sistema de Gestão do Transporte Escolar por NFC (Near Field Communication), com o objetivo de centralizar as informações e o gerenciamento das viagens. A solução consiste em uma plataforma digital, disponibilizada por meio de um aplicativo ou site, que permitirá aos estudantes confirmar previamente sua utilização do transporte, selecionar os pontos de embarque e desembarque e acompanhar a localização dos ônibus.

O projeto também prevê a utilização de tags NFC individuais para identificação dos estudantes durante o embarque. Por meio dessa tecnologia, será possível registrar automaticamente a presença dos passageiros, comparar as confirmações realizadas previamente com os embarques efetivos e identificar possíveis divergências. Além disso, a integração com GPS permitirá acompanhar a localização do veículo em tempo real, proporcionando maior previsibilidade aos estudantes.

O objetivo geral da pesquisa é desenvolver uma proposta de sistema digital para aprimorar a gestão do transporte escolar, utilizando tecnologias de identificação por aproximação e geolocalização.. 

REFERENCIAL TEÓRICO

No contexto do transporte escolar, a utilização de uma plataforma digital permitirá reunir informações sobre os estudantes, trajetos, horários, pontos de embarque e confirmação de viagens. A centralização desses dados facilitará o acesso às informações pelos responsáveis pelo transporte, permitindo identificar previamente a quantidade de passageiros e organizar melhor as viagens. Além disso, a utilização de um banco de dados possibilitará armazenar o histórico de embarques, contribuindo para o acompanhamento das atividades e a identificação de possíveis problemas operacionais.

2.2 Near Field Communication

O NFC utiliza a tecnologia de indução magnética para estabelecer a conexão entre dois aparelhos capacitados. Tal tipo de comunicação é categorizada na sua forma mais simplificada como evolução do RFID (identificação por radiofrequência). Uma transferência de dados em NFC requer um aparelho iniciador (ou leitor) e um aparelho alvo, ambos portadores da tecnologia. O iniciador gera um campo de ondas de rádio de baixa frequência (tipicamente 13.56MHz) e conforme existe um alvo dentro desse campo o circuito é ativado, configurando uma conexão entre ambos. Tal conexão pode ser dada através de três modos: passivo ou leitura/escrita, ativo ou peer-to-peer e emulador de cartão.

(FONSECA; MACHADO & MACHADO, 2018)



2.3 Geolocalização por GPS

O Sistema de Posicionamento Global (GPS) é uma tecnologia que permite determinar a localização geográfica de dispositivos por meio de sinais enviados por satélites. Sua aplicação no projeto consiste na instalação ou utilização de um dispositivo com GPS no ônibus escolar, responsável por transmitir informações sobre sua localização para a plataforma digital. Com isso, os estudantes poderão visualizar a posição aproximada do veículo em um mapa e acompanhar seu deslocamento durante o percurso. A utilização desse recurso poderá melhorar a organização dos horários de embarque, proporcionando maior previsibilidade e reduzindo a necessidade de comunicação constante entre os passageiros e os responsáveis pelo transporte.



2.4 Notificações e comunicação digital

As notificações digitais representam um recurso importante para transmitir informações aos usuários de maneira rápida e organizada. No sistema proposto, esse mecanismo será utilizado para informar situações relacionadas ao embarque dos estudantes. Caso um aluno confirme previamente a utilização do transporte, mas não tenha sua presença registrada pela tag NFC, a plataforma poderá sinalizar essa ocorrência. A partir disso, poderão ser encaminhadas notificações ao estudante e ao responsável pelo transporte, permitindo uma comunicação mais eficiente e contribuindo para evitar atrasos e falhas de organização.



METODOLOGIA

A pesquisa caracteriza-se como aplicada, pois busca desenvolver uma solução tecnológica voltada à resolução de um problema prático relacionado à gestão do transporte escolar. Quanto à abordagem, apresenta caráter qualitativo, considerando a análise das dificuldades existentes no processo de organização e controle dos passageiros. Também possui características exploratórias e descritivas, uma vez que busca compreender o problema e descrever as funcionalidades necessárias para a solução proposta. O universo da pesquisa compreende a comunidade estudantil do IFRN que utiliza ou poderá utilizar o transporte escolar, além dos responsáveis pela organização e realização das viagens. A amostra ainda deverá ser definida conforme a disponibilidade dos participantes e a possibilidade de realização de testes durante o desenvolvimento do projeto.

Inicialmente, será realizada uma análise do funcionamento atual do transporte escolar, buscando identificar as principais dificuldades relacionadas à confirmação de passageiros, à comunicação e ao controle de embarque. Essa etapa permitirá compreender as necessidades dos usuários e estabelecer os requisitos funcionais da plataforma. Em seguida, será desenvolvido o planejamento da solução tecnológica, considerando a estrutura do sistema, as funcionalidades necessárias e a integração entre os diferentes recursos. A plataforma deverá permitir que os estudantes realizem seu cadastro, confirmem a utilização do transporte e selecionem os pontos de embarque e desembarque.

Posteriormente, será planejada a implementação da identificação por NFC. Cada estudante receberá uma tag individual vinculada ao seu cadastro. Durante o embarque, a aproximação da tag ao leitor instalado no ônibus permitirá registrar automaticamente sua presença no sistema. Outra etapa metodológica consiste na integração de um mecanismo de notificações, responsável por identificar divergências entre os passageiros que confirmaram a utilização do transporte e aqueles que efetivamente realizaram o embarque.

Também será estudada a integração com GPS, permitindo transmitir a localização do ônibus para a plataforma e disponibilizar sua visualização em um mapa digital. A coleta de dados poderá ocorrer por meio de observações do funcionamento atual do transporte, levantamento dos requisitos dos usuários e aplicação de questionários ou entrevistas aos estudantes e responsáveis pelo serviço. Os dados obtidos serão utilizados para identificar necessidades e avaliar a adequação das funcionalidades propostas.

A análise dos dados qualitativos será realizada por meio da organização e interpretação das informações coletadas, identificando os problemas recorrentes e relacionando-os às funcionalidades planejadas. Caso sejam realizados testes quantitativos, poderão ser analisados indicadores como quantidade de embarques registrados, divergências entre confirmações de presenças e tempo necessário para o registro dos passageiros. Por fim, serão realizados testes funcionais para verificar o funcionamento dos mecanismos de cadastro, confirmação de viagens, identificação por NFC, notificações e localização por GPS.



RESULTADOS E DISCUSSÕES

Espera-se que a plataforma proporcione maior organização no gerenciamento do transporte escolar do IFRN, centralizando informações que atualmente podem estar distribuídas em diferentes canais de comunicação. A funcionalidade de confirmação antecipada permitirá que os estudantes informem se utilizarão o transporte para ir à instituição, retornar para sua cidade ou realizar ambos os trajetos. Essas informações possibilitarão aos responsáveis visualizar previamente a quantidade de passageiros e organizar as viagens.

Outro resultado esperado está relacionado à implementação da identificação por NFC. Com a utilização de tags individuais, será possível registrar os embarques automaticamente, permitindo comparar os estudantes que confirmaram a viagem com aqueles que realmente utilizaram o transporte. Essa funcionalidade poderá contribuir para diminuir erros de registro e facilitar a identificação de passageiros ausentes.

O sistema de notificações também deverá representar uma melhoria significativa, pois permitirá sinalizar situações em que estudantes confirmaram a utilização do transporte, mas não tiveram seu embarque registrado. Dessa forma, os responsáveis poderão obter informações mais rapidamente e tomar decisões relacionadas à organização da viagem.

Em relação à geolocalização, espera-se que a integração com GPS permita aos estudantes acompanhar a posição aproximada do ônibus em tempo real. Esse recurso poderá facilitar o planejamento dos horários de saída dos alunos para os pontos de embarque e reduzir a necessidade de mensagens frequentes para consultar a localização do veículo.

Entre os principais desafios técnicos previstos estão a integração do leitor NFC com a plataforma, a disponibilidade de conexão com a internet durante os trajetos, a precisão das informações de localização e a segurança dos dados armazenados.

Também será necessário considerar situações em que o estudante não possua sua tag no momento do embarque ou em que ocorra alguma falha de leitura, sendo importante disponibilizar um procedimento alternativo de identificação.

5	CONSIDERAÇÕES FINAIS 

O desenvolvimento da proposta do Sistema de Gestão do Transporte Escolar por NFC apresenta uma alternativa tecnológica para solucionar dificuldades relacionadas à organização e ao controle do transporte utilizado pelos estudantes do IFRN.

A integração entre confirmação antecipada de viagens, identificação individual por NFC, registro automático de presença, notificações e localização por GPS poderá proporcionar melhorias significativas no gerenciamento dos passageiros e na comunicação entre estudantes e responsáveis pelo transporte. ‘	A proposta também demonstra como diferentes tecnologias podem ser utilizadas de maneira integrada para resolver problemas presentes no cotidiano de uma instituição de ensino.

Entretanto, para que a solução alcance os resultados esperados, será necessário realizar etapas de desenvolvimento, integração e testes, considerando aspectos como compatibilidade dos equipamentos, disponibilidade de conexão com a internet, facilidade de utilização e proteção dos dados pessoais.

Como possibilidade de continuidade, recomenda-se a implementação de um protótipo funcional e sua posterior aplicação em um cenário real de transporte escolar, permitindo avaliar sua eficiência e identificar possíveis melhorias.

Dessa forma, conclui-se que o projeto apresenta potencial para modernizar a gestão do transporte escolar, contribuindo para um serviço mais organizado, seguro e eficiente para a comunidade acadêmica.



REFERÊNCIAS

BRASIL. NFC (Near Field Communication; Campo próximo de comunicação) entendimento e aceitação, 2024. Disponível em: <https://submissoesrevistarcmos.com.br/rcmos/pt_BR/article/view/307 >. Acesso em: 12 Nov. 2026. 

BRASIL. Near Field Communication., GTA UFRJ 2018. Disponível em: <https://www.gta.ufrj.br/ensino/eel878/redes1-2018-1/trabalhos-vf/nfc/ >. Acesso em: 12 Nov. 2026. 

BRASIL. CIÊNCIA HOJE - A vasta ciência por trás do GPS.  JUNHO 2026. Disponível em: <A vasta ciência por trás do GPS - Ciência HojeCiência Hoje >. Acesso em: 12 Nov. 2026.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c43378fd-b8b1-5c57-a16a-22d29204f10c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

# ExploreCity 🧭

Guia turístico e histórico interativo de São Paulo, feito com React Native e Expo.

**Disciplina:** Programação Web 2 — Projeto 3: Guia Turístico e Histórico Interativo
**Integrantes:** [Mariana], [Miguel], [Pedro], [Wallex]


## Funcionalidades

| Requisito | Como foi feito |
|---|---|
| Mapa e marcadores | `react-native-maps`, com marcadores coloridos para Museus (roxo), Parques (verde) e Monumentos (terracota), filtro por categoria e mapa centralizado no usuário e no ponto selecionado |
| GPS | `expo-location`: posição atual, distância (fórmula de Haversine) e pontos mais próximos |
| Notificações | `expo-notifications`: alerta local com uma curiosidade histórica ao chegar perto de um ponto, raio configurável (100 m a 1 km), sem repetir o mesmo aviso (intervalo de 6 h, salvo no aparelho) |
| Acelerômetro | `expo-sensors`: "Agite para um ponto aleatório", usando o sensor real, com vibração, animação e barra de força do movimento |
| Widget Android | `react-native-android-widget`: [status — atualizar depois] |
| Dados | Arquivo estático `src/data/places.json` |

## Telas
- **Home:** saudação, atalho "Agite", categorias e pontos próximos
- **Mapa:** marcadores por categoria, filtros, ponto mais próximo e card de informações
- **Guia:** visita guiada com progresso, raio de proximidade e teste de notificação
- **Detalhes:** foto, história, curiosidade e distância
- **Descoberta:** ponto sorteado ao agitar o celular

## Como executar
Requisitos: Node.js 22 ou superior (testado com Node 24), npm e o app **Expo Go** no celular Android (na versão compatível com o SDK 58). O computador e o celular precisam estar na mesma rede Wi-Fi.

```
npm install
npx expo start
```

Escaneie o QR Code que aparece no terminal com o Expo Go e permita o acesso à **localização** e às **notificações**.

## Estrutura de pastas
```
src/
├── app/          telas (Expo Router)
├── components/   cards, marcador, abas
├── constants/    tema, categorias, configurações de proximidade
├── data/         places.json e leitura dos dados
├── services/     GPS, notificações, proximidade e acelerômetro
├── types/        tipos TypeScript
└── utils/        cálculo de distância e proximidade
```

## Como adicionar um novo ponto turístico
1. Coloque a foto em `assets/images/places/`.
2. Adicione uma linha em `src/data/placeImages.ts` ligando o nome do arquivo à foto.
3. Copie um bloco de `src/data/places.json` e troque os dados (id, nome, categoria, descrição, curiosidade, latitude, longitude e imagem).

## Limitações conhecidas
- As notificações de proximidade funcionam **com o app aberto**. Com a tela bloqueada, seria necessária localização em segundo plano, que não é suportada no Expo Go.
- Notificações push (remotas) não são usadas.

## Créditos das fotos
[Liste aqui a fonte de cada foto, por exemplo: "MASP — Wikimedia Commons, autor, licença".]
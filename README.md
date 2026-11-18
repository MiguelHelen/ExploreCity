# ExploreCity 🧭

Guia turístico e histórico interativo de São Paulo, feito com React Native e Expo.

**Disciplina:** Programação Web 2 — Projeto 3: Guia Turístico e Histórico Interativo
**Integrantes:** Mariana de Oliveira Rigueiro, Miguel Heleno do Nascimento Silva, Pedro Tersi Gomes de Souza e Wallex André Adriano dos Santos.

## Funcionalidades

| Requisito | Como foi feito |
|---|---|
| Mapa e marcadores | `react-native-maps`, com marcadores coloridos para Museus (roxo), Parques (verde) e Monumentos (terracota), filtro por categoria e mapa centralizado no usuário e no ponto selecionado |
| GPS | `expo-location`: posição atual, distância (fórmula de Haversine) e pontos mais próximos |
| Notificações | `expo-notifications`: alerta local com uma curiosidade histórica ao chegar perto de um ponto, raio configurável (100 m a 1 km), sem repetir o mesmo aviso (intervalo de 6 h, salvo no aparelho) |
| Acelerômetro | `expo-sensors`: "Agite para um ponto aleatório", usando o sensor real, com vibração, animação e barra de força do movimento |
| Widget Android | Implementado com `react-native-android-widget` (requer development build ou APK) |
| Dados | Arquivo estático `src/data/places.json` |

## Telas
- **Home:** saudação, atalho "Agite", categorias e pontos próximos
- **Mapa:** marcadores por categoria, filtros, ponto mais próximo e card de informações
- **Guia:** visita guiada com progresso, raio de proximidade e teste de notificação
- **Detalhes:** foto, história, curiosidade e distância
- **Descoberta:** ponto sorteado ao agitar o celular

## Como executar
Requisitos: Node.js 22 ou superior, npm e o app **Expo Go** no celular Android (na versão compatível com o SDK 58). O computador e o celular precisam estar na mesma rede Wi-Fi.

```bash
npm install
npx expo start
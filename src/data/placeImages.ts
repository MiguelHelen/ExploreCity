/**
 * Mapa das fotos dos pontos turísticos.
 * O React Native precisa que cada imagem seja "require" com caminho fixo,
 * então ligamos aqui o nome do arquivo (usado no places.json) à foto real.
 *
 * Para adicionar um lugar novo: coloque a foto em assets/images/places
 * e acrescente uma linha nesta tabela.
 */

import type { ImageSourcePropType } from 'react-native';

export const placeImages: Record<string, ImageSourcePropType> = {
  'museu-ipiranga.jpg': require('../../assets/images/places/museu-ipiranga.jpg'),
  'masp.jpg': require('../../assets/images/places/masp.jpg'),
  'pinacoteca.jpg': require('../../assets/images/places/pinacoteca.jpg'),
  'parque-ibirapuera.jpg': require('../../assets/images/places/parque-ibirapuera.jpg'),
  'parque-da-luz.jpg': require('../../assets/images/places/parque-da-luz.jpg'),
  'parque-villa-lobos.jpg': require('../../assets/images/places/parque-villa-lobos.jpg'),
  'theatro-municipal.jpg': require('../../assets/images/places/theatro-municipal.jpg'),
  'catedral-da-se.jpg': require('../../assets/images/places/catedral-da-se.jpg'),
  'monumento-as-bandeiras.jpg': require('../../assets/images/places/monumento-as-bandeiras.jpg'),
};
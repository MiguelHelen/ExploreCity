'use no memo';

/**
 * Visual do widget "Ponto mais próximo" do ExploreCity.
 *
 * ATENÇÃO (regras da biblioteca):
 *  - Widgets não podem usar hooks (useState, useEffect...).
 *  - Só podem usar as peças da biblioteca (FlexWidget, TextWidget, ImageWidget),
 *    e não View, Text ou Image do React Native.
 *  - A linha 'use no memo' acima impede o React Compiler de inserir hooks aqui.
 *  - Por isso as cores estão escritas direto, sem importar o tema do app.
 */

import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

import { getCategoryInfo } from '../constants/categories';
import { placeImages } from '../data/placeImages';
import type { Place } from '../types/place';
import { formatDistance } from '../utils/distance';

interface NearestPlaceWidgetProps {
  place: Place;
  distance?: number;
  width: number; // tamanho do widget na tela inicial
  height: number;
}

export function NearestPlaceWidget({ place, distance, width, height }: NearestPlaceWidgetProps) {
  const category = getCategoryInfo(place.category);
  const hasDistance = distance !== undefined;

  const padding = 10;
  const photoHeight = Math.max(height - padding * 2, 40);
  const photoWidth = Math.round(width * 0.4);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel="Ponto turístico mais próximo"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F4C5C',
        borderRadius: 24,
        padding,
      }}>
      <ImageWidget
        image={placeImages[place.image] as number}
        imageWidth={photoWidth}
        imageHeight={photoHeight}
        radius={16}
      />

      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 12,
        }}>
        <TextWidget
          text={hasDistance ? 'MAIS PRÓXIMO DE VOCÊ' : 'EM DESTAQUE'}
          style={{ fontSize: 10, fontWeight: 'bold', color: '#F28C28' }}
        />
        <TextWidget
          text={place.name}
          truncate="END"
          maxLines={2}
          style={{ fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' }}
        />
        <TextWidget
          text={hasDistance ? `${category.singular} • ${formatDistance(distance)}` : category.singular}
          style={{ fontSize: 12, color: '#D7E6EA' }}
        />
        <TextWidget
          text="ExploreCity"
          style={{ fontSize: 10, fontWeight: 'bold', color: '#8FB9C4' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
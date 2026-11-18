/**
 * Tratador do widget: o Android chama esta função quando o widget é adicionado,
 * redimensionado ou precisa se atualizar. Ela lê os dados salvos e desenha o widget.
 */

import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { NearestPlaceWidget } from './NearestPlaceWidget';
import { loadWidgetData } from './widget-data';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await loadWidgetData();
      props.renderWidget(
        <NearestPlaceWidget
          place={data.place}
          distance={data.distance}
          width={props.widgetInfo.width}
          height={props.widgetInfo.height}
        />
      );
      break;
    }
    default:
      break;
  }
}
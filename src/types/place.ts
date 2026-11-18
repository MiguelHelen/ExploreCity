/**
 * Molde dos dados do ExploreCity.
 * Descreve como um ponto turístico deve ser escrito no arquivo places.json.
 */

// As três categorias do app. Se quiser criar uma nova no futuro, comece por aqui.
export type Category = 'museum' | 'park' | 'monument';

// Um ponto turístico.
export interface Place {
  id: string; // identificador único, ex.: "masp"
  name: string; // nome exibido no app
  category: Category; // museu, parque ou monumento
  description: string; // descrição histórica
  curiosity: string; // curiosidade (usada nas notificações e no "agite")
  latitude: number; // posição norte-sul no mapa
  longitude: number; // posição leste-oeste no mapa
  image: string; // nome do arquivo da foto em assets/images/places
}
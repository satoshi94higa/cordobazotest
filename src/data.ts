/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NiloPoint {
  id: string;
  order: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  historicalPhoto: string;
  currentPhoto: string;
}

// Datos del proyecto El NILO
export const NILO_POINTS: NiloPoint[] = [
  {
    "id": "1",
    "order": 1,
    "title": "Av. Vélez Sarsfield y Blvd. San Juan",
    "description": "La Guardia de Caballería de la Policía de Córdoba se enfrenta a manifestantes frente a la Casa Radical.",
    "lat": -31.42042516618635,
    "lng": -64.18905719044096,
    "historicalPhoto": "/fotos/AS-137.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "2",
    "order": 2,
    "title": "Av. Vélez Sarsfield",
    "description": "La Guardia de Caballería hacia la Plaza Vélez Sarsfield.",
    "lat": -31.42180272405577,
    "lng": -64.18950658733263,
    "historicalPhoto": "/fotos/AS-090.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "3",
    "order": 3,
    "title": "Blvd. San Juan y Cañada",
    "description": "Manifestante lanza piedra contra la Policía. A tres cuadras, en Arturo M. Bas y San Juan, es asesinado el delegado de SMATA Maximiliano Mena.",
    "lat": -31.419970255551757,
    "lng": -64.18983391955626,
    "historicalPhoto": "/fotos/AS-185.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "4",
    "order": 4,
    "title": "Blvd. San Juan y Obispo Trejo",
    "description": "Manifestantes arman una barricada sobre el boulevard con chapas y materiales de construcción de obras cercanas. El Arzobispado se puede observar en el fondo.",
    "lat": -31.42069510460032,
    "lng": -64.18748357313221,
    "historicalPhoto": "/fotos/AS-048.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "5",
    "order": 5,
    "title": "Obispo Trejo",
    "description": "Manifestantes sacan una chapa de cerramiento de una obra. Al fondo se ve la torre del Colegio Monserrat.",
    "lat": -31.42038784493884,
    "lng": -64.18738374049549,
    "historicalPhoto": "/fotos/AS-047.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "6",
    "order": 6,
    "title": "Planta de Renault",
    "description": "Los trabajadores de Renault, nucleados en SMATA, se concentran en la salida de la Planta de Santa Isabel para marchar hacia el Centro desde la Ruta Provincial 5.",
    "lat": -31.47264414268566,
    "lng": -64.23916501396913,
    "historicalPhoto": "/fotos/AS-095.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "7",
    "order": 7,
    "title": "Av. Colón y Urquiza",
    "description": "Manifestantes incendian el local de la empresa estadounidense Xerox.",
    "lat": -31.41071713240025,
    "lng": -64.19267246841827,
    "historicalPhoto": "/fotos/AS-085.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "8",
    "order": 8,
    "title": "Avellaneda y Santa Rosa",
    "description": "Manifestantes armaron varias barricadas para impedir el avance de las Fuerzas Armadas y la Policías. Utilizaron Citroën 2CV incendiados de una concesionaria de avenida Colón.",
    "lat": -31.408873263281304,
    "lng": -64.1948666548339,
    "historicalPhoto": "/fotos/AS-077.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "9",
    "order": 9,
    "title": "Av. Colón 800",
    "description": "Citroën 2CV quemados. Estos vehículos fueron sacados de la concecionaria ubicada en avenida Colón, a una cuadra de Plaza Colón. En el fondo, se puede observar la Iglesia María Auxiliadora.",
    "lat": -31.41024124727004,
    "lng": -64.19457807323579,
    "historicalPhoto": "/fotos/AS-086.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "10",
    "order": 10,
    "title": "La Rioja y Rodríguez Peña",
    "description": "Las Fuerzas Armadas ingresan a la ciudad de Córdoba durante la tarde del 29 de mayo de 1969.",
    "lat": -31.40738173372145,
    "lng": -64.19582241128795,
    "historicalPhoto": "/fotos/AS-009.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "11",
    "order": 11,
    "title": "Avellaneda y La Rioja",
    "description": "Las Fuerzas Armadas ingresan a la ciudad de Córdoba durante la tarde del 29 de mayo de 1969.",
    "lat": -31.4077921327911,
    "lng": -64.19449054218116,
    "historicalPhoto": "/fotos/AS-053.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "12",
    "order": 12,
    "title": "Av. Colón y Tucumán",
    "description": "Los vehículos de las Fuerzas Armadas llegan al centro de la ciudad y despejan la zona. Estacionan frente al Cinerama",
    "lat": -31.41239726343689,
    "lng": -64.18719120549778,
    "historicalPhoto": "/fotos/AS-122.jpg",
    "currentPhoto": "/fotos/"
  },
  {
    "id": "13",
    "order": 13,
    "title": "Av. General Paz y Av. Colón",
    "description": "Soldados realizan un control a un hombrte y una mujer en motocicleta. Al fondo a la izquierda se puede ver la sede cordobesa de Radio Nacional.",
    "lat": -31.412400875092505,
    "lng": -64.18550644737309,
    "historicalPhoto": "/fotos/AS-146.jpg",
    "currentPhoto": "/fotos/"
  }
];

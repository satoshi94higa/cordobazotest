/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CordobazoPoint {
  id: string;
  order: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  historicalPhoto: string;
  currentPhoto: string;
}

// Datos de ejemplo basados en puntos históricos del Cordobazo
export const CORDOBAZO_POINTS: CordobazoPoint[] = [
  {
    id: "1",
    order: 1,
    title: "Avenida Colón y Rodríguez Peña",
    description: "Las Fuerzas Armadas se agrupan sobre la Plaza Colón mientras transeúntes observan el escenario.",
    lat: -31.409701016652246,
    lng: -64.19666307456328,
    historicalPhoto: "/fotos/AS-012.jpg",
    currentPhoto: "/fotos/Captura de pantalla 2026-05-08 170535.png"
  },
  {
    id: "2",
    order: 2,
    title: "Obispo Trejo y Bv. San Juan",
    description: "Dos manifestantes sacan unas chapas de una obra para hacer una barricada sobre la calle Obispo Trejo. A lo lejos, se ve torre del Monserrat.",
    lat: -31.42038784493884,
    lng: -64.18738374049549,
    historicalPhoto: "/fotos/AS-047.jpg",
    currentPhoto: "/fotos/Captura de pantalla 2026-05-08 171050.png"
  },
  {
    id: "3",
    order: 3,
    title: "Obispo Trejo y Bv. San Juan (II)",
    description: "Manifestantes forman una barricada sobre el boulevard. A lo lejos se ve el Arzobispado de Córdoba.",
    lat: -31.42069510460032,
    lng: -64.18748357313221,
    historicalPhoto: "/fotos/AS-048.jpg",
    currentPhoto: "/fotos/Captura de pantalla 2026-05-08 171234.png"
  },
  {
    id: "4",
    order: 4,
    title: "Avellaneda",
    description: "Protestantes quemaron y formaron una barrera con dos Citroen 2CV. Los vehículos posiblemente fueron sacados de una concesionaria sobre avenida Colón.",
    lat: -31.408873263281304,
    lng: -64.1948666548339,
    historicalPhoto: "/fotos/AS-077.jpg",
    currentPhoto: "/fotos/Captura de pantalla 2026-05-08 171556.png"
  },
  {
    id: "5",
    order: 5,
    title: "Bv. San Juan y Simón Bolivar",
    description: "Vehículos incendiados forman una barrera. Detrás se puede apreciar el Instituto Nuestra Señora de Nieva.",
    lat: -31.419080400848024,
    lng: -64.19252801280008,
    historicalPhoto: "/fotos/AS-082.jpg",
    currentPhoto: "/fotos/Captura de pantalla 2026-05-08 171832.png"
  },
  {
    id: "6",
    order: 6,
    title: "Punto 6",
    description: "Escena histórica del Cordobazo.",
    lat: -31.41071713240025,
    lng: -64.19267246841827,
    historicalPhoto: "/fotos/AS-085.jpg",
    currentPhoto: ""
  },
  {
    id: "7",
    order: 7,
    title: "Punto 7",
    description: "Escena histórica del Cordobazo.",
    lat: -31.409929774817286,
    lng: -64.19522815036885,
    historicalPhoto: "/fotos/AS-088.jpg",
    currentPhoto: ""
  },
  {
    id: "8",
    order: 8,
    title: "Punto 8",
    description: "Escena histórica del Cordobazo.",
    lat: -31.422245894597303,
    lng: -64.18965950700185,
    historicalPhoto: "/fotos/AS-090.jpg",
    currentPhoto: ""
  },
  {
    id: "9",
    order: 9,
    title: "Punto 9",
    description: "Escena histórica del Cordobazo.",
    lat: -31.422401536869522,
    lng: -64.18976143093933,
    historicalPhoto: "/fotos/AS-092.jpg",
    currentPhoto: ""
  },
  {
    id: "10",
    order: 10,
    title: "Punto 10",
    description: "Escena histórica del Cordobazo.",
    lat: -31.47264414268566,
    lng: -64.23916501396913,
    historicalPhoto: "/fotos/AS-096.jpg",
    currentPhoto: ""
  },
  {
    id: "11",
    order: 11,
    title: "Punto 11",
    description: "Escena histórica del Cordobazo.",
    lat: -31.41239726343689,
    lng: -64.18719120549778,
    historicalPhoto: "/fotos/AS-122.jpg",
    currentPhoto: ""
  },
  {
    id: "12",
    order: 12,
    title: "Punto 12",
    description: "Escena histórica del Cordobazo.",
    lat: -31.419771548701117,
    lng: -64.18997429619772,
    historicalPhoto: "/fotos/AS-130.jpg",
    currentPhoto: ""
  },
  {
    id: "13",
    order: 13,
    title: "Punto 13",
    description: "Escena histórica del Cordobazo.",
    lat: -31.42042516618635,
    lng: -64.18905719044096,
    historicalPhoto: "/fotos/AS-137.jpg",
    currentPhoto: ""
  },
  {
    id: "14",
    order: 14,
    title: "Punto 14",
    description: "Escena histórica del Cordobazo.",
    lat: -31.412653466557398,
    lng: -64.18563543269703,
    historicalPhoto: "/fotos/AS_146.jpg",
    currentPhoto: ""
  },
  {
    id: "15",
    order: 15,
    title: "Punto 15",
    description: "Escena histórica del Cordobazo.",
    lat: -31.413046573685328,
    lng: -64.18525669068276,
    historicalPhoto: "/fotos/AS_148.jpg",
    currentPhoto: ""
  },
  {
    id: "16",
    order: 16,
    title: "Punto 16",
    description: "Escena histórica del Cordobazo.",
    lat: -31.419970255551757,
    lng: -64.18983391955626,
    historicalPhoto: "/fotos/AS-185.jpg",
    currentPhoto: ""
  }
];

# Instrucciones para Integrar tus Datos de QGIS

Este mapa está diseñado para ser alimentado fácilmente con tus datos de QGIS.

## 1. Exportación desde QGIS
Cuando exportes tu capa de puntos desde QGIS a CSV, asegúrate de que las columnas tengan estos nombres (o cámbialos en el CSV):
- `title`: El nombre del lugar.
- `description`: El texto breve sobre el Cordobazo.
- `lat`: La latitud (-31.xxxx).
- `lng`: La longitud (-64.xxxx).
- `historicalPhoto`: El nombre del archivo de la foto histórica (ej: `punto1_1969.jpg`).
- `currentPhoto`: El nombre del archivo de la foto actual (ej: `punto1_2024.jpg`).

## 2. Gestión de Fotos
1. Crea una carpeta llamada `fotos` dentro de la carpeta `public` de este proyecto.
2. Copia todas tus fotos allí.
3. En el archivo `data.ts`, las rutas a las fotos serán `/fotos/nombre_de_tu_foto.jpg`.

## 3. Actualización de Datos
Abre el archivo `src/data.ts` y reemplaza el contenido de `CORDOBAZO_POINTS` con tus datos. Puedes convertir tu CSV a JSON fácilmente online y pegarlo ahí.

## 4. Uso Offline
Para que funcione totalmente offline (sin internet):
1. Este servidor (Node.js) debe estar corriendo en la máquina local de la muestra.
2. Los mapas de OpenStreetMap (Tiles) normalmente se descargan de internet. Para uso offline estricto, necesitarías descargar los "Tiles" de Córdoba y servirlos localmente, cambiando la URL en `LeafletMap.tsx`.

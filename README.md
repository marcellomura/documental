# CONTEXTO · "13 CEROS"

Documental animado estilo explainer (tipo Vox, pero argentino) sobre **por qué los argentinos confían más en el dólar que en su propia moneda**. Dura 5:58, en 1080p30, con narración en voz argentina.

## Entregables (`entrega/`)

| Archivo | Qué es |
|---|---|
| `13_ceros_documental_1080p.mp4` | Video final (H.264 + AAC, −14 LUFS, listo para YouTube) |
| `13_ceros_miniatura.png` | Miniatura 1280×720 |
| `13_ceros_subtitulos_es.srt` | Subtítulos en español, sincronizados por palabra |
| `descripcion_youtube.md` | Títulos sugeridos, descripción, capítulos, fuentes y créditos |

## Cómo está hecho

1. **Guion** (`guion/segmentos.json`): 12 segmentos, con datos chequeados (INDEC, BCRA, prensa).
2. **Voz**: ElevenLabs, voz "Carlos Pro – Argentinian Documentary & Radio", modelo `eleven_multilingual_v2`.
3. **Audio** (`tools/proc_audio.py`): recorte de pausas, +10 % de velocidad, compresión.
4. **Sincronía** (`tools/align.py`): tiempos por palabra con faster-whisper, alineados al guion (`video/src/data/words.json`).
5. **Línea de tiempo** (`tools/timeline.py`): dónde arranca cada segmento.
6. **Animación** (`video/`, Remotion + React): cada animación se dispara con la palabra exacta que dice el narrador (`cue(segmento, "palabra")`).
7. **Mezcla** (`tools/mix.py`): narración, 3 pistas de ElevenLabs Music con ducking automático bajo la voz, y ~120 efectos de sonido sincronizados. Normalizada a −14 LUFS.
8. **Imágenes**: fotos de archivo de Wikimedia Commons con licencias libres (`tools/getfiles.py`, créditos en `video/public/img/creditos.json`).

## Regenerar

```bash
pip install faster-whisper numpy pillow        # + ffmpeg
python3 tools/proc_audio.py && python3 tools/align.py && python3 tools/timeline.py
python3 tools/mix.py                           # -> audio/mix/mezcla.wav
cd video && npm install
npx remotion render Documental out/documental_video.mp4 --muted --crf=16
npx remotion still Miniatura ../entrega/13_ceros_miniatura.png
# mux final
ffmpeg -i out/documental_video.mp4 -i ../audio/mix/mezcla.wav -c:v libx264 -preset slow -b:v 1.9M -pass 1 ...
```

Para ver y editar el video en vivo: `cd video && npx remotion studio`.

---

# Episodio 2 · "EL ROBO DEL SIGLO"

El robo al Banco Río de Acassuso (13/01/2006), contado como un disco de rock: cada capítulo es un **track** que entra con una tarjeta de vinilo, la música cambia en cada tema y la estética es de fanzine, con letras recortadas de nota de rescate, fotocopia y trama de puntos. Dura 5:33, en 1080p30.

| Archivo (`entrega/`) | Qué es |
|---|---|
| `el_robo_del_siglo_1080p.mp4` | Video final (H.264 + AAC, −14 LUFS) |
| `el_robo_del_siglo_subtitulos_es.srt` | Subtítulos en español |
| `el_robo_del_siglo_descripcion_youtube.md` | Títulos, descripción, capítulos, fuentes, créditos y configuración de subida |
| `el_robo_del_siglo_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura para A/B, más la miniatura vertical |

- Guion: `guion/ep02_robo_del_siglo.json` · Escenas: `video/src/ep02/` (composición `RoboDelSiglo`)
- Música: Kevin MacLeod (incompetech.com), CC BY 4.0, y ElevenLabs Music. Efectos: ElevenLabs.

```bash
EP=ep02 NSEG=11 TEMPO=1.10 python3 tools/proc_audio.py
EP=ep02 GUION=ep02_robo_del_siglo.json python3 tools/align.py
python3 tools/timeline_ep02.py && python3 tools/mix_ep02.py      # -> audio/mix/mezcla_ep02.wav
EP=ep02 OUT=el_robo_del_siglo_subtitulos_es.srt python3 tools/srt.py
cd video && npx remotion render RoboDelSiglo out/ep02_muted.mp4 --muted --crf=16 && cd ..
IN=video/out/ep02_muted.mp4 AUD=audio/mix/mezcla_ep02.wav OUT=entrega/el_robo_del_siglo_1080p.mp4 TITLE="EL ROBO DEL SIGLO" VBR=2000k tools/final.sh
```

---

# Episodio 3 · "ARGENTINA Y EL FMI: ¿POR QUÉ SIEMPRE VOLVEMOS?"

Vuelve al estilo de **13 CEROS** (papel, collage, resaltador, gráficos) con fotos y videos reales de archivo. Arranca con el absurdo del día (pagarle al FMI con plata del FMI), explica reservas, deuda y refinanciación con la historia del préstamo de 2018, y cierra con la parte que da bronca. Dura 4:56, en 1080p30.

| Archivo (`entrega/`) | Qué es |
|---|---|
| `argentina_y_el_fmi_1080p.mp4` | Video final (H.264 + AAC, −14 LUFS) |
| `argentina_y_el_fmi_subtitulos_es.srt` | Subtítulos en español, con cifras |
| `argentina_y_el_fmi_descripcion_youtube.md` | Títulos, descripción, capítulos, fuentes, créditos y configuración de subida |
| `argentina_y_el_fmi_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura para A/B, la miniatura vertical y los textos para TikTok |

- Guion: `guion/ep03_fmi.json` · Escenas: `video/src/ep03/` (composición `Fmi`)
- Música original (3 temas) y efectos: ElevenLabs. Fotos y videos: Wikimedia Commons (`video/public/img/ep03/creditos.json`).

```bash
EP=ep03 NSEG=10 TEMPO=1.10 python3 tools/proc_audio.py
EP=ep03 GUION=ep03_fmi.json python3 tools/align.py
python3 tools/timeline_ep03.py && python3 tools/mix_ep03.py       # -> audio/mix/mezcla_ep03.wav
EP=ep03 OUT=argentina_y_el_fmi_subtitulos_es.srt python3 tools/srt.py
cd video && npx remotion render Fmi out/ep03_muted.mp4 --muted --crf=16 && cd ..
IN=video/out/ep03_muted.mp4 AUD=audio/mix/mezcla_ep03.wav OUT=entrega/argentina_y_el_fmi_1080p.mp4 TITLE="ARGENTINA Y EL FMI" VBR=2200k tools/final.sh
```

---

# Episodio 4 · "SÚPER NIÑO"

Qué es El Niño, por qué el de 2026 es "súper" y qué le puede pasar a la Argentina. Dura 4:20 y es el primero en **4K** (3840×2160, 30 fps). Todos los mapas y gráficos usan datos reales: NOAA OISST, NOAA CPC, NOAA NCEI, Natural Earth y NASA Blue Marble.

| Archivo (`entrega/`) | Qué es |
|---|---|
| `super_nino_4k.mp4` | Video final en 4K (H.264 + AAC, −14 LUFS). Es el que se sube a YouTube. Está en Git LFS. |
| `super_nino_1080p.mp4` | La misma versión en 1080p, liviana |
| `super_nino_subtitulos_es.srt` | Subtítulos en español, con cifras |
| `super_nino_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos y configuración de subida |
| `super_nino_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura para A/B, la miniatura vertical y los textos para TikTok |
| `super_nino_short_youtube.mp4` | Short vertical para YouTube (0:59, 1080×1920, subtítulos incrustados) |
| `super_nino_short_tiktok.mp4` | Short vertical para TikTok (1:06) |
| `super_nino_shorts_publicacion.md` | Calendario (jueves 8/10), títulos, textos, portadas y configuración de los dos shorts |

- Guion: `guion/ep04_super_nino.json` · Escenas: `video/src/ep04/` (composición `SuperNino`)
  - `globe.tsx`: globo 3D en canvas. Proyecta píxel a píxel la textura real de NASA con la anomalía de NOAA encima.
  - `flatmap.tsx`: mapa del Pacífico con el mapa de calor satelital.
  - `section.tsx`: corte del océano (año normal → El Niño).
  - `charts.tsx`: gráficos con datos de NOAA.
  - `argmap.tsx`: provincias y ríos.
- Datos crudos: `tools/prep_ep04_data.py` los descarga en `data_ep04/`, que no se versiona. Las texturas del globo están en `video/public/ep04/globe/`.
- Música: un tema original nuevo (ElevenLabs) y el tema de tensión del episodio 3. Los efectos de lluvia, viento, trueno y fuego se sintetizan en `tools/mix_ep04.py`.
- Logo nuevo en `video/public/brand/` (fondo oscuro, transparente y recorte del cuadrado).

```bash
EP=ep04 NSEG=10 TEMPO=1.10 python3 tools/proc_audio.py
EP=ep04 GUION=ep04_super_nino.json python3 tools/align.py
python3 tools/timeline_ep04.py && python3 tools/mix_ep04.py       # -> audio/mix/mezcla_ep04.wav
EP=ep04 OUT=super_nino_subtitulos_es.srt python3 tools/srt.py
cd video && npx remotion render SuperNino out/ep04_4k_muted.mp4 --muted --scale=2 --props='{"dpr":2}' --crf=15 && cd ..
IN=video/out/ep04_4k_muted.mp4 AUD=audio/mix/mezcla_ep04.wav OUT=entrega/super_nino_4k.mp4 TITLE="SÚPER NIÑO" VBR=13M MAXRATE=24M BUFSIZE=36M tools/final.sh
IN=video/out/ep04_4k_muted.mp4 AUD=audio/mix/mezcla_ep04.wav OUT=entrega/super_nino_1080p.mp4 TITLE="SÚPER NIÑO" VBR=2600k VF=scale=1920:1080:flags=lanczos tools/final.sh
# shorts (tools/shorts_ep04.py recorta la narración y mezcla; composiciones ShortNinoYT y ShortNinoTT)
python3 tools/shorts_ep04.py
cd video && npx remotion render ShortNinoYT out/short4_yt_muted.mp4 --muted --crf=15 && npx remotion render ShortNinoTT out/short4_tt_muted.mp4 --muted --crf=15 && cd ..
IN=video/out/short4_yt_muted.mp4 AUD=audio/mix/mezcla_short4_yt.wav OUT=entrega/super_nino_short_youtube.mp4 TITLE="SÚPER NIÑO (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
IN=video/out/short4_tt_muted.mp4 AUD=audio/mix/mezcla_short4_tt.wav OUT=entrega/super_nino_short_tiktok.mp4 TITLE="SÚPER NIÑO (TikTok)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
```

# Episodio 5 · "TU RELOJ ESTÁ MAL"

Por qué la Argentina vive una hora adelantada (dos en la cordillera): la hora del sol, 1894 y el Observatorio de Córdoba, la hora de Brasilia, 1930-1970, el caos de 1974, 2008 y San Luis 2009, el jet lag social, los fans de la hora adelantada y el proyecto de 2025 que el Senado nunca votó. Dura 4:40.

| Archivo (`entrega/`) | Qué es |
|---|---|
| `tu_reloj_esta_mal_1080p.mp4` | Video final en 1080p (H.264 + AAC, −14 LUFS), sacado del render 4K. Va en git normal porque el 4K no entra en el cupo de Git LFS. |
| `tu_reloj_esta_mal_subtitulos_es.srt` | Subtítulos en español, con cifras |
| `tu_reloj_esta_mal_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos y configuración de subida |
| `tu_reloj_esta_mal_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura para A/B, la miniatura vertical y los textos para TikTok |

- Guion: `guion/ep05_reloj.json` · Escenas: `video/src/ep05/` (composición `Reloj`)
  - `globe5.tsx`: globo con día y noche reales. Mezcla NASA Blue Marble y Black Marble según la posición del Sol para cada fecha y hora.
  - `art5.tsx`: piezas 3D. Incluye el reloj de paletas, el reloj analógico en capas, la trayectoria del Sol, el mapa de la Argentina que se levanta según las horas de adelanto y la transición de aguja de reloj.
  - `scenes5a.tsx` y `scenes5b.tsx`: las 10 escenas y la pantalla final.
- Datos del Sol: `video/src/data/ep05/ciudades.json`, calculado con astral (fórmulas de la NOAA).
- Música: tres temas originales de ElevenLabs (`video/public/ep05/music/`). Efectos de ElevenLabs: despertador, tren, campanada y gallo. El tic-tac, las hojas de calendario y el avión se sintetizan en `tools/sfx_synth.py`.

```bash
EP=ep05 NSEG=10 TEMPO=1.10 python3 tools/proc_audio.py
EP=ep05 GUION=ep05_reloj.json python3 tools/align.py
python3 tools/timeline_ep05.py && python3 tools/mix_ep05.py       # -> audio/mix/mezcla_ep05.wav
EP=ep05 OUT=tu_reloj_esta_mal_subtitulos_es.srt python3 tools/srt.py
cd video && npx remotion render Reloj out/ep05_4k_muted.mp4 --muted --scale=2 --props='{"dpr":2}' --crf=15 && cd ..
IN=video/out/ep05_4k_muted.mp4 AUD=audio/mix/mezcla_ep05.wav OUT=entrega/tu_reloj_esta_mal_1080p.mp4 TITLE="TU RELOJ ESTÁ MAL" VBR=2600k VF=scale=1920:1080:flags=lanczos tools/final.sh
```

### Short, Reel y TikTok (octubre de 2026)

Tres versiones del mismo corto vertical (1080×1920, 1:15–1:16, subtítulos incrustados, −14 LUFS), en `entrega/` y en Drive. Están en la carpeta `CONTEXTO/Ep5 · Tu reloj está mal` (id `1pHe9G-0pln8FFn3qYIH5uLeHT03jJryD`), junto al master 4K (`195hiRVpfhYSnTnTJrYheRMoWyeyeos9p`).

- YouTube Shorts: archivo `1JAwNryw7Vve9VUBsro-DmPsg0SWNf_uc`, md5 `0b5a5391958ba0ae4178e8e528620e47`.
- Reel: archivo `1zO63MSvtGiI40-SLX96kQXdEAHy97FB3`, md5 `25460f9e8608e9fff3be8e3a74a215ee`.
- TikTok: archivo `1tF-i8rZds6AZv94HD0DT8w3GYdXq7QFe`, md5 `7647a622e983a488f7ac3a408f69d011`.

La página de publicación con botones de copiar (títulos y miniaturas A/B del video largo, y textos y portadas de los cortos) se arma con `python3 tools/pagina_publicacion_ep05.py tools/pagina_publicacion_ep05_ids.json salida.html`, a partir de los `.md` de `entrega/`.

| Archivo | Plataforma | Cierre |
|---|---|---|
| `tu_reloj_esta_mal_short_youtube.mp4` | YouTube Shorts | «Tocá el enlace de acá abajo» |
| `tu_reloj_esta_mal_reel_instagram.mp4` | Reels | «El link está en la bio» |
| `tu_reloj_esta_mal_tiktok.mp4` | TikTok | «Buscá CONTEXTO en YouTube» |

- Guía de publicación (títulos, textos, portadas, configuración y calendario de cada plataforma): `entrega/tu_reloj_esta_mal_cortos_publicacion.md`.
- **Narración:** tramos de la narración original:
  - el gancho completo
  - "¿Y cuál usamos? Menos tres…"
  - "tu cuerpo no lee el reloj"
  - el jet lag social
  - la pregunta
- **Cierres:** se generaron aparte con la misma voz y el mismo modelo del episodio (Carlos Pro, `eleven_multilingual_v2`). Guion en `guion/ep05_short_x.json`; audio en `audio/ep05/short/final/x01–x03.wav`, procesado como la narración (tempo 1,10).
- **Escenas:** `video/src/ep05/short5.tsx`, composiciones `ShortRelojYT`, `ShortRelojIG` y `ShortRelojTT` (entrada `src/index05s.tsx`). Reusa:
  - el globo con día y noche reales
  - los relojes 3D
  - la escuela a oscuras
  - la transición de aguja de reloj, en versión vertical
- **Render:** el cuerpo es igual en las tres hasta la transición al cierre, así que se renderiza una vez y cada cierre aparte; `tools/final.sh` los une con `PATCH`. Usa una carpeta `public` reducida y un bundle propio, para no chocar con los renders por tramos que borran `/tmp/remotion-webpack-bundle-*`.

```bash
python3 tools/short_ep05.py                       # línea de tiempo y las tres mezclas
PUB=<public reducida: ep05/globe, fonts, brand, tex> BUNDLE=<carpeta del bundle> tools/render_short05.sh
```

---

# Episodio 8 · "LA PARADOJA DE LA CARNE"

En el repo figura como `ep06` (carpetas y archivos), pero en el canal es el **Episodio 8**: el Ep6 (¿Argentina fue el país más rico del mundo?) y el Ep7 (Messi) se hicieron en otras sesiones.

Por qué la carne es tan cara en un país con más vacas que personas y por qué ya comemos más pollo que carne vacuna. Sigue un kilo de carne del campo a la mesa, eslabón por eslabón (cría, engorde, frigorífico, carnicería e impuestos), con el reparto de FADA (abril de 2026). Dura 5:51 y es el primero con **3D real** (three.js).

| Archivo | Qué es |
|---|---|
| `la_paradoja_de_la_carne_1440p.mp4` | Master final en 2560×1440 (H.264 + AAC, −14 LUFS). No va en git (pesa demasiado): está en Drive, en `CONTEXTO/Ep8 · La paradoja de la carne` |
| `entrega/la_paradoja_de_la_carne_short.mp4` | Short vertical para YouTube (1:10, 1080×1920, subtítulos incrustados) que manda al video largo |
| `entrega/la_paradoja_de_la_carne_subtitulos_es.srt` | Subtítulos en español, con cifras |
| `entrega/la_paradoja_de_la_carne_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos y configuración de subida |
| `entrega/la_paradoja_de_la_carne_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura (GPT Image 2.1) para A/B, más la vertical |
| `entrega/la_paradoja_de_la_carne_short_publicacion.md` | Cómo publicar el short y enlazarlo al video |

- Guion: `guion/ep06_carne.json` (el s08 se corrigió con el precio de exportación verificado: +27,5 % interanual) · Escenas: `video/src/ep06/` (composición `Carne`)
  - `three6.tsx`: 3D real con three.js y `@remotion/three`. El bloque de 100 cubos (cada uno, $1), las torres de bandejas de carne, la balanza, el diorama del viaje (molino, feedlot, frigorífico, carnicería, parrilla y peajes del Estado) y el globo con las rutas de exportación.
  - `kit6.tsx`: el ticket térmico, la escalera de precios, el corte de cuchilla como transición, el archivo a pantalla completa y los pictogramas.
  - `scenes6a.tsx` y `scenes6b.tsx`: las 10 escenas y la pantalla final. `short6.tsx`: el short vertical.
- Archivo real: fotos de Wikimedia Commons (`video/public/ep06/creditos.json`) y videos (`video/public/ep06/vid/creditos.json`): feedlot con dron, "A Mark of Wholesome Meat" (USDA, 1964), pastizales y granja avícola.
- Música: dos temas originales de ElevenLabs (cadena y bronca). Efectos de ElevenLabs: cuchilla, chisporroteo, mugido e impresora de tickets. El fuego se sintetiza en `tools/sfx_synth.py`.
- El 3D se renderiza con WebGL por software (`--gl=swangle`), así que el render completo tarda bastante más que los episodios anteriores.

```bash
EP=ep06 NSEG=10 TEMPO=1.10 python3 tools/proc_audio.py
EP=ep06 GUION=ep06_carne.json python3 tools/align.py
python3 tools/timeline_ep06.py && python3 tools/mix_ep06.py        # -> audio/mix/mezcla_ep06.wav
EP=ep06 OUT=la_paradoja_de_la_carne_subtitulos_es.srt python3 tools/srt.py
tools/render_ep06.sh                                               # -> video/out/ep06_1440_muted.mp4 (por tramos)
IN=video/out/ep06_1440_muted.mp4 AUD=audio/mix/mezcla_ep06.wav OUT=video/out/la_paradoja_de_la_carne_1440p.mp4 TITLE="LA PARADOJA DE LA CARNE" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final.sh
rclone copy video/out/la_paradoja_de_la_carne_1440p.mp4 "gdrive:CONTEXTO/Ep8 · La paradoja de la carne"
# short (tools/short_ep06.py recorta la narración, alinea el cierre y mezcla; composición ShortCarne en src/index6s.tsx)
python3 tools/short_ep06.py
cd video && npx remotion render src/index6s.tsx ShortCarne out/short6_muted.mp4 --muted --gl=swangle --crf=15 && cd ..
IN=video/out/short6_muted.mp4 AUD=audio/mix/mezcla_short6.wav OUT=entrega/la_paradoja_de_la_carne_short.mp4 TITLE="LA PARADOJA DE LA CARNE (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
```

# Episodio 9 · "VACA MUERTA: EL TESORO Y LA TRAMPA"

En el repo figura como `ep09`. La Argentina produce petróleo récord (936.800 barriles por día en agosto de 2026) y el crudo ya es lo que más exporta, pero la nafta subió casi 20 % desde la guerra en Medio Oriente. El video baja tres kilómetros bajo el desierto de Neuquén y 145 millones de años atrás para explicar qué es Vaca Muerta, cómo funciona el fracking y cuánto hay. Después cuenta las tres trampas (los caños, la nafta al precio del mundo y la enfermedad holandesa) y compara con Arabia Saudita, Venezuela y Noruega. Dura 6:00.

| Archivo | Qué es |
|---|---|
| `vaca_muerta_1440p.mp4` | Master final en 2560×1440 (H.264 + AAC, −14 LUFS). No va en git: está en Drive, en `CONTEXTO/Ep9 · Vaca Muerta` |
| `entrega/vaca_muerta_short.mp4` | Short vertical para YouTube (1:17, 1080×1920, subtítulos incrustados) que manda al video largo |
| `entrega/vaca_muerta_subtitulos_es.srt` | Subtítulos en español, con cifras |
| `entrega/vaca_muerta_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos y configuración de subida |
| `entrega/vaca_muerta_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura (GPT Image 2.1) para A/B, más la vertical |
| `entrega/vaca_muerta_short_publicacion.md` | Cómo publicar el short y enlazarlo al video |

- Guion: `guion/ep09_vaca_muerta.json` · Escenas: `video/src/ep09/` (composición `Vaca`)
  - `three9.tsx`: el bloque geológico en corte (mar jurásico con plancton, capas que se depositan, barro que se vuelve roca, calor y presión, gotas de petróleo, el pozo que baja 3 km y dobla, las cinco etapas de fractura y el petróleo que sube), el mapa 3D con las provincias reales extruidas (Natural Earth), el área de la formación, los 4.700 pozos, Tucumán a escala y el oleoducto VMOS hasta Punta Colorada, los barriles instanciados y el litro de nafta.
  - `kit9.tsx`: la transición de crudo que sube, los sellos de "TRAMPA", el display del surtidor, los rankings y la pantalla partida.
  - `scenes9a.tsx` y `scenes9b.tsx`: las 10 escenas y la pantalla final. `short9.tsx`: el short vertical (entrada `src/index9s.tsx`).
- Archivo real: fotos de Wikimedia Commons (`video/public/ep09/creditos.json`) y videos (`video/public/ep09/vid/creditos.json`): el bloqueo de petroleros en el golfo de Omán (CENTCOM, 2026), bombas de petróleo y petroleros frente a California.
- Datos: `video/src/data/ep09/provincias.json` (límites simplificados de Natural Earth). El área de Vaca Muerta es un contorno aproximado de 30.000 km².
- Música: dos temas originales de ElevenLabs (el tesoro y las trampas). Efectos de ElevenLabs: perforación, mar, fractura, bocina de barco, bomba de petróleo y surtidor.

```bash
EP=ep09 NSEG=10 TEMPO=1.14 python3 tools/proc_audio.py
EP=ep09 GUION=ep09_vaca_muerta.json python3 tools/align.py
python3 tools/timeline_ep09.py && python3 tools/mix_ep09.py        # -> audio/mix/mezcla_ep09.wav
EP=ep09 OUT=vaca_muerta_subtitulos_es.srt python3 tools/srt.py
tools/render_ep09.sh                                               # -> video/out/ep09_1440_muted.mp4 (por tramos)
IN=video/out/ep09_1440_muted.mp4 AUD=audio/mix/mezcla_ep09.wav OUT=video/out/vaca_muerta_1440p.mp4 TITLE="VACA MUERTA: EL TESORO Y LA TRAMPA" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final.sh
rclone copy video/out/vaca_muerta_1440p.mp4 "gdrive:CONTEXTO/Ep9 · Vaca Muerta"
# short
python3 tools/short_ep09.py
cd video && npx remotion render src/index9s.tsx ShortVaca out/short9_muted.mp4 --muted --gl=swangle --crf=15 && cd ..
IN=video/out/short9_muted.mp4 AUD=audio/mix/mezcla_short9.wav OUT=entrega/vaca_muerta_short.mp4 TITLE="VACA MUERTA (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
```

# Episodio 10 · "EL CUADRO DEL NAZI"

En el repo figura como `ep10`. En agosto de 2025, un periodista holandés reconoció en las fotos de un aviso inmobiliario de Mar del Plata un retrato que los nazis robaron en Ámsterdam en 1940. El video sigue el cuadro desde la galería de Jacques Goudstikker (que murió escapando en un barco con su inventario en el bolsillo) hasta Göring y su hombre de confianza, Friedrich Kadgien, «la Serpiente». Recorre las rutas de las ratas, la Argentina de Perón y los peores criminales que se escondieron acá (Eichmann, Mengele, Priebke). Después cuenta la investigación del diario AD, el allanamiento (y el tapiz de caballos) y la primera devolución de una obra robada por los nazis que hace la Justicia argentina (septiembre de 2026). Cierra con el segundo cuadro, que sigue sin aparecer. Dura 6:26.

| Archivo | Qué es |
|---|---|
| `el_cuadro_del_nazi_1440p.mp4` | Master final en 2560×1440 (H.264 + AAC, −14 LUFS). No va en git: está en Drive, en `CONTEXTO/Ep10 · El cuadro del nazi` |
| `entrega/el_cuadro_del_nazi_short.mp4` | Short vertical para YouTube (1:24, 1080×1920, subtítulos incrustados) que manda al video largo |
| `entrega/el_cuadro_del_nazi_subtitulos_es.srt` | Subtítulos en español, con los nombres bien escritos y las cifras |
| `entrega/el_cuadro_del_nazi_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos y configuración de subida |
| `entrega/el_cuadro_del_nazi_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura (GPT Image 2.1) para A/B, más la vertical |
| `entrega/el_cuadro_del_nazi_short_publicacion.md` | Cómo publicar el short y enlazarlo al video |

- Guion: `guion/ep10_cuadro_nazi.json`. La locución usa grafías fonéticas para los nombres propios ("Gáutstiker", "Áijman", "ese ese"), y el mapa `display` del guion devuelve la grafía real en los subtítulos y en `video/src/data/ep10/words.json` (lo aplica `tools/timeline_ep10.py`).
- Verificación de la locución: `tools/check_voz.py` transcribe cada segmento con whisper y lo compara con el guion. Se probó además sin el guion como pista, para confirmar que los nombres se reconocen solos.
- Escenas: `video/src/ep10/` (composición `Cuadro`)
  - `three10.tsx`: el living con el sillón de terciopelo verde y el retrato (que se cambia por el tapiz de caballos), el chalet de Mar del Plata de noche (con el cartel SE VENDE, alguien que se mueve detrás de la ventana y los patrulleros), la cubierta del barco de 1940 con la escotilla, el cuaderno negro con las hojas que pasan, la galería con cientos de cuadros que se llevan, el botín (oro, diamantes, billetes) y el campo de 600 marcos (100 en rojo: los que faltan).
  - `kit10.tsx`: sellos de goma con borde de tinta gastada, fotos de archivo como copias en papel, expediente, máquina de escribir, calendario, año que corre, etiqueta de museo, mapas planos (Natural Earth) con rutas y la transición de diafragma de cámara.
  - `shots10.tsx`: cámaras y tomas 3D, el globo, el celular con el aviso (genérico, sin marca), el tablero de corcho con hilos rojos.
  - `scenes10a.tsx` y `scenes10b.tsx`: las 10 escenas y la pantalla final. `short10.tsx`: el short vertical (entrada `src/index10s.tsx`). `src/index10t.tsx`: banco de pruebas de los decorados 3D.
- Archivo real: fotos de Wikimedia Commons (`video/public/ep10/img/creditos.json`): Goudstikker, Dési, Göring en la galería (1941) y en Rotterdam (1940), tropas alemanas en Ámsterdam, la foto de archivo del cuadro y de la naturaleza muerta de Mignon (RCE), el pasaporte de la Cruz Roja de «Ricardo Klement», Eichmann, Mengele, Priebke, Perón y los Monuments Men.
- Música: tres temas originales de ElevenLabs (misterio, huida y cierre). Efectos de ElevenLabs: timbre, páginas, barco de noche, caída en la bodega, martillo de juez, flash de cámara antigua, botas, aviones, proyector, celular, patrulleros y radio.

```bash
EP=ep10 NSEG=10 TEMPO=1.14 python3 tools/proc_audio.py
EP=ep10 GUION=ep10_cuadro_nazi.json python3 tools/align.py
EP=ep10 GUION=ep10_cuadro_nazi.json SEGS=s01,s02 python3 tools/check_voz.py   # verificar la pronunciación
python3 tools/timeline_ep10.py && python3 tools/mix_ep10.py        # -> audio/mix/mezcla_ep10.wav
EP=ep10 OUT=el_cuadro_del_nazi_subtitulos_es.srt python3 tools/srt.py
tools/render_ep10.sh                                               # -> video/out/ep10/cXX.mp4 (por tramos)
tools/patch_ep10.sh 4 3916 3916 4570                               # (opcional) re-renderiza un fragmento dentro de su tramo
# OJO: no pegar los tramos con "concat -c copy" si alguno se re-renderizó: queda con otra base de tiempo y rango de color
# y el video se congela en esos tramos. final_tramos.sh decodifica cada tramo y los une con el filtro concat.
TRAMOS="video/out/ep10/c*.mp4" AUD=audio/mix/mezcla_ep10.wav OUT=video/out/el_cuadro_del_nazi_1440p.mp4 TITLE="EL CUADRO DEL NAZI" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
python3 tools/check_congelados.py video/out/el_cuadro_del_nazi_1440p.mp4  # falla si hay algún tramo quieto de 6 s o más
rclone copy video/out/el_cuadro_del_nazi_1440p.mp4 "gdrive:CONTEXTO/Ep10 · El cuadro del nazi"
# short
python3 tools/short_ep10.py
cd video && npx remotion render src/index10s.tsx ShortCuadro out/short10_muted.mp4 --muted --gl=swangle --crf=15 && cd ..
IN=video/out/short10_muted.mp4 AUD=audio/mix/mezcla_short10.wav OUT=entrega/el_cuadro_del_nazi_short.mp4 TITLE="EL CUADRO DEL NAZI (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
python3 tools/check_congelados.py entrega/el_cuadro_del_nazi_short.mp4
```

# Episodio 11 · "EL SOL DE PERÓN"

En el repo figura como `ep11`. El 24 de marzo de 1951, Perón anunció que en la isla Huemul (lago Nahuel Huapi, Bariloche) la Argentina había logrado la fusión nuclear controlada, algo que ni Estados Unidos ni la URSS habían conseguido; hasta dijo que la energía se iba a vender "en envases de medio litro, como la leche". El video cuenta quién era Ronald Richter, la ciudad científica de la isla y el reactor de 12 metros que mandó demoler, explica la fusión nuclear de forma simple, muestra cómo José Antonio Balseiro (33 años) desarmó el fraude en 1952 y cierra con el giro: la mentira despertó los programas de fusión de EE. UU. (el stellarator de Spitzer) y de la URSS, y en Bariloche dejó el Instituto Balseiro, INVAP y una industria que hoy exporta reactores. Termina con la fusión hoy (NIF, ITER) y la isla que se abre al público. Dura 7:07.

| Archivo | Qué es |
|---|---|
| `el_sol_de_peron_1440p.mp4` | Master final en 2560×1440 (H.264 + AAC, −14 LUFS, 864 MB, md5 `1f0bc0c2d9627f4d74fe295bd120d3da`). No va en git: está en Drive, en `CONTEXTO/Ep11 · El Sol de Perón` (carpeta `1Vwqy7cytUdf7ufLwYe5R3SNy6t_2QtLH`, archivo `1uUhWpNzx8OQa8Vvn138FkPVaMWjUbAau`) |
| `entrega/el_sol_de_peron_short.mp4` | Short vertical para YouTube (1:10, 1080×1920, subtítulos incrustados) que manda al video largo |
| `entrega/el_sol_de_peron_subtitulos_es.srt` | Subtítulos en español, con los nombres bien escritos y las cifras |
| `entrega/el_sol_de_peron_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos y configuración de subida |
| `entrega/el_sol_de_peron_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura (GPT Image 2.1) para A/B |
| `entrega/el_sol_de_peron_short_publicacion.md` | Cómo publicar el short y enlazarlo al video |

- Guion: `guion/ep11_huemul.json` (11 segmentos + el cierre del short). Grafías fonéticas: "Ríjter", "Spítser", "Prínston", "estelarátor", "Ínvap", "Ársat", "Íter", "Édward Téler"; el mapa `display` devuelve la grafía real (lo aplica `tools/timeline_ep11.py`). La locución se verificó con `tools/check_voz.py` y además sin el guion como pista.
- Control de calidad: cada tramo se revisó con `tools/check_congelados.py` y una hoja de cuadros cada 2 s apenas salía del render; los que tenían pausas de 3 s o más se corrigieron (movimiento lento, barra que crece en vivo, gallina dibujada a mano) y se volvieron a renderizar. El master final no tiene tramos quietos de más de 3 s (solo pausas de lectura de 2–3 s sobre textos).
- Qué mejora respecto del Ep10: mucho más **video de archivo real** (noticiero de 1953 con Perón en el balcón, el noticiero Sucesos Argentinos del Pulqui II, la bomba H Ivy Mike, el láser del NIF, el Sol filmado por la NASA), una estructura en tres actos con ganchos al final de cada parte ("Fin de la historia. O eso parecía"), una encuesta para comentarios a mitad del video y una pregunta al final.
- Escenas: `video/src/ep11/` (composición `Sol`)
  - `three11.tsx`: la isla Huemul en el lago con montañas, bosque, edificios que se levantan, lancha y reflectores militares de noche; el reactor de hormigón de 12 m (cuñas extruidas) con la grieta y la demolición; el Sol con su núcleo; la fusión deuterio + tritio → helio + neutrón; el stellarator de Spitzer (bobinas y plasma retorcido).
  - `kit11.tsx`: película de noticiero (parpadeo, rayas, polvo), cuenta regresiva de película, video de archivo enmarcado con perforaciones, diarios recreados, teletipo, botellas de "energía ½ litro", banderas, termómetro en escala real, osciloscopios, enchufe desconectado, encuesta para comentarios, rótulos y el destello solar como transición.
  - `scenes11a.tsx` (S01–S06) y `scenes11b.tsx` (S07–S11 y la pantalla final). `short11.tsx`: el short vertical (entrada `src/index11s.tsx`).
- Archivo real: fotos de Wikimedia Commons (`video/public/ep11/img/creditos.json`) y videos (`video/public/ep11/vid/creditos.json`, recortados con ffmpeg desde `raw/ep11/vid`). El noticiero del Pulqui II tenía barras negras y una marca de agua arriba a la izquierda: se recorta con `crop=924:520:178:125`.
- Música: tres temas originales de ElevenLabs (era atómica, tensión, legado). Efectos de ElevenLabs: arco eléctrico, contador Geiger, prensa con flashes, jet, explosión termonuclear, zumbido de laboratorio, teletipo, láser, demolición y gallinas.

```bash
EP=ep11 NSEG=11 TEMPO=1.16 python3 tools/proc_audio.py
EP=ep11 GUION=ep11_huemul.json python3 tools/align.py
EP=ep11 GUION=ep11_huemul.json SEGS=s01,s02 python3 tools/check_voz.py   # verificar la pronunciación
python3 tools/timeline_ep11.py && python3 tools/mix_ep11.py        # -> audio/mix/mezcla_ep11.wav
EP=ep11 OUT=el_sol_de_peron_subtitulos_es.srt python3 tools/srt.py
tools/render_ep11.sh                                               # -> video/out/ep11/cXX.mp4 (por tramos, ~5 h)
TRAMOS="video/out/ep11/c*.mp4" AUD=audio/mix/mezcla_ep11.wav OUT=video/out/el_sol_de_peron_1440p.mp4 TITLE="EL SOL DE PERÓN" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
python3 tools/check_congelados.py video/out/el_sol_de_peron_1440p.mp4
rclone copy video/out/el_sol_de_peron_1440p.mp4 "gdrive:CONTEXTO/Ep11 · El Sol de Perón"
# short (el cierre x01 se procesa aparte en audio/ep11/short/final)
python3 tools/short_ep11.py
cd video && npx remotion render src/index11s.tsx ShortSol out/short11_muted.mp4 --muted --gl=swangle --crf=15 && cd ..
IN=video/out/short11_muted.mp4 AUD=audio/mix/mezcla_short11.wav OUT=entrega/el_sol_de_peron_short.mp4 TITLE="EL SOL DE PERÓN (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
python3 tools/check_congelados.py entrega/el_sol_de_peron_short.mp4
# todo lo anterior desde el render, en cola: tools/cola_ep11.sh
```

# Episodio 12 · "907 METROS" (ARA San Juan)

En el repo figura como `ep12`. El 15 de noviembre de 2017, un hidrófono de la red que vigila los ensayos nucleares, en la isla Ascensión, registró un ruido que venía del Mar Argentino: era el ARA San Juan, con 44 personas a bordo. El video explica cómo funciona un submarino diésel-eléctrico y el snorkel, reconstruye la noche del 14 de noviembre (el agua que entró por la ventilación, el cortocircuito en las baterías de proa y el último mensaje de las 7:30), la búsqueda (más de una docena de países, un área casi como España, las siete llamadas que no eran del submarino), cómo el canal SOFAR llevó el sonido a 6.000 y 8.000 km, qué es una implosión (con la grabación real del Titan), el año sin rastros, el hallazgo de Ocean Infinity a 907 metros cuando el barco ya se iba y el fallo del juicio de Río Gallegos (2026), con las dos horas que nadie puede explicar. Cierra con los 44 nombres. Dura 7:26.

| Archivo | Qué es |
|---|---|
| `907_metros_1440p.mp4` | Master final en 2560×1440 (H.264 + AAC, −14 LUFS, 899 MB, md5 `3f9f26bf3197f15057a7e80ae8bbae07`). No va en git: está en Drive, en `CONTEXTO/Ep12 · 907 metros (ARA San Juan)` (carpeta `1ziv1rEnuQe9uB0NksQ3itEttfIsIv1q5`, archivo `1UJWcyImOTASbf-1HlCgpCd1Kx5lwL97x`) |
| `entrega/907_metros_short.mp4` | Short vertical para YouTube (1:15, 1080×1920, subtítulos incrustados, −14 LUFS) que manda al video largo; también en Drive (archivo `16r18GCaN10NF47O5cuZCYa0OGyFfVmFs`, md5 `5afe582757dcb42d18ebccf8859ea8f3`) |
| `entrega/907_metros_subtitulos_es.srt` | Subtítulos en español, con los nombres bien escritos y las cifras |
| `entrega/907_metros_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos, configuración de subida y fecha sugerida (aniversario) |
| `entrega/907_metros_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura (GPT Image 2.1) para A/B |
| `entrega/907_metros_short_publicacion.md` | Cómo publicar el short y enlazarlo al video |

- Guion: `guion/ep12_sanjuan.json` (10 segmentos + el cierre del short). Grafías fonéticas: "Kráfchik", "Óushen Infíniti", "Crozé", "Sófar", "Titán"; el mapa `display` devuelve la grafía real. `tools/timeline_ep12.py` además abre silencios dentro del segmento 6 (después de "implosión." y de "Titanic.", donde suena sola la grabación real) y reserva 19 s para los nombres.
- Qué mejora respecto del Ep11: **sistema visual nuevo** (Archivo variable con ancho y peso animados, Instrument Serif para lo humano, IBM Plex Mono para datos; títulos que entran letra por letra mientras la fuente pasa de ancha y fina a angosta y pesada; odómetros; escenas que se solapan con transiciones propias: ping de sonar, descenso con desenfoque, barrido, destello y disolvencia; formato de cine 2.39:1 en la apertura que se abre en el título; capítulos en pantalla), **datos reales en 3D** (el fondo del Mar Argentino con la batimetría SRTM15+ de Scripps/NOAA, rayos de sonido del canal SOFAR calculados con el perfil de Munk), **sonido real** (la grabación de la implosión del Titan, NOAA) y un cierre homenaje con los 44 nombres.
- Escenas: `video/src/ep12/` (composición `SanJuan`)
  - `kit12.tsx`: paleta, tipografía cinética (`KTitle`, `SyncWords`, `SerifLine`), `Odo`, `DataCard`, `Timecode`, `DepthGauge`, `Chapter`, `NameCard`, fotos y videos de archivo con etalonaje frío, anillos de sonar, retícula, encuesta y `driftT` (acercamiento lento y continuo para que ningún gráfico quede quieto; `tools/check_congelados.py` no debe marcar tramos LARGOS).
  - `three12.tsx`: el TR-1700 por partes con rayos X (960 celdas, motores, conducto del snorkel, agua que entra, chispas), el agua (luz que se apaga con la profundidad, rayos, nieve marina, superficie), el mar con tormenta, el fondo marino con batimetría real, el robot, los vehículos autónomos, los restos y la sección de casco que pandea.
  - `viz12.tsx`: canal SOFAR, mapa del Atlántico con las 11 estaciones, frente de onda geodésico y rumbos, área de búsqueda contra España, espectrograma, eje de horas, calendario, llamadas, y la lista de los 44.
  - `scenes12a.tsx` (S01–S05 y el título) y `scenes12b.tsx` (S06–S10, los nombres y la pantalla final). `SanJuan.tsx` arma las transiciones. `short12.tsx`: el short vertical (entrada `src/index12s.tsx`).
- Archivo real: fotos de Wikimedia Commons (`video/public/ep12/img/creditos.json`: U.S. Navy, Embajada de EE. UU., Ministerio de Defensa de Rusia, CTBTO, Casa Rosada, Argentina.gob.ar, Diputados) y videos (`video/public/ep12/vid/creditos.json`: llegada del robot de la Marina de EE. UU. a Comodoro Rivadavia, restos del Titan, submarino Tupi; recortados con ffmpeg desde `raw/ep12/vid`). El espectrograma y la onda del Titan se generan con numpy a partir de `sfx/titan_real.wav`; la imagen de sonar de barrido lateral es una representación generada.
- Música: cuatro temas originales de ElevenLabs (abismo, la señal, el hallazgo, los nombres). Efectos de ElevenLabs: sonar, ambiente submarino, crujido del casco, implosión, tormenta, cortocircuito, llamada satelital, robot, burbujas, impacto, reloj.

```bash
EP=ep12 NSEG=10 TEMPO=1.14 python3 tools/proc_audio.py
EP=ep12 GUION=ep12_sanjuan.json python3 tools/align.py
EP=ep12 GUION=ep12_sanjuan.json python3 tools/check_voz.py      # verificar la pronunciación
python3 tools/timeline_ep12.py && python3 tools/mix_ep12.py      # -> audio/mix/mezcla_ep12.wav
EP=ep12 OUT=907_metros_subtitulos_es.srt python3 tools/srt.py
python3 tools/short_ep12.py                                       # línea de tiempo y mezcla del short
tools/cola_ep12.sh   # render por tramos (tools/render_ep12.sh), master 1440p, short y control de congelados
rclone copy video/out/907_metros_1440p.mp4 "gdrive:CONTEXTO/Ep12 · 907 metros (ARA San Juan)"
```

# Episodio 13 · "EL LOTE 31.202" (edición especial: el fentanilo contaminado)

En el repo figura como `ep13`. Es la primera **edición especial** del canal y dura 10:20. La historia del fentanilo contaminado de HLB Pharma y Laboratorios Ramallo, al que la Justicia le atribuye 90 muertes, contada con el **modelo del queso suizo**: nueve barreras que tenían que frenar un remedio contaminado antes de llegar a la vena de un paciente, y cómo falló cada una:

- la fábrica, el ensayo de esterilidad y la liberación
- el historial de reportes y la clausura de 2019 que nunca se ejecutó
- la inspección avisada el día anterior
- la carta de advertencia que nunca se firmó
- la alarma interna ("Sí, lo sé")
- la trazabilidad que no existía

Después vienen la barrera que sí funcionó (el equipo del Hospital Italiano de La Plata), lo que pasó después ("hoy quemamos todo", el autoclave, los 5 kilos que faltan, los 13 procesados, las exfuncionarias, Lugones no imputado) y el estado de la causa. Cierra con un homenaje a las víctimas.

| Archivo | Qué es |
|---|---|
| `el_lote_31202_1440p.mp4` | Master final en 2560×1440 (H.264 + AAC, 10:20, −14 LUFS, pico −1,3 dBTP). No va en git: está en Drive, en `CONTEXTO/Ep13 · El lote 31.202 (fentanilo contaminado)` (carpeta `1EjWkitY8xLsjo7Dpg1IaWdIST8Uc4DOF`; archivo `1-_g9BGDN9XsCKkDA-omdA2FUOBKUn27B`, md5 `7202acaffbc187e13908836aaf17dc5a`) |
| `entrega/el_lote_31202_short.mp4` | Short vertical para YouTube y TikTok (1:18, 1080×1920, subtítulos incrustados, −14 LUFS) que manda al video largo; también en Drive (archivo `183muIQ_8atIYPs_SEDkQBAiZgBKTZpU6`, md5 `f9b6c3b9b2ef3de3b4e227ab71a88712`) |
| `entrega/el_lote_31202_subtitulos_es.srt` | Subtítulos en español, con las cifras y los nombres bien escritos (HLB Pharma, aunque la voz dice "Farma") |
| `entrega/el_lote_31202_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos, configuración de subida, cuidados legales y fecha sugerida |
| `entrega/el_lote_31202_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura (GPT Image 2.1) para A/B |
| `entrega/el_lote_31202_short_publicacion.md` | Cómo publicar el short (YouTube y TikTok) y enlazarlo al video |
| Página de publicación | https://claude.ai/artifact/4kvxapoNEM5j6RREj7i2XA (privada): los archivos en Drive, un cuadro por capítulo, títulos y miniaturas A/B, descripción, short, TikTok y cuidados, con botones para copiar. Se arma con `tools/pagina_publicacion_ep13.py` a partir de los .md de `entrega/` |

## Investigación y guion

- Dossier con la cronología verificada, los cuidados legales y las fuentes: `guion/ep13_investigacion.md`.
- **Cuidados legales:**
  - los procesados no están condenados
  - 90 muertes "según la Justicia" (otros relevamientos dicen más de 100)
  - los chats salen del expediente publicado y se muestran como recreación
  - el desvío del fentanilo es una hipótesis
  - Lugones no está imputado
  - no se nombra ni se muestra a ningún paciente
- Guion: `guion/ep13_fentanilo.json` (12 segmentos + el cierre del short). El mapa `display` devuelve las grafías reales: Klebsiella pneumoniae, Tchukrán, etc.

## Voz y audio

- Voz eleven_v4. `tools/proc_audio.py` con `PAUSAS=respirar` alarga un poco las pausas naturales en lugar de comprimirlas.
- `tools/check_voz.py` ahora convierte cifras a palabras (con apócope: "treinta y un mil") y con `PROMPT=0` transcribe sin pista, para no esconder errores.
- Una frase que la voz decía mal ("otras ciento veinte mil" sonaba "320.000") se regeneró sola y se empalmó en `s08_raw.wav`.
- `tools/timeline_ep13.py` abre silencios después de frases exactas (por ejemplo, 3 s después de "Las nueve fetas estaban alineadas." y 9 s para el montaje de fechas) y reserva el homenaje y la placa final.

## Qué mejora respecto del Ep12

- **Un recurso narrativo central en 3D:** las nueve fetas de acrílico ámbar.
  - Cada una tiene sus agujeros fijos y un agujero de la falla que se abre y se corre hasta alinearse con los demás.
  - La ampolla las atraviesa.
  - Al final aparece la décima barrera, verde quirófano, que la frena.
- **Vidrio creíble:** la ampolla está torneada (LatheGeometry), con líquido, etiqueta del lote y anillo de corte, en un entorno de estudio con cajas de luz (PMREM) y una capa de reflejos aditiva.
- **Sistema visual clínico y forense nuevo** (`kit13.tsx`):
  - Geist y Geist Mono para la interfaz y los datos, Instrument Serif para lo humano, Tinos y Arimo para los documentos
  - el contador de barreras arriba (con modo tinta sobre papel) y una placa a pantalla completa por barrera
  - chats con "escribiendo…", documentos con sellos de tinta y la marca RECREACIÓN
  - riel de fechas, papel que se quema con un filtro SVG (ruido + gradiente) y un montaje final con la fecha de cada agujero
- **Música:** ocho temas que comparten el mismo leitmotiv (Eleven Music v2.5 con el tema principal como referencia de audio), con unos 35 efectos sincronizados.
- **Mezcla:** silencios buscados en la muerte del 12 de febrero, el "Sí, lo sé", las fetas alineadas y el homenaje.

## Escenas (`video/src/ep13/`, composición `Lote`)

- `kit13.tsx`: paleta, tipografía, fondos, el contador de barreras y las placas, chats, documentos, sellos, nombres, fotos, fechas que ruedan y el quemado.
- `three13.tsx`: escenario con entorno de reflejos (habitación o estudio), fetas, ampolla, bacterias y sala limpia con línea de llenado.
- `stack13.tsx`: la pila de fetas con el viajero (ampolla o falla) y la décima barrera. Sirve para 16:9 y para el vertical.
- `viz13a.tsx` y `viz13b.tsx`: gráficos:
  - potencia, gotero, defensas, microscopio
  - el ensayo con ocho lotes mezclados, los 118 reportes, las 23 ampollas, el candado, las 18 tareas, el acta abierta, los seis lotes
  - el riel de fechas, las 120.000 ampollas, la lista de trazabilidad, el mapa de distribución
  - las 12 ampollas del hospital, el correo, la coincidencia genómica, el autoclave, lo destruido, los 5 kilos
  - los 13 procesados, el estado de la causa, los 4 millones de unidades
- `scenes13a.tsx` (S01–S06), `scenes13b.tsx` (S07–S12, el homenaje y la placa final) y `Lote.tsx` (transiciones).
- `short13.tsx`: el short vertical (entrada `src/index13s.tsx`).

## Archivo y créditos

- Fotos de Wikimedia Commons (`video/public/ep13/img/creditos.json`): ANMAT, Ramallo, Hospital Italiano de La Plata, Instituto Malbrán, Ministerio de Salud y bacterias (CDC).
- Mapa de Natural Earth.

## Control del render

Cada tramo se revisa con una hoja de contacto, y el máster con `tools/check_congelados.py`, que marca los lapsos de 6 s o más casi sin cambios. Lo que se corrigió con parches (fragmentos re-renderizados y empalmados en su tramo por cuadro exacto, sin volver a renderizar el tramo entero):

- la placa de la barrera 9: «LA TRAZABILIDAD» pisaba la feta y ahora va a 90 px;
- tres huecos sin nada en pantalla mientras sigue la voz:
  - la fecha 08.2025 antes de la ficha de García Furfaro;
  - la fecha 10.2026 antes de los 4 millones de unidades;
  - el cierre: la encuesta sigue durante «Te leo en los comentarios» y después entran las nueve fetas agujereadas y la del hospital, antes de «Compartilo»;
- dos tramos quietos de más de 6 s:
  - el chat de la técnica del INAME: se acerca de a poco y la respuesta de Mantecón se escribe desde «la respuesta…»;
  - los 13 procesados: las figuras pasan atrás cuando hablan las defensas y la placa se acerca.

Cómo se hace un parche:

```bash
# public reducida con enlaces duros (no ocupa disco) y bundle propio fuera de /tmp/remotion-webpack-bundle-*,
# porque render_ep13.sh borra esos bundles entre tramo y tramo. ep05/globe hace falta porque three6 precarga esa textura.
mkdir -p $PUB/ep05 && for d in fonts brand tex ep13; do cp -rl video/public/$d $PUB/$d; done && cp -rl video/public/ep05/globe $PUB/ep05/
cd video && npx remotion bundle src/index13.tsx --public-dir=$PUB --out-dir=$BUNDLE
npx remotion render $BUNDLE Lote parche.mp4 --frames=A-B --scale=1.3333333333333333 --gl=swangle --crf=15 --muted --timeout=240000
# empalme por cuadro exacto (trim + concat, recodificado con crf 12) y después el máster con tools/final_tramos.sh
```

## Comandos

```bash
EP=ep13 NSEG=12 TEMPO=1.0 PAUSAS=respirar python3 tools/proc_audio.py
EP=ep13 GUION=ep13_fentanilo.json python3 tools/align.py
EP=ep13 GUION=ep13_fentanilo.json PROMPT=0 python3 tools/check_voz.py   # verificar la pronunciación (sin pista)
python3 tools/timeline_ep13.py && python3 tools/mix_ep13.py               # -> audio/mix/mezcla_ep13.wav
EP=ep13 OUT=el_lote_31202_subtitulos_es.srt python3 tools/srt.py
python3 tools/short_ep13.py                                                # línea de tiempo y mezcla del short
tools/cola_ep13.sh   # render por tramos (tools/render_ep13.sh), master 1440p, short y control de congelados
rclone copy video/out/el_lote_31202_1440p.mp4 "gdrive:CONTEXTO/Ep13 · El lote 31.202 (fentanilo contaminado)"
```

# Episodio 14 · "CAMPO DEL CIELO" (la mesa de hierro que nadie encuentra)

En el repo figura como `ep14` (composición `Cielo`, con entrada propia `video/src/index14.tsx`). Dura 6:58. Es la historia de la lluvia de meteoritos de hierro que cayó en el Chaco hace unos 4.000 años y del **Mesón de Fierro**: la masa de unas 14 toneladas que el teniente de fragata Miguel Rubín de Celis vio en 1783, hizo cavar, dio vuelta con palancas y voló con pólvora, y que nadie volvió a ver. En el camino aparecen:

- la expedición de 1576 que no pudo volver y el análisis de 1774 que prometía una mina de plata
- Chladni, que usó ese hierro para probar que caen piedras del cielo
- el bloque de 1803, la imagen del apóstol Santiago y las pistolas para Madison (un misterio abierto)
- El Chaco, el intento de llevárselo en 1990 (procesados, sin condena), la documenta de 2012 y Gancedo (2016)
- por qué nadie encuentra la mesa, y la pregunta del cierre: si aparece, ¿de quién es?

| Archivo | Qué es |
|---|---|
| `campo_del_cielo_1440p.mp4` | Master final en 2560×1440 (H.264 + AAC, 6:58, −14 LUFS). No va en git: está en Drive, en `CONTEXTO/Ep14 · Campo del Cielo` (carpeta `1mG8-ezBvqAExnI5IQxM8xtrRd4XFUgMT`; archivo y md5: se completan al terminar el render) |
| `entrega/campo_del_cielo_short.mp4` | Short vertical para YouTube y TikTok (1:16, 1080×1920, subtítulos incrustados, −14 LUFS) que manda al video largo; también en Drive (archivo y md5: se completan al terminar el render) |
| `entrega/campo_del_cielo_subtitulos_es.srt` | Subtítulos en español, con las cifras en números y los nombres bien escritos (la voz usa grafías fonéticas: Kladni, Jag, Mádison) |
| `entrega/campo_del_cielo_descripcion_youtube.md` | Títulos, descripción, capítulos, datos, fuentes, créditos, configuración de subida, cuidados y fecha sugerida |
| `entrega/campo_del_cielo_ab_miniaturas.md` | 3 títulos y 3 prompts de miniatura (GPT Image 2.1) para A/B |
| `entrega/campo_del_cielo_short_publicacion.md` | Cómo publicar el short (YouTube y TikTok) y enlazarlo al video |
| Página de publicación | Se publica al terminar el render (privada): los archivos en Drive, un cuadro por capítulo, títulos y miniaturas A/B, descripción, short, TikTok y cuidados, con botones para copiar. Se arma con `tools/pagina_publicacion_ep14.py` a partir de los .md de `entrega/` |

## Investigación y guion

- Dossier con la cronología verificada, los cuidados y las fuentes: `guion/ep14_investigacion.md`.
- **Cuidados:**
  - el peso del Mesón varía entre fuentes (13,5 a 45 t): se usa el de Rubín de Celis, «más de trescientos quintales», unas 14 t
  - El Chaco: 37 t es la cifra de la balanza de 1980; con la de 2016 dio 28,84 t. No se dice que sea «el segundo más grande del mundo»
  - las pistolas de Madison van como misterio: el museo no dice que sean de hierro meteórico, y la pistola que se ve es ilustrativa
  - Haag y los otros dos detenidos de 1990 fueron procesados; la causa quedó en nada
  - no se le atribuyen leyendas a ningún pueblo sin fuente; los moqoit se opusieron al traslado de 2012
- Guion: `guion/ep14_cielo.json` (9 segmentos + el cierre del short). El mapa `display` devuelve las grafías reales.

## Voz y audio

- Voz eleven_v4. `tools/proc_audio.py` con `TEMPO=1.03 PAUSAS=respirar`; `tools/check_voz.py` sin pista (`PROMPT=0`) para verificar cifras y nombres.
- `tools/timeline_ep14.py` abre silencios internos (el golpe del impacto, la voladura, «Después se fue») y reserva la placa final.
- Ocho temas con el mismo leitmotiv (Eleven Music, el tema principal como referencia) y 18 efectos. `tools/mix_ep14.py` ata los golpes musicales al impacto, a la voladura, al corte de 1990 y a Gancedo, y controla que la música no tape la voz (informe de enmascaramiento).

## Qué mejora respecto del Ep13

- **3D propio del tema** (`three14.tsx`):
  - la masa de hierro es procedural: un superelipsoide con regmagliptos (los huecos ovalados de los meteoritos), óxido por vértice y relieve fino, sin costuras de textura
  - la Tierra desde el espacio con atmósfera, el bólido que se parte en fragmentos, la lluvia de hierro con ondas de choque y la voladura con humo, chispas y destello
- **El monte chaqueño** en cuatro capas con paralaje alineado al horizonte de la cámara 3D, en cuatro climas (atardecer, noche, sol bajo, día), con pasto en primer plano.
- **Mapas con datos reales** (`map14.tsx`, `tools/geo_ep14.py`): provincias, los ríos Salado, Dulce, Bermejo y Paraná (Natural Earth 10m), el límite recto Chaco–Santiago del Estero y el campo de cráteres a escala (18,5 × 3 km). Estilo antiguo (pluma sobre pergamino) y moderno.
- **Sistema visual «cielo y hierro»** (`kit14.tsx`): Fraunces con peso y óptica animables, IM Fell English para los papeles del siglo XVIII y Pinyon Script para la letra de Rubín de Celis; pergamino, sellos de tinta, la cinta de los años y el rótulo «paradero desconocido».
- **Transiciones propias:** el bólido (una estela incandescente barre la pantalla), la tinta (el pergamino se abre en un círculo), la disolvencia y el destello.

## Render: qué es caro con WebGL por software

Con `--gl=swangle`, Chrome hace **todo** el dibujo en SwiftShader (una GPU emulada en la CPU), no solo el 3D. Un desenfoque grande o un filtro SVG con `feTurbulence` cuesta segundos por cuadro, y se recalcula en cada cuadro: Chrome no reutiliza las capas entre un cuadro y otro, ni siquiera con `will-change`.

El primer intento de render iba a tardar unas 10 h. Medido con `video/medir_cuadros.mjs` (costo por cuadro en frío y en caliente, con variantes que apagan capas):

| Qué | Costo por cuadro | Solución |
|---|---|---|
| La Vía Láctea: un degradé rotado con `blur(2px)` | 8 s | Sin desenfoque (el degradé ya es suave) |
| El follaje del monte (ruido + desplazamiento en cuatro capas) | 3,5–4 s | Horneado a PNG (`video/bake14.mjs` → `public/ep14/monte/`) |
| El pergamino (manchas y fibras con `feTurbulence`) | 2–3 s | Horneado a WebP con transparencia (`public/ep14/tex/parch14.webp`); las hojas usan el recorte de arriba a la izquierda, que es el mismo ruido |
| La pluma en los mapas antiguos (un filtro por provincia) | 1–2 s | Un solo filtro para todas, recortado a la pantalla, y una octava |
| El grano global al 4 % | 0,3–0,6 s | Fuera (después de la compresión de YouTube no se ve) |
| El 3D (masa, suelo, luces) | ~1 s | Se deja |

Quedó en 1,8 s por cuadro en promedio (los planos del monte bajaron de 8 a 3,5 s y los del pergamino de 6 a 2 s): unas 6 h para los 12.530 cuadros. Con cuatro pestañas no se gana nada en los planos pesados porque la CPU ya está saturada con una sola.

Si se cambia el dibujo del monte o el filtro del pergamino, hay que volver a hornear: `cd video && node bake14.mjs`.

## Escenas (`video/src/ep14/`, composición `Cielo`)

- `kit14.tsx`: paleta, tipografía, cielo nocturno, pergamino, hojas, sellos, nombres, citas, la letra manuscrita, fotos con grado de color, la cinta de años y el radar de búsqueda.
- `three14.tsx`: escenario, masas de hierro, Tierra, bólido, fragmentos, lluvia de hierro, voladura, suelo y sombras de contacto.
- `art14.tsx`: el monte en capas (horneado), el pasto, la grúa, el camión, el patrullero, la pistola de chispa y el volcán.
- `map14.tsx`: el mapa (antiguo y moderno), la brújula y el campo de cráteres.
- `shots14.tsx`: el plano de la mesa en el monte, el bólido 2D, los cortes del suelo y del pozo, el arco del mundo y los avisos de venta.
- `scenes14a.tsx` (S01–S04), `scenes14b.tsx` (S05–S09 y la placa final) y `Cielo.tsx` (transiciones).
- `short14.tsx`: el short vertical (entrada `src/index14s.tsx`, composición `ShortCielo`).

## Archivo y créditos

- Fotos con licencia (`video/public/ep14/img/creditos.json`): El Chaco (Edgardo Scheihing), el cartel del parque Pigüen N'onaxa, el trozo del Museo de Historia Natural de Londres, Chladni, Madison (National Gallery of Art), Woodbine Parish y una pistola de chispa ilustrativa (Metropolitan Museum).
- La Tierra: NASA Blue Marble y Black Marble. Mapas: Natural Earth.

## Comandos

```bash
EP=ep14 NSEG=9 TEMPO=1.03 PAUSAS=respirar python3 tools/proc_audio.py
EP=ep14 GUION=ep14_cielo.json python3 tools/align.py
EP=ep14 GUION=ep14_cielo.json PROMPT=0 python3 tools/check_voz.py   # verificar cifras y nombres (sin pista)
python3 tools/timeline_ep14.py && python3 tools/mix_ep14.py         # -> audio/mix/mezcla_ep14.wav
python3 tools/geo_ep14.py                                            # provincias, ríos y puntos del mapa
EP=ep14 OUT=campo_del_cielo_subtitulos_es.srt python3 tools/srt.py
python3 tools/short_ep14.py                                          # línea de tiempo y mezcla del short
cd video && node bake14.mjs && cd ..                                 # monte y pergamino horneados
tools/cola_ep14.sh     # render por tramos (tools/render_ep14.sh), master 1440p y control de congelados
tools/cola_short14.sh  # espera a la cola del episodio y hace el short
rclone copy video/out/campo_del_cielo_1440p.mp4 "gdrive:CONTEXTO/Ep14 · Campo del Cielo"
```

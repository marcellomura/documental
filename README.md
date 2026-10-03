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

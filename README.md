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

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

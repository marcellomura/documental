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

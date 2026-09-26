# Prompt para continuar en una sesión nueva

Copiá todo lo que está dentro del bloque y pegalo como primer mensaje de la sesión nueva.

```
Seguimos con el proyecto CONTEXTO, un canal de YouTube y TikTok de documentales explicativos sobre la Argentina, estilo Vox. El repo es marcellomura/documental y la rama es claude/eloquent-knuth-ej9tp8: trabajá y pusheá ahí, sin abrir PR. Hablame en español con voseo. Antes de hacer nada, leé el README.md: explica cómo se hizo cada episodio y tiene los comandos para regenerar todo.

ESTADO DE LOS EPISODIOS (los archivos están en entrega/)
- Ep1 "13 CEROS", Ep2 "El robo del siglo" y Ep3 "Argentina y el FMI": terminados.
- Ep4 "Súper Niño": terminado. Tiene super_nino_4k.mp4 (en Git LFS), los shorts de YouTube y TikTok, subtítulos, descripción, miniaturas y la guía de los shorts. super_nino_1080p.mp4 nunca se generó, aunque el README y super_nino_shorts_publicacion.md lo nombran. Se hace con tools/final.sh a partir del render 4K; el comando está en el README.
- Ep5 "Tu reloj está mal" (4:40): terminado. La composición de Remotion es "Reloj" (video/src/ep05). La entrega es tu_reloj_esta_mal_1080p.mp4 más subtítulos, descripción y miniaturas A/B. Si el 1080p no está en el repo, regeneralo con la sección "Episodio 5" del README (render 4K de alrededor de 1 h y después final.sh).
- Calendario: jueves 1/10 El robo del siglo; jueves 8/10 Súper Niño (video y shorts); jueves 15/10 Tu reloj está mal (propuesto).
- Git LFS: están usados 861 MB de 1 GB, así que no subas más archivos grandes a LFS. Los de menos de 100 MB van en git normal.

GOOGLE DRIVE (el conector ya está conectado)
En "Mi unidad" ya existe esta estructura:
- CONTEXTO (id 1nY5WLrPJ6aMumNZD5uyGz6ownLaB7dv1)
  - Ep1 · 13 ceros (id 1pFveZZ8jXktkdtgtFn-UhNfhs_vAQcxJ): tiene 13_ceros_descripcion_youtube.txt
  - Ep2 · El robo del siglo (id 1bbMlvicqQ7O8W1n3OT_emTNEQerc8buZ): vacía
  - Ep3 · Argentina y el FMI (id 1dZgtc5vm0vaf_rnY3Gnub29Yd5ibrRU8): vacía
  - Ep4 · Súper Niño (id 1dS_i5tPSGNcSlNer8WK2MLmGOvIS0chE): vacía
  - Ep5 · Tu reloj está mal (id 1pHe9G-0pln8FFn3qYIH5uLeHT03jJryD): tiene la descripción y las miniaturas A/B como Google Docs y tu_reloj_esta_mal_subtitulos_es.srt
  - Guías del canal (id 1Ele9pSzRYheWkSRMwU0LLiaZ090F-cBf): vacía

Falta subir estos textos de entrega/ (subilos con la misma base de nombre y extensión .txt; los .srt quedan como .srt):
- Ep1: ab_testing_miniaturas_titulos.md, short_publicacion.md, 13_ceros_subtitulos_es.srt
- Ep2: el_robo_del_siglo_descripcion_youtube.md, el_robo_del_siglo_ab_miniaturas.md, el_robo_del_siglo_subtitulos_es.srt
- Ep3: argentina_y_el_fmi_descripcion_youtube.md, argentina_y_el_fmi_ab_miniaturas.md, argentina_y_el_fmi_subtitulos_es.srt
- Ep4: super_nino_descripcion_youtube.md, super_nino_ab_miniaturas.md, super_nino_shorts_publicacion.md, super_nino_subtitulos_es.srt
- Guías del canal: kit_canal_youtube.md, kit_tiktok.md, subida_youtube_paso_a_paso.md

Cómo subir los textos con el conector (ya probado):
- Usá create_file con textContent, contentMimeType "text/plain; charset=UTF-8" y disableConversionToGoogleType: true. Así los emojis llegan intactos; lo verifiqué byte a byte.
- NO los conviertas a Google Docs: la conversión rompe los emojis de 4 bytes (👉 💬 📚 🇦🇷…) y el markdown junta los renglones, así que los capítulos quedan todos en una línea.
- Después de cada subida, compará el fileSize que devuelve Drive con el tamaño del archivo local en bytes (wc -c).

Videos y la miniatura PNG: el conector solo acepta el contenido dentro de la llamada, así que no sirve para archivos de cientos de MB. Desde el contenedor sí se llega a www.googleapis.com, pero para subirlos directo hace falta una credencial guardada en la configuración del entorno, nunca pegada en el chat. La propuesta es rclone:
1. Yo corro en mi compu `rclone authorize "drive"` e inicio sesión con Google.
2. Guardo el resultado como variables de entorno del entorno de Claude Code: RCLONE_CONFIG_GDRIVE_TYPE=drive y RCLONE_CONFIG_GDRIVE_TOKEN=<el JSON que devuelve>.
3. Abro una sesión nueva.
4. Vos instalás rclone y copiás cada archivo a su carpeta con `rclone copy` (por ruta CONTEXTO/... o con --drive-root-folder-id).
Si esas variables no existen, guiame paso a paso para crearlas.

Los archivos que van a Drive por esa vía son:
- Videos: 13_ceros_documental_1080p.mp4, 13_ceros_documental_1080p_MAXCALIDAD.mp4 (LFS), 13_ceros_short_vertical.mp4, el_robo_del_siglo_1080p.mp4, argentina_y_el_fmi_1080p.mp4, super_nino_4k.mp4 (LFS), super_nino_short_youtube.mp4, super_nino_short_tiktok.mp4 y tu_reloj_esta_mal_1080p.mp4.
- Imagen: 13_ceros_miniatura.png.
- Para los que están en LFS, corré `git lfs pull` antes.
- Si la credencial funciona, también podés renderizar el Ep5 en 4K (comando en el README) y subir ese 4K directo a Drive, sin pasar por git.

PREFERENCIAS
- Voz de ElevenLabs "Carlos Pro" (voice_id gBTPbHzRd0ZmV75Z5Zk4, modelo eleven_multilingual_v2).
- Motion graphics en Remotion 4.
- Las miniaturas van solo como prompts para GPT Image 2.1: no las generes.
- Siempre dame links y previews.
- Nada de identificadores de modelo en los commits.
- Para renderizar se usa el Chromium headless que está en /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell (los comandos completos están en el README).

PRIMER PASO: traé la rama (git pull), revisá qué hay en cada carpeta de Drive con search_files usando parentId, y seguí subiendo los textos que faltan. Cuando termines, decime qué hace falta para los videos.
```

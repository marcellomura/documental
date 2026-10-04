# Prompt para continuar en una sesión nueva

Copiá todo lo que está dentro del bloque y pegalo como primer mensaje de la sesión nueva.

```
Seguimos con el proyecto CONTEXTO, un canal de YouTube y TikTok de documentales explicativos sobre la Argentina, estilo Vox. El repo es marcellomura/documental y la rama es claude/eloquent-knuth-ej9tp8: trabajá y pusheá ahí, sin abrir PR. Hablame en español con voseo. Antes de hacer nada, leé el README.md: explica cómo se hizo cada episodio y tiene los comandos para regenerar todo.

ESTADO DE LOS EPISODIOS (los archivos están en entrega/)
- Ep1 "13 CEROS", Ep2 "El robo del siglo" y Ep3 "Argentina y el FMI": terminados.
- Ep4 "Súper Niño": terminado. Tiene super_nino_4k.mp4 (en Git LFS), los shorts de YouTube y TikTok, subtítulos, descripción, miniaturas y la guía de los shorts. super_nino_1080p.mp4 nunca se generó, aunque el README y super_nino_shorts_publicacion.md lo nombran. Se hace con tools/final.sh a partir del render 4K; el comando está en el README.
- Ep5 "Tu reloj está mal" (4:40): terminado. La composición de Remotion es "Reloj" (video/src/ep05). La entrega es tu_reloj_esta_mal_1080p.mp4 más subtítulos, descripción y miniaturas A/B. Si el 1080p no está en el repo, regeneralo con la sección "Episodio 5" del README (render 4K de alrededor de 1 h y después final.sh).
- Ep8 "La paradoja de la carne" (5:51, en el repo es ep06, composición "Carne" en video/src/ep06): terminado. Primer episodio con 3D real (three.js, render con --gl=swangle). El master de 1440p está en Drive (CONTEXTO/Ep8 · La paradoja de la carne) junto con el short, la descripción, las miniaturas y los subtítulos. Ver la sección del README.
- Ep9 "Vaca Muerta: el tesoro y la trampa" (6:00, en el repo es ep09, composición "Vaca" en video/src/ep09): terminado. 3D con three.js (bloque geológico en corte, mapa 3D de provincias con el oleoducto, barriles). El master de 1440p está en Drive (CONTEXTO/Ep9 · Vaca Muerta) junto con el short (1:17), la descripción, las miniaturas y los subtítulos. Ver la sección del README.
- Ep10 "El cuadro del nazi" (6:26, en el repo es ep10, composición "Cuadro" en video/src/ep10): terminado. El cuadro robado por los nazis que apareció en un aviso inmobiliario de Mar del Plata (devuelto por la Justicia en septiembre de 2026). 3D con three.js (living con el retrato y el tapiz, chalet, cubierta del barco, cuaderno negro, galería, botín) y archivo de Wikimedia. La locución usa grafías fonéticas para los nombres y tools/check_voz.py verifica la pronunciación con whisper. El master de 1440p está en Drive (CONTEXTO/Ep10 · El cuadro del nazi, id 1PSiffuFLi-4uOTKL4AOh1rW_UTr_4M3R) junto con el short (1:24), la descripción, las miniaturas y los subtítulos. Ver la sección del README.
- Ep11 "El Sol de Perón" (7:07, en el repo es ep11, composición "Sol" en video/src/ep11): terminado. El Proyecto Huemul: Perón anunció en 1951 la fusión nuclear controlada en la isla Huemul (Bariloche), Richter, el informe de Balseiro, el giro (el stellarator de Spitzer, el Instituto Balseiro, INVAP y los reactores exportados) y la fusión hoy. 3D con three.js (isla, reactor demolido, Sol, fusión, stellarator) y mucho video de archivo real (noticieros de Perón, Pulqui II, Ivy Mike, NIF, NASA). El master de 1440p está en Drive (CONTEXTO/Ep11 · El Sol de Perón, id 1Vwqy7cytUdf7ufLwYe5R3SNy6t_2QtLH) junto con el short (1:10), la descripción, las miniaturas y los subtítulos. Ver la sección del README.
- Ep12 "907 METROS" (7:26, en el repo es ep12, composición "SanJuan" en video/src/ep12): terminado. El ARA San Juan: el hidrófono HA10 de la isla Ascensión, el submarino diésel-eléctrico y el snorkel, el agua por la ventilación y el último mensaje, la búsqueda, el canal SOFAR, la implosión (con la grabación real del Titan), el hallazgo de Ocean Infinity a 907 m y el fallo de Río Gallegos (2026); cierra con los 44 nombres. Estrena sistema visual (Archivo variable, Instrument Serif, IBM Plex Mono, transiciones propias, acercamiento continuo con driftT) y batimetría real en 3D. El master de 1440p está en Drive (CONTEXTO/Ep12 · 907 metros (ARA San Juan), id 1ziv1rEnuQe9uB0NksQ3itEttfIsIv1q5) junto con el short (1:15), la descripción, las miniaturas y los subtítulos. Ver la sección del README. Ojo con el disco: cada `node stills.mjs` crea un bundle de ~1 GB en /tmp (ahora se borra solo al terminar).
- Calendario: jueves 1/10 El robo del siglo; jueves 8/10 Súper Niño (video y shorts); jueves 15/10 Tu reloj está mal (propuesto); La paradoja de la carne, un jueves libre después del Ep7 de Messi (por ejemplo, el 22/10); Vaca Muerta, el jueves 29/10 y su short el sábado 31/10; El cuadro del nazi, el jueves 5/11 y su short el sábado 7/11; El Sol de Perón, el jueves 12/11 y su short el sábado 14/11; 907 metros, el domingo 15/11 a las 10:00 (aniversario de la desaparición) y su short el martes 17/11 a las 13:00 (alternativa: jueves 19/11 y sábado 21/11).
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

Videos y la miniatura PNG: el conector solo acepta el contenido dentro de la llamada, así que no sirve para archivos de cientos de MB. ACTUALIZACIÓN: este entorno ya tiene RCLONE_CONFIG_GDRIVE_TYPE y RCLONE_CONFIG_GDRIVE_TOKEN; instalá rclone (curl -sSL https://downloads.rclone.org/rclone-current-linux-amd64.zip) y subí con `rclone copy archivo "gdrive:CONTEXTO/<carpeta>"`. Desde el contenedor sí se llega a www.googleapis.com, pero para subirlos directo hace falta una credencial guardada en la configuración del entorno, nunca pegada en el chat. La propuesta es rclone:
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

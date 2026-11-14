#!/bin/bash
# Sube la entrega del ep16 (EL PUNTO DÉBIL) a Drive, en CONTEXTO/Ep16 · El punto débil, con los mismos nombres que los
# episodios anteriores (los .md van como .txt para que Drive los muestre), y deja los IDs en entrega/ep16_drive_ids.json
# para la página de publicación. Se puede relanzar: rclone saltea lo que ya está igual.
set -e
cd "$(dirname "$0")/.."
P="gdrive:CONTEXTO"
N="Ep16 · El punto débil"
D="$P/$N"
rclone mkdir "$D"
up() { echo "→ $2"; rclone copyto "$1" "$D/$2" --drive-chunk-size 64M -q; }
up video/out/el_punto_debil_1440p.mp4 el_punto_debil_1440p.mp4
up entrega/el_punto_debil_vertical.mp4 el_punto_debil_vertical.mp4
up entrega/el_punto_debil_subtitulos_es.srt el_punto_debil_subtitulos_es.srt
up entrega/el_punto_debil_vertical_subtitulos_es.srt el_punto_debil_vertical_subtitulos_es.srt
up entrega/el_punto_debil_descripcion_youtube.md el_punto_debil_descripcion_youtube.txt
up entrega/el_punto_debil_vertical_textos.md el_punto_debil_vertical_publicacion.txt
up entrega/el_punto_debil_miniaturas.md el_punto_debil_ab_miniaturas.txt
up guion/ep16_investigacion.md el_punto_debil_dossier_investigacion.txt
rclone lsjson "$P" --dirs-only > /tmp/claude-0/ep16_dirs.json
rclone lsjson "$D" > /tmp/claude-0/ep16_files.json
python3 - "$N" <<'EOF'
import json, sys
name = sys.argv[1]
dirs = json.load(open('/tmp/claude-0/ep16_dirs.json'))
files = {f['Name']: f for f in json.load(open('/tmp/claude-0/ep16_files.json'))}
pick = lambda n: files[n]['ID']
ids = {
    'folder': next(d['ID'] for d in dirs if d['Name'] == name),
    'largo': pick('el_punto_debil_1440p.mp4'),
    'vertical': pick('el_punto_debil_vertical.mp4'),
    'srt': pick('el_punto_debil_subtitulos_es.srt'),
    'srt_v': pick('el_punto_debil_vertical_subtitulos_es.srt'),
    'descripcion': pick('el_punto_debil_descripcion_youtube.txt'),
    'vertical_textos': pick('el_punto_debil_vertical_publicacion.txt'),
    'miniaturas': pick('el_punto_debil_ab_miniaturas.txt'),
    'dossier': pick('el_punto_debil_dossier_investigacion.txt'),
    'tamaños': {n: f['Size'] for n, f in files.items()},
}
json.dump(ids, open('entrega/ep16_drive_ids.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(ids, ensure_ascii=False, indent=1))
EOF

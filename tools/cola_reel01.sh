#!/bin/bash
# Cola del reel 01: render por tramos, codificación final con la mezcla (menos de 100 MB, para git normal) y control de
# tramos congelados. Se puede relanzar en cualquier momento (retoma desde el primer tramo que falta).
set -e
cd "$(dirname "$0")/.."
tools/render_reel01.sh
TRAMOS="video/out/reel01/c*.mp4" AUD=audio/mix/mezcla_reel01.wav OUT=entrega/la_maestra_que_iba_a_caballo_reel.mp4 \
  TITLE="LA MAESTRA QUE IBA A CABALLO (el caso Nanci Godoy)" VBR=4600k MAXRATE=9M BUFSIZE=14M tools/final_tramos.sh
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py entrega/la_maestra_que_iba_a_caballo_reel.mp4 || true
echo "REEL LISTO $(date +%H:%M)"

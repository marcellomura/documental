#!/usr/bin/env bash
# Codificación final a partir de los tramos (cXX.mp4) sin pegarlos con "-c copy": decodifica cada tramo y los
# une con el filtro concat. Así no importa si un tramo re-renderizado tiene otra base de tiempo o rango de color.
#   TRAMOS="video/out/ep10/c*.mp4" AUD=audio/mix/mezcla_ep10.wav OUT=video/out/el_cuadro_del_nazi_1440p.mp4 \
#   TITLE="EL CUADRO DEL NAZI" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
set -euo pipefail
cd "$(dirname "$0")/.."
FILES=($(ls ${TRAMOS}))
N=${#FILES[@]}
INPUTS=(); FG=""; CAT=""
for i in "${!FILES[@]}"; do
  INPUTS+=(-i "${FILES[$i]}")
  FG+="[$i:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p[v$i];"
  CAT+="[v$i]"
done
FG+="${CAT}concat=n=$N:v=1:a=0[v]"
TMP=$(mktemp -d)
X264=(-c:v libx264 -preset "${PRESET:-slow}" -b:v "$VBR" -maxrate "${MAXRATE:-5M}" -bufsize "${BUFSIZE:-10M}" -pix_fmt yuv420p -x264-params "aq-mode=3:aq-strength=0.9")
ffmpeg -v error -y "${INPUTS[@]}" -filter_complex "$FG" -map "[v]" "${X264[@]}" -pass 1 -passlogfile "$TMP/x" -an -f mp4 /dev/null
ffmpeg -v error -y "${INPUTS[@]}" -i "$AUD" -filter_complex "$FG" -map "[v]" -map "$N:a:0" "${X264[@]}" -pass 2 -passlogfile "$TMP/x" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  -metadata title="$TITLE" -metadata artist="CONTEXTO" "$OUT"
rm -rf "$TMP"
ls -la "$OUT"

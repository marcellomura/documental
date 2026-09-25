#!/usr/bin/env bash
# Codificación final: video de Remotion + mezcla de audio -> MP4 listo para YouTube (<100 MB para GitHub)
# Episodio 2:
#   IN=video/out/ep02_muted.mp4 AUD=audio/mix/mezcla_ep02.wav OUT=entrega/el_robo_del_siglo_1080p.mp4 \
#   TITLE="EL ROBO DEL SIGLO" VBR=2000k tools/final.sh
# PATCH/PATCH_FRAME (opcional): reemplaza el video desde ese cuadro con otro render parcial (--frames=N-fin).
set -euo pipefail
cd "$(dirname "$0")/.."
IN=${IN:-video/out/documental_video.mp4}
AUD=${AUD:-audio/mix/mezcla.wav}
OUT=${OUT:-entrega/13_ceros_documental_1080p.mp4}
TITLE=${TITLE:-13 CEROS — Por qué los argentinos no confían en su propia moneda}
VBR=${VBR:-1900k}
TMP=$(mktemp -d)
INPUTS=(-i "$IN")
VMAP="0:v:0"
FILTER=()
AIDX=1
if [ -n "${PATCH:-}" ]; then
  INPUTS+=(-i "$PATCH")
  FILTER=(-filter_complex "[0:v]trim=end_frame=${PATCH_FRAME},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]")
  VMAP="[v]"
  AIDX=2
fi
# 4K: VBR=13M MAXRATE=24M BUFSIZE=36M · 1080p desde el render 4K: VF=scale=1920:1080:flags=lanczos
X264=(-c:v libx264 -preset "${PRESET:-slow}" -b:v "$VBR" -maxrate "${MAXRATE:-5M}" -bufsize "${BUFSIZE:-10M}" -pix_fmt yuv420p -x264-params "aq-mode=3:aq-strength=0.9")
if [ -n "${VF:-}" ]; then X264+=(-vf "$VF"); fi
ffmpeg -v error -y "${INPUTS[@]}" "${FILTER[@]}" -map "$VMAP" "${X264[@]}" -pass 1 -passlogfile "$TMP/x" -an -f mp4 /dev/null
ffmpeg -v error -y "${INPUTS[@]}" -i "$AUD" "${FILTER[@]}" -map "$VMAP" -map "$AIDX:a:0" "${X264[@]}" -pass 2 -passlogfile "$TMP/x" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  -metadata title="$TITLE" -metadata artist="CONTEXTO" "$OUT"
rm -rf "$TMP"
ls -la "$OUT"

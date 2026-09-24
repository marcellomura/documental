#!/usr/bin/env bash
# Codificación final: video de Remotion + mezcla de audio -> MP4 listo para YouTube (<100 MB para GitHub)
set -euo pipefail
cd "$(dirname "$0")/.."
IN=video/out/documental_video.mp4
AUD=audio/mix/mezcla.wav
OUT=entrega/13_ceros_documental_1080p.mp4
VBR=${VBR:-1900k}
TMP=$(mktemp -d)
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -b:v "$VBR" -maxrate 5M -bufsize 10M -pix_fmt yuv420p \
  -x264-params "aq-mode=3:aq-strength=0.9" -pass 1 -passlogfile "$TMP/x" -an -f mp4 /dev/null
ffmpeg -v error -y -i "$IN" -i "$AUD" -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -b:v "$VBR" -maxrate 5M -bufsize 10M \
  -pix_fmt yuv420p -x264-params "aq-mode=3:aq-strength=0.9" -pass 2 -passlogfile "$TMP/x" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  -metadata title="13 CEROS — Por qué los argentinos no confían en su propia moneda" -metadata artist="CONTEXTO" "$OUT"
rm -rf "$TMP"
ls -la "$OUT"

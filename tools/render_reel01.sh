#!/bin/bash
# Render del reel 01 (LA MAESTRA QUE IBA A CABALLO) a 1080×1920 por tramos de 30 s, con WebGL por software.
# Usa la entrada propia (src/indexR01.tsx) y una carpeta public reducida armada con enlaces duros (fuentes, marca y
# reel01): el bundle pesa unos 20 MB en vez de ~1 GB. Se puede relanzar: saltea los tramos que ya están.
# Uso: tools/render_reel01.sh  → video/out/reel01/cXX.mp4 (después: tools/final_tramos.sh con la mezcla, ver cola_reel01.sh).
set -e
cd "$(dirname "$0")/../video"
PUB=${PUB:-/tmp/claude-0/pub_reel01}
rm -rf "${PUB:?}" && mkdir -p "$PUB" && cp -rl public/fonts public/brand public/reel01 "$PUB/"
mkdir -p out/reel01
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/reel01/timeline.json'));print(math.ceil(t['total']*t['fps']))")
STEP=900
n=0
for ((a=0; a<TOTAL; a+=STEP)); do
  n=$((n+1)); b=$(( a+STEP-1 < TOTAL-1 ? a+STEP-1 : TOTAL-1 ))
  f=$(printf "out/reel01/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render src/indexR01.tsx ReelGodoy "$f.tmp.mp4" --public-dir="$PUB" --muted --gl=swangle --frames=$a-$b --crf=14 --concurrency=${CONC:-3} --timeout=240000 --log=error
  mv "$f.tmp.mp4" "$f"
  rm -rf /tmp/remotion-webpack-bundle-*
done
echo "LISTO $(date +%H:%M)"

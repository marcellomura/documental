#!/bin/bash
# Render del vertical del ep15 (1080×1920, 2:46) por tramos de 30 s, con WebGL por software y la carpeta public
# reducida. Se puede relanzar: saltea los tramos que ya están. → video/out/ep15v/cXX.mp4
set -e
cd "$(dirname "$0")/../video"
PUB=${PUB:-/tmp/claude-0/pub15v}
rm -rf "${PUB:?}" && mkdir -p "$PUB" && cp -rl public/fonts public/brand public/tex public/ep15 "$PUB/"
mkdir -p out/ep15v
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep15v/timeline.json'));print(math.ceil(t['total']*t['fps']))")
STEP=900
n=0
for ((a=0; a<TOTAL; a+=STEP)); do
  n=$((n+1)); b=$(( a+STEP-1 < TOTAL-1 ? a+STEP-1 : TOTAL-1 ))
  f=$(printf "out/ep15v/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render src/index15v.tsx Vert15 "$f.tmp.mp4" --public-dir="$PUB" --muted --gl=swangle --frames=$a-$b --crf=14 --concurrency=${CONC:-4} --timeout=240000 --log=error
  mv "$f.tmp.mp4" "$f"
  rm -rf /tmp/remotion-webpack-bundle-*
done
echo "LISTO $(date +%H:%M)"

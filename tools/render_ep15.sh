#!/bin/bash
# Render del largo del ep15 (EL HOMBRE DE LAS MIL CARAS) a 2560×1440 por tramos de 30 s, con WebGL por software.
# Entrada propia (src/index15.tsx) y carpeta public reducida con enlaces duros (fuentes, marca, texturas y ep15).
# Uso: tools/render_ep15.sh  → video/out/ep15/cXX.mp4 (después: tools/cola_ep15.sh arma el máster con la mezcla).
set -e
cd "$(dirname "$0")/../video"
PUB=${PUB:-/tmp/claude-0/pub15}
rm -rf "${PUB:?}" && mkdir -p "$PUB" && cp -rl public/fonts public/brand public/tex public/ep15 "$PUB/"
mkdir -p out/ep15
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep15/timeline.json'));print(math.ceil(t['total']*t['fps']))")
STEP=900
n=0
for ((a=0; a<TOTAL; a+=STEP)); do
  n=$((n+1)); b=$(( a+STEP-1 < TOTAL-1 ? a+STEP-1 : TOTAL-1 ))
  f=$(printf "out/ep15/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render src/index15.tsx Doc15 "$f.tmp.mp4" --public-dir="$PUB" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=${CONC:-4} --timeout=240000 --log=error
  mv "$f.tmp.mp4" "$f"
  rm -rf /tmp/remotion-webpack-bundle-*
done
echo "LISTO $(date +%H:%M)"

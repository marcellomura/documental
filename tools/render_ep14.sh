#!/bin/bash
# Render del episodio 14 (CAMPO DEL CIELO) a 2560×1440 por tramos de 30 s, con WebGL por software.
# Usa la entrada propia (src/index14.tsx) y una carpeta public reducida armada con enlaces duros (fuentes, marca,
# texturas, ep14 y el globo de ep05): el bundle pesa ~80 MB en vez de ~1 GB.
# Uso: tools/render_ep14.sh  → video/out/ep14/cXX.mp4 (después: tools/final_tramos.sh con la mezcla, ver cola_ep14.sh).
set -e
cd "$(dirname "$0")/../video"
PUB=${PUB:-/tmp/claude-0/pub14}
rm -rf "${PUB:?}" && mkdir -p "$PUB/ep05" && cp -rl public/fonts public/brand public/tex public/ep14 "$PUB/" && cp -rl public/ep05/globe "$PUB/ep05/"
mkdir -p out/ep14
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep14/timeline.json'));print(math.ceil(t['total']*t['fps']))")
STEP=900
n=0
for ((a=0; a<TOTAL; a+=STEP)); do
  n=$((n+1)); b=$(( a+STEP-1 < TOTAL-1 ? a+STEP-1 : TOTAL-1 ))
  f=$(printf "out/ep14/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render src/index14.tsx Cielo "$f.tmp.mp4" --public-dir="$PUB" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=${CONC:-4} --timeout=240000 --log=error
  mv "$f.tmp.mp4" "$f"
  rm -rf /tmp/remotion-webpack-bundle-*
done
echo "LISTO $(date +%H:%M)"

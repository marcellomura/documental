#!/bin/bash
# Render del ep16 (EL PUNTO DÉBIL) por tramos de 30 s con WebGL por software.
#   tools/render_ep16.sh          → largo a 2560×1440 en video/out/ep16/cXX.mp4
#   tools/render_ep16.sh v        → vertical 1080×1920 en video/out/ep16v/cXX.mp4
# Entrada propia y carpeta public reducida con enlaces duros (fuentes, marca, texturas, ep16 y las fotos del ep15).
# Un tramo ya hecho no se vuelve a renderizar: para rehacerlo, borrar su cXX.mp4.
set -e
cd "$(dirname "$0")/../video"
if [ "$1" = "v" ]; then ENTRY=src/index16v.tsx; COMP=Vert16; OUT=out/ep16v; TL=src/data/ep16v/timeline.json; SCALE=1; else ENTRY=src/index16.tsx; COMP=Doc16; OUT=out/ep16; TL=src/data/ep16/timeline.json; SCALE=1.3333333333333333; fi
PUB=${PUB:-/tmp/claude-0/pub16r}
rm -rf "${PUB:?}" && mkdir -p "$PUB/ep15" && cp -rl public/fonts public/brand public/tex public/ep16 "$PUB/" && cp -rl public/ep15/img "$PUB/ep15/"
mkdir -p $OUT
TOTAL=$(python3 -c "import json,math;t=json.load(open('$TL'));print(math.ceil(t['total']*t['fps']))")
STEP=900
n=0
for ((a=0; a<TOTAL; a+=STEP)); do
  n=$((n+1)); b=$(( a+STEP-1 < TOTAL-1 ? a+STEP-1 : TOTAL-1 ))
  f=$(printf "$OUT/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render $ENTRY $COMP "$f.tmp.mp4" --public-dir="$PUB" --muted --gl=swangle --scale=$SCALE --frames=$a-$b --crf=15 --concurrency=${CONC:-4} --timeout=300000 --log=error
  mv "$f.tmp.mp4" "$f"
  rm -rf /tmp/remotion-webpack-bundle-*
done
echo "LISTO $(date +%H:%M)"

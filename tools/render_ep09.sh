#!/bin/bash
# Render del episodio 9 a 2560×1440 por tramos (cortes de escena), con WebGL por software (SwiftShader).
# Uso: tools/render_ep09.sh  → video/out/ep09/cXX.mp4 y video/out/ep09_1440_muted.mp4
set -e
cd "$(dirname "$0")/../video"
mkdir -p out/ep09
B=(0 1369 2465 3653 4446 5441 6366 7468 8517 9616)
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep09/timeline.json'));print(math.ceil(t['total']*t['fps']))")
for i in "${!B[@]}"; do
  a=${B[$i]}; n=$((i+1)); b=$(( n < ${#B[@]} ? ${B[$n]} - 1 : TOTAL - 1 ))
  f=$(printf "out/ep09/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b"
  npx remotion render Vaca "$f.tmp.mp4" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
done
ls out/ep09/c[0-9][0-9].mp4 | sed "s|^out/ep09/|file |" > out/ep09/lista.txt
ffmpeg -v error -y -f concat -safe 0 -i out/ep09/lista.txt -c copy out/ep09_1440_muted.mp4
echo "LISTO out/ep09_1440_muted.mp4"

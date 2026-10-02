#!/bin/bash
# Render del episodio 10 a 2560×1440 por tramos (cortes de escena), con WebGL por software (SwiftShader).
# Uso: tools/render_ep10.sh  → video/out/ep10/cXX.mp4 y video/out/ep10_1440_muted.mp4
set -e
cd "$(dirname "$0")/../video"
mkdir -p out/ep10
B=(0 1425 2731 3916 5024 6084 7137 8250 9500 10375)
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep10/timeline.json'));print(math.ceil(t['total']*t['fps']))")
for i in "${!B[@]}"; do
  a=${B[$i]}; n=$((i+1)); b=$(( n < ${#B[@]} ? ${B[$n]} - 1 : TOTAL - 1 ))
  f=$(printf "out/ep10/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b"
  npx remotion render Cuadro "$f.tmp.mp4" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
done
ls out/ep10/c[0-9][0-9].mp4 | sed "s|^out/ep10/|file |" > out/ep10/lista.txt
ffmpeg -v error -y -f concat -safe 0 -i out/ep10/lista.txt -c copy out/ep10_1440_muted.mp4
echo "LISTO out/ep10_1440_muted.mp4"

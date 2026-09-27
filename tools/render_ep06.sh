#!/bin/bash
# Render del episodio 6 a 2560×1440 por tramos (cortes de escena), con WebGL por software (SwiftShader).
# Uso: tools/render_ep06.sh  → video/out/ep06/cXX.mp4 y video/out/ep06_1440_muted.mp4
set -e
cd "$(dirname "$0")/../video"
mkdir -p out/ep06
B=(0 1143 1901 2988 4318 5366 6192 6847 8152 8883)
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep06/timeline.json'));print(math.ceil(t['total']*t['fps']))")
for i in "${!B[@]}"; do
  a=${B[$i]}; n=$((i+1)); b=$(( n < ${#B[@]} ? ${B[$n]} - 1 : TOTAL - 1 ))
  f=$(printf "out/ep06/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b"
  npx remotion render Carne "$f.tmp.mp4" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
done
ls out/ep06/c*.mp4 | sed 's/^out\/ep06\//file /' > out/ep06/lista.txt
ffmpeg -v error -y -f concat -safe 0 -i out/ep06/lista.txt -c copy out/ep06_1440_muted.mp4
echo "LISTO out/ep06_1440_muted.mp4"

#!/bin/bash
# Render del episodio 11 a 2560×1440 por tramos (cortes de escena), con WebGL por software (SwiftShader).
# Uso: tools/render_ep11.sh  → video/out/ep11/cXX.mp4 (después: tools/final_tramos.sh con la mezcla)
set -e
cd "$(dirname "$0")/../video"
mkdir -p out/ep11
B=(0 1198 2367 3335 4314 5315 6838 7829 9075 10454 11672)
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep11/timeline.json'));print(math.ceil(t['total']*t['fps']))")
for i in "${!B[@]}"; do
  a=${B[$i]}; n=$((i+1)); b=$(( n < ${#B[@]} ? ${B[$n]} - 1 : TOTAL - 1 ))
  f=$(printf "out/ep11/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render Sol "$f.tmp.mp4" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
done
echo "LISTO $(date +%H:%M)"

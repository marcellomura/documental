#!/bin/bash
# Render del episodio 12 (ARA San Juan) a 2560×1440 por tramos (cortes de escena), con WebGL por software.
# Uso: tools/render_ep12.sh  → video/out/ep12/cXX.mp4 (después: tools/final_tramos.sh con la mezcla).
# Borra el bundle de webpack de /tmp después de cada tramo (pesa ~900 MB y el disco es chico).
set -e
cd "$(dirname "$0")/../video"
mkdir -p out/ep12
read -r -a B <<< "$(python3 -c "
import json
t=json.load(open('src/data/ep12/timeline.json')); s=t['starts']
cuts=[0, s['s02']-0.35, s['s03']-0.35, s['s04']-0.6, s['s05']-0.35, s['s06']-0.35, s['s06']+30, s['s07']-0.5, s['s08']-0.35, s['s09']-0.25, s['s10']-0.5, t['names']]
print(' '.join(str(round(c*30)) for c in cuts))")"
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep12/timeline.json'));print(math.ceil(t['total']*t['fps']))")
for i in "${!B[@]}"; do
  a=${B[$i]}; n=$((i+1)); b=$(( n < ${#B[@]} ? ${B[$n]} - 1 : TOTAL - 1 ))
  f=$(printf "out/ep12/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render SanJuan "$f.tmp.mp4" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
  rm -rf /tmp/remotion-webpack-bundle-*
done
echo "LISTO $(date +%H:%M)"

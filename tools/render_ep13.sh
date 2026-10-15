#!/bin/bash
# Render del episodio 13 (EL LOTE 31.202) a 2560×1440 por tramos (cortes de escena), con WebGL por software.
# Uso: tools/render_ep13.sh  → video/out/ep13/cXX.mp4 (después: tools/final_tramos.sh con la mezcla, ver cola_ep13.sh).
# Borra el bundle de webpack de /tmp después de cada tramo (pesa ~1 GB y el disco es chico).
set -e
cd "$(dirname "$0")/../video"
mkdir -p out/ep13
read -r -a B <<< "$(python3 -c "
import json
t=json.load(open('src/data/ep13/timeline.json')); s=t['starts']
cuts=[0, s['s02']-0.5, s['s03']-0.5, s['s04']-1.5, s['s04']+30, s['s05']-1.3, s['s06']-1.7, s['s07']-1.8, s['s08']-1.2, s['s09']-1.6,
      s['s10']-0.5, s['s11']-0.5, s['s11']+40, s['s12']-0.5, s['s12']+30, t['memorial']-0.2]
print(' '.join(str(round(c*30)) for c in cuts))")"
TOTAL=$(python3 -c "import json,math;t=json.load(open('src/data/ep13/timeline.json'));print(math.ceil(t['total']*t['fps']))")
for i in "${!B[@]}"; do
  a=${B[$i]}; n=$((i+1)); b=$(( n < ${#B[@]} ? ${B[$n]} - 1 : TOTAL - 1 ))
  f=$(printf "out/ep13/c%02d.mp4" $n)
  [ -s "$f" ] && { echo "ya está $f"; continue; }
  echo "== tramo $n: cuadros $a-$b ($(date +%H:%M))"
  npx remotion render Lote "$f.tmp.mp4" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=4 --log=error
  mv "$f.tmp.mp4" "$f"
  rm -rf /tmp/remotion-webpack-bundle-*
done
echo "LISTO $(date +%H:%M)"

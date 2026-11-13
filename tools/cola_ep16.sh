#!/bin/bash
# Cola del ep16 (EL PUNTO DÉBIL): espera al render en curso (si se pasa su PID), completa los tramos que falten del largo
# y del vertical, codifica los dos másters con sus mezclas y corre el detector de tramos congelados.
# Se puede relanzar: saltea lo hecho. Uso: tools/cola_ep16.sh [PID del render en curso]
set -e
cd "$(dirname "$0")/.."
if [ -n "$1" ]; then while kill -0 "$1" 2>/dev/null; do sleep 30; done; fi
tools/render_ep16.sh
tools/render_ep16.sh v
for ep in ep16 ep16v; do
  N=$(python3 -c "import json,math;t=json.load(open('video/src/data/$ep/timeline.json'));print(math.ceil(math.ceil(t['total']*t['fps'])/900))")
  for i in $(seq 1 $N); do n=$(printf %02d $i); [ -s video/out/$ep/c$n.mp4 ] || { echo "falta el tramo $n de $ep"; exit 1; }; done
done
M=video/out/el_punto_debil_1440p.mp4
if [ -s $M ] && [ -z "$(find video/out/ep16 -name 'c*.mp4' -newer $M)" ] && [ audio/mix/mezcla_ep16.wav -ot $M ]; then echo "ya está el máster del largo"; else
  echo "== máster del largo $(date +%H:%M)"
  TRAMOS="video/out/ep16/c*.mp4" AUD=audio/mix/mezcla_ep16.wav OUT=$M \
    TITLE="EL PUNTO DÉBIL — La anomalía magnética que vive sobre nosotros" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
fi
MV=entrega/el_punto_debil_vertical.mp4
if [ -s $MV ] && [ -z "$(find video/out/ep16v -name 'c*.mp4' -newer $MV)" ] && [ audio/mix/mezcla_ep16v.wav -ot $MV ]; then echo "ya está el máster del vertical"; else
  echo "== máster del vertical $(date +%H:%M)"
  mkdir -p entrega
  TRAMOS="video/out/ep16v/c*.mp4" AUD=audio/mix/mezcla_ep16v.wav OUT=$MV \
    TITLE="EL PUNTO DÉBIL (vertical)" VBR=4600k MAXRATE=9M BUFSIZE=14M tools/final_tramos.sh
fi
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py $M || true
python3 tools/check_congelados.py $MV || true
echo "COLA LISTA $(date +%H:%M)"

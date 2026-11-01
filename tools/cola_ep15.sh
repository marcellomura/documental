#!/bin/bash
# Cola del ep15: espera al render del largo que ya está corriendo (si se pasa su PID), completa los tramos que falten
# del largo y del vertical, codifica los dos másters con sus mezclas y corre el detector de tramos congelados.
# Se puede relanzar: saltea lo hecho. Uso: tools/cola_ep15.sh [PID del render en curso]
set -e
cd "$(dirname "$0")/.."
if [ -n "$1" ]; then while kill -0 "$1" 2>/dev/null; do sleep 30; done; fi
tools/render_ep15.sh
tools/render_ep15v.sh
for ep in ep15 ep15v; do
  N=$(python3 -c "import json,math;t=json.load(open('video/src/data/$ep/timeline.json'));print(math.ceil(math.ceil(t['total']*t['fps'])/900))")
  for n in $(seq -w 1 $N); do [ -s video/out/$ep/c$n.mp4 ] || { echo "falta el tramo $n de $ep"; exit 1; }; done
done
M=video/out/el_hombre_de_las_mil_caras_1440p.mp4
if [ -s $M ] && [ -z "$(find video/out/ep15 -name 'c*.mp4' -newer $M)" ]; then echo "ya está el máster del largo"; else
  echo "== máster del largo $(date +%H:%M)"
  TRAMOS="video/out/ep15/c*.mp4" AUD=audio/mix/mezcla_ep15.wav OUT=$M \
    TITLE="EL HOMBRE DE LAS MIL CARAS — El Gusano Menocchio y el crimen de La Fidelidad" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
fi
MV=entrega/el_hombre_de_las_mil_caras_vertical.mp4
if [ -s $MV ] && [ -z "$(find video/out/ep15v -name 'c*.mp4' -newer $MV)" ]; then echo "ya está el máster del vertical"; else
  echo "== máster del vertical $(date +%H:%M)"
  mkdir -p entrega
  TRAMOS="video/out/ep15v/c*.mp4" AUD=audio/mix/mezcla_ep15v.wav OUT=$MV \
    TITLE="EL HOMBRE DE LAS MIL CARAS (vertical)" VBR=4600k MAXRATE=9M BUFSIZE=14M tools/final_tramos.sh
fi
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py $M || true
python3 tools/check_congelados.py $MV || true
echo "COLA LISTA $(date +%H:%M)"

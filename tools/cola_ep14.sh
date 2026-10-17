#!/bin/bash
# Cola del episodio 14: render por tramos, máster 1440p con la mezcla y el detector de tramos congelados.
# Se puede relanzar: saltea los tramos hechos y el máster si ningún tramo es más nuevo que él.
set -e
cd "$(dirname "$0")/.."
tools/render_ep14.sh
N=$(python3 -c "import json,math;t=json.load(open('video/src/data/ep14/timeline.json'));print(math.ceil(math.ceil(t['total']*t['fps'])/900))")
for n in $(seq -w 1 $N); do [ -s video/out/ep14/c$n.mp4 ] || { echo "falta el tramo $n"; exit 1; }; done
M=video/out/campo_del_cielo_1440p.mp4
if [ -s $M ] && [ -z "$(find video/out/ep14 -name 'c*.mp4' -newer $M)" ]; then
  echo "ya está el máster"
else
  echo "== master $(date +%H:%M)"
  TRAMOS="video/out/ep14/c*.mp4" AUD=audio/mix/mezcla_ep14.wav OUT=$M \
    TITLE="CAMPO DEL CIELO — La mesa de hierro que nadie encuentra" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
fi
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py $M || true
echo "COLA LISTA $(date +%H:%M)"

#!/bin/bash
# Cola del episodio 11: espera el render por tramos, codifica el master 1440p con la mezcla, renderiza el short
# y lo codifica. Al final corre el detector de tramos congelados sobre ambos.
set -e
cd "$(dirname "$0")/.."
while pgrep -f "tools/render_ep11.sh" > /dev/null; do sleep 60; done
tools/render_ep11.sh   # re-renderiza los tramos que falten (por ejemplo, uno borrado para corregirlo)
for n in $(seq -w 1 11); do [ -s video/out/ep11/c$n.mp4 ] || { echo "falta el tramo $n"; exit 1; }; done
echo "== master $(date +%H:%M)"
TRAMOS="video/out/ep11/c*.mp4" AUD=audio/mix/mezcla_ep11.wav OUT=video/out/el_sol_de_peron_1440p.mp4 \
  TITLE="EL SOL DE PERÓN" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
echo "== short $(date +%H:%M)"
cd video && npx remotion render src/index11s.tsx ShortSol out/short11_muted.mp4 --muted --gl=swangle --crf=15 --concurrency=4 --log=error && cd ..
IN=video/out/short11_muted.mp4 AUD=audio/mix/mezcla_short11.wav OUT=entrega/el_sol_de_peron_short.mp4 TITLE="EL SOL DE PERÓN (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py video/out/el_sol_de_peron_1440p.mp4 || true
python3 tools/check_congelados.py entrega/el_sol_de_peron_short.mp4 || true
echo "COLA LISTA $(date +%H:%M)"

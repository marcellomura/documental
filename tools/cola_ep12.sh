#!/bin/bash
# Cola del episodio 12: espera el render por tramos, codifica el master 1440p con la mezcla, renderiza el short
# y lo codifica. Al final corre el detector de tramos congelados sobre ambos.
set -e
cd "$(dirname "$0")/.."
while pgrep -f "tools/render_ep12.sh" > /dev/null; do sleep 60; done
tools/render_ep12.sh   # re-renderiza los tramos que falten (por ejemplo, uno borrado para corregirlo)
for n in $(seq -w 1 12); do [ -s video/out/ep12/c$n.mp4 ] || { echo "falta el tramo $n"; exit 1; }; done
while [ ! -s audio/mix/mezcla_ep12.wav ]; do sleep 30; done
echo "== master $(date +%H:%M)"
TRAMOS="video/out/ep12/c*.mp4" AUD=audio/mix/mezcla_ep12.wav OUT=video/out/907_metros_1440p.mp4 \
  TITLE="907 METROS" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
echo "== short $(date +%H:%M)"
cd video && npx remotion render src/index12s.tsx ShortSanJuan out/short12_muted.mp4 --muted --gl=swangle --crf=15 --concurrency=4 --log=error && rm -rf /tmp/remotion-webpack-bundle-* && cd ..
IN=video/out/short12_muted.mp4 AUD=audio/mix/mezcla_short12.wav OUT=entrega/907_metros_short.mp4 TITLE="907 METROS (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py video/out/907_metros_1440p.mp4 || true
python3 tools/check_congelados.py entrega/907_metros_short.mp4 || true
echo "COLA LISTA $(date +%H:%M)"

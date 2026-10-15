#!/bin/bash
# Short del episodio 5 en tres versiones (YouTube Shorts, Reels, TikTok). El cuerpo es idéntico hasta la transición
# al cierre, así que se renderiza una sola vez y después cada cierre aparte (tools/final.sh los une con PATCH).
# Usa una carpeta public reducida y un bundle propio fuera de /tmp/remotion-webpack-bundle-* (los renders por tramos
# de otros episodios borran esos bundles entre tramo y tramo).
#   PUB=<carpeta public reducida> BUNDLE=<carpeta del bundle> tools/render_short05.sh
set -e
cd "$(dirname "$0")/../video"
PUB=${PUB:?carpeta public reducida (ep05/globe, fonts, brand, tex)}
BUNDLE=${BUNDLE:?carpeta para el bundle}
read -r SPLIT YT IG TT <<< "$(python3 -c "
import json, math
t = json.load(open('src/data/ep05/short.json')); v = t['variants']
print(math.floor((t['cta'] - 0.8) * 30), *[math.ceil(v[k]['total'] * 30) for k in ('yt', 'ig', 'tt')])")"
mkdir -p out/ep05s
[ -d "$BUNDLE" ] || npx remotion bundle src/index05s.tsx --public-dir="$PUB" --out-dir="$BUNDLE" --log=error
R=(--muted --crf=15 --concurrency=${CONC:-2} --log=error)
[ -s out/ep05s/cuerpo.mp4 ] || { echo "== cuerpo 0-$((SPLIT-1)) $(date +%H:%M)"; npx remotion render "$BUNDLE" ShortRelojYT out/ep05s/cuerpo.tmp.mp4 --frames=0-$((SPLIT-1)) "${R[@]}" && mv out/ep05s/cuerpo.tmp.mp4 out/ep05s/cuerpo.mp4; }
for v in yt ig tt; do
  case $v in yt) N=$YT; C=ShortRelojYT;; ig) N=$IG; C=ShortRelojIG;; tt) N=$TT; C=ShortRelojTT;; esac
  f=out/ep05s/cierre_$v.mp4
  [ -s $f ] || { echo "== cierre $v $SPLIT-$((N-1)) $(date +%H:%M)"; npx remotion render "$BUNDLE" $C $f.tmp.mp4 --frames=$SPLIT-$((N-1)) "${R[@]}" && mv $f.tmp.mp4 $f; }
done
cd ..
for v in yt ig tt; do
  case $v in yt) OUT=entrega/tu_reloj_esta_mal_short_youtube.mp4; T="TU RELOJ ESTÁ MAL (YouTube Shorts)";; ig) OUT=entrega/tu_reloj_esta_mal_reel_instagram.mp4; T="TU RELOJ ESTÁ MAL (Reel)";; tt) OUT=entrega/tu_reloj_esta_mal_tiktok.mp4; T="TU RELOJ ESTÁ MAL (TikTok)";; esac
  IN=video/out/ep05s/cuerpo.mp4 PATCH=video/out/ep05s/cierre_$v.mp4 PATCH_FRAME=$SPLIT AUD=audio/mix/mezcla_short05_$v.wav OUT=$OUT TITLE="$T" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
done
echo "LISTO $(date +%H:%M)"

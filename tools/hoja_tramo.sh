#!/bin/bash
# Hoja de contacto de un tramo renderizado: un cuadro cada N segundos en una grilla, para revisar el render
# apenas sale cada tramo (sin esperar al máster). Uso: tools/hoja_tramo.sh video/out/ep15/c01.mp4 [cada_s] [salida.jpg]
set -e
IN=$1; EACH=${2:-2}; OUT=${3:-${IN%.mp4}_hoja.jpg}
# el tramo cNN empieza en (NN-1)·30 s: así la hora que se imprime es la del máster
NUM=$(basename "$IN" | sed -n 's/^c0*\([0-9][0-9]*\)\.mp4$/\1/p'); OFF=$(( ${NUM:-1} * 30 - 30 ))
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
N=$(python3 -c "import math;print(max(1,math.ceil($D/$EACH)))")
COLS=5; ROWS=$(( (N + COLS - 1) / COLS ))
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$IN")
case $W in 1080,*) TW=216;; *) TW=384;; esac
ffmpeg -v error -y -i "$IN" -vf "fps=1/$EACH,scale=$TW:-2,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf:text='%{pts\:hms\:$OFF}':x=6:y=6:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=${COLS}x${ROWS}:padding=4:color=black" -frames:v 1 -q:v 3 "$OUT"
echo "$OUT ($N cuadros, ${D}s)"

#!/bin/bash
# Re-renderiza solo un fragmento del episodio 10 y lo empalma dentro de su tramo (video/out/ep10/cXX.mp4).
# Uso: tools/patch_ep10.sh <tramo> <cuadro_inicial_del_tramo> <desde> <hasta>   (cuadros absolutos de la composición)
set -e
cd "$(dirname "$0")/../video"
n=$1; base=$2; a=$3; b=$4
f=$(printf "out/ep10/c%02d.mp4" $n)
p=$(printf "out/ep10/p%02d.mp4" $n)
npx remotion render Cuadro "$p" --muted --gl=swangle --scale=1.3333333333333333 --frames=$a-$b --crf=15 --concurrency=4 --log=error
la=$((a - base)); lb=$((b - base + 1))
total=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f")
ffmpeg -v error -y -i "$f" -i "$p" -filter_complex \
  "[0:v]split[s1][s2];[s1]trim=end_frame=$la,setpts=PTS-STARTPTS[x];[1:v]setpts=PTS-STARTPTS[y];[s2]trim=start_frame=$lb,setpts=PTS-STARTPTS[z];[x][y][z]concat=n=3:v=1:a=0[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 15 -pix_fmt yuv420p "$f.new.mp4"
nf=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f.new.mp4")
[ "$nf" = "$total" ] || { echo "cuadros distintos: $nf vs $total"; exit 1; }
mv "$f.new.mp4" "$f"; rm -f "$p"
echo "parche $f ok ($nf cuadros)"

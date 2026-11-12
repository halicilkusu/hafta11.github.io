# Pıtır'ın Maceraları — kaynak

Video tamamen kodla üretilir (hazır görsel/ses kullanılmaz).

    npm i @napi-rs/canvas
    node render.js events events.json
    for n in $(seq 1 10); do node render.js ep $n ep$n.mp4; done
    python3 audio.py events.json audio.wav      # numpy gerekir
    # ardından ffmpeg ile ep1..ep10 birleştirilir ve audio.wav eklenir

Yazı tipi: Baloo 2 (SIL Open Font License).

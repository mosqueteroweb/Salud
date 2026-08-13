import re, subprocess, os
from TTS.api import TTS

TEXT_FILE="/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_es.txt"
text=open(TEXT_FILE,encoding='utf-8').read()

LIM=239
def split_text(s):
    # trocear por oraciones (punto final), respetando LIM
    parts=[]
    for sent in re.split(r'(?<=[.!?])\s+', s):
        sent=sent.strip()
        if not sent: continue
        if len(sent)<=LIM:
            parts.append(sent); continue
        # subdividir por comas/palabras
        cur=""
        for seg in re.split(r'(?<=,)\s+', sent):
            if len(cur)+len(seg)+2<=LIM:
                cur=(cur+", "+seg) if cur else seg
            else:
                if cur: parts.append(cur)
                cur=seg
        if cur: parts.append(cur)
    return parts

parts=split_text(text)
print("fragmentos (oraciones):", len(parts))

device="mps"
tts=TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

tmp=[]
for i,p in enumerate(parts):
    f=f"/Users/pedro/carpetaHermes/salud-prototipo/audio/_h{i}.wav"
    tts.tts_to_file(text=p, speaker_wav="/Users/pedro/carpetaHermes/salud-prototipo/audio/ref_hombre_20s.wav", language="es", file_path=f)
    tmp.append(f)
    if i%15==0: print(f"  frag {i}/{len(parts)} ok")
lst="/Users/pedro/carpetaHermes/salud-prototipo/audio/_hlist.txt"
with open(lst,'w') as fh:
    for f in tmp: fh.write(f"file '{f}'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c","copy","/Users/pedro/carpetaHermes/salud-prototipo/audio/xtts_hombre.wav"],
               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for f in tmp: os.remove(f)
os.remove(lst)
print("HOMBRE listo / FIN")

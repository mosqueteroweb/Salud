import re, subprocess, os
from TTS.api import TTS

TEXT_FILE="/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_es.txt"
text=open(TEXT_FILE,encoding='utf-8').read()

def chunks(s,n=230):
    out=[]
    while s:
        if len(s)<=n:
            out.append(s.strip()); break
        cut=s.rfind(' ',0,n)
        if cut<=0: cut=n
        out.append(s[:cut].strip()); s=s[cut:].lstrip()
    return [c for c in out if c]

parts=chunks(text,230)
print("fragmentos:", len(parts))

device="mps"
tts=TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

def gen(speaker_wav, speaker, lang, out_wav):
    tmp=[]
    for i,p in enumerate(parts):
        f=f"/Users/pedro/carpetaHermes/salud-prototipo/audio/_c{i}.wav"
        if speaker_wav:
            tts.tts_to_file(text=p, speaker_wav=speaker_wav, language=lang, file_path=f)
        else:
            tts.tts_to_file(text=p, speaker=speaker, language=lang, file_path=f)
        tmp.append(f)
        if i % 10 == 0: print(f"  frag {i}/{len(parts)} ok")
    lst="/Users/pedro/carpetaHermes/salud-prototipo/audio/_list.txt"
    with open(lst,'w') as fh:
        for f in tmp: fh.write(f"file '{f}'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c","copy",out_wav],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for f in tmp: os.remove(f)
    os.remove(lst)
    print("LISTO", out_wav)

print("=== HOMBRE (clonado) ===")
gen("audio/ref_hombre_20s.wav", None, "es", "audio/xtts_hombre.wav")
print("=== MUJER (preset Ana Florence) ===")
gen(None, "Ana Florence", "es", "audio/xtts_mujer.wav")
print("FIN")

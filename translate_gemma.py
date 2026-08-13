import requests, json, time, re

SRC="/Users/pedro/carmonaHermes/salud-prototipo/audio/transcript_en.txt" if False else "/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_en.txt"
OUT="/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_es.txt"
text=open(SRC,encoding='utf-8').read()

def chunks(s,n=3500):
    out=[]
    while s:
        if len(s)<=n:
            out.append(s); break
        cut=s.rfind(' ',0,n)
        if cut<=0: cut=n
        out.append(s[:cut]); s=s[cut:].lstrip()
    return out

parts=chunks(text,3500)
SYS=("Eres un traductor y divulgador experto. Traduce del inglés al español de forma NATURAL y COLOQUIAL, "
     "como si un locutor de divulgación estuviera contando el texto en voz alta. Mantén el significado exacto, "
     "no inventes datos, no añadas explicaciones. Usa puntuación que ayude a la entonación (comas, puntos). "
     "Solo devuelve el texto traducido, sin notas ni marcas.")
res=[]
for i,p in enumerate(parts):
    r=requests.post("http://localhost:11434/api/generate",
        json={"model":"gemma4:26b","system":SYS,"prompt":p,"stream":False},timeout=300)
    t=r.json().get("response",p)
    res.append(t.strip())
    print(f"frag {i} ok ({len(t)} chars)")
    time.sleep(0.3)
es=' '.join(res)
es=re.sub(r'\s+',' ',es).strip()
open(OUT,'w',encoding='utf-8').write(es)
print("TOTAL es:",len(es))
print(es[:300])

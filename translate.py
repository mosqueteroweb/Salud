import time
from deep_translator import GoogleTranslator

src="/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_en.txt"
out="/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_es.txt"
text=open(src,encoding='utf-8').read()

def chunks(s,n=4500):
    out=[]
    while s:
        if len(s)<=n:
            out.append(s); break
        cut=s.rfind(' ',0,n)
        if cut<=0: cut=n
        out.append(s[:cut]); s=s[cut:].lstrip()
    return out

parts=chunks(text,4500)
tr=GoogleTranslator(source='en',target='es')
res=[]
for i,p in enumerate(parts):
    try:
        r=tr.translate(p)
    except Exception as e:
        print("error frag",i,e); r=p
    res.append(r)
    time.sleep(0.5)
es=' '.join(res)
open(out,'w',encoding='utf-8').write(es)
print("traducido chars:",len(es))
print("muestra:",es[:400])

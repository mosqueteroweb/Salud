import requests, base64, json, sys

TEXT_FILE="/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_es.txt"
REF_AUDIO="/Users/pedro/carpetaHermes/salud-prototipo/audio/audio_es.mp3"
OUT="/Users/pedro/carpetaHermes/salud-prototipo/audio/audio_fish.wav"
SERVER="http://localhost:8080"

text=open(TEXT_FILE,encoding='utf-8').read()
ref_b64=base64.b64encode(open(REF_AUDIO,'rb').read()).decode()

# Fish-Speech / OpenAudio S1-mini API (estilo OpenAI)
payload={
  "model": "fishaudio/openaudio-s1-mini",
  "text": text,
  "references": [ref_b64],
  "reference_id": None,
  "format": "wav",
  "lossless": False,
}
r=requests.post(SERVER+"/v1/tts", json=payload, timeout=1200)
if r.status_code!=200:
    print("ERROR", r.status_code, r.text[:500]); sys.exit(1)
open(OUT,'wb').write(r.content)
print("audio generado:", len(r.content), "bytes ->", OUT)

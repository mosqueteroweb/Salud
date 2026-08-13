import sys
from TTS.api import TTS

TEXT_FILE="/Users/pedro/carpetaHermes/salud-prototipo/audio/transcript_es.txt"
text=open(TEXT_FILE,encoding='utf-8').read()

device="mps"
tts=TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# Hombre: clonar desde referencia del usuario
tts.tts_to_file(
    text=text,
    speaker_wav="/Users/pedro/carpetaHermes/salud-prototipo/audio/ref_hombre_20s.wav",
    language="es",
    file_path="/Users/pedro/carpetaHermes/salud-prototipo/audio/xtts_hombre.wav",
)
print("HOMBRE listo")

# Mujer: speaker preset del modelo (es-ES)
tts.tts_to_file(
    text=text,
    speaker="Ana Florence",
    language="es",
    file_path="/Users/pedro/carpetaHermes/salud-prototipo/audio/xtts_mujer.wav",
)
print("MUJER listo")

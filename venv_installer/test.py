import whisper
import sys

def transcribe_to_vtt(audio_path, output_vtt_path, model="base"):
  # Whisper 모델 로드
  model = whisper.load_model(model)

  # 오디오 파일 변환
  result = model.transcribe(audio_path, verbose=False)

  # 결과를 WebVTT 형식으로 변환
  segments = result["segments"]
  with open(output_vtt_path, 'w', encoding='utf-8') as vtt_file:
    vtt_file.write("WEBVTT\n\n")
    for segment in segments:
      start = format_timestamp(segment["start"])
      end = format_timestamp(segment["end"])
      text = segment["text"]
      vtt_file.write(f"{start} --> {end}\n{text}\n\n")

def format_timestamp(seconds):
  """초 단위의 시간을 HH:MM:SS.MMM 형식으로 변환"""
  hours = int(seconds // 3600)
  minutes = int((seconds % 3600) // 60)
  seconds = seconds % 60
  return f"{hours:02}:{minutes:02}:{seconds:06.3f}"

if __name__ == "__main__":
  if len(sys.argv) < 3:
    print("Usage: python script.py <audio_path> <output_vtt_path> [model_size]")
    sys.exit(1)

  audio_path = sys.argv[1]
  output_vtt_path = sys.argv[2]
  model_size = sys.argv[3] if len(sys.argv) > 3 else "base"

  transcribe_to_vtt(audio_path, output_vtt_path, model_size)

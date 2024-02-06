import sys
from googletrans import Translator, LANGUAGES
import re

def get_leading_trailing_spaces(s):
    leading_spaces = s[:len(s) - len(s.lstrip())]
    trailing_spaces = s[len(s.rstrip()):]
    return leading_spaces, trailing_spaces

def translate_vtt_blocks(input_vtt_path, output_vtt_path, dest_lang='ko'):
  translator = Translator()
  pattern = re.compile(r'(\d{2}:)?\d{2}:\d{2}\.\d{3} --> (\d{2}:)?\d{2}:\d{2}\.\d{3}')

  segments = []  # 타임스탬프와 텍스트 세그먼트 저장
  current_segment = {'timestamp': '', 'text': []}
  first_line = True
  max_bytes = 1000

  # 파일 읽기
  with open(input_vtt_path, 'r', encoding='utf-8') as file:
    for line in file:
      if first_line and line.startswith('WEBVTT'):
        first_line = False
        continue  # 'WEBVTT' 헤더는 건너뜀
      if pattern.match(line):
        if current_segment['text']:  # 이전 세그먼트 저장
          if current_segment['timestamp']:
            segments.append(current_segment)
          current_segment = {'timestamp': line.strip(), 'text': []}
        else:  # 첫 번째 타임스탬프인 경우
          current_segment['timestamp'] = line.strip()
      else:
        current_segment['text'].append(line.strip())
  if current_segment['text']:  # 마지막 세그먼트 추가
    segments.append(current_segment)

  # print(f'segments : {segments}')

  # 세그먼트 번역
  accumulated_text = []
  translated_text = []
  for segment in segments:
    text_to_translate = '\n'.join(segment['text'])
    accumulated_text.append(text_to_translate)
    if len('\n'.join(accumulated_text).encode('utf-8')) > max_bytes:
      input = '\n'.join(accumulated_text)
      # print(f'input : {input}')
      leading_spaces, trailing_spaces = get_leading_trailing_spaces(input)
      output = translator.translate(input, dest=dest_lang).text
      # print(f'output : {output}')
      translated_text.append(leading_spaces + output + trailing_spaces)
      accumulated_text = []
  if accumulated_text:
    input = '\n'.join(accumulated_text)
    # print(f'input2 : {input}')
    leading_spaces, trailing_spaces = get_leading_trailing_spaces(input)
    output = translator.translate(input, dest=dest_lang).text
    # print(f'output2 : {output}')
    translated_text.append(leading_spaces + output + trailing_spaces)
    # translated_text.append(translator.translate('\n'.join(accumulated_text), dest=dest_lang).text)

  translated_text = '\n'.join(translated_text).split('\n')
  # print(f'translated_text : {translated_text}')
  # # 번역된 세그먼트를 VTT 형식으로 파일에 저장
  with open(output_vtt_path, 'w', encoding='utf-8') as file:
    file.write('WEBVTT\n\n')  # 'WEBVTT' 헤더를 파일 맨 앞에 추가
    for i, segment in enumerate(segments):
      # file.write(str(i + 1) + '\n')
      file.write(segment['timestamp'] + '\n')
      for line in segment['text']:
        file.write(translated_text.pop(0) + '\n')

if __name__ == '__main__':
  if len(sys.argv) < 3:
    print("Usage: python script.py <input_vtt_path> <output_vtt_path> [dest_lang]")
    sys.exit(1)
  input_vtt_path = sys.argv[1]  # 번역할 VTT 파일 경로
  output_vtt_path = sys.argv[2]  # 번역된 VTT 파일 저장 경로
  dest_lang = sys.argv[3] if len(sys.argv) > 3 else "ko"  # 목적 언어 코드 (예: 'ko'는 한국어)
  translate_vtt_blocks(input_vtt_path, output_vtt_path, dest_lang)

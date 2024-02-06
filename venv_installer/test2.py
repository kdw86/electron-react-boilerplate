import whisper
from googletrans import Translator

class Google_Translator:
  def __init__(self):
    self.translator = Translator()
    self.result = {'src_text': '', 'src_lang': '', 'tgt_text': '', 'tgt_lang': ''}

  def translate(self, text, lang='en'):
    translated = self.translator.translate(text, dest=lang)
    self.result['src_text'] = translated.origin
    self.result['src_lang'] = translated.src
    self.result['tgt_text'] = translated.text
    self.result['tgt_lang'] = translated.dest
    return self.result

  def translate_file(self, file_path, lang='en'):
    with open(file_path, 'r') as f:
      text = f.read()
    return self.translate(text, lang)

if __name__ == '__main__':
  translator = Google_Translator()

  # Select the language you want to translate to
  tgt_lang_code = input('# Enter language code (Default: ko): ')

  if tgt_lang_code == '':
      tgt_lang_code = 'ko'

  print('>> You chose: {}\n'.format(tgt_lang_code))

  # Select the option you want to use
  input_message = '# Pick an option: text or file: \n'

  for index, option in enumerate(options):
      input_message += f'{index + 1}. {option}\n'

  input_message += 'Enter your choice: '

  option = input(input_message)

  print('>> You chose: {}\n'.format(options[int(option) - 1]))

  # Translate the text
  if option == '1':
      input_text = input('Press Enter to translate: ')
      result = translator.translate(input_text, tgt_lang_code)

      print('[{}] -> [{}]'.format(result['src_lang'], result['tgt_lang']))
      print('=' * 50)
      print('Source Text : {}'.format(result['src_text']))
      print('Target Text : {}'.format(result['tgt_text']))
  # Translate the file
  elif option == '2':
      file_path = input('Enter file path: ')
      result = translator.translate_file(file_path, tgt_lang_code)

      print('[{}] -> [{}]'.format(result['src_lang'], result['tgt_lang']))
      print('=' * 50)
      print('Source Text : [{}]\n'.format(result['src_text']))
      print('Target Text : [{}]'.format(result['tgt_text']))


options = ['text', 'file']
model = whisper.load_model("base")

# load audio and pad/trim it to fit 30 seconds
audio = whisper.load_audio("audio.mp3")
audio = whisper.pad_or_trim(audio)

# make log-Mel spectrogram and move to the same device as the model
mel = whisper.log_mel_spectrogram(audio).to(model.device)

# detect the spoken language
_, probs = model.detect_language(mel)
print(f"Detected language: {max(probs, key=probs.get)}")

# decode the audio
options = whisper.DecodingOptions()
result = whisper.decode(model, mel, options)

# print the recognized text
print(result.text)

#!/usr/bin/env python3
"""Generate static privacy translations from the preserved English originals.

No network calls. Every substantive text segment must have a translation.
Original public/ and legacy/ policy files are never changed.
"""
from pathlib import Path
from html.parser import HTMLParser
import html,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
SOURCE=json.loads((ROOT/'src/i18n/privacy-source.json').read_text())
DICTIONARY=json.loads((ROOT/'src/i18n/privacy-dictionary.json').read_text())
FILES={
'aster-strike':('aster-privacy-policy.html','/aster-privacy-policy.html','/aster-tos.html'),
'blokito-puzzle':('blokito-puzzle-privacy.html','/blokito-puzzle-privacy.html','/blockito-puzzle-tos.html'),
'grill-pop':('grillpop-privacy.html','/grillpop-privacy.html','/grillpop-tos.html'),
'mochi-tiles':('mochi-tiles-policy.html','/mochi-tiles-policy.html','/mochi-tiles-tos.html'),
'memory-pairs':('mp_policy.html','/privacy','/mp_tos.html'),
'math-challenge':('math_privacy.html','/math_privacy','/math_tos.html'),
'sudoku-challenge':('sudoku_policy.html','/sudoku_policy','/sudoku_tos.html')}
ALIASES={14:13,43:41,64:63,65:63,73:72,74:72,76:75,77:75,78:75,79:72,80:72,81:72,82:72}
UNCHANGED={0,1,4,19,22,23,90,104,105,106}
APPS=['Aster Strike','Blokito Puzzle','Foodie Grill Pop','Mochi Tiles','Matching Pairs','Math Challenge','Sudoku Challenge']
def translate(text,locale):
 normalized=re.sub(r'\s+',' ',text).strip()
 if not normalized or normalized=='zeakar_games':return ''
 if normalized not in SOURCE:raise ValueError('Unmapped original policy text: '+normalized)
 i=SOURCE.index(normalized)
 if locale=='en' or i in UNCHANGED:return normalized
 key=str(ALIASES.get(i,i))
 if key not in DICTIONARY[locale]:raise ValueError(f'Missing translation: {locale}/{i}: {normalized}')
 translated=DICTIONARY[locale][key]
 params={'app':next((app for app in APPS if app in normalized),''),'provider':next((provider for provider in ['Lamian Studio','Milaan Games','Milaan'] if provider in normalized),''),'date':next(iter(re.findall(r'\d{4}-\d{2}-\d{2}',normalized)),'')}
 return translated.format(**params)

class Policy(HTMLParser):
 def __init__(self,locale):
  super().__init__(convert_charrefs=True);self.locale=locale;self.inside=False;self.skip=0;self.email=False;self.result=[];self.ids=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='body':self.inside=True;return
  if not self.inside:return
  if tag in ['script','style']:self.skip+=1;return
  if self.skip:return
  if 'data-cfemail' in attrs:
   b=bytes.fromhex(attrs['data-cfemail']);email=bytes(v^b[0] for v in b[1:]).decode()
   self.result.append('<a href="mailto:'+html.escape(email,quote=True)+'">'+html.escape(email));self.email=True;return
  if tag not in ['p','strong','em','ul','ol','li','a','br','hr','h1','h2','h3','h4','div','span']:return
  attr=''
  if tag=='a':
   href=attrs.get('href','')
   if href.startswith(('https://','http://','mailto:','#')):attr=' href="'+html.escape(href,quote=True)+'" rel="noopener noreferrer"'
  self.result.append('<'+tag+attr+'>')
 def handle_endtag(self,tag):
  if tag=='body':self.inside=False;return
  if not self.inside:return
  if tag in ['script','style']:self.skip-=1;return
  if self.skip:return
  if tag=='a' and self.email:self.email=False;self.result.append('</a>');return
  if tag in ['p','strong','em','ul','ol','li','a','h1','h2','h3','h4','div','span']:self.result.append('</'+tag+'>')
 def handle_data(self,text):
  if not self.inside or self.skip or self.email:return
  normalized=re.sub(r'\s+',' ',text).strip()
  if normalized and normalized!='zeakar_games':
   self.ids.append(SOURCE.index(normalized));result=translate(text,self.locale)
   self.result.append((' ' if text[0].isspace() else '')+html.escape(result)+(' ' if text[-1].isspace() else ''))

output={};coverage={}
for game,(filename,path,terms) in FILES.items():
 original=(ROOT/'public'/filename).read_text();locales={}
 for locale in ['en','vi','zh','fr','th','ja','ko']:
  parser=Policy(locale);parser.feed(original)
  locales[locale]=''.join(parser.result)
  coverage[f'{locale}/{game}']={'segments':len(parser.ids),'source_sha256':hashlib.sha256(original.encode()).hexdigest()}
 output[game]={'originalUrl':'https://game.lamian.dev'+path,'termsUrl':'https://game.lamian.dev'+terms,'sourceFile':filename,'locales':locales}
(ROOT/'src/data/privacy-translations.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/ui-review/privacy-translation-coverage.json').write_text(json.dumps({'source':'Preserved English app privacy policies; dates, providers, links and emails retained.','translations':'Prepared by Codex. Original English policies remain unchanged.','coverage':coverage},indent=2)+'\n')
print('Generated 49 complete privacy documents across 7 languages; no missing text segments.')

# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from docx import Document

doc = Document('final report_FINAL_v3.docx')

print("=== CHAPTER 2 FULL CONTENT ===")
in_ch2 = False
stop = False
for i, para in enumerate(doc.paragraphs):
    text = para.text.strip()
    style = para.style.name
    if not text:
        continue
    
    # Detect start of chapter 2
    if 'OVERVIEW OF KNOWLEDGE' in text.upper() and 'Heading' in style:
        in_ch2 = True
    
    if not in_ch2:
        continue
    
    # Detect start of chapter 3
    if in_ch2 and ('BUSINESS CONTEXT' in text.upper() or 'CHAPTER 3' in text.upper()) and 'Heading' in style:
        break
    
    prefix = ''
    if 'Heading 1' in style: prefix = '\n=H1= '
    elif 'Heading 2' in style: prefix = '\n  =H2= '
    elif 'Heading 3' in style: prefix = '\n    =H3= '
    else: prefix = '  BODY: '
    
    print(f'{prefix}{text[:400]}')

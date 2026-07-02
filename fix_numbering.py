# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import re
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document('final report_FINAL_v2.docx')

print("Fixing Heading 1 paragraphs...")

non_chapter_headings = [
    'ACKNOWLEDGEMENT',
    'CONTENTS',
    'LIST OF PICTURES AND TABLES',
    'REFERENCES'
]

def remove_numbering(para):
    pPr = para._element.get_or_add_pPr()
    # Remove existing numPr if any
    old_numPr = pPr.find(qn('w:numPr'))
    if old_numPr is not None:
        pPr.remove(old_numPr)
    
    # Add new numPr with numId = 0 (no numbering)
    numPr = OxmlElement('w:numPr')
    numId = OxmlElement('w:numId')
    numId.set(qn('w:val'), '0')
    numPr.append(numId)
    pPr.append(numPr)

for para in doc.paragraphs:
    if para.style.name == 'Heading 1':
        text = para.text.strip()
        
        # 1. Remove numbering from non-chapters
        if any(h in text.upper() for h in non_chapter_headings):
            remove_numbering(para)
            print(f"  Removed numbering from: {text}")
            
        # 2. Strip manual "CHAPTER X: " from chapters
        match = re.match(r'^CHAPTER\s+\d+:\s*(.*)', text, re.IGNORECASE)
        if match:
            new_text = match.group(1).strip()
            # Preserve formatting if possible, or just replace text
            if para.runs:
                para.runs[0].text = new_text
                for r in para.runs[1:]:
                    r.text = ''
            else:
                para.text = new_text
            print(f"  Stripped manual prefix: '{text}' -> '{new_text}'")

doc.save('final report_FINAL_v3.docx')
print("\nSaved to 'final report_FINAL_v3.docx'")

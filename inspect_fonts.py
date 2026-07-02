# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from docx import Document
from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn

IN_FILE = "final report_FINAL.docx"
doc = Document(IN_FILE)

print("=== DOCUMENT DEFAULT STYLES ===")
print(f"Normal font: {doc.styles['Normal'].font.name} {doc.styles['Normal'].font.size}")
for i in range(1, 5):
    try:
        h = doc.styles[f'Heading {i}']
        print(f"Heading {i}: font={h.font.name}, size={h.font.size}, bold={h.font.bold}, color={h.font.color.rgb if h.font.color and h.font.color.type else 'default'}")
    except:
        pass

print("\n=== TOC PARAGRAPHS ===")
for i, para in enumerate(doc.paragraphs):
    text = para.text.strip()
    style = para.style.name
    if 'TOC' in style or 'toc' in style.lower() or (i > 47 and i < 60):
        print(f"[{i}] style={style!r} text={text[:80]!r}")
        for run in para.runs:
            print(f"     run: font={run.font.name!r} size={run.font.size} bold={run.font.bold} text={run.text[:40]!r}")

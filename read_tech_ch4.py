# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from docx import Document

doc = Document('final report_FINAL_v5.docx')

# Extract tech sections + chapters 2.3, 4
targets = [
    'Technology used', 'SYSTEM DESIGN', 'CHAPTER 4',
    'Data Layer', 'Database Design', 'OLAP', 'ETL',
    'Kiến trúc', 'Module', 'Implementation',
    'Oracle', 'ASP.NET', 'Entity Framework', 'SQLite', '.NET'
]

print("=== TECH + CHAPTER 4 CONTENT ===\n")
in_ch4 = False
in_tech = False

for i, para in enumerate(doc.paragraphs):
    text = para.text.strip()
    style = para.style.name

    if not text:
        continue

    # Track chapter 4
    if 'SYSTEM DESIGN' in text.upper() and 'Heading 1' in style:
        in_ch4 = True
    if in_ch4 and 'IMPLEMENTATION' in text.upper() and 'Heading 1' in style:
        in_ch4 = False

    # Track tech section
    if 'Technology used' in text and 'Heading' in style:
        in_tech = True
    if in_tech and 'Functions in system' in text and 'Heading' in style:
        in_tech = False

    if in_ch4 or in_tech:
        if 'Heading 1' in style: pfx = '\n=H1='
        elif 'Heading 2' in style: pfx = '\n  =H2='
        elif 'Heading 3' in style: pfx = '\n    =H3='
        else: pfx = '   '
        print(f"{pfx} [{i}] {text[:400]}")

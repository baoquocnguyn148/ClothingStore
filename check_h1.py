import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from docx import Document

doc = Document('final report_FINAL_v2.docx')
print("=== HEADING 1 PARAGRAPHS ===")
for p in doc.paragraphs:
    if p.style.name == 'Heading 1':
        print(f"Text: '{p.text}'")

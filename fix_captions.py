# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import re
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document('final report_FINAL_v3.docx')

print("Applying Caption style to pictures and tables...")

# Ensure Caption style exists and looks good
try:
    caption_style = doc.styles['Caption']
except KeyError:
    caption_style = doc.styles.add_style('Caption', WD_STYLE_TYPE.PARAGRAPH)

# Format Caption style
font = caption_style.font
font.name = 'Times New Roman'
font.size = Pt(11)
font.italic = True
font.color.rgb = RGBColor(0x33, 0x33, 0x33)  # Dark Gray
caption_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
caption_style.paragraph_format.space_before = Pt(6)
caption_style.paragraph_format.space_after = Pt(12)

# Find paragraphs that look like captions
# Matches: "Hình X.X", "📌 Hình X.X", "Bảng X.X", "Table X.X", "Figure X.X"
caption_pattern = re.compile(r'^(?:📌\s*)?(Hình|Bảng|Figure|Table)\s+\d+\.\d+.*', re.IGNORECASE)

count = 0
for para in doc.paragraphs:
    text = para.text.strip()
    if caption_pattern.match(text):
        para.style = caption_style
        # Center align the paragraph explicitly just in case
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print(f"  Found caption: {text[:50]}...")
        count += 1

doc.save('final report_FINAL_v4.docx')
print(f"\nDone! Applied 'Caption' style to {count} items.")
print("Saved to 'final report_FINAL_v4.docx'")

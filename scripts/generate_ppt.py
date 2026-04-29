#!/usr/bin/env python3
"""
Professor Assistant — PPT Generator
Converts a session.md lecture file into a .pptx presentation.
Speaker notes contain the full lecture script.

Usage:
  python3 scripts/generate_ppt.py courses/[FOLDER]/lectures/week01/session1.md
"""

import sys
import re
import os
from pathlib import Path

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN
    from pptx.oxml.ns import qn
    from lxml import etree
except ImportError:
    print("Error: python-pptx is not installed.")
    print("Run: pip install python-pptx")
    sys.exit(1)

# ── Colour palette ────────────────────────────────────────────────────────────
DARK_BLUE  = RGBColor(0x1B, 0x35, 0x6E)
ACCENT     = RGBColor(0x2E, 0x6D, 0xB4)
GOLD       = RGBColor(0xC9, 0xA0, 0x2B)
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xF7, 0xF7, 0xF7)
DARK_GRAY  = RGBColor(0x33, 0x33, 0x33)
MID_GRAY   = RGBColor(0x88, 0x88, 0x88)

W  = Inches(13.33)
H  = Inches(7.5)
M  = Inches(0.45)   # margin


# ── Low-level helpers ─────────────────────────────────────────────────────────

def _blank_slide(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def _bg(slide, color):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def _rect(slide, x, y, w, h, color, line=False):
    from pptx.util import Emu
    shp = slide.shapes.add_shape(1, x, y, w, h)
    shp.fill.solid()
    shp.fill.fore_color.rgb = color
    if not line:
        shp.line.fill.background()
    return shp


def _textbox(slide, x, y, w, h, text, size, bold=False,
             color=DARK_GRAY, align=PP_ALIGN.LEFT, wrap=True):
    txb = slide.shapes.add_textbox(x, y, w, h)
    tf  = txb.text_frame
    tf.word_wrap = wrap
    p   = tf.paragraphs[0]
    p.alignment = align
    r   = p.add_run()
    r.text = text
    r.font.size  = Pt(size)
    r.font.bold  = bold
    r.font.color.rgb = color
    return txb


def _set_notes(slide, text):
    if not text:
        return
    nf = slide.notes_slide.notes_text_frame
    nf.clear()
    for i, line in enumerate(text.split('\n')):
        p = nf.paragraphs[0] if i == 0 else nf.add_paragraph()
        p.text = line


# ── Slide builders ────────────────────────────────────────────────────────────

def add_title_slide(prs, title, subtitle, notes=""):
    slide = _blank_slide(prs)
    _bg(slide, DARK_BLUE)
    _rect(slide, 0, H - Inches(0.15), W, Inches(0.15), GOLD)
    _rect(slide, 0, Inches(3.55), Inches(0.08), Inches(1.9), GOLD)
    _textbox(slide, M + Inches(0.2), Inches(2.9), W - M*2, Inches(1.2),
             title, 38, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
    _textbox(slide, M + Inches(0.2), Inches(4.15), W - M*2, Inches(0.9),
             subtitle, 22, bold=False, color=RGBColor(0xAA, 0xBB, 0xDD),
             align=PP_ALIGN.LEFT)
    _set_notes(slide, notes)
    return slide


def add_section_slide(prs, title, notes=""):
    slide = _blank_slide(prs)
    _bg(slide, ACCENT)
    _rect(slide, 0, Inches(3.4), Inches(0.1), Inches(0.7), GOLD)
    _textbox(slide, Inches(0.35), Inches(3.1), W - Inches(0.7), Inches(1.3),
             title, 34, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
    _set_notes(slide, notes)
    return slide


def add_content_slide(prs, title, bullets, notes=""):
    slide = _blank_slide(prs)
    _bg(slide, LIGHT_GRAY)
    _rect(slide, 0, 0, W, Inches(1.15), DARK_BLUE)
    _rect(slide, 0, Inches(1.15), W, Inches(0.05), GOLD)
    _textbox(slide, M, Inches(0.15), W - M*2, Inches(0.95),
             title, 26, bold=True, color=WHITE, align=PP_ALIGN.LEFT)

    txb = slide.shapes.add_textbox(M, Inches(1.35), W - M*2, Inches(5.9))
    tf  = txb.text_frame
    tf.word_wrap = True

    for idx, raw in enumerate(bullets):
        stripped  = raw.lstrip()
        is_sub    = raw.startswith('    ') or raw.startswith('\t\t')
        bullet_ch = '◦' if is_sub else '●'
        clean     = re.sub(r'^[-*•◦●]\s*', '', stripped)
        text      = f"  {bullet_ch}  {clean}" if is_sub else f"{bullet_ch}  {clean}"

        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        r = p.add_run()
        r.text = text
        r.font.size  = Pt(17 if is_sub else 20)
        r.font.color.rgb = MID_GRAY if is_sub else DARK_GRAY
        p.space_after = Pt(4 if is_sub else 8)

    _set_notes(slide, notes)
    return slide


def add_quote_slide(prs, quote, source="", notes=""):
    slide = _blank_slide(prs)
    _bg(slide, DARK_BLUE)
    _textbox(slide, Inches(1), Inches(2.0), W - Inches(2), Inches(3),
             f'"{quote}"', 28, bold=False, color=WHITE, align=PP_ALIGN.CENTER)
    if source:
        _textbox(slide, Inches(1), Inches(5.2), W - Inches(2), Inches(0.6),
                 f"— {source}", 18, color=GOLD, align=PP_ALIGN.CENTER)
    _set_notes(slide, notes)
    return slide


def add_closing_slide(prs, course, week, session, notes=""):
    slide = _blank_slide(prs)
    _bg(slide, DARK_BLUE)
    _rect(slide, 0, H - Inches(0.15), W, Inches(0.15), GOLD)
    _textbox(slide, M, Inches(2.8), W - M*2, Inches(1),
             "Q & A", 48, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    _textbox(slide, M, Inches(3.9), W - M*2, Inches(0.7),
             f"{course}  ·  Week {week}  ·  Session {session}",
             18, color=RGBColor(0xAA, 0xBB, 0xDD), align=PP_ALIGN.CENTER)
    _set_notes(slide, notes)
    return slide


# ── Markdown parser ───────────────────────────────────────────────────────────

def parse_slide_deck(md_text):
    """
    Finds the SECTION 3: SLIDE DECK block and returns a list of slide dicts.
    Expected block format:

    [SLIDE N | TYPE]
    Title: ...
    Subtitle: ...      (optional, TITLE slides)
    - bullet
      - sub-bullet
    Notes: full script text
    (blank line terminates the notes)
    """
    # Locate the slide deck section
    m = re.search(
        r'(?:SECTION 3|SLIDE DECK)[^\n]*\n(.*)',
        md_text, re.IGNORECASE | re.DOTALL
    )
    if not m:
        return []

    deck_text = m.group(1)

    # Split on [SLIDE N | TYPE] markers
    raw_blocks = re.split(r'\[SLIDE\s+\d+\s*[|｜]\s*', deck_text)
    slides = []

    for block in raw_blocks:
        block = block.strip()
        if not block:
            continue

        lines = block.split('\n')
        first = lines[0].strip().rstrip(']').upper()

        slide = {
            'type':     first,
            'title':    '',
            'subtitle': '',
            'bullets':  [],
            'notes':    '',
            'quote':    '',
            'source':   '',
        }

        in_notes = False
        notes_buf = []
        bullet_buf = []

        for line in lines[1:]:
            if in_notes:
                notes_buf.append(line)
                continue

            if line.startswith('Title:'):
                slide['title'] = line[6:].strip()
            elif line.startswith('Subtitle:'):
                slide['subtitle'] = line[9:].strip()
            elif line.startswith('Quote:'):
                slide['quote'] = line[6:].strip()
            elif line.startswith('Source:'):
                slide['source'] = line[7:].strip()
            elif line.startswith('Notes:'):
                in_notes = True
                rest = line[6:].strip()
                if rest:
                    notes_buf.append(rest)
            elif re.match(r'\s*[-*•]', line):
                bullet_buf.append(line)

        slide['bullets'] = bullet_buf
        slide['notes']   = '\n'.join(notes_buf).strip()
        slides.append(slide)

    return slides


def fallback_from_lesson_plan(md_text):
    """Generate basic slides from the lesson plan table when no SLIDE DECK exists."""
    slides = []

    course  = re.search(r'\|\s*Course\s*\|\s*(.+?)\s*\|', md_text)
    week    = re.search(r'\|\s*Week\s*\|\s*(.+?)\s*\|', md_text)
    session = re.search(r'\|\s*Session\s*\|\s*(.+?)\s*\|', md_text)
    topic   = re.search(r'\|\s*Topic\s*\|\s*(.+?)\s*\|', md_text)

    c = course.group(1)  if course  else "Course"
    w = week.group(1)    if week    else "?"
    s = session.group(1) if session else "?"
    t = topic.group(1)   if topic   else "Lecture"

    slides.append({'type': 'TITLE', 'title': c,
                   'subtitle': f"Week {w}  ·  Session {s}  —  {t}",
                   'bullets': [], 'notes': '', 'quote': '', 'source': ''})

    # Objectives
    obj = re.search(r'Learning Objectives.*?\n(.*?)(?=\n\*\*|\n#{2,})', md_text, re.DOTALL)
    if obj:
        bullets = [l.strip() for l in obj.group(1).split('\n') if l.strip().startswith('-')]
        slides.append({'type': 'CONTENT', 'title': 'Learning Objectives',
                       'bullets': bullets, 'notes': '', 'quote': '', 'source': ''})

    # Time breakdown rows
    rows = re.findall(
        r'\|\s*[\d:]+\s*\|\s*[\d ]+\s*min\s*\|\s*([^|]{3,}?)\s*\|', md_text
    )
    for activity in rows:
        act = activity.strip()
        if act and act.lower() not in ('activity', 'duration'):
            slides.append({'type': 'CONTENT', 'title': act,
                           'bullets': [], 'notes': '', 'quote': '', 'source': ''})

    slides.append({'type': 'CLOSING', 'title': '', 'subtitle': '',
                   'bullets': [], 'notes': '', 'quote': '', 'source': ''})
    return slides, c, w, s


# ── Main ──────────────────────────────────────────────────────────────────────

def generate_ppt(md_path_str):
    md_path = Path(md_path_str)
    if not md_path.exists():
        print(f"Error: file not found — {md_path}")
        sys.exit(1)

    md_text = md_path.read_text(encoding='utf-8')
    slides  = parse_slide_deck(md_text)

    # Try to pull meta from lesson plan header for the closing slide
    course_m  = re.search(r'\|\s*Course\s*\|\s*(.+?)\s*\|', md_text)
    week_m    = re.search(r'\|\s*Week\s*\|\s*(.+?)\s*\|', md_text)
    session_m = re.search(r'\|\s*Session\s*\|\s*(.+?)\s*\|', md_text)
    course_name  = course_m.group(1)  if course_m  else "Course"
    week_num     = week_m.group(1)    if week_m    else "?"
    session_num  = session_m.group(1) if session_m else "?"

    if not slides:
        print("No SLIDE DECK section found — building fallback from lesson plan...")
        slides, course_name, week_num, session_num = fallback_from_lesson_plan(md_text)

    prs = Presentation()
    prs.slide_width  = W
    prs.slide_height = H

    for s in slides:
        stype = s['type'].upper()
        if 'TITLE' in stype:
            add_title_slide(prs, s['title'], s['subtitle'], s['notes'])
        elif 'SECTION' in stype or 'DIVIDER' in stype:
            add_section_slide(prs, s['title'], s['notes'])
        elif 'QUOTE' in stype:
            add_quote_slide(prs, s['quote'], s['source'], s['notes'])
        elif 'CLOSING' in stype or 'QA' in stype or 'Q&A' in stype:
            add_closing_slide(prs, course_name, week_num, session_num, s['notes'])
        else:
            add_content_slide(prs, s['title'], s['bullets'], s['notes'])

    out = md_path.parent / (md_path.stem + '_slides.pptx')
    prs.save(out)
    print(f"✓ PPT saved → {out}")
    return out


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/generate_ppt.py <path/to/session.md>")
        print("Example: python3 scripts/generate_ppt.py courses/ENG101/lectures/week01/session1.md")
        sys.exit(1)
    generate_ppt(sys.argv[1])

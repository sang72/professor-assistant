import PptxGenJS from 'pptxgenjs';
import fs from 'fs';

export async function markdownToPptx(mdText, title = 'Presentation') {
  try {
    const prs = new PptxGenJS();

    const slides = [];
    const lines = mdText.split('\n');
    let currentSlide = { title: '', content: [], isFirstSlide: false };

    // Parse markdown into slides
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        // Main heading - new slide
        if (currentSlide.content.length > 0 || currentSlide.title) {
          slides.push({ ...currentSlide });
        }
        currentSlide = { title: line.substring(2).trim(), content: [], isFirstSlide: slides.length === 0 };
      } else if (line.startsWith('---')) {
        // Slide break
        if (currentSlide.title || currentSlide.content.length > 0) {
          slides.push({ ...currentSlide });
          currentSlide = { title: '', content: [], isFirstSlide: false };
        }
      } else if (line.trim().length > 0) {
        currentSlide.content.push(line);
      }
    }

    // Add last slide
    if (currentSlide.title || currentSlide.content.length > 0) {
      slides.push(currentSlide);
    }

    // If no slides, create title slide only
    if (slides.length === 0) {
      slides.push({ title: '', content: [], isFirstSlide: true });
    }

    // Create PPT slides
    slides.forEach((slideData, idx) => {
      const slide = prs.addSlide();

      if (slideData.isFirstSlide && !slideData.title) {
        // Title slide
        slide.background = { color: '2563eb' };
        slide.addText(title, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 1.5,
          fontSize: 44,
          bold: true,
          color: 'ffffff',
          align: 'center',
          fontFace: 'Arial'
        });
        slide.addText(new Date().toLocaleDateString('ko-KR'), {
          x: 0.5,
          y: 3.8,
          w: 9,
          h: 0.5,
          fontSize: 16,
          color: 'ffffff',
          align: 'center',
          fontFace: 'Arial'
        });
      } else {
        // Content slide
        slide.background = { color: 'ffffff' };
        let yPos = 0.5;

        // Add title if present
        if (slideData.title) {
          slide.addText(slideData.title, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.6,
            fontSize: 36,
            bold: true,
            color: '1f2937',
            fontFace: 'Arial'
          });
          yPos += 0.8;
        }

        // Add content
        for (const line of slideData.content) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('## ')) {
            // Sub heading
            slide.addText(trimmed.substring(3), {
              x: 0.5,
              y: yPos,
              w: 9,
              h: 0.4,
              fontSize: 24,
              bold: true,
              color: '374151',
              fontFace: 'Arial'
            });
            yPos += 0.5;
          } else if (trimmed.startsWith('### ')) {
            // Smaller heading
            slide.addText(trimmed.substring(4), {
              x: 0.7,
              y: yPos,
              w: 8.8,
              h: 0.35,
              fontSize: 18,
              bold: true,
              color: '#4b5563',
              fontFace: 'Arial'
            });
            yPos += 0.4;
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            // Bullet point
            slide.addText(trimmed.substring(2), {
              x: 0.9,
              y: yPos,
              w: 8.6,
              h: 0.35,
              fontSize: 14,
              color: '374151',
              bullet: { type: 'bullet', char: '•' },
              fontFace: 'Arial',
              wrap: true
            });
            yPos += 0.4;
          } else if (/^\d+\.\s/.test(trimmed)) {
            // Numbered list
            const text = trimmed.replace(/^\d+\.\s/, '');
            slide.addText(text, {
              x: 0.9,
              y: yPos,
              w: 8.6,
              h: 0.35,
              fontSize: 14,
              color: '374151',
              bullet: { type: 'bullet', char: '◦' },
              fontFace: 'Arial',
              wrap: true
            });
            yPos += 0.4;
          } else {
            // Regular text
            slide.addText(trimmed, {
              x: 0.7,
              y: yPos,
              w: 8.8,
              h: 0.4,
              fontSize: 13,
              color: '4b5563',
              fontFace: 'Arial',
              wrap: true
            });
            yPos += 0.4;
          }

          // Prevent overflow
          if (yPos > 6.8) break;
        }
      }
    });

    // Generate buffer
    const buffer = await prs.write({ outputType: 'arraybuffer' });
    return Buffer.from(buffer);
  } catch (err) {
    console.error('Error converting markdown to pptx:', err);
    throw err;
  }
}

export async function mdFileToPptxStream(mdPath, title) {
  try {
    const mdText = fs.readFileSync(mdPath, 'utf-8');
    return await markdownToPptx(mdText, title);
  } catch (err) {
    console.error('Error generating pptx:', err);
    throw err;
  }
}

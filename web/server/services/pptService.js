import PptxGenJS from 'pptxgenjs';
import fs from 'fs';

export async function markdownToPptx(mdText, title = 'Presentation') {
  try {
    const prs = new PptxGenJS();
    prs.defineLayout({ name: 'LAYOUT1', master: 'MASTER1' });

    // Set slide defaults
    prs.defineLayout({ name: 'LAYOUT1', master: 'MASTER1' });

    const lines = mdText.split('\n');
    let currentSlideContent = [];
    let slideTitle = '';
    let slideIndex = 0;

    function createSlide() {
      if (slideIndex === 0 && !slideTitle) {
        // Title slide
        const slide = prs.addSlide();
        slide.background = { color: '2563eb' };
        slide.addText(title, {
          x: 0.5,
          y: 2.5,
          w: 9,
          h: 1.5,
          fontSize: 44,
          bold: true,
          color: 'ffffff',
          align: 'center',
        });
        slide.addText(new Date().toLocaleDateString('ko-KR'), {
          x: 0.5,
          y: 4.2,
          w: 9,
          h: 0.5,
          fontSize: 18,
          color: 'ffffff',
          align: 'center',
        });
      } else {
        // Content slide
        const slide = prs.addSlide();
        let yPos = 0.5;

        // Title
        if (slideTitle) {
          slide.addText(slideTitle, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.6,
            fontSize: 32,
            bold: true,
            color: '1f2937',
          });
          yPos += 0.8;
        }

        // Content
        currentSlideContent.forEach((line) => {
          if (line.trim().length === 0) return;

          if (line.startsWith('##')) {
            slide.addText(line.substring(2).trim(), {
              x: 1,
              y: yPos,
              w: 8.5,
              h: 0.4,
              fontSize: 20,
              bold: true,
              color: '374151',
            });
            yPos += 0.5;
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            slide.addText(line.substring(2).trim(), {
              x: 1.2,
              y: yPos,
              w: 8.3,
              h: 0.35,
              fontSize: 14,
              color: '#4b5563',
              bullet: true,
            });
            yPos += 0.4;
          } else if (line.trim().length > 0) {
            slide.addText(line.trim(), {
              x: 1,
              y: yPos,
              w: 8.5,
              h: 0.35,
              fontSize: 12,
              color: '#666',
              wrap: true,
            });
            yPos += 0.4;
          }

          if (yPos > 6.5) return; // Prevent overflow
        });
      }

      slideIndex++;
      currentSlideContent = [];
      slideTitle = '';
    }

    // Parse markdown
    for (const line of lines) {
      if (line.startsWith('# ')) {
        // New slide with title
        if (slideIndex > 0 || currentSlideContent.length > 0) {
          createSlide();
        }
        slideTitle = line.substring(2).trim();
      } else if (line.startsWith('---')) {
        // Slide break
        if (slideTitle || currentSlideContent.length > 0) {
          createSlide();
        }
      } else {
        currentSlideContent.push(line);
      }
    }

    // Create last slide
    if (slideTitle || currentSlideContent.length > 0) {
      createSlide();
    }

    // If no slides were created, create title slide
    if (slideIndex === 0) {
      const slide = prs.addSlide();
      slide.background = { color: '2563eb' };
      slide.addText(title, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: 'ffffff',
        align: 'center',
      });
    }

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

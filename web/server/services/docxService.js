import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, Table, TableCell, TableRow, WidthType, VerticalAlign, AlignmentType, PageBreak } from 'docx';
import fs from 'fs';
import path from 'path';

// 마크다운을 docx 문서로 변환
export async function markdownToDocx(mdText, filename = 'document.docx') {
  try {
    const lines = mdText.split('\n');
    const paragraphs = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 제목 1 (#)
      if (line.startsWith('# ')) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(2),
            heading: HeadingLevel.HEADING_1,
            thematicBreak: false,
            spacing: { before: 240, after: 120 },
          })
        );
      }
      // 제목 2 (##)
      else if (line.startsWith('## ')) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(3),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      }
      // 제목 3 (###)
      else if (line.startsWith('### ')) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(4),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        );
      }
      // 페이지 나누기 (---)
      else if (line === '---') {
        paragraphs.push(new Paragraph({ pageBreakBefore: true, text: '' }));
      }
      // 구분선 (|) — 테이블
      else if (line.startsWith('|')) {
        const rows = [];
        // 현재 행과 다음 행(구분선)을 읽음
        if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|')) {
          const cellTexts = line.split('|').slice(1, -1).map(t => t.trim());
          const cells = cellTexts.map(text =>
            new TableCell({
              children: [new Paragraph({ text: text || '' })],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
          rows.push(new TableRow({ children: cells }));

          // 구분선 행 건너뛰기
          i++;

          // 다음 행들(데이터 행)
          while (i + 1 < lines.length && lines[i + 1].includes('|')) {
            i++;
            const dataLine = lines[i];
            const dataCells = dataLine.split('|').slice(1, -1).map(t => t.trim());
            const cellsData = dataCells.map(text =>
              new TableCell({
                children: [new Paragraph({ text: text || '' })],
              })
            );
            rows.push(new TableRow({ children: cellsData }));
          }

          paragraphs.push(
            new Table({
              rows: rows,
              width: { size: 100, type: WidthType.PERCENT },
            })
          );
        }
      }
      // 불릿 (- 또는 *)
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(2),
            bullet: { level: 0 },
            spacing: { line: 240 },
          })
        );
      }
      // 들여쓰기 불릿
      else if ((line.startsWith('  - ') || line.startsWith('  * '))) {
        paragraphs.push(
          new Paragraph({
            text: line.substring(4),
            bullet: { level: 1 },
            spacing: { line: 240 },
          })
        );
      }
      // 번호 리스트 (1., 2., ...)
      else if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, '');
        paragraphs.push(
          new Paragraph({
            text: text,
            bullet: { level: 0 },
            spacing: { line: 240 },
          })
        );
      }
      // 일반 텍스트 (공백이나 특수문자로만 이루어지지 않음)
      else if (line.length > 0) {
        paragraphs.push(
          new Paragraph({
            text: line,
            spacing: { line: 360 },
          })
        );
      }
      // 빈 줄 (여러 빈 줄 방지)
      else if (paragraphs.length > 0 && paragraphs[paragraphs.length - 1].text !== '') {
        paragraphs.push(new Paragraph({ text: '', spacing: { line: 240 } }));
      }
    }

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'default',
            levels: [
              {
                level: 0,
                format: 'decimal',
                text: '%1.',
                alignment: 'left',
              },
            ],
          },
        ],
        abstractNums: [],
      },
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (err) {
    console.error('Error converting markdown to docx:', err);
    throw err;
  }
}

// 파일에서 읽어서 Word로 변환하고 저장
export async function mdFileToDocx(mdPath, outputPath) {
  try {
    const mdText = fs.readFileSync(mdPath, 'utf-8');
    const buffer = await markdownToDocx(mdText);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  } catch (err) {
    console.error('Error creating docx from file:', err);
    throw err;
  }
}

// 스트림으로 Word 파일 반환 (다운로드용)
export async function mdFileToDocxStream(mdPath) {
  try {
    const mdText = fs.readFileSync(mdPath, 'utf-8');
    return await markdownToDocx(mdText);
  } catch (err) {
    console.error('Error generating docx:', err);
    throw err;
  }
}

// 목차 파일을 파싱해서 챕터 목록 반환
export function parseTOC(tocText) {
  try {
    const lines = tocText.split('\n').filter(line => line.trim().length > 0);
    const chapters = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // "Chapter N: Title" 형식
      const match = trimmed.match(/^(?:Chapter|Week|주\s*)(\d+)[:\s-]+(.+)/i);
      if (match) {
        chapters.push({
          key: String(match[1]).padStart(2, '0'),
          number: parseInt(match[1]),
          title: match[2].trim(),
          index: index,
        });
      }
      // 마크다운 헤더 (#) 형식
      else if (trimmed.startsWith('# ')) {
        const title = trimmed.substring(2).trim();
        const match2 = title.match(/^(?:Chapter|Week|주\s*)(\d+)[:\s-]+(.+)/i);
        if (match2) {
          chapters.push({
            key: String(match2[1]).padStart(2, '0'),
            number: parseInt(match2[1]),
            title: match2[2].trim(),
            index: index,
          });
        } else {
          chapters.push({
            key: String(chapters.length + 1).padStart(2, '0'),
            number: chapters.length + 1,
            title: title,
            index: index,
          });
        }
      }
    });

    return chapters;
  } catch (err) {
    console.error('Error parsing TOC:', err);
    return [];
  }
}

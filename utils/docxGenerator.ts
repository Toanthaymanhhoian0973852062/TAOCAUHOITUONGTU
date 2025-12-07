import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import FileSaver from "file-saver";
import { MathProblem } from "../types";

export const generateAndDownloadDocx = async (originalProblem: string, problems: MathProblem[]) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "PHIẾU BÀI TẬP TỰ LUYỆN",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          
          // Original Problem Section
          new Paragraph({
            text: "ĐỀ BÀI MẪU:",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: originalProblem,
                italics: true,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Practice Problems Section
          new Paragraph({
            text: "BÀI TẬP TƯƠNG TỰ:",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
          }),
          
          ...problems.flatMap((p, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Bài ${index + 1}: `,
                  bold: true,
                }),
                new TextRun({
                  text: p.question,
                }),
              ],
              spacing: { after: 150 },
            }),
          ]),

          // Answer Key Section (Page Break before answers)
          new Paragraph({
            text: "ĐÁP ÁN & HƯỚNG DẪN GIẢI",
            heading: HeadingLevel.HEADING_2,
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
          }),

          ...problems.flatMap((p, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Bài ${index + 1}: `,
                  bold: true,
                }),
                new TextRun({
                  text: p.solution,
                }),
              ],
              spacing: { after: 150 },
            }),
          ]),
          
          // Footer watermark
          new Paragraph({
             text: "Được tạo bởi iMath AI",
             alignment: AlignmentType.CENTER,
             spacing: { before: 600 },
             children: [
                 new TextRun({
                     text: "iMath AI",
                     color: "888888",
                     size: 20
                 })
             ]
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  
  // Handle file-saver import inconsistencies
  // Some ESM builds export the function as default, others as a named export or property of default
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, "Bai_Tap_Tu_Luyen.docx");
};
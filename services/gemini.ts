import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedResponse, MathProblem, ProblemConfig } from "../types";

// Initialize the client using process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateSimilarProblems = async (
  input: string | File,
  config: ProblemConfig,
  additionalInstructions?: string
): Promise<{ problems: MathProblem[], originalText: string }> => {
  const modelId = "gemini-2.5-flash"; 
  const totalQuestions = config.level1 + config.level2 + config.level3;
  
  let parts: any[] = [];
  
  // Updated System Instruction with strict LaTeX formatting rules
  const systemInstruction = `
    Bạn là một giáo viên dạy toán giỏi và chuyên gia về soạn thảo LaTeX. Hãy tạo ra các bài tập chất lượng cao.

    QUY TẮC ĐỊNH DẠNG VĂN BẢN VÀ LATEX (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI):

    1. ĐỊNH DẠNG CÔNG THỨC TOÁN:
       - Toàn bộ công thức toán, biểu thức số học, đại số và các kí hiệu hình học (điểm, đoạn thẳng, tam giác, đường tròn...) PHẢI được chuyển sang định dạng LaTeX và nằm trong cặp dấu \${ }$.
       - Ví dụ ĐÚNG: \${2x-3}$, \${\\Delta ABC}$, \${A \\in d}$, \${BC = 5cm}$.
       - Ví dụ SAI: $2x-3$, 2x-3, (O).

    2. QUY TẮC DẤU NGOẶC TRONG CÔNG THỨC (Nằm trong \${ }$):
       - Ngoặc đơn ( ): Chuyển thành \\left( \\right). Ví dụ: \${(x+1)}$ -> \${\\left(x+1\\right)}$.
       - Ngoặc vuông [ ]: Chuyển thành \\left[ \\right]. Ví dụ: \${[a,b]}$ -> \${\\left[a,b\\right]}$.
       - Ngoặc nhọn { }: Chuyển thành \\left\\{ \\right\\}. Ví dụ: \${{1; 2}}$ -> \${\\left\\{1; 2\\right\\}}$.
       - Giá trị tuyệt đối | |: Chuyển thành \\left| \\right|. Ví dụ: \${|x|}$ -> \${\\left|x\\right|}$.
       - Ngoại lệ: Hệ phương trình hoặc các cấu trúc LaTeX phức tạp (như \\begin{cases}...) thì giữ nguyên cấu trúc nội tại, không bọc thêm \\left \\right nếu không cần thiết.

    3. PHÂN BIỆT VĂN BẢN VÀ CÔNG THỨC:
       - Các dấu ngoặc chứa văn bản chú thích (không phải biểu thức toán) thì GIỮ NGUYÊN, không đưa vào \${ }$.
       - Ví dụ: "(1 điểm)", "(đề thi gồm 01 trang)", "(dành cho học sinh giỏi)".

    4. KÍ HIỆU HÌNH HỌC & ĐƠN VỊ ĐẶC BIỆT:
       - Góc: Sử dụng \\widehat{...}. Ví dụ: góc ABC -> \${\\widehat{ABC}}$.
       - Độ: Sử dụng {}^\\circ. Ví dụ: 90 độ -> \${90{}^\\circ}$.
       - Tam giác: Từ "tam giác" hoặc kí hiệu tam giác -> đổi thành \\Delta. Ví dụ: tam giác ABC -> \${\\Delta ABC}$.
    
    5. CÁC QUY TẮC KHÁC:
       - Dấu trừ "-": Không để khoảng trắng trước và sau dấu trừ trong công thức. Ví dụ: \${a-b}$.
       - Loại bỏ dòng thừa: Bỏ qua các dòng chứa nhiều dấu chấm liên tiếp (..............) dùng để điền khuyết.
       - Xử lý khoảng trắng: Xóa bỏ các khoảng trắng thừa liên tiếp.
       - Nếu biểu thức quá dài hoặc dạng MathType phức tạp không thể chuyển đổi chính xác, hãy ghi chú lại thay vì chuyển đổi sai.

    Nhiệm vụ của bạn là trích xuất (nếu là file) hoặc nhận đề bài, sau đó tạo ra ${totalQuestions} bài toán tương tự tuân thủ chính xác các quy tắc trên và cấu hình mức độ khó yêu cầu.
  `;

  const requestDetails = `
    YÊU CẦU VỀ SỐ LƯỢNG VÀ MỨC ĐỘ KHÓ (Tổng ${totalQuestions} câu):
    1. Mức độ Nhận biết/Cơ bản: ${config.level1} câu.
       - Đặc điểm: Thay số liệu, giữ nguyên cấu trúc và dạng toán, tương tự hoàn toàn đề gốc.
    2. Mức độ Thông hiểu/Vận dụng: ${config.level2} câu.
       - Đặc điểm: Thay đổi nhẹ về ngữ cảnh, cách đặt câu hỏi hoặc yêu cầu suy luận thêm một bước nhỏ.
    3. Mức độ Vận dụng cao/Nâng cao: ${config.level3} câu.
       - Đặc điểm: Bài toán mở rộng, khó hơn, yêu cầu tư duy sâu hơn hoặc tổng hợp kiến thức từ đề gốc.
  `;

  try {
    if (input instanceof File) {
      const base64Data = await fileToBase64(input);
      const mimeType = input.type;

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });

      parts.push({
        text: `
          Hãy phân tích file đính kèm (ảnh hoặc PDF) để tìm đề bài toán.
          
          Nhiệm vụ:
          1. Trích xuất chính xác nội dung đề bài toán gốc từ file theo đúng định dạng LaTeX đặc biệt đã quy định (\${ }$).
          2. Tạo ra ${totalQuestions} bài toán tương tự theo cấu trúc sau:
          ${requestDetails}
          
          Yêu cầu về nội dung:
          - Giữ nguyên dạng toán của đề gốc.
          - Cung cấp đáp án/lời giải vắn tắt (cũng định dạng LaTeX).
          ${additionalInstructions ? `Lưu ý thêm từ người dùng: ${additionalInstructions}` : ''}
        `
      });
    } else {
      parts.push({
        text: `
          Dựa vào đề bài toán mẫu dưới đây, hãy tạo ra các bài toán tương tự.
          
          Đề bài mẫu: "${input}"
          
          ${requestDetails}
          ${additionalInstructions ? `Lưu ý thêm từ người dùng: ${additionalInstructions}` : ''}
          
          Yêu cầu:
          1. Tuân thủ tuyệt đối quy tắc định dạng LaTeX trong System Instruction (đặc biệt là \${ }$ và \\left \\right).
          2. Có đáp án cho từng câu.
        `
      });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original_text: {
              type: Type.STRING,
              description: "Nội dung đề bài gốc đã được định dạng chuẩn LaTeX ${ }$"
            },
            problems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "Nội dung đề bài toán mới (chuẩn LaTeX ${ })"
                  },
                  solution: {
                    type: Type.STRING,
                    description: "Đáp án hoặc lời giải ngắn gọn (chuẩn LaTeX ${ })"
                  }
                },
                required: ["question", "solution"]
              }
            }
          },
          required: ["problems"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Không nhận được phản hồi từ AI.");
    }

    const parsedData = JSON.parse(responseText) as GeneratedResponse;
    
    // If input is string, use it as fallback if original_text is empty
    const originalText = parsedData.original_text || (typeof input === 'string' ? input : "Không thể trích xuất đề bài gốc");

    return {
      problems: parsedData.problems,
      originalText: originalText
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng kiểm tra lại file hoặc API Key.");
  }
};
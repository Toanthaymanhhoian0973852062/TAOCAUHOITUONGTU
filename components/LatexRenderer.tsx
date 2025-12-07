import React from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Regex nhận diện các loại công thức:
  // 1. Block math: $$...$$ hoặc \[...\]
  // 2. Inline math: ${...}$ hoặc \(...\)
  const regex = /((?:\$\$[\s\S]*?\$\$)|(?:\\\[[\s\S]*?\\\])|(?:\\\([\s\S]*?\\\))|(?:\${[\s\S]*?}\$))/g;
  
  const parts = content.split(regex);

  return (
    // Sử dụng whitespace-pre-line: Giữ xuống dòng (\n) nhưng gộp khoảng trắng thừa -> Xuống dòng tự nhiên
    // Sử dụng leading-loose: Tăng khoảng cách dòng để chứa được các phân số to (\displaystyle) mà không bị dính
    <span className={`latex-container break-words whitespace-pre-line leading-loose ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // --- Xử lý Block Math (Công thức dòng riêng) ---
        // Tự động xuống dòng và căn giữa
        if (part.startsWith('$$') || part.startsWith('\\[')) {
           const math = part.startsWith('$$') ? part.slice(2, -2) : part.slice(2, -2);
           try {
             const html = katex.renderToString(math, {
               throwOnError: false,
               displayMode: true, // Chế độ hiển thị khối
               output: 'html',
               strict: false
             });
             return (
               <div 
                 key={index} 
                 dangerouslySetInnerHTML={{ __html: html }} 
                 className="my-2 w-full overflow-x-auto overflow-y-hidden text-center"
               />
             );
           } catch (e) { 
             console.error(e);
             return <div key={index} className="text-red-500 font-mono text-sm p-2 bg-red-50">{part}</div>; 
           }
        }

        // --- Xử lý Inline Math (Công thức trên dòng) ---
        if (part.startsWith('${') || part.startsWith('\\(')) {
           const math = part.startsWith('${') ? part.slice(2, -2) : part.slice(2, -2);
           
           // KIỂM TRA QUAN TRỌNG:
           // Nếu công thức chứa môi trường bắt đầu bằng \begin (ví dụ hệ phương trình, ma trận...)
           // thì KHÔNG ĐƯỢC thêm \displaystyle vì sẽ gây lỗi cú pháp LaTeX.
           // Chỉ thêm \displaystyle cho các công thức ngắn (phân số, tích phân...) để hiển thị to rõ.
           const hasComplexEnvironment = /\\begin\s*\{/.test(math);
           const shouldForceDisplay = !hasComplexEnvironment;

           try {
             const mathToRender = shouldForceDisplay ? '\\displaystyle ' + math : math;
             
             const html = katex.renderToString(mathToRender, {
               throwOnError: false,
               displayMode: false, // Chế độ inline
               output: 'html',
               strict: false 
             });
             return (
               <span 
                 key={index} 
                 dangerouslySetInnerHTML={{ __html: html }} 
                 className="mx-1 inline-block align-middle" // align-middle giúp căn chỉnh tốt hơn với dòng text
               />
             );
           } catch (e) { 
               console.error(e);
               // Fallback: Nếu lỗi, thử render nguyên bản không có \displaystyle
               try {
                  const htmlRetry = katex.renderToString(math, { throwOnError: false, displayMode: false });
                  return <span key={index} dangerouslySetInnerHTML={{ __html: htmlRetry }} className="mx-1" />;
               } catch (err) {
                  return <span key={index} className="text-red-500 font-mono text-xs">{part}</span>;
               }
           }
        }

        // --- Xử lý Văn bản thường ---
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
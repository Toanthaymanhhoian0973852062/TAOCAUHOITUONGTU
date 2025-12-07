import React, { useState } from 'react';
import { MathProblem } from '../types';
import { FileDown, CheckCircle2, BookOpen, LayoutList, FileText, Eye, EyeOff, X, Printer } from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';

interface ProblemListProps {
  originalProblem: string;
  problems: MathProblem[];
  onDownload: () => void;
}

const ProblemList: React.FC<ProblemListProps> = ({ originalProblem, problems, onDownload }) => {
  const [showSolutions, setShowSolutions] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-content');
    if (!element) return;
    
    // @ts-ignore
    const opt = {
      margin: 10,
      filename: 'Phieu_Bai_Tap_iMath.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  if (problems.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in pb-20 print:pb-0 print:w-full print:max-w-none">
      {/* Control Bar - Sticky & Clean - Hidden during print */}
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg shadow-slate-200/50 py-3 px-4 mb-8 sticky top-20 z-30 transition-all print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                <LayoutList size={20} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800">Danh sách bài tập</h3>
                <p className="text-xs text-slate-500 font-medium">{problems.length} câu hỏi được tạo</p>
             </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
               onClick={() => setShowSolutions(!showSolutions)}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
             >
               {showSolutions ? <Eye size={18} /> : <EyeOff size={18} />}
               <span className="hidden sm:inline">{showSolutions ? 'Hiện đáp án' : 'Ẩn đáp án'}</span>
             </button>

            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-200 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Xem trước</span>
            </button>
            
            <button
              onClick={handleDownloadPDF}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-200 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Tải PDF</span>
            </button>

            <button
              onClick={onDownload}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition-all active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>Tải Word</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIST VIEW (Working View) - Hidden during print */}
      <div className="grid gap-8 print:hidden">
        {/* Original Problem Card */}
        <div className="bg-white rounded-3xl border border-white shadow-xl shadow-indigo-100 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500"></div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
                <BookOpen size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-violet-800 bg-violet-50 px-3 py-1 rounded-full">Đề bài gốc</h3>
            </div>
            <div className="text-slate-800 font-medium leading-relaxed text-lg pl-2">
              <LatexRenderer content={originalProblem} />
            </div>
          </div>
        </div>
        
        {/* Section Divider */}
        <div className="relative flex items-center justify-center py-2">
            <div className="h-px bg-indigo-100 w-full absolute"></div>
            <span className="relative bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
                Bài tập tương tự
            </span>
        </div>

        {problems.map((problem, index) => (
          <div key={index} className="bg-white rounded-3xl border border-white shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 p-6 md:p-8 group">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold rounded-2xl text-base shadow-inner group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white transition-all">
                {index + 1}
              </div>
              <div className="flex-grow">
                <div className="mb-5">
                  <div className="text-slate-900 text-lg leading-relaxed font-medium">
                    <LatexRenderer content={problem.question} />
                  </div>
                </div>
                
                {showSolutions && (
                  <div className="mt-5 pt-5 border-t border-dashed border-slate-200 animate-fade-in">
                      <div className="flex items-center gap-2 mb-3">
                         <div className="text-emerald-500 bg-emerald-50 p-1 rounded-full"><CheckCircle2 size={14} strokeWidth={3} /></div>
                         <span className="text-xs font-bold uppercase text-emerald-600 tracking-wide">Lời giải chi tiết</span>
                      </div>
                      <div className="text-slate-700 text-base bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/50">
                        <LatexRenderer content={problem.solution} />
                      </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HIDDEN PDF CONTENT (Used for html2pdf generation) */}
      <div className="fixed left-[-9999px] top-0">
          <div id="printable-content" className="bg-white text-black p-[20mm] w-[210mm] min-h-[297mm]">
            {/* Document Title */}
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold uppercase mb-2">Phiếu Bài Tập Tự Luyện</h1>
              <p className="text-xs text-slate-500 italic">iMath AI generated</p>
            </div>

            {/* Original Problem */}
            <div className="mb-8">
              <div className="mb-2">
                <h2 className="text-base font-bold uppercase border-b border-black inline-block">I. Đề bài mẫu</h2>
              </div>
              <div className="italic text-justify pl-0 pt-2 leading-relaxed">
                <LatexRenderer content={originalProblem} />
              </div>
            </div>

            {/* Practice Problems */}
            <div className="mb-10">
              <div className="mb-4">
                <h2 className="text-base font-bold uppercase border-b border-black inline-block">II. Bài tập luyện tập</h2>
              </div>
              <div className="space-y-4">
                {problems.map((p, idx) => (
                  <div key={idx} className="text-justify leading-relaxed break-inside-avoid">
                    <span className="font-bold mr-1">Bài {idx + 1}. </span>
                    <LatexRenderer content={p.question} />
                  </div>
                ))}
              </div>
            </div>

            <div className="html2pdf__page-break"></div>

            {/* Answers */}
            <div>
              <div className="mb-4 pt-4">
                <h2 className="text-base font-bold uppercase border-b border-black inline-block">III. Đáp án chi tiết</h2>
              </div>
              <div className="space-y-4">
                {problems.map((p, idx) => (
                  <div key={idx} className="text-justify leading-relaxed break-inside-avoid">
                    <span className="font-bold mr-1">Bài {idx + 1}. </span>
                    <LatexRenderer content={p.solution} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-400 border-t pt-2">
               Created by iMath AI
            </div>
          </div>
      </div>

      {/* PREVIEW MODAL - Hidden during print */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="bg-slate-100 w-full max-w-5xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col relative z-10 overflow-hidden animate-fade-in border border-white/20">
             
             {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm">
                      <FileText size={20} strokeWidth={2.5} />
                   </div>
                   <h3 className="font-bold text-xl text-slate-800">Xem trước phiếu bài tập</h3>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-rose-200"
                   >
                      <Printer size={18} />
                      <span className="hidden sm:inline">Tải PDF</span>
                   </button>
                   <button 
                      onClick={onDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
                   >
                      <FileDown size={18} />
                      <span className="hidden sm:inline">Tải Word</span>
                   </button>
                   <div className="w-px h-8 bg-slate-200 mx-2"></div>
                   <button 
                      onClick={() => setIsPreviewOpen(false)}
                      className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors"
                   >
                      <X size={24} />
                   </button>
                </div>
             </div>

             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto bg-slate-200/50 p-4 md:p-8 custom-scrollbar document-preview">
                <div className="bg-white max-w-[21cm] mx-auto min-h-[29.7cm] shadow-xl p-[1.5cm] md:p-[2.5cm] text-slate-900 rounded-sm">
                   {/* Document Title */}
                   <div className="text-center mb-8 border-b-2 border-black pb-4">
                     <h1 className="text-2xl font-bold uppercase mb-2">Phiếu Bài Tập Tự Luyện</h1>
                     <p className="text-xs text-slate-500 italic">iMath AI generated</p>
                   </div>

                   {/* Original Problem */}
                   <div className="mb-8">
                     <div className="bg-blue-50 border-l-4 border-blue-600 pl-3 py-1 mb-3">
                       <h2 className="text-base font-bold uppercase text-blue-800">I. Đề bài mẫu</h2>
                     </div>
                     <div className="italic text-justify pl-4 border-l-2 border-slate-200 text-slate-700 bg-slate-50/50 p-2 rounded-r">
                       <LatexRenderer content={originalProblem} />
                     </div>
                   </div>

                   {/* Practice Problems */}
                   <div className="mb-10">
                     <div className="bg-blue-50 border-l-4 border-blue-600 pl-3 py-1 mb-4">
                       <h2 className="text-base font-bold uppercase text-blue-800">II. Bài tập luyện tập</h2>
                     </div>
                     <div className="space-y-6">
                       {problems.map((p, idx) => (
                         <div key={idx} className="text-justify leading-relaxed">
                           <span className="font-bold mr-1">Bài {idx + 1}. </span>
                           <LatexRenderer content={p.question} />
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Visual Separator for Answers */}
                   <div className="py-8 flex items-center justify-center opacity-40 select-none">
                     <div className="w-full border-t border-dashed border-slate-400"></div>
                     <div className="absolute bg-white px-2 text-slate-500 flex items-center gap-1">
                        <Printer size={16} />
                        <span className="text-xs font-mono">Trang sau (Đáp án)</span>
                     </div>
                   </div>

                   {/* Answers */}
                   <div>
                     <div className="bg-slate-100 border-l-4 border-slate-600 pl-3 py-1 mb-4">
                       <h2 className="text-base font-bold uppercase text-slate-800">III. Đáp án chi tiết</h2>
                     </div>
                     <div className="space-y-4">
                       {problems.map((p, idx) => (
                         <div key={idx} className="text-justify leading-relaxed">
                           <span className="font-bold text-slate-800 mr-1">Bài {idx + 1}. </span>
                           <LatexRenderer content={p.solution} />
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemList;
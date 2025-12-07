import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, History, Sparkles, Heart, Coffee, X, Copy, Check, Zap, Sigma, Divide, Percent, FunctionSquare, Triangle, Binary } from 'lucide-react';
import ProblemInput from './components/ProblemInput';
import ProblemList from './components/ProblemList';
import HistorySidebar from './components/HistorySidebar';
import { generateSimilarProblems } from './services/gemini';
import { generateAndDownloadDocx } from './utils/docxGenerator';
import { MathProblem, GenerationStatus, ProblemConfig, HistoryItem } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [originalProblem, setOriginalProblem] = useState<string>('');
  const [generatedProblems, setGeneratedProblems] = useState<MathProblem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Donate State
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('genmath_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (originalText: string, problems: MathProblem[], config: ProblemConfig) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      originalText,
      problems,
      config
    };

    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50 items
    setHistory(updatedHistory);
    localStorage.setItem('genmath_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('genmath_history', JSON.stringify(updatedHistory));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setOriginalProblem(item.originalText);
    setGeneratedProblems(item.problems);
    setStatus(GenerationStatus.SUCCESS);
    setIsHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async (input: string | File, config: ProblemConfig, additionalInstructions?: string) => {
    setStatus(GenerationStatus.LOADING);
    setErrorMsg(null);
    setGeneratedProblems([]);
    
    // If input is text, show it immediately, if file, wait for extraction
    if (typeof input === 'string') {
      setOriginalProblem(input);
    } else {
      setOriginalProblem("Đang trích xuất nội dung từ file...");
    }

    try {
      const result = await generateSimilarProblems(input, config, additionalInstructions);
      setGeneratedProblems(result.problems);
      setOriginalProblem(result.originalText);
      setStatus(GenerationStatus.SUCCESS);
      
      // Save to history on success
      saveToHistory(result.originalText, result.problems, config);

    } catch (error: any) {
      console.error(error);
      setStatus(GenerationStatus.ERROR);
      setOriginalProblem(typeof input === 'string' ? input : ''); // Reset if failed
      setErrorMsg(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleDownload = async () => {
    if (generatedProblems.length > 0) {
      try {
        await generateAndDownloadDocx(originalProblem, generatedProblems);
      } catch (e) {
        console.error("Error generating docx", e);
        alert("Không thể tạo file Word. Vui lòng thử lại.");
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // VietQR Link generation
  const qrUrl = `https://img.vietqr.io/image/MB-0973852062-compact2.png?accountName=LE%20DUC%20MANH`;

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
      
      {/* --- MATH BACKGROUND ICONS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 print:hidden select-none">
        {/* Top Left */}
        <div className="absolute top-[10%] left-[5%] text-blue-300/20 rotate-12 animate-float" style={{animationDelay: '0s'}}>
          <Sigma size={120} strokeWidth={1} />
        </div>
        <div className="absolute top-[20%] left-[15%] text-indigo-300/10 -rotate-12 animate-float" style={{animationDelay: '2s'}}>
          <FunctionSquare size={80} strokeWidth={1} />
        </div>
        
        {/* Top Right */}
        <div className="absolute top-[5%] right-[10%] text-sky-300/20 rotate-45 animate-float" style={{animationDelay: '1s'}}>
           <Triangle size={100} strokeWidth={1} />
        </div>
        <div className="absolute top-[25%] right-[5%] text-blue-400/10 -rotate-6 animate-float" style={{animationDelay: '3s'}}>
           <Divide size={90} strokeWidth={1} />
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-[15%] left-[8%] text-violet-300/10 rotate-6 animate-float" style={{animationDelay: '1.5s'}}>
           <Binary size={110} strokeWidth={1} />
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-[10%] right-[15%] text-indigo-300/20 -rotate-12 animate-float" style={{animationDelay: '4s'}}>
           <Percent size={100} strokeWidth={1} />
        </div>
        
        {/* Center-ish scattered */}
        <div className="absolute top-[50%] left-[80%] text-blue-200/20 rotate-180 animate-float" style={{animationDelay: '2.5s'}}>
           <Calculator size={60} strokeWidth={1} />
        </div>
        <div className="absolute top-[60%] left-[5%] text-sky-200/20 rotate-90 animate-float" style={{animationDelay: '0.5s'}}>
           <span className="font-serif text-8xl font-thin select-none">x</span>
        </div>
      </div>

      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-blue-100 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Calculator size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-900 tracking-tight">
              iMath
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all font-semibold text-sm border border-transparent hover:border-blue-200"
            >
              <History size={18} />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 rounded-full shadow-md shadow-blue-200">
              <Sparkles size={12} fill="currentColor" />
              AI Powered
            </div>
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      <div className="print:hidden relative z-50">
        <HistorySidebar 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelect={loadHistoryItem}
          onDelete={deleteHistoryItem}
        />
      </div>

      {/* Donate Modal */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDonateOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-white/50 z-50">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white text-center relative flex items-center justify-between">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <Coffee size={20} className="text-amber-400 fill-amber-400" />
                 Mời tác giả ly cà phê
               </h3>
               <button 
                  onClick={() => setIsDonateOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-1 rounded-full text-slate-300 hover:text-white transition-colors"
               >
                  <X size={20} />
               </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
               <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 mb-6 w-full max-w-[280px]">
                 <img 
                   src={qrUrl} 
                   alt="Mã QR Chuyển khoản MB Bank" 
                   className="w-full h-auto rounded-xl"
                 />
               </div>

               <div className="w-full bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Số tài khoản (MB Bank)</p>
                    <p className="font-mono font-bold text-slate-800 text-xl tracking-tight">0973 852 062</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard("0973852062")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    {copied ? <Check size={14} className="text-emerald-500"/> : <Copy size={14} />}
                    {copied ? "Đã chép" : "Sao chép"}
                  </button>
               </div>
               
               <p className="text-center text-slate-400 text-xs mt-6 px-4">
                 Quét mã QR để ủng hộ phát triển ứng dụng. <br/>Mọi sự ủng hộ đều là động lực to lớn! ❤️
               </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full print:p-0 print:max-w-none relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in print:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wide mb-4 shadow-sm">
            <Zap size={14} fill="currentColor" />
            Công cụ AI hỗ trợ giảng dạy
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Tạo bài tập tự luyện <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Thông Minh & Nhanh Chóng
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Biến 1 đề bài mẫu thành 10 bài toán tương tự chỉ trong vài giây. Hỗ trợ xuất Word và PDF chuẩn định dạng.
          </p>
        </div>

        <div className="print:hidden">
          <ProblemInput 
            onGenerate={handleGenerate} 
            isGenerating={status === GenerationStatus.LOADING} 
          />
        </div>

        {status === GenerationStatus.ERROR && (
          <div className="max-w-4xl mx-auto mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 animate-fade-in print:hidden shadow-sm">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-lg">Đã xảy ra lỗi</p>
              <p className="text-sm opacity-90 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === GenerationStatus.SUCCESS && (
          <ProblemList 
            originalProblem={originalProblem}
            problems={generatedProblems}
            onDownload={handleDownload}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-slate-200 mt-auto print:hidden relative z-10">
        <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="text-slate-500 font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} <span className="font-bold text-indigo-900">iMath AI</span>. Phiên bản dành cho giáo dục.
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
             <div className="flex items-center gap-2">
                <span className="text-slate-400">Phát triển bởi:</span>
                <a 
                  href="https://www.facebook.com/toanthaymanh.hoian.0973852062" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 font-bold text-slate-700 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer hover:shadow-md hover:shadow-blue-100"
                >
                  <Heart size={14} className="text-red-400 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
                  <span>Lê Đức Mạnh</span>
                </a>
             </div>
             
             <div className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Zalo: <span className="text-slate-700 font-bold font-mono text-base">0973 852 062</span>
             </div>
             
             <button 
                onClick={() => setIsDonateOpen(true)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
             >
                <Coffee size={16} fill="currentColor" className="text-white/90"/>
                <span>Ủng hộ</span>
             </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
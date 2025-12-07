import React, { useState, useRef } from 'react';
import { Sparkles, Upload, X, FileText, Image as ImageIcon, Settings, Plus, Minus, Paperclip, Loader2, ArrowRight } from 'lucide-react';
import { ProblemConfig } from '../types';

interface ProblemInputProps {
  onGenerate: (input: string | File, config: ProblemConfig, additionalInfo?: string) => void;
  isGenerating: boolean;
}

const ProblemInput: React.FC<ProblemInputProps> = ({ onGenerate, isGenerating }) => {
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState<ProblemConfig>({
    level1: 4,
    level2: 4,
    level3: 2
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (getTotalQuestions() === 0) {
      alert("Vui lòng chọn ít nhất 1 câu hỏi.");
      return;
    }

    if (selectedFile) {
      onGenerate(selectedFile, config, textInput); 
    } else if (textInput.trim()) {
      onGenerate(textInput, config);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Vui lòng chọn file ảnh hoặc PDF');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        e.preventDefault();
        setSelectedFile(file);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateConfig = (key: keyof ProblemConfig, delta: number) => {
    setConfig(prev => {
      const newValue = prev[key] + delta;
      if (newValue < 0) return prev;
      return { ...prev, [key]: newValue };
    });
  };

  const getTotalQuestions = () => config.level1 + config.level2 + config.level3;

  const isButtonDisabled = isGenerating || (!textInput.trim() && !selectedFile) || getTotalQuestions() === 0;

  return (
    <div 
      className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-white p-6 md:p-8 animate-fade-in mb-10 relative overflow-hidden"
      onPaste={handlePaste}
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>

      <form onSubmit={handleSubmit} className="relative z-10">
        
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl">
             <FileText size={20} strokeWidth={2.5} />
           </div>
           <div>
             <h3 className="text-xl font-bold text-slate-800">Dữ liệu đầu vào</h3>
             <p className="text-sm text-slate-400 font-medium">Nhập đề bài hoặc tải ảnh lên</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
          {/* File Upload Area */}
          <div className="md:col-span-5 order-2 md:order-1">
            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-full min-h-[220px] border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group bg-slate-50/50"
              >
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 group-hover:scale-110 transition-all shadow-sm group-hover:shadow-md">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Tải lên Ảnh hoặc PDF</p>
                <p className="text-xs text-slate-400 mt-1.5 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">hoặc Ctrl+V để dán</p>
              </div>
            ) : (
              <div className="h-full min-h-[220px] relative border border-indigo-200 bg-indigo-50/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center group transition-all">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 border border-indigo-50 mb-4">
                  {selectedFile.type.includes('pdf') ? <FileText size={32} /> : <ImageIcon size={32} />}
                </div>
                <div className="w-full px-2">
                  <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs font-semibold text-indigo-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  type="button"
                  onClick={clearFile}
                  className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="md:col-span-7 order-1 md:order-2 relative group">
            <textarea
              id="problem"
              className="w-full h-full min-h-[220px] p-5 text-slate-700 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-300 text-base leading-relaxed shadow-sm group-hover:border-slate-300"
              placeholder={selectedFile ? "Nhập yêu cầu bổ sung cho AI (không bắt buộc)..." : "Nhập hoặc dán đề bài toán tại đây..."}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isGenerating}
            />
            {selectedFile && (
               <div className="absolute top-4 right-4 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg">
                 <Paperclip size={18} />
               </div>
            )}
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf"
        />

        {/* Configuration Section */}
        <div className="mb-10 bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-5">
             <div className="flex items-center gap-2 text-slate-700">
                <Settings className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Cấu trúc đề bài</h3>
             </div>
             <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
               Tổng: {getTotalQuestions()} câu
             </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { id: 'level1', label: 'Nhận biết', desc: 'Thay số', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
              { id: 'level2', label: 'Vận dụng', desc: 'Đổi ngữ cảnh', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-200' },
              { id: 'level3', label: 'Nâng cao', desc: 'Mở rộng', color: 'from-violet-400 to-fuchsia-500', shadow: 'shadow-violet-200' },
            ].map((level) => (
              <div key={level.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-10 rounded-full bg-gradient-to-b ${level.color} shadow-sm`}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{level.label}</p>
                    <p className="text-xs font-medium text-slate-400">{level.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                  <button 
                    type="button"
                    onClick={() => updateConfig(level.id as keyof ProblemConfig, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-slate-400 hover:text-indigo-600 hover:shadow-sm disabled:opacity-30 transition-all"
                    disabled={isGenerating || config[level.id as keyof ProblemConfig] <= 0}
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-7 text-center font-bold text-slate-800 text-sm">{config[level.id as keyof ProblemConfig]}</span>
                  <button 
                    type="button"
                    onClick={() => updateConfig(level.id as keyof ProblemConfig, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-slate-400 hover:text-indigo-600 hover:shadow-sm disabled:opacity-30 transition-all"
                    disabled={isGenerating}
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`
            w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300
            ${isButtonDisabled 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-1 active:scale-[0.98]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Đang xử lý dữ liệu...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" fill="currentColor" />
              <span>{selectedFile ? 'Phân tích & Tạo bài tập' : 'Tạo bài tập tương tự'}</span>
              <ArrowRight className="w-5 h-5 opacity-80" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProblemInput;
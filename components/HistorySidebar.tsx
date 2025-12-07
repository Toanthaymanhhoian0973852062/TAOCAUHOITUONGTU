import React from 'react';
import { X, Trash2, Clock, ChevronRight, FileText } from 'lucide-react';
import { HistoryItem } from '../types';
import { LatexRenderer } from './LatexRenderer';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect, 
  onDelete 
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-5 h-5" />
            <h2 className="font-bold text-lg">Lịch sử tạo đề</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Chưa có lịch sử nào.</p>
              <p className="text-sm">Hãy tạo bài tập mới để lưu lại.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {new Date(item.timestamp).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    onClick={(e) => onDelete(item.id, e)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm text-slate-800 font-medium line-clamp-2">
                    <span className="text-blue-600 mr-1"><FileText size={12} className="inline"/></span>
                    <LatexRenderer content={item.originalText.substring(0, 100) + (item.originalText.length > 100 ? '...' : '')} />
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>{item.problems.length} câu hỏi</span>
                  <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    Xem lại <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 text-center text-xs text-slate-400 bg-slate-50">
          Lịch sử được lưu trên trình duyệt của bạn
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
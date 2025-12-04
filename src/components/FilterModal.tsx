import React from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity"
            onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className="bg-white w-full sm:w-[500px] sm:rounded-xl rounded-t-xl p-6 pointer-events-auto shadow-xl transform transition-transform duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">絞り込み条件</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Price Section */}
            <div className="mb-6">
                <h4 className="font-bold text-gray-700 mb-3 text-sm">料金区分</h4>
                <div className="grid grid-cols-3 gap-3">
                    <label className="flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-200 has-[:checked]:bg-orange-50 has-[:checked]:border-primary has-[:checked]:text-primary transition-all">
                        <input type="checkbox" className="hidden" />
                        <span className="text-sm font-medium">無料</span>
                    </label>
                    <label className="flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-200 has-[:checked]:bg-orange-50 has-[:checked]:border-primary has-[:checked]:text-primary transition-all">
                        <input type="checkbox" className="hidden" />
                        <span className="text-sm font-medium">〜1000円</span>
                    </label>
                    <label className="flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-200 has-[:checked]:bg-orange-50 has-[:checked]:border-primary has-[:checked]:text-primary transition-all">
                        <input type="checkbox" className="hidden" />
                        <span className="text-sm font-medium">有料</span>
                    </label>
                </div>
            </div>

            {/* Age Section */}
            <div className="mb-6">
                <h4 className="font-bold text-gray-700 mb-3 text-sm">子どもの年齢</h4>
                <div className="flex gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                        <span className="text-gray-700">幼児向け (0〜5歳)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                        <span className="text-gray-700">小学生向け</span>
                    </label>
                </div>
            </div>

            {/* Facilities Section */}
            <div className="mb-8">
                <h4 className="font-bold text-gray-700 mb-3 text-sm">こだわり設備</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                     {['水遊び可能', '大型遊具あり', 'アスレチック', '屋内施設', 'オムツ替え', 'ベビーカーOK'].map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                            <span className="text-sm text-gray-700">{item}</span>
                        </label>
                     ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    クリア
                </button>
                <button
                    onClick={onApply}
                    className="flex-[2] py-3 px-4 rounded-lg font-bold text-white bg-primary hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
                >
                    この条件で検索
                </button>
            </div>
        </div>
    </div>
  );
};
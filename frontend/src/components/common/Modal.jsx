import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={`w-full ${maxWidth} bg-white rounded-3xl shadow-xl shadow-purple-500/10 border border-purple-100 max-h-[90vh] overflow-y-auto p-6`}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

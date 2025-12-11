import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
        error: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
        info: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${styles[type]} rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[320px] max-w-md`}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold text-lg">
                    {icons[type]}
                </div>
                <p className="flex-1 font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

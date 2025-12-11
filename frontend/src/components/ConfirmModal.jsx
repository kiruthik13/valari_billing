export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
    if (!isOpen) return null;

    const styles = {
        danger: {
            button: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
            icon: '⚠️',
            iconBg: 'bg-red-100'
        },
        warning: {
            button: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
            icon: '⚠️',
            iconBg: 'bg-yellow-100'
        },
        info: {
            button: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
            icon: 'ℹ️',
            iconBg: 'bg-blue-100'
        }
    };

    const style = styles[type];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`${style.iconBg} rounded-full p-3 flex-shrink-0`}>
                            <span className="text-2xl">{style.icon}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-600">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`${style.button} px-4 py-2 text-white rounded-lg font-medium transition-all shadow-lg`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

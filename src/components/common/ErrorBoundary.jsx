import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#1F1C18] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border border-[#EAE4DB] rounded-3xl p-8 shadow-xl space-y-4 animate-fadeIn">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-serif text-xl font-bold">
              M
            </div>
            <h2 className="font-serif text-xl font-medium text-[#1F1C18]">
              გვერდის ჩატვირთვა ვერ მოხერხდა
            </h2>
            <p className="text-xs text-[#787168] leading-relaxed">
              დაფიქსირდა დროებითი შეფერხება. გთხოვთ სცადოთ გვერდის განახლება ან დაბრუნდეთ მთავარზე.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#1F1C18] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer"
              >
                გვერდის განახლება
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-4 rounded-full border border-[#D9D1C5] text-[#1F1C18] text-xs font-medium hover:bg-[#F4EFE6] transition-colors cursor-pointer"
              >
                მთავარი გვერდი
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

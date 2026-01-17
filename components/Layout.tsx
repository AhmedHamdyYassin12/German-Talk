
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-red-600 to-yellow-400 opacity-80" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-30" />
      
      <main className="w-full max-w-lg z-10">
        {children}
      </main>
      
      <footer className="mt-8 text-slate-400 text-sm font-medium">
        DeutschTalk &copy; {new Date().getFullYear()} • Safe & Anonymous
      </footer>
    </div>
  );
};

export default Layout;

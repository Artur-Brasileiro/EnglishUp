"use client";

import React from 'react';
// 1. MUDANÇA: Sai react-router-dom, entra next/navigation
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowDown } from 'lucide-react';

const PageShell = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColorClass = "bg-slate-100 text-slate-600",
  onMethodologyClick,
  children 
}) => {
  // 2. MUDANÇA: useNavigate vira useRouter
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 animate-fadeIn">
      
      {/* 3. MUDANÇA: Bloco <Helmet> removido completamente (O SEO está no page.js) */}

      <div className="max-w-6xl mx-auto text-center">
        
        <div className="mb-8">
          <div className={`${iconColorClass} p-4 rounded-full inline-flex mb-4 shadow-sm`}>
            <Icon className="w-10 h-10 md:w-12 md:h-12" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            {title}
          </h1>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-6">
            {description}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              // 4. MUDANÇA: navigate -> router.push (ou replace)
              onClick={() => router.push("/")}
              className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Hub Principal
            </button>

            {onMethodologyClick && (
              <button 
                onClick={onMethodologyClick}
                className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <ArrowDown className="w-4 h-4" /> Aprender Metodologia
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo da Página (Jogos, Textos, etc) */}
        <div className="text-left">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default PageShell;
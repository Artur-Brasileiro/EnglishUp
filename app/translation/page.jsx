import TranslationGame from '../../src/components/TranslationGame';
import TranslationEducation from '../../src/content/TranslationEducation';

export const metadata = {
  title: 'Exercícios de Tradução de Frases | EnglishUp',
  description: 'Treine a montagem de frases em inglês. Traduza do português para o inglês e melhore sua gramática.',
};

export default function TranslationPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <TranslationEducation />
        
        <section>
            <div className="flex items-center gap-2 mb-6">
                <span className="bg-emerald-500 w-2 h-8 rounded-full"></span>
                <h2 className="text-2xl font-bold text-slate-800">Challenge: Tradução</h2>
            </div>
            <TranslationGame />
        </section>
      </div>
    </div>
  );
}
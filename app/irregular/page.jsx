import IrregularVerbsGame from '../../src/components/IrregularVerbsGame';
import IrregularVerbsEducation from '../../src/content/IrregularVerbsEducation';

export const metadata = {
  title: 'Guia Definitivo dos Verbos Irregulares | EnglishUp',
  description: 'Aprenda os verbos irregulares com nosso guia completo. Memorize a tabela de verbos e jogue gratuitamente.',
};

export default function IrregularPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Conteúdo Educativo (Para o AdSense ler) */}
        <IrregularVerbsEducation />

        {/* Jogo Interativo */}
        <section id="game-area" className="scroll-mt-20">
            <div className="flex items-center gap-2 mb-6">
                <span className="bg-indigo-600 w-2 h-8 rounded-full"></span>
                <h2 className="text-2xl font-bold text-slate-800">Pratique Agora</h2>
            </div>
            <IrregularVerbsGame />
        </section>
      </div>
    </div>
  );
}
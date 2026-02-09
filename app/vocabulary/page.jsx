import VocabularyGame from '../../src/components/VocabularyGame';
import VocabularyEducation from '../../src/content/VocabularyEducation';

export const metadata = {
  title: 'Treino de Vocabulário Diário | EnglishUp',
  description: 'Expanda seu vocabulário em inglês com 30 palavras novas por dia. Exercícios de memorização e repetição espaçada.',
};

export default function VocabularyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <VocabularyEducation />
        
        <section className="scroll-mt-20">
            <div className="flex items-center gap-2 mb-6">
                <span className="bg-rose-500 w-2 h-8 rounded-full"></span>
                <h2 className="text-2xl font-bold text-slate-800">Iniciar Treino Diário</h2>
            </div>
            <VocabularyGame />
        </section>
      </div>
    </div>
  );
}
import PhrasalVerbsGame from '../../src/components/PhrasalVerbsGame';
import PhrasalVerbsEducation from '../../src/content/PhrasalVerbsEducation';

export const metadata = {
  title: 'Aprenda Phrasal Verbs Jogando | EnglishUp',
  description: 'Domine os phrasal verbs mais usados em conversas e filmes. Entenda o sentido real com exemplos práticos.',
};

export default function PhrasalPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <PhrasalVerbsEducation />
        
        <section>
            <div className="flex items-center gap-2 mb-6">
                <span className="bg-indigo-600 w-2 h-8 rounded-full"></span>
                <h2 className="text-2xl font-bold text-slate-800">Desafio de Phrasal Verbs</h2>
            </div>
            <PhrasalVerbsGame />
        </section>
      </div>
    </div>
  );
}
import IrregularVerbsGame from '../../../../src/components/IrregularVerbsGame';

// Essa função roda no servidor antes da página ser enviada
export async function generateMetadata({ params }) {
  // Aguarda os parâmetros (no Next.js 15+ params é uma Promise, no 14 é objeto)
  // Se estiver usando Next 13/14 pode acessar direto params.levelId
  const { levelId } = await params; 
  
  return {
    title: `Fase ${levelId} - Irregular Verbs | EnglishUp`,
    description: `Treine os verbos irregulares da Fase ${levelId}. Memorize Past e Participle jogando.`,
    robots: {
      index: false, // Opcional: Geralmente não queremos indexar níveis de jogos individuais, mas você decide
    }
  };
}

export default function LevelPage() {
  return <IrregularVerbsGame />;
}
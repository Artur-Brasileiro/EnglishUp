import PhrasalVerbsGame from '../../../../src/components/PhrasalVerbsGame';

// Gera o título dinâmico para o navegador (SEO e UX)
export async function generateMetadata({ params }) {
  const { levelId } = await params; 
  
  return {
    title: `Fase ${levelId} | Phrasal Verbs - EnglishUp`,
    description: `Complete a Fase ${levelId} do desafio de Phrasal Verbs e domine o inglês com exercícios práticos.`,
  };
}

export default function LevelPage() {
  return <PhrasalVerbsGame />;
}
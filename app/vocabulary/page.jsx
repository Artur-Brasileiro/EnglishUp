import VocabularyGame from '../../../../src/components/VocabularyGame';

// ADICIONADO: Função para gerar o título dinâmico (SEO)
export async function generateMetadata({ params }) {
  // O await garante compatibilidade com versões futuras do Next.js
  const { levelId } = await params;
  
  return {
    title: `Nível ${levelId} - Vocabulário Diário | EnglishUp`,
    description: `Treine as 30 palavras do Nível ${levelId}. Expanda seu vocabulário em inglês com exercícios de memorização.`,
  };
}

export default function LevelPage() {
  return <VocabularyGame />;
}
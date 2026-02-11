import VocabularyGame from '../../src/components/VocabularyGame';

export const metadata = {
  title: 'Treino de Vocabulário Diário | EnglishUp',
  description: 'Expanda seu vocabulário em inglês com 30 palavras novas por dia. Exercícios de memorização e repetição espaçada.',
};

export default function VocabularyPage() {
  // Removemos o <VocabularyEducation /> e as divs extras de layout
  // pois o VocabularyGame (via PageShell) já cuida de toda a estrutura visual.
  return (
    <VocabularyGame />
  );
}
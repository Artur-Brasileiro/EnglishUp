import TranslationGame from '../../../../src/components/TranslationGame';

export async function generateMetadata({ params }) {
  const { levelId } = await params;
  const formattedLevel = levelId.charAt(0).toUpperCase() + levelId.slice(1).replace('_', ' ');

  return {
    title: `${formattedLevel} | Translation - EnglishUp`,
    description: `Pratique traduções com foco em ${formattedLevel}.`,
  };
}

export default function LevelPage() {
  return <TranslationGame />;
}
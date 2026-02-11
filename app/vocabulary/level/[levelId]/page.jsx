import VocabularyGame from '../../../../src/components/VocabularyGame';

// O VocabularyGame (Client Component) já cuida de atualizar o título da página
// e carregar o nível correto usando o useParams()

export default function LevelPage() {
  return <VocabularyGame />;
}
// app/irregular/page.jsx (ou o caminho que você estiver usando)
import IrregularVerbsGame from '../../src/components/IrregularVerbsGame';

export const metadata = {
  title: 'Guia Definitivo dos Verbos Irregulares | EnglishUp',
  description: 'Aprenda os verbos irregulares com nosso guia completo. Memorize a tabela de verbos e jogue gratuitamente.',
};

export default function IrregularPage() {
  // Removemos o container <div className="max-w-4xl..."> e o <IrregularVerbsEducation />
  // pois o próprio componente do jogo já lida com o layout de tela cheia e exibe o conteúdo educativo no menu.
  return <IrregularVerbsGame />;
}
import HubPage from '../src/screens/HubPage';

// Metadados estáticos para o Google (Isso substitui o Helmet da Home!)
export const metadata = {
  title: 'EnglishUp - Aprenda Inglês Jogando | Exercícios Grátis',
  description: 'Plataforma gratuita para aprender inglês jogando. Exercícios de vocabulário, verbos irregulares, phrasal verbs e tradução.',
}

export default function Home() {
  return <HubPage />;
}
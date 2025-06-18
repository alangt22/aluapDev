// pages/CardDetail.tsx
import { useParams } from "react-router-dom";
import { Container } from "../../components/container";
import { List } from "../../components/list";

export function CardDetail() {
  const { id } = useParams();

  if (!id || typeof id !== 'string') {
    return <p className="text-center">Carregando...</p>;
  }

  return (
    <Container>
      <main>
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent py-4">
          Detalhes da Lista
        </h1>
        <List listaId={id} />
      </main>
    </Container>
  );
}


import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { Container } from "../../components/container";
import { Card } from "../../components/card";

export function Dashboard() {
  const { user } = useContext(AuthContext);


  return (
    <Container>
      <div className="w-full flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Olá, Seja bem-vindo(a) {user?.name}</h1>
        <span className="text-2xl font-bold text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Crie listas para organizar suas financas</span>

      </div>
      <Card />
    </Container>
  );
}

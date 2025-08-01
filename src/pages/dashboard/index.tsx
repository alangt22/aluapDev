import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect } from "react";
import { Container } from "../../components/container";
import { Card } from "../../components/card";
import { Ganhos } from "@/components/ganhos";

import { FiBarChart2 } from "react-icons/fi";
import { Link } from "react-router-dom";

export function Dashboard() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = "Dashboard | AluapDEV";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
         "Acompanhe seu painel e gerencie seus dados na plataforma AluapDEV."
      );
    }
  }, []);

  return (
    <Container>
      <div className="w-full flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Olá, Seja bem-vindo(a) {user?.name}
        </h1>
        <span className="text-2xl font-bold text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Crie listas para organizar suas financas
        </span>
        <section className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center lg:gap-5">
          <div className="border-2 p-2 rounded-md mt-10 shadow-xl">
            <Ganhos />
          </div>

          <div className="border-2  rounded-md mt-10 shadow-xl mb-10">
            <Card />
          </div>
        </section>
      </div>
      <div className="fixed bottom-6 right-6 md:hidden z-50 group">
        <Link
          to="/resumo"
          className="w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200"
          aria-label="Ir para retorno financeiro"
        >
          <FiBarChart2 size={24} />
        </Link>

        <div className="absolute bottom-16 right-1/2 translate-x-1/2 bg-black text-white text-xs font-medium px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Resumo financeiro
        </div>
      </div>
    </Container>
  );
}

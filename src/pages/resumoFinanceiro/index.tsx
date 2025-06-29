import { useContext, useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import { AuthContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Container } from "@/components/container";
import { FiArrowLeft } from "react-icons/fi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";


const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A28EFF", "#FF6680", "#FFB3BA", "#B0E57C",
  "#FFD700", "#00CED1"
];

export function ResumoFinanceiro() {
  const { user } = useContext(AuthContext);
  const [totalCreditos, setTotalCreditos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.uid) return;

    
    const qCreditos = query(
      collection(db, "creditos"),
      where("userId", "==", user.uid)
    );
    const unsubscribeCreditos = onSnapshot(qCreditos, (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + (doc.data().valor ?? 0), 0);
      setTotalCreditos(total);
    });

    
    const qListas = query(
      collection(db, "listas"),
      where("userId", "==", user.uid)
    );
    const unsubscribeListas = onSnapshot(qListas, (snapshot) => {
      const categorias: Record<string, number> = {};
      let total = 0;

      snapshot.docs.forEach((listaDoc) => {
        const itensRef = collection(db, "listas", listaDoc.id, "itens");
        onSnapshot(itensRef, (itensSnap) => {
          itensSnap.docs.forEach((doc) => {
            const data = doc.data();
            const valor = data.valor ?? 0;
            const categoria = data.categoria || "Outros";
            total += valor;
            categorias[categoria] = (categorias[categoria] || 0) + valor;
          });

          setTotalGastos(total);
          setGastosPorCategoria(categorias);
        });
      });
    });

    return () => {
      unsubscribeCreditos();
      unsubscribeListas();
    };
  }, [user?.uid]);

  const saldo = totalCreditos - totalGastos;
  const dataGrafico = Object.entries(gastosPorCategoria).map(([categoria, valor]) => ({
    name: categoria,
    value: valor,
  }));

  return (
    <Container>
      <Link to="/dashboard" className="flex items-center gap-2 mb-4 group">
        <FiArrowLeft
          size={20}
          className="text-gray-700 group-hover:text-blue-600 transition-colors"
        />
        <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
          Voltar
        </span>
      </Link>

      <div className="p-4 border rounded-md bg-white shadow max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Resumo Financeiro</h2>
        <p>Créditos: R$ {totalCreditos.toFixed(2)}</p>
        <p>Gastos: R$ {totalGastos.toFixed(2)}</p>
        <p className="font-semibold mt-2">Saldo: R$ {saldo.toFixed(2)}</p>
      </div>

      {dataGrafico.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8 mb-20">
          <h3 className="text-lg font-semibold mb-4 text-center">Distribuição de Gastos por Categoria</h3>

          
          <ul className="mb-6 text-sm text-gray-700 space-y-1">
            {dataGrafico.map((item, index) => (
              <li key={item.name} className="flex justify-between border-b pb-1">
                <span>
                  <span
                    className="inline-block w-3 h-3 mr-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  {item.name}
                </span>
                <span>R$ {item.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataGrafico}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {dataGrafico.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Container>
  );
}

import { useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import { AuthContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Container } from "@/components/container";
import { FiArrowLeft } from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF6680",
  "#FFB3BA",
  "#B0E57C",
  "#FFD700",
  "#00CED1",
];

export function ResumoFinanceiro() {
  const { user } = useContext(AuthContext);

  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [totalCreditos, setTotalCreditos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!user?.uid) return;

    const [ano, mes] = mesSelecionado.split("-").map(Number);
    const inicioUTC = new Date(Date.UTC(ano, mes - 1, 1));
    const fimUTC = new Date(Date.UTC(ano, mes, 0, 23, 59, 59));

    // Créditos
    const qCreditos = query(
      collection(db, "creditos"),
      where("userId", "==", user.uid),
      where("data", ">=", Timestamp.fromDate(inicioUTC)),
      where("data", "<=", Timestamp.fromDate(fimUTC))
    );

    const unsubscribeCreditos = onSnapshot(qCreditos, (snapshot) => {
      const total = snapshot.docs.reduce(
        (acc, doc) => acc + (doc.data().valor ?? 0),
        0
      );
      setTotalCreditos(total);
    });

    // Gastos
    const qListas = query(
      collection(db, "listas"),
      where("userId", "==", user.uid),
      where("vencimento", ">=", Timestamp.fromDate(inicioUTC)),
      where("vencimento", "<=", Timestamp.fromDate(fimUTC))
    );

    const unsubscribeListas = onSnapshot(qListas, (listasSnap) => {
      const categorias: Record<string, number> = {};
      let totalGastosTemp = 0;
      const unsubItens: (() => void)[] = [];
      setTotalGastos(0);
      setGastosPorCategoria({});
      listasSnap.forEach((listaDoc) => {
        const itensRef = collection(db, "listas", listaDoc.id, "itens");

        const unsub = onSnapshot(itensRef, (itensSnap) => {
          let subtotal = 0;
          const categoriasLocais: Record<string, number> = {};

          itensSnap.forEach((doc) => {
            const data = doc.data();
            const valor = data.valor ?? 0;
            const categoria = data.categoria || "Outros";

            subtotal += valor;
            categoriasLocais[categoria] =
              (categoriasLocais[categoria] || 0) + valor;
          });

          totalGastosTemp += subtotal;
          for (const [cat, val] of Object.entries(categoriasLocais)) {
            categorias[cat] = (categorias[cat] || 0) + val;
          }

          setTotalGastos(totalGastosTemp);
          setGastosPorCategoria({ ...categorias });
        });

        unsubItens.push(unsub);
      });

      return () => unsubItens.forEach((fn) => fn());
    });

    return () => {
      unsubscribeCreditos();
      unsubscribeListas();
    };
  }, [mesSelecionado, user?.uid]);

  const saldo = totalCreditos - totalGastos;

  const dataGrafico = Object.entries(gastosPorCategoria).map(
    ([categoria, valor]) => ({
      name: categoria,
      value: valor,
    })
  );

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

      <label className="text-sm font-medium">
        Filtrar por mês:
        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          className="ml-2 px-2 py-1 border rounded"
        />
      </label>

      <div className="p-4 border rounded-md bg-white shadow max-w-md mx-auto mt-4">
        <h2 className="text-xl font-bold mb-4">Resumo Financeiro</h2>
        <p>Créditos: R$ {totalCreditos.toFixed(2)}</p>
        <p>Gastos: R$ {totalGastos.toFixed(2)}</p>
        <p className="font-semibold mt-2">Saldo: R$ {saldo.toFixed(2)}</p>
      </div>

      {dataGrafico.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8 mb-20">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Distribuição de Gastos por Categoria
          </h3>

          <ul className="mb-6 text-sm text-gray-700 space-y-1">
            {dataGrafico.map((item, index) => (
              <li
                key={item.name}
                className="flex justify-between border-b pb-1"
              >
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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

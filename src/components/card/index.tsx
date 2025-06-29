import { useState, useEffect, useContext } from "react";
import { Container } from "../container";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Loading } from "../loading";

const listaFormSchema = z.object({
  nome: z.string().min(3, "O nome da lista deve ter pelo menos 3 caracteres"),
  vencimento: z.string().min(10, "Data de vencimento é obrigatória"),
});

type ListaFormInput = z.infer<typeof listaFormSchema>;

interface ListaProps {
  id: string;
  nome: string;
  vencimento: Date;
  createdAt: Date | null;
}

function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatarData(data: Date | null) {
  if (!data) return "Data não disponível";
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Função para formatar valores em moeda BRL
const formatarValor = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export function Card() {
  const { user } = useContext(AuthContext);
  const [listas, setListas] = useState<ListaProps[]>([]);
  const [totais, setTotais] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // useForm com schema que valida input do formulário
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ListaFormInput>({
    resolver: zodResolver(listaFormSchema),
  });

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "listas"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedListas: ListaProps[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        let vencimentoDate: Date = data.vencimento
          ? data.vencimento.toDate
            ? data.vencimento.toDate()
            : new Date(data.vencimento)
          : new Date();

        return {
          id: doc.id,
          nome: data.nome ?? "",
          vencimento: vencimentoDate,
          createdAt: data.createdAt?.toDate() ?? null,
        };
      });

      setListas(fetchedListas);
      await calcularTotais(fetchedListas);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  async function calcularTotais(listas: ListaProps[]) {
    const novosTotais: Record<string, number> = {};

    for (const lista of listas) {
      const itensSnap = await getDocs(
        collection(db, "listas", lista.id, "itens")
      );
      let soma = 0;
      itensSnap.forEach((doc) => {
        const data = doc.data();
        if (data.valor && typeof data.valor === "number") {
          soma += data.valor;
        }
      });
      novosTotais[lista.id] = soma;
    }

    setTotais(novosTotais);
  }

  const onSubmit = async (data: ListaFormInput) => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const vencimentoDate = parseDateLocal(data.vencimento);

      await addDoc(collection(db, "listas"), {
        nome: data.nome,
        vencimento: vencimentoDate,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Lista criada com sucesso!");
      setOpen(false);
      reset(); // limpa formulário
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      toast.error("Erro ao criar lista. Tente novamente.");
    }
    setLoading(false);
  };

  async function handleDelete(listaId: string) {
    try {
      const itensRef = collection(db, "listas", listaId, "itens");
      const itensSnapshot = await getDocs(itensRef);

      const batch = writeBatch(db);
      itensSnapshot.forEach((docItem) => batch.delete(docItem.ref));

      await batch.commit();
      await deleteDoc(doc(db, "listas", listaId));

      toast.success("Lista excluída com todos os itens!");
    } catch (error) {
      console.error("Erro ao excluir lista e itens:", error);
      toast.error("Erro ao excluir. Tente novamente.");
    }
  }

  return (
    <Container>
      <main className="py-10 flex flex-col gap-8 w-[350px] lg:w-[500px]">
        <h1 className="font-bold text-2xl text-center">Gastos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="w-36 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 mx-auto cursor-pointer"
              title="Adicionar nova lista"
            >
              <FiPlus size={18} />
              Nova lista
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar nova lista</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para criar uma nova lista
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 mt-4"
            >
              <label className="flex flex-col gap-1 text-sm font-medium">
                Nome da lista
                <input
                  type="text"
                  {...register("nome")}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Cartão Azul"
                />
                {errors.nome && (
                  <span className="text-red-500 text-sm">
                    {errors.nome.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium">
                Data de vencimento
                <input
                  type="date"
                  {...register("vencimento")}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.vencimento && (
                  <span className="text-red-500 text-sm">
                    {errors.vencimento.message}
                  </span>
                )}
              </label>

              <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer"
                >
                  {loading ? <Loading /> : "Criar"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 place-items-center">
          {listas.length === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <span>Nenhuma lista encontrada</span>
            </div>
          ) : (
            listas.map((lista) => (
              <div
                key={lista.id}
                className="w-full max-w-sm h-full flex flex-col justify-between items-center gap-2 border border-gray-300 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-black shadow-xl p-4 mb-8"
              >
                <button
                  className="absolute top-2 right-2 text-white hover:text-red-500 transition duration-200"
                  onClick={() => handleDelete(lista.id)}
                  title="Excluir lista"
                >
                  <FiTrash2 size={20} />
                </button>

                <h1 className="text-3xl font-bold mb-2 text-center">
                  {lista.nome}
                </h1>

                <span className="block text-lg text-gray-700 mb-1 text-center font-bold">
                  Total: {formatarValor(totais[lista.id] ?? 0)}
                </span>

                <div className="flex flex-col">
                  <strong>Data de vencimento</strong>
                  <span className="text-sm font-bold text-gray-600 mb-4 text-center">
                    {formatarData(lista.vencimento)}
                  </span>
                </div>

                <Link
                  to={`/card/${lista.id}`}
                  className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Mais detalhes
                </Link>

                <span className="text-sm text-white mt-4">
                  Criado em: {formatarData(lista.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </Container>
  );
}

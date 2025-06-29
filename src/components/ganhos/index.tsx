import { useState, useEffect, useContext } from "react";
import { Container } from "../container";
import { FiPlus, FiTrash2, FiList } from "react-icons/fi";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { Loading } from "../loading";

const creditoSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  valor: z.number().positive("Valor deve ser positivo"),
  data: z.string().min(10, "Data é obrigatória"),
});

type CreditoInput = z.infer<typeof creditoSchema>;

interface Credito {
  id: string;
  nome: string;
  valor: number;
  data: Date;
}

export function Ganhos() {
  const { user } = useContext(AuthContext);
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreditoInput>({
    resolver: zodResolver(creditoSchema),
  });

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "creditos"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Credito[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome,
          valor: data.valor,
          data: data.data.toDate(),
        };
      });

      setCreditos(lista);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const onSubmit = async (data: CreditoInput) => {
    if (!user?.uid) return;
    setLoading(true);

    try {
      const [ano, mes, dia] = data.data.split("-").map(Number);
      const dataLocal = new Date(ano, mes - 1, dia); // meses são base 0

      await addDoc(collection(db, "creditos"), {
        nome: data.nome,
        valor: data.valor,
        data: dataLocal,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Crédito adicionado!");
      reset();
      setOpenAdd(false);
    } catch (error) {
      console.error("Erro ao adicionar crédito:", error);
      toast.error("Erro ao adicionar crédito.");
    }

    setLoading(false);
  };

  const excluirCredito = async (id: string) => {
    try {
      await deleteDoc(doc(db, "creditos", id));
      toast.success("Crédito excluído!");
    } catch (error) {
      console.error("Erro ao excluir crédito:", error);
      toast.error("Erro ao excluir.");
    }
  };

  const totalCreditos = creditos.reduce((total, c) => total + c.valor, 0);

  return (
    <Container>
      <section className="w-82 flex flex-col items-center justify-center py-16">
        <h1 className="font-bold text-2xl mb-4">Créditos</h1>

        {/* Botão adicionar */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mb-4 text-sm font-medium cursor-pointer">
              <FiPlus className="w-4 h-4" />
              Adicionar
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar crédito</DialogTitle>
              <DialogDescription>
                Preencha os dados do crédito
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 mt-4"
            >
              <label className="text-sm font-medium flex flex-col gap-1">
                Nome do serviço
                <input
                  type="text"
                  {...register("nome")}
                  className="px-3 py-2 border rounded-md"
                  placeholder="Ex: Salário, aluguel..."
                />
                {errors.nome && (
                  <span className="text-red-500">{errors.nome.message}</span>
                )}
              </label>

              <label className="text-sm font-medium flex flex-col gap-1">
                Valor (R$)
                <input
                  type="number"
                  step="0.01"
                  {...register("valor", { valueAsNumber: true })}
                  className="px-3 py-2 border rounded-md"
                />
                {errors.valor && (
                  <span className="text-red-500">{errors.valor.message}</span>
                )}
              </label>

              <label className="text-sm font-medium flex flex-col gap-1">
                Data
                <input
                  type="date"
                  {...register("data")}
                  className="px-3 py-2 border rounded-md"
                />
                {errors.data && (
                  <span className="text-red-500">{errors.data.message}</span>
                )}
              </label>

              <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md cursor-pointer">
                    Cancelar
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                >
                  {loading ? <Loading /> : "Salvar"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <button
          onClick={() => setMostrarLista((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mb-4 cursor-pointer"
        >
          <FiList />
          {mostrarLista ? "Fechar lista" : "Ver mais"}
        </button>

        {mostrarLista && (
          <div className="mt-4 flex flex-col gap-4 w-full max-w-2xl">
            {creditos.length === 0 ? (
              <span className="text-center">
                Nenhum crédito adicionado ainda.
              </span>
            ) : (
              creditos.map((credito) => (
                <div
                  key={credito.id}
                  className="flex justify-between items-center p-4 border rounded-md bg-white shadow-md"
                >
                  <div>
                    <h2 className="font-bold text-lg">{credito.nome}</h2>
                    <p className="text-sm text-gray-500 font-bold">
                      Valor:{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(credito.valor)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data: {new Date(credito.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={() => excluirCredito(credito.id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                    title="Excluir crédito"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              ))
            )}

            {creditos.length > 0 && (
              <div className="text-center mt-6 font-semibold text-xl">
                Total:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalCreditos)}
              </div>
            )}
          </div>
        )}
      </section>
    </Container>
  );
}

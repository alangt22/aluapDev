import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Container } from "../container";
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Loading } from "../loading";
import { z } from "zod";

const categorias = [
  "Comida",
  "Transporte",
  "Educação",
  "Saúde",
  "Lazer",
  "Moradia",
  "Contas",
  "Investimentos",
  "Compras",
  "Outros",
] as const;

const itemSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valor: z.string().refine((val) => !isNaN(Number(val)), "Valor inválido"),
  categoria: z.enum(categorias, {
    errorMap: () => ({ message: "Selecione uma categoria válida" }),
  }),
});

export type ListProps = {
  listaId: string;
};

interface ItemProps {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  createdAt: Date;
}

export function List({ listaId }: ListProps) {
  const [listaInfo, setListaInfo] = useState<any>(null);
  const [itens, setItens] = useState<ItemProps[]>([]);

  const [open, setOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [nomeItem, setNomeItem] = useState("");
  const [valorItem, setValorItem] = useState("");
  const [categoriaItem, setCategoriaItem] = useState<
    (typeof categorias)[number]
  >(categorias[0]);
  const [loading, setLoading] = useState(false);

  const formatarData = (data: Date | null) => {
    if (!data) return "Data não disponível";
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatarValor = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  useEffect(() => {
    if (listaInfo?.nome) {
      document.title = `${listaInfo.nome} | AluapDEV`;

      const metaDescription = document.querySelector(
        "meta[name='description']"
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `Detalhes da lista: ${listaInfo.nome}`
        );
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = `Detalhes da lista: ${listaInfo.nome}`;
        document.head.appendChild(meta);
      }
    }
  }, [listaInfo]);

  useEffect(() => {
    const fetchListaInfo = async () => {
      const docRef = doc(db, "listas", listaId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListaInfo({ id: docSnap.id, ...docSnap.data() });
      }
    };

    if (listaId) fetchListaInfo();
  }, [listaId]);

  useEffect(() => {
    if (listaId) {
      const q = query(collection(db, "listas", listaId, "itens"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome,
          valor: doc.data().valor,
          categoria: doc.data().categoria,
          createdAt: doc.data().createdAt?.toDate() ?? null,
        }));
        setItens(items);
      });

      return () => unsubscribe();
    }
  }, [listaId]);

  async function handleSaveItem() {
    const result = itemSchema.safeParse({
      nome: nomeItem,
      valor: valorItem,
      categoria: categoriaItem,
    });

    if (!result.success) {
      alert(result.error.errors.map((e) => e.message).join("\n"));
      return;
    }

    const valor = parseFloat(valorItem);
    setLoading(true);

    try {
      if (editItemId) {
        const ref = doc(db, "listas", listaId, "itens", editItemId);
        await updateDoc(ref, {
          nome: nomeItem,
          valor,
          categoria: categoriaItem,
        });
      } else {
        await addDoc(collection(db, "listas", listaId, "itens"), {
          nome: nomeItem,
          valor,
          categoria: categoriaItem,
          createdAt: serverTimestamp(),
        });
      }

      setNomeItem("");
      setValorItem("");
      setCategoriaItem(categorias[0]);
      setEditItemId(null);
      setOpen(false);
    } catch (err) {
      console.error("Erro ao salvar item:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditItem(itemId: string) {
    const ref = doc(db, "listas", listaId, "itens", itemId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setNomeItem(snap.data().nome);
      setValorItem(snap.data().valor.toString());
      setCategoriaItem(snap.data().categoria);
      setEditItemId(itemId);
      setOpen(true);
    }
  }

  async function handleDeleteItem(itemId: string) {
    await deleteDoc(doc(db, "listas", listaId, "itens", itemId));
  }

  const total = itens.reduce((acc, item) => acc + item.valor, 0);

  if (!listaInfo)
    return <p className="text-center">Carregando dados da lista...</p>;

  return (
    <Container>
      <main className="py-10 flex flex-col gap-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 hover:text-blue-500 mb-10"
        >
          <FiArrowLeft size={20} />
          Voltar
        </Link>

        <section className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">{listaInfo.nome}</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 self-start flex items-center gap-2 cursor-pointer">
                <FiPlus size={18} />
                Adicionar Item
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editItemId ? "Editar Item" : "Adicionar Novo Item"}
                </DialogTitle>
                <DialogDescription>
                  {editItemId
                    ? "Altere os dados do item selecionado."
                    : "Informe os dados do novo item abaixo."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Nome do item"
                  value={nomeItem}
                  onChange={(e) => setNomeItem(e.target.value)}
                  className="w-full border px-4 py-2 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Valor"
                  value={valorItem}
                  onChange={(e) => setValorItem(e.target.value)}
                  className="w-full border px-4 py-2 rounded-md"
                />
                <select
                  value={categoriaItem}
                  onChange={(e) =>
                    setCategoriaItem(
                      e.target.value as (typeof categorias)[number]
                    )
                  }
                  className="w-full border px-4 py-2 rounded-md"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <button
                      onClick={() => {
                        setNomeItem("");
                        setValorItem("");
                        setCategoriaItem(categorias[0]);
                        setEditItemId(null);
                      }}
                      className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </DialogClose>
                  <button
                    onClick={handleSaveItem}
                    className="relative px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loading />
                    ) : editItemId ? (
                      "Salvar Alterações"
                    ) : (
                      "Adicionar"
                    )}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {itens.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum item encontrado.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {itens.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white/70 border border-gray-300 shadow-md rounded-md p-4"
              >
                <div>
                  <h3 className="text-lg font-semibold">{item.nome}</h3>
                  <p className="text-gray-600">
                    Valor: {formatarValor(item.valor)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Categoria: {item.categoria}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditItem(item.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      <FiEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition cursor-pointer"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 mt-2">
                    {formatarData(item.createdAt || null)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-right text-xl font-bold mt-6">
          Total: {formatarValor(total)}
        </div>
      </main>
    </Container>
  );
}

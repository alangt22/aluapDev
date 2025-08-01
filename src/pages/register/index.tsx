import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../components/container";
import { Input } from "../../components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "../../services/firebaseConnection";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Loading } from "../../components/loading";

const schema = z.object({
  email: z.string().email("E-mail inválido").nonempty("E-mail obrigatório"),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .nonempty("Senha obrigatória"),
  name: z.string().nonempty("Nome obrigatório"),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const [loading, setLoading] = useState(false);

  const { handleInfoUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    document.title = "Register | AluapDEV";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Crie sua conta na plataforma AluapDEV."
      );
    }
  }, []);

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }

    handleLogout();
  }, []);

  async function onSubmit(data: FormData) {
    setLoading(true);

    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (user) => {
        await updateProfile(user.user, {
          displayName: data.name,
        });
        handleInfoUser({
          name: data.name,
          email: data.email,
          uid: user.user.uid,
        });
        toast.success("cadastrado com sucesso");
        navigate("/dashboard", { replace: true });
        setLoading(false);
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          toast.error("Este e-mail já está cadastrado.");
        } else if (error.code === "auth/invalid-email") {
          toast.error("E-mail inválido.");
        } else if (error.code === "auth/weak-password") {
          toast.error("A senha precisa ter pelo menos 6 caracteres.");
        } else {
          toast.error("Erro ao cadastrar. Tente novamente.");
          console.error(error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <div className="mb-6 max-w-sm">
          <span className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Aluap
            <span className="bg-gradient-to-r from-purple-500 to-purple-900 bg-clip-text text-transparent">
              DEV
            </span>
          </span>
        </div>

        <form
          className="bg-white/60 max-w-xl w-full rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Input
              type="name"
              placeholder="Digite seu nome completo"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>
          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite seu e-mail"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>
          <div className="mb-3">
            <Input
              type="password"
              placeholder="Digite sua senha"
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button
            className="bg-gradient-to-r from-purple-400 to-blue-600 cursor-pointer w-full rounded-md text-white h-10 font-medium flex items-center justify-center
            opacity-80 hover:opacity-100"
            type="submit"
          >
            {loading ? <Loading /> : "Cadastrar"}
          </button>
        </form>
        <p>
          Ja possui uma conta?{" "}
          <Link to="/login" className="text-black hover:text-purple-900">
            Faça login.
          </Link>
        </p>
      </div>
    </Container>
  );
}

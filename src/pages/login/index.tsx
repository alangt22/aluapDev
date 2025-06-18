import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container } from "../../components/container";
import { Input } from "../../components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";
import toast from "react-hot-toast";
import { Loading } from "../../components/loading";

const schema = z.object({
  email: z.string().email("E-mail inválido").nonempty("E-mail obrigatório"),
  password: z.string().nonempty("Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const [loading, setLoading] = useState(false);

  const Navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }

    handleLogout();
  }, []);

  function onSubmit(data: FormData) {
    setLoading(true);
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((user) => {
        console.log("logado com sucesso");
        console.log(user);
        toast.success("Logado com sucesso!");
        Navigate("/dashboard", { replace: true });
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Erro ao logar");
        console.log(error);
        setLoading(false);
      });
  }

  return (
    <Container>
      <div className=" w-full min-h-screen flex justify-center items-center flex-col gap-4 ">
        <div className="mb-6 max-w-sm w-full">
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
            {loading ? <Loading /> : "Acessar"}
          </button>
        </form>
        <span>
          Ainda nao possui uma conta?{" "}
          <Link to="/register" className="text-black hover:text-purple-900">
            Cadastre-se
          </Link>
        </span>
        <Link
          to="/reset-password"
          className="text-black text-sm mt-2 hover:underline"
        >
          Esqueceu a senha?
        </Link>
      </div>
    </Container>
  );
}

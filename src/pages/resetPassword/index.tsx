// pages/ResetPassword.tsx
import { useEffect, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const naigate = useNavigate();

  useEffect(() => {
  document.title = "Reset Password | AluapDEV";
  const metaDescription = document.querySelector("meta[name='description']");
  if (metaDescription) {
    metaDescription.setAttribute("content", "Faça login na plataforma AluapDEV.");
  }
}, []);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, informe um e-mail válido.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("E-mail de redefinição enviado com sucesso!");
      naigate("/login");
    } catch (error: any) {
      console.error("Erro ao enviar e-mail de redefinição:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("Usuário não encontrado.");
      } else {
        toast.error("Erro ao enviar e-mail de redefinição.");
      }
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Redefinir Senha</h1>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-300  cursor-pointer text-white py-2 rounded hover:bg-blue-600"
        >
          Enviar e-mail de redefinição
        </button>
      </form>
      <a href="/login" className="flex items-center mt-4 text-blue-600 hover:text-blue-800"> 
      <FiArrowLeft className="w-4 h-4" />
      Voltar
      </a>
    </div>
  );
}

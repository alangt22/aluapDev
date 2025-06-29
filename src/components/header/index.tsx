import { FiBarChart2, FiUser } from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import { auth } from "../../services/firebaseConnection";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";

export function Header() {
  const { user } = useContext(AuthContext);
  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="w-full flex items-center justify-center h-16 bg-gradient-to-r from-purple-400 to-blue-600 mb-4 shadow-xl sticky top-0 z-50">
      <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">Óla, {user?.name}</span>
          <FiUser size={24} />
          <div className="relative group ml-4">
            <Link
              to="/resumo"
              className="text-xl hover:scale-110 hover:text-blue-500 cursor-pointer transition duration-200"
              aria-label="Resumo financeiro"
            >
              <FiBarChart2 size={24} />
            </Link>

            <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Resumo financeiro
            </span>
          </div>
        </div>
        <button
          className="ml-auto text-xl hover:scale-110 hover:text-red-500 cursor-pointer transition duration-200"
          onClick={handleLogout}
          title="Sair da conta"
        >
          <FiLogOut size={24} />
        </button>
      </header>
    </div>
  );
}

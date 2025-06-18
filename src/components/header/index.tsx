import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import { auth} from "../../services/firebaseConnection";
import { signOut } from "firebase/auth";

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

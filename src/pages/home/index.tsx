import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-purple-500 px-4">

      <div className="text-center mb-6">
        <h1 className="text-6xl font-bold">
          <span className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Aluap
            <span className="bg-gradient-to-r from-purple-500 to-purple-900 bg-clip-text text-transparent">
              DEV
            </span>
          </span>
        </h1>
        <p className="mt-4 text-2xl text-gray-800 max-w-md mx-auto">
          Organize suas finanças de forma inteligente e eficiente.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition"
        >
          Entrar
        </Link>
        <Link
          to="/register"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition"
        >
          Registrar
        </Link>
      </div>
    </div>
  );
}

import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-purple-400 to-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Aluap
            <span className="bg-gradient-to-r from-purple-500 to-purple-900 bg-clip-text text-transparent">
              DEV
            </span>
          </span>
        </div>

        <div className="text-center text-sm md:text-left">
          <p className="font-semibold">Contato:</p>
          <p>Email: contato@aluapdev.com</p>
          <p>Telefone: (11) 99999-9999</p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:scale-110 transition-transform"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://wa.me/551140094503"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hover:scale-110 transition-transform"
          >
            <FaWhatsapp size={24} />
          </a>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/30 py-4 text-center text-sm text-white/90">
        © {new Date().getFullYear()} AluapDEV. Todos os direitos reservados.
      </div>
    </footer>
  );
}

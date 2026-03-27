export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Farmácia QUEOPS. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>CNPJ: 00.000.000/0001-00</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

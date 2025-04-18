import { ArrowLeft, ChartArea, Menu, Package, Settings, User, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet"
import { Link } from "react-router-dom"

type Props = {
    title: string
    onBack?: () => void
    closeIcon?: boolean
}

export function Header({ title, onBack, closeIcon }: Props) {
    return (
        <div className="flex items-center justify-between w-full py-2 bg-white">
            {onBack ? (
                <div className="flex items-center w-full py-4">
                    <button
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                        onClick={onBack}
                        aria-label="Voltar"
                    >
                        {closeIcon ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <ArrowLeft className="w-6 h-6" />
                        )}
                    </button>
                    <h1 className="text-xl font-semibold text-center flex-1">
                        {title}
                    </h1>
                    <div className="w-6" />
                </div>
            ) : (
                <div className="flex items-center flex-1 gap-4 justify-between">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-"
                                aria-label="Abrir menu"
                            >
                                <Menu className="w-6 h-6 text-gray-700" />
                            </button>
                        </SheetTrigger>

                        <SheetContent side="left" className="w-[300px] p-4">
                            <div className="flex flex-col h-full">
                                {/* Cabeçalho do sidebar */}
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                                    <SheetClose >

                                        <span className="sr-only">Fechar menu</span>
                                    </SheetClose>
                                </div>

                                {/* Itens do menu */}
                                <nav className="flex flex-col gap-2">
                                    <Link
                                        to="/clients"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
                                    >
                                        <span><User /></span>
                                        Clientes
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
                                    >
                                        <span><Package></Package></span>
                                        Produtos
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
                                    >
                                        <span><ChartArea /></span>
                                        Relatórios
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
                                    >
                                        <span><Settings /></span>
                                        Configurações
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <button
                        className="hover:ring-2 ring-blue-200 rounded-full transition-all"
                        aria-label="Perfil do usuário"
                    >
                        <img
                            src="https://randomuser.me/api/portraits/women/79.jpg"
                            alt="Foto do usuário"
                            className="w-10 h-10 rounded-full border-2 border-white"
                        />
                    </button>
                </div>
            )}
        </div>
    )
}
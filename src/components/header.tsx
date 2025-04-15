import { ArrowLeft, Menu } from "lucide-react"

type Props = {
    title: string
    onBack?: () => void
}

export function Header({ title, onBack }: Props) {
    return (
        <div className="flex items-center justify-between w-full py-2 bg-white">
            {onBack ? (
                <div className="flex items-center w-full py-4">
                    <button
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                        onClick={onBack}
                        aria-label="Voltar"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-center flex-1">
                        {title}
                    </h1>
                    {/* Espaço vazio para balancear o layout */}
                    <div className="w-6" />
                </div>
            ) : (
                <div className="flex items-center flex-1 gap-4 justify-between">
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Abrir menu"
                    >
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>

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
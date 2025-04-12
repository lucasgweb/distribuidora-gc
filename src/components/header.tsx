import { ArrowLeft, Menu } from "lucide-react"

type Props = {
    title: string
    onBack?: () => void
}

export function Header({ title, onBack }: Props) {
    return (
        <div className="flex items-center justify-between w-full">

            {!title ? (
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="ml-2">Voltar</span>
                </button>
            ) : (
                <button className="flex font-bold items-center text-gray-800 hover:text-gray-800" onClick={onBack}>
                    <Menu className="w-5 h-5" />
                </button>
            )}

            <img
                src="https://randomuser.me/api/portraits/women/79.jpg"
                alt="User"
                className="w-10 h-10 rounded-full"
            />
        </div>
    )
}
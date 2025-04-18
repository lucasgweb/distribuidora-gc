import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

// Tela para registrar entrada/saida de inventário
export function InventoryMovementPage() {
    const navigate = useNavigate();
    const [balonKilos, setBalonKilos] = useState('10');
    const [marca, setMarca] = useState('delta');
    const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
    const [pipeta, setPipeta] = useState('llena');
    const [cantidad, setCantidad] = useState('');

    const handleSubmit = () => {
        // TODO: lógica de registro de movimiento
        navigate('/inventory');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="px-6 pb-10 max-w-md mx-auto w-full flex-1">
                <Header title="Movimento inventario" onBack={() => navigate(-1)} />

                <div className="mt-6 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Información principal</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="balon">Balones</Label>
                                <Select onValueChange={setBalonKilos} value={balonKilos}>
                                    <SelectTrigger id="balon" className="w-full">
                                        <SelectValue placeholder="Seleccionar kilos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 kilos</SelectItem>
                                        <SelectItem value="15">15 kilos</SelectItem>
                                        <SelectItem value="45">45 kilos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="marca">Marca</Label>
                                <Select onValueChange={setMarca} value={marca}>
                                    <SelectTrigger id="marca" className="w-full">
                                        <SelectValue placeholder="Seleccionar marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="delta">DELTA</SelectItem>
                                        <SelectItem value="sol">SOL</SelectItem>
                                        <SelectItem value="aire">AIRE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Información inventario</h2>
                        <RadioGroup
                            value={movementType}
                            onValueChange={(val) => setMovementType(val as 'entrada' | 'salida')}
                            className="flex space-x-4"
                        >
                            <label htmlFor="entrada" className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem id="entrada" value="entrada" />
                                <span>Entrada</span>
                            </label>
                            <label htmlFor="salida" className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem id="salida" value="salida" />
                                <span>Salida</span>
                            </label>
                        </RadioGroup>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="pipeta">Pipeta</Label>
                        <Select onValueChange={setPipeta} value={pipeta}>
                            <SelectTrigger id="pipeta" className="w-full">
                                <SelectValue placeholder="Seleccionar pipeta" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="llena">Llena</SelectItem>
                                <SelectItem value="vacia">Vacía</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="cantidad">Cantidad</Label>
                        <Input
                            id="cantidad"
                            type="number"
                            placeholder="0"
                            value={cantidad}
                            onChange={e => setCantidad(e.target.value)}
                        />
                    </div>

                    <Button className="w-full mt-4" onClick={handleSubmit}>
                        Registrar movimiento
                    </Button>
                </div>
            </div>


        </div>
    );
}

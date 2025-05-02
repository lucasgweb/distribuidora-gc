import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Textarea } from "../components/ui/textarea";
import { ProductDTO } from "../dtos/product.dto";



export function InventoryMovementPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [movementType, setMovementType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
    const [cylinderType, setCylinderType] = useState<'FULL' | 'EMPTY'>('FULL');
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');

                // Make sure we're getting an array
                if (Array.isArray(response.data.products)) {
                    setProducts(response.data.products);

                    // Set first product as default if available
                    if (response.data.length > 0) {
                        setSelectedProductId(response.data[0].id);
                    }
                } else {
                    console.error("API response is not an array:", response.data);
                    toast.error("Formato de respuesta de productos inválido");
                    setProducts([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("No se pudieron cargar los productos");
                setProducts([]);
            }
        };

        fetchProducts();
    }, []);

    const handleSubmit = async () => {
        if (!selectedProductId) {
            toast.info("Debes seleccionar un producto");
            return;
        }

        if (!quantity || parseInt(quantity) <= 0) {
            toast.info("La cantidad debe ser mayor que cero");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/inventory-movements', {
                productId: selectedProductId,
                movementType, // 'ENTRY' or 'EXIT'
                cylinderType, // 'FULL' or 'EMPTY'
                quantity: parseInt(quantity),
                notes: notes.trim() || undefined,
            });

            toast.success("Movimiento de inventario registrado correctamente");

            navigate('/inventory');
        } catch (error) {
            console.error('Error registering inventory movement:', error);
            toast.error("No se pudo registrar el movimiento de inventario");
        } finally {
            setIsLoading(false);
        }
    };

    // Find selected product name - safely access the products array
    const selectedProduct = products.length > 0
        ? products.find(product => product.id === selectedProductId)
        : null;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="px-6 pb-10 max-w-md mx-auto w-full flex-1">
                <Header title="Movimiento de inventario" onBack={() => navigate(-1)} />

                <div className="mt-6 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Información del producto</h2>
                        <div className="space-y-1">
                            <Label htmlFor="product">Producto</Label>
                            <Select
                                onValueChange={setSelectedProductId}
                                value={selectedProductId}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="product" className="w-full">
                                    <SelectValue placeholder="Seleccionar producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(product => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Tipo de movimiento</h2>
                        <RadioGroup
                            value={movementType}
                            onValueChange={(val) => setMovementType(val as 'ENTRY' | 'EXIT')}
                            className="flex space-x-4"
                            disabled={isLoading}
                        >
                            <label htmlFor="entry" className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem id="entry" value="ENTRY" />
                                <span>Entrada</span>
                            </label>
                            <label htmlFor="exit" className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem id="exit" value="EXIT" />
                                <span>Salida</span>
                            </label>
                        </RadioGroup>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Cilindro</h2>
                        <RadioGroup
                            value={cylinderType}
                            onValueChange={(val) => setCylinderType(val as 'FULL' | 'EMPTY')}
                            className="flex space-x-4"
                            disabled={isLoading}
                        >
                            <label htmlFor="full" className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem id="full" value="FULL" />
                                <span>Lleno</span>
                            </label>
                            <label htmlFor="empty" className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem id="empty" value="EMPTY" />
                                <span>Vacío</span>
                            </label>
                        </RadioGroup>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                            id="quantity"
                            type="number"
                            placeholder="0"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Descripción o razón del movimiento"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {selectedProduct && (
                        <div className="p-4 bg-gray-50 rounded-md">
                            <h3 className="font-medium mb-2">Resumen:</h3>
                            <p>
                                {movementType === 'ENTRY' ? 'Entrada' : 'Salida'} de {quantity || '0'} cilindro(s)
                                {cylinderType === 'FULL' ? ' lleno(s)' : ' vacío(s)'} de {selectedProduct.name}
                            </p>
                        </div>
                    )}

                    <Button
                        className="w-full mt-4"
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedProductId || !quantity}
                    >
                        {isLoading ? "Registrando..." : "Registrar movimiento"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
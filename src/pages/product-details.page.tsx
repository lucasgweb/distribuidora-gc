import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { ProductDTO } from '../dtos/product.dto';

export function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDTO>({
        id: '',
        name: '',
        basePrice: 0,
        emptyCylinderPrice: 0,
        allowPriceNegotiation: true,
        allowCylinderNegotiation: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    useEffect(() => {
        if (id && id !== 'new') {
            // Buscar produto da API
            const mockProduct = {
                id: '1',
                name: 'Balón 10kg Delta',
                basePrice: 150,
                emptyCylinderPrice: 100,
                allowPriceNegotiation: true,
                allowCylinderNegotiation: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setProduct(mockProduct);
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para salvar/atualizar
        navigate('/products');
    };

    return (
        <div className="flex px-6 flex-col min-h-screen ">
            <Header
                title={id ? "Editar Producto" : "Nuevo Producto"}
                onBack={() => navigate('/products')}
            />
            <div className="pt-4 pb-4 max-w-2xl mx-auto w-full">

                <form onSubmit={handleSubmit} className="">
                    <div className="space-y-4">
                        <div>
                            <Label>Nombre del Producto</Label>
                            <Input
                                required
                                value={product.name}
                                onChange={e => setProduct({ ...product, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Label>Precio Base (S/)</Label>
                                <Input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={product.basePrice}
                                    onChange={e => setProduct({ ...product, basePrice: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                                <Label>Precio Balón Vacío (S/)</Label>
                                <Input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={product.emptyCylinderPrice}
                                    onChange={e => setProduct({ ...product, emptyCylinderPrice: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Permitir negociación de precio</Label>
                                <div className="flex gap-4">
                                    <RadioGroup
                                        value={String(product.allowPriceNegotiation)}
                                        onValueChange={value => setProduct({ ...product, allowPriceNegotiation: value === 'true' })}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="true" id="price-yes" />
                                            <Label htmlFor="price-yes">Sí</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="false" id="price-no" />
                                            <Label htmlFor="price-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div>
                                <Label>Permitir negociación de balón vacío</Label>
                                <div className="flex gap-4">
                                    <RadioGroup
                                        value={String(product.allowCylinderNegotiation)}
                                        onValueChange={value => setProduct({ ...product, allowCylinderNegotiation: value === 'true' })}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="true" id="cylinder-yes" />
                                            <Label htmlFor="cylinder-yes">Sí</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="false" id="cylinder-no" />
                                            <Label htmlFor="cylinder-no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate('/products')}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1">
                                {id ? 'Guardar Cambios' : 'Crear Producto'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
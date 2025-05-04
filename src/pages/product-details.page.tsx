import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
    createProduct,
    getProduct,
    updateProduct,
} from '../services/products.service';
import { FullScreenLoader } from '../components/full-screen-loader';
import { Loader2 } from 'lucide-react';
import { MoneyInput } from '../components/ui/money-input';
import { useAuth } from '../hooks/use-auth.hook';

type EditableProduct = {
    name: string;
    basePrice: number;
    emptyCylinderPrice: number;
    allowPriceNegotiation: boolean;
    allowCylinderNegotiation: boolean;
};

export function ProductDetailsPage() {
    const { id } = useParams();
    const isNew = !id || id === 'new';
    const navigate = useNavigate();

    const { user } = useAuth()

    const [product, setProduct] = useState<EditableProduct>({
        name: '',
        basePrice: 0,
        emptyCylinderPrice: 0,
        allowPriceNegotiation: true,
        allowCylinderNegotiation: true,
    });

    const [loading, setLoading] = useState(true);
    const [isSavingProduct, setIsSavingProduct] = useState(false);

    // Cargar datos si estamos editando
    useEffect(() => {
        if (!isNew && id) {
            (async () => {
                try {
                    const data = await getProduct(id);
                    setProduct({
                        name: data.name,
                        basePrice: data.basePrice,
                        emptyCylinderPrice: data.emptyCylinderPrice,
                        allowPriceNegotiation: data.allowPriceNegotiation,
                        allowCylinderNegotiation: data.allowCylinderNegotiation,
                    });
                } catch (error) {
                    console.error('Error al cargar producto', error);
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setLoading(false);
        }
    }, [id, isNew]);

    // Handlers para los MoneyInput
    const handleBasePriceChange = (value: number) => {
        setProduct(prev => ({ ...prev, basePrice: value }));
    };

    const handleEmptyCylinderPriceChange = (value: number) => {
        setProduct(prev => ({ ...prev, emptyCylinderPrice: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProduct(true);

        try {
            // Validamos que los precios sean >= 0
            if (product.basePrice < 0 || product.emptyCylinderPrice < 0) {
                alert('Por favor ingrese valores de precio válidos (>= 0).');
                setIsSavingProduct(false);
                return;
            }

            const payload = {
                name: product.name,
                basePrice: product.basePrice,
                emptyCylinderPrice: product.emptyCylinderPrice,
                allowPriceNegotiation: product.allowPriceNegotiation,
                allowCylinderNegotiation: product.allowCylinderNegotiation,
            };

            if (isNew) {
                await createProduct(payload);
            } else {
                await updateProduct({ id: id!, ...payload });
            }

            navigate(-1);
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('Ocurrió un error al guardar el producto.');
        } finally {
            setIsSavingProduct(false);
        }
    };

    if (loading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="flex px-6 flex-col min-h-screen">
            <Header
                title={isNew ? 'Nuevo Producto' : 'Editar Producto'}
                onBack={() => navigate(-1)}
                hideAvatar
            />

            <div className="pt-4 pb-4 max-w-2xl mx-auto w-full">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <Label>Nombre del Producto</Label>
                            <Input
                                required
                                value={product.name}
                                onChange={e =>
                                    setProduct(prev => ({ ...prev, name: e.target.value }))
                                }
                            />
                        </div>

                        {/* Precios */}
                        <div className="grid gap-4">
                            <div>
                                <Label>Precio Base (S/)</Label>
                                <MoneyInput
                                    required
                                    value={product.basePrice}
                                    onValueChange={handleBasePriceChange}
                                    onBlur={() => {
                                        if (product.basePrice < 0) {
                                            setProduct(prev => ({ ...prev, basePrice: 0 }));
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <Label>Precio Balón Vacío (S/)</Label>
                                <MoneyInput
                                    required
                                    value={product.emptyCylinderPrice}
                                    onValueChange={handleEmptyCylinderPriceChange}
                                    onBlur={() => {
                                        if (product.emptyCylinderPrice < 0) {
                                            setProduct(prev => ({ ...prev, emptyCylinderPrice: 0 }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {
                            user?.role !== 'MEMBER' && (
                                <>
                                    {/* Negociaciones */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Permitir negociación de precio</Label>
                                            <RadioGroup
                                                value={String(product.allowPriceNegotiation)}
                                                onValueChange={value =>
                                                    setProduct(prev => ({
                                                        ...prev,
                                                        allowPriceNegotiation: value === 'true',
                                                    }))
                                                }
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

                                        <div>
                                            <Label>Permitir negociación de balón vacío</Label>
                                            <RadioGroup
                                                value={String(product.allowCylinderNegotiation)}
                                                onValueChange={value =>
                                                    setProduct(prev => ({
                                                        ...prev,
                                                        allowCylinderNegotiation: value === 'true',
                                                    }))
                                                }
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

                                    {/* Botones */}
                                    <div className="flex gap-2 mt-6">
                                        <Button
                                            disabled={isSavingProduct}
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => navigate('/products')}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={isSavingProduct}
                                        >
                                            {isSavingProduct && <Loader2 className="animate-spin" />}
                                            {isNew ? 'Crear Producto' : 'Guardar Cambios'}
                                        </Button>
                                    </div>
                                </>
                            )
                        }

                    </div>
                </form>
            </div>
        </div>
    );
}

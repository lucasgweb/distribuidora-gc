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

type EditableProduct = {
    name: string;
    basePrice: string;
    emptyCylinderPrice: string;
    allowPriceNegotiation: boolean;
    allowCylinderNegotiation: boolean;
};

export function ProductDetailsPage() {
    const { id } = useParams();
    const [isSavingProduct, setIsSavingProduct] = useState(false)
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    const [product, setProduct] = useState<EditableProduct>({
        name: '',
        basePrice: '',
        emptyCylinderPrice: '',
        allowPriceNegotiation: true,
        allowCylinderNegotiation: true,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isNew && id) {
            async function fetchProduct() {
                try {
                    const data = await getProduct(id!);
                    setProduct({
                        name: data.name,
                        basePrice: data.basePrice.toString().replace(/^0+/, '') || '0',
                        emptyCylinderPrice: data.emptyCylinderPrice.toString().replace(/^0+/, '') || '0',
                        allowPriceNegotiation: data.allowPriceNegotiation,
                        allowCylinderNegotiation: data.allowCylinderNegotiation,
                    });
                } catch (error) {
                    console.error('Error al cargar producto', error);
                } finally {
                    setLoading(false);
                }
            }
            fetchProduct();
        } else {
            setLoading(false);
        }
    }, [id, isNew]);

    const handlePriceChange = (value: string, field: 'basePrice' | 'emptyCylinderPrice') => {
        // Permite números decimais e valores vazios
        if (value === '' || /^(\d+\.?\d*|\.\d+)$/.test(value)) {
            setProduct(prev => ({
                ...prev,
                [field]: value.replace(/^0+/, '') || '0'
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSavingProduct(true)

        try {
            const basePrice = parseFloat(product.basePrice || '0');
            const emptyCylinderPrice = parseFloat(product.emptyCylinderPrice || '0');

            if (isNaN(basePrice) || isNaN(emptyCylinderPrice)) {
                alert('Por favor ingrese valores numéricos válidos');
                return;
            }

            const productData = {
                ...product,
                basePrice,
                emptyCylinderPrice
            };

            if (isNew) {
                await createProduct(productData);
            } else if (id) {
                await updateProduct({ id, ...productData });
            }

            navigate('/products');
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('Ocurrió un error al guardar el producto.');
        } finally {
            setIsSavingProduct(false)
        }
    };

    if (loading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="flex px-6 flex-col min-h-screen">
            <Header
                title={isNew ? "Nuevo Producto" : "Editar Producto"}
                onBack={() => navigate('/products')}
            />
            <div className="pt-4 pb-4 max-w-2xl mx-auto w-full">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label>Nombre del Producto</Label>
                            <Input
                                required
                                value={product.name}
                                onChange={e =>
                                    setProduct({ ...product, name: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Label>Precio Base (S/)</Label>
                                <Input
                                    type="text"
                                    required
                                    value={product.basePrice}
                                    onChange={e => handlePriceChange(e.target.value, 'basePrice')}
                                    onBlur={() => {
                                        if (!product.basePrice) {
                                            setProduct(prev => ({ ...prev, basePrice: '0' }));
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <Label>Precio Balón Vacío (S/)</Label>
                                <Input
                                    type="text"
                                    required
                                    value={product.emptyCylinderPrice}
                                    onChange={e => handlePriceChange(e.target.value, 'emptyCylinderPrice')}
                                    onBlur={() => {
                                        if (!product.emptyCylinderPrice) {
                                            setProduct(prev => ({ ...prev, emptyCylinderPrice: '0' }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Resto do formulário permanece igual */}
                        <div className="space-y-4">
                            <div>
                                <Label>Permitir negociación de precio</Label>
                                <RadioGroup
                                    value={String(product.allowPriceNegotiation)}
                                    onValueChange={value =>
                                        setProduct({
                                            ...product,
                                            allowPriceNegotiation: value === 'true',
                                        })
                                    }
                                    className="flex gap-4s"
                                >
                                    <div className="flex items-center gap-2 justify-baseline">
                                        <RadioGroupItem value="true" id="price-yes" />
                                        <Label htmlFor="price-yes" className='mt-3'>Sí</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="false" id="price-no" />
                                        <Label htmlFor="price-no" className='mt-3'>No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <Label>Permitir negociación de balón vacío</Label>
                                <RadioGroup
                                    value={String(product.allowCylinderNegotiation)}
                                    onValueChange={value =>
                                        setProduct({
                                            ...product,
                                            allowCylinderNegotiation: value === 'true',
                                        })
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="true" id="cylinder-yes" />
                                        <Label htmlFor="cylinder-yes" className='mt-3'>Sí</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="false" id="cylinder-no" />
                                        <Label htmlFor="cylinder-no" className='mt-3'>No</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

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
                            <Button type="submit" className="flex-1" disabled={isSavingProduct}>
                                {isSavingProduct && (<Loader2 className='animate-spin' />)}
                                {isNew ? 'Crear Producto' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
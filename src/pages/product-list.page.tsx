import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { ProductDTO } from '../dtos/product.dto';
import { Card, CardContent } from '../components/ui/card';

export function ProductListPage() {
    const mockProducts: ProductDTO[] = [
        {
            id: '1',
            name: 'Balón 10kg Delta',
            basePrice: 150,
            emptyCylinderPrice: 100,
            allowPriceNegotiation: true,
            allowCylinderNegotiation: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            name: 'Balón 15kg Sol',
            basePrice: 200,
            emptyCylinderPrice: 120,
            allowPriceNegotiation: false,
            allowCylinderNegotiation: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<ProductDTO[]>(mockProducts);

    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id?: string) => {
        if (!id) return;
        if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="flex flex-col px-6 min-h-screen ">
            <Header title="Productos" onBack={() => navigate('/')} />
            <div className="pt-4 pb-4 max-w-3xl mx-auto w-full">
                <div className="flex items-center  w-full justify-between gap-2">

                    <Input
                        placeholder="Buscar productos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <Button
                        onClick={() => navigate('/products/new')}

                    >
                        Nuevo
                    </Button>
                </div>



                <div className="mt-4 space-y-2">
                    {filtered.map(product => (
                        <Card
                            key={product.id}
                            className=" cursor-pointer"
                            onClick={() => navigate(`/products/${product.id}`)}
                        >
                            <CardContent>

                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{product.name}</h3>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">P. Base:</span>{' '}
                                                <span>S/ {product.basePrice.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Balón:</span>{' '}
                                                <span>S/ {product.emptyCylinderPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(product.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-2 text-sm">
                                    <div className="flex items-center gap-1">
                                        {product.allowPriceNegotiation ?
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                            <XCircle className="w-4 h-4 text-red-500" />}
                                        <span>Neg. Precio</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {product.allowCylinderNegotiation ?
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                            <XCircle className="w-4 h-4 text-red-500" />}
                                        <span>Neg. Balón</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
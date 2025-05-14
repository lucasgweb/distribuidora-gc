// src/pages/SaleDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/header";
import { Check, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { SaleDTO } from "../dtos/sale.dto";
import { getSale } from "../services/sales.service";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FullScreenLoader } from "../components/full-screen-loader";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

dayjs.locale("es");
dayjs.extend(localizedFormat);

const getPaymentMethodLabel = (method: string): string => {
    switch (method.toUpperCase()) {
        case 'CASH':
            return 'Efectivo';
        case 'YAPE':
            return 'Yape';
        case 'TRANSFER':
            return 'Transferencia';
        case 'CARD':
            return 'Tarjeta';
        default:
            return method;
    }
};

export function SaleFinished() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [sale, setSale] = useState<SaleDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const [generatingPDF, setGeneratingPDF] = useState(false);

    const generatePDF = async () => {
        if (!sale) return;
        try {
            setGeneratingPDF(true);
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const titleSize = 16, headerSize = 12, normalSize = 10, smallSize = 8;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            let y = margin;

            // Title
            pdf.setFontSize(titleSize).setFont('helvetica', 'bold');
            pdf.text(`Venta #${sale.code}`, margin, y);
            y += 8;

            // Date
            pdf.setFontSize(smallSize).setFont('helvetica', 'normal');
            const saleDate = format(new Date(sale.createdAt), "PPPP 'a las' HH:mm", { locale: es });
            pdf.text(saleDate, margin, y);
            y += 10;

            // Cliente
            pdf.setFontSize(headerSize).setFont('helvetica', 'bold');
            pdf.text("Información del Cliente", margin, y); y += 7;
            pdf.setFontSize(normalSize).setFont('helvetica', 'normal');
            pdf.text(`Nombre: ${sale.client.name}`, margin, y); y += 5;
            pdf.text(`Documento: ${sale.client.document}`, margin, y); y += 5;
            pdf.text(`Teléfono: ${sale.client.phone || 'N/A'}`, margin, y); y += 12;

            // Venta info
            pdf.setFontSize(headerSize).setFont('helvetica', 'bold');
            pdf.text("Información de la Venta", margin, y); y += 7;
            pdf.setFontSize(normalSize).setFont('helvetica', 'normal');
            pdf.text(`Chofer: ${sale.user.name}`, margin, y); y += 5;
            pdf.text(`Método de Pago: ${getPaymentMethodLabel(sale.paymentMethod)}`, margin, y); y += 12;

            // Detalle
            pdf.setFontSize(headerSize).setFont('helvetica', 'bold');
            pdf.text("Detalle de Venta", margin, y); y += 10;
            pdf.setFontSize(normalSize);

            sale.items.forEach((item, idx) => {
                if (y > pdf.internal.pageSize.getHeight() - 40) { pdf.addPage(); y = margin; }
                pdf.setFont('helvetica', 'bold').text(`${idx + 1}. ${item.product.name}`, margin, y);
                y += 5;
                pdf.setFont('helvetica', 'normal');
                const price = formatCurrency(item.negotiatedPrice || item.product.basePrice);
                pdf.text(`Precio: ${price}`, margin + 5, y); y += 5;
                if (item.negotiatedCylinderPrice) {
                    pdf.text(`Precio Cilindro: ${formatCurrency(item.negotiatedCylinderPrice)}`, margin + 5, y);
                    y += 5;
                }
                pdf.text(`Cantidad: ${item.soldQuantity} unidades`, margin + 5, y); y += 5;
                if (item.returnedQuantity > 0) {
                    pdf.text(`Devueltos: ${item.returnedQuantity}`, margin + 5, y);
                    y += 5;
                }
                const subtotal = (item.negotiatedPrice || item.product.basePrice) * item.soldQuantity -
                    (item.negotiatedCylinderPrice || item.product.emptyCylinderPrice) * item.returnedQuantity;
                pdf.text(`Subtotal: ${formatCurrency(subtotal)}`, margin + 5, y);
                y += 10;
            });

            if (y > pdf.internal.pageSize.getHeight() - 50) { pdf.addPage(); y = margin; }
            pdf.setDrawColor(200).line(margin, y, pageWidth - margin, y); y += 10;
            pdf.setFont('helvetica', 'bold').setFontSize(16);
            pdf.text("Total:", pageWidth - margin - 50, y);
            pdf.text(formatCurrency(sale.totalAmount), pageWidth - margin, y, { align: 'right' }); y += 15;

            const note = "Este comprobante electrónico ha sido generado automáticamente y es válido sin firma ni sello según la normativa vigente.";
            pdf.setFontSize(smallSize).setFont('helvetica', 'normal');
            const textWidth = pdf.getStringUnitWidth(note) * smallSize / pdf.internal.scaleFactor;
            pdf.text(note, (pageWidth - textWidth) / 2, y);

            pdf.save(`venta-${sale.code}.pdf`);
            toast.success("El comprobante ha sido descargado correctamente");
        } catch (e) {
            console.error(e);
            toast.error("No se pudo generar el PDF. Intente usar imprimir.");
        } finally {
            setGeneratingPDF(false);
        }
    };

    useEffect(() => {
        const fetchSale = async () => {
            try {
                if (!id) throw new Error("ID de venta no proporcionado");
                const data = await getSale(id);
                setSale(data);
            } catch (error) {
                console.error("Error al obtener la venta:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchSale();
    }, [id, navigate]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(value);

    if (loading) return <FullScreenLoader />;
    if (!sale) return <div className="p-4 text-center">Venta no encontrada</div>;


    return (
        <div className="flex flex-col min-h-screen ">
            <div className=" mx-auto w-full flex-1 pb-24 space-y-4 px-4">
                {/* Header con back y share */}
                <Header
                    title="Comprobante de venta"
                    onBack={() => navigate(-1)}
                    hideAvatar
                />

                {/* Card: Información general de la venta */}
                <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <div className="flex justify-center">
                        <div className="relative h-16 w-16">
                            <div className="absolute inset-0 bg-yellow-400/30 rounded-full animate-ping-once" />
                            <div className="h-16 w-16 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Check size={28} className="text-white" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-center text-2xl font-bold text-primary">
                        Venta #{sale.code}
                    </h2>
                    <p className="text-center text-sm text-gray-600">
                        {dayjs(sale.createdAt).format(
                            "dddd, D [de] MMMM [de] YYYY [a las] HH:mm"
                        )}
                    </p>
                    <p className="text-center text-sm text-gray-600">
                        Usuario: {sale.user.name}
                    </p>
                    <div className="flex justify-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {sale.paymentMethod === "CASH" ? "Efectivo" : "Yape"}
                        </span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 grid gap-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Nombre:</span> {sale.client.name}
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Documento:</span> {sale.client.document}
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Teléfono:</span> {sale.client.phone}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">Detalle de venta</h3>

                    <div className="overflow-x-auto mb-10">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-gray-600 text-xs">
                                    <th className="pb-2">Descripción</th>
                                    <th className="pb-2">Precio unitario</th>
                                    <th className="pb-2">Cantidad</th>
                                    <th className="pb-2">Devueltos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items.map((item) => {
                                    const unitPrice =
                                        item.negotiatedPrice ?? item.product.basePrice;

                                    return (
                                        <tr key={item.id} className="border-t text-xs">
                                            <td className="py-2">{item.product.name}</td>
                                            <td className="py-2">
                                                {formatCurrency(unitPrice)}
                                            </td>
                                            <td className="py-2">
                                                {item.soldQuantity} uni
                                            </td>
                                            <td className="py-2">
                                                {item.returnedQuantity} uni
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-2 text-sm">


                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(sale.totalAmount)}</span>
                        </div>
                    </div>
                </div>
                {/* Botão fixo para PDF */}
                <div className="pb-6">
                    <Button
                        disabled={generatingPDF}
                        variant='outline'
                        className="border-primary w-full text-primary hover:scale-[1.02] transition-transform"
                        onClick={() => generatePDF()}
                    >
                        {
                            generatingPDF && (<Loader2 className="animate-spin" />)
                        }
                        Descargar PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}
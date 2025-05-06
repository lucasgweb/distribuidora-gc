// SaleDetail.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/header";
import { Printer, Share2, FileDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { SaleDTO } from "../dtos/sale.dto";
import { getSale } from "../services/sales.service";
import { FullScreenLoader } from "../components/full-screen-loader";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import { toast } from "sonner";

export function SaleDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [sale, setSale] = useState<SaleDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const fetchSale = async () => {
            try {
                if (!id) throw new Error("ID de venta no proporcionado");
                const saleData = await getSale(id);
                setSale(saleData);
            } catch (err) {
                console.error("Error al obtener la venta:", err);
                toast.error("No se pudo cargar la información de la venta"
                );
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchSale();
    }, [id, navigate]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
        }).format(value);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Código copiado al portapapeles");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error("No se pudo copiar al portapapeles");
        }
    };

    const generatePDF = async () => {
        if (!sale) return;

        try {
            setGeneratingPDF(true);

            // Create PDF document
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Set font sizes
            const titleFontSize = 16;
            const headerFontSize = 12;
            const normalFontSize = 10;
            const smallFontSize = 8;

            // Page dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;

            // Start positions
            let yPos = margin;

            // Add title
            pdf.setFontSize(titleFontSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Venta #${sale.code}`, margin, yPos);
            yPos += 8;

            // Add date
            pdf.setFontSize(smallFontSize);
            pdf.setFont('helvetica', 'normal');
            const saleDate = format(new Date(sale.createdAt), "PPPP 'a las' HH:mm", { locale: es });
            pdf.text(saleDate, margin, yPos);
            yPos += 10;

            // Client information
            pdf.setFontSize(headerFontSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text("Información del Cliente", margin, yPos);
            yPos += 7;

            pdf.setFontSize(normalFontSize);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Nombre: ${sale.client.name}`, margin, yPos);
            yPos += 5;
            pdf.text(`Documento: ${sale.client.document}`, margin, yPos);
            yPos += 5;
            pdf.text(`Teléfono: ${sale.client.phone || "N/A"}`, margin, yPos);
            yPos += 12;

            // Sale information
            pdf.setFontSize(headerFontSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text("Información de la Venta", margin, yPos);
            yPos += 7;

            pdf.setFontSize(normalFontSize);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Chofer: ${sale.user.name}`, margin, yPos);
            yPos += 5;
            pdf.text(`Método de Pago: ${getPaymentMethodLabel(sale.paymentMethod)}`, margin, yPos);
            /*             const paymentStatus = sale.debt > 0 ? `DEUDA ${formatCurrency(sale.debt)}` : "PAGADO";
                        pdf.text(`Estado de Pago: ${paymentStatus}`, margin, yPos);
                        */
            yPos += 12;

            // Products title
            pdf.setFontSize(headerFontSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text("Detalle de Venta", margin, yPos);
            yPos += 10;

            // Products
            pdf.setFontSize(normalFontSize);
            sale.items.forEach((item, index) => {
                // Check if we need a new page
                if (yPos > pdf.internal.pageSize.getHeight() - 40) {
                    pdf.addPage();
                    yPos = margin;
                }

                pdf.setFont('helvetica', 'bold');
                pdf.text(`${index + 1}. ${item.product.name}`, margin, yPos);
                yPos += 5;

                pdf.setFont('helvetica', 'normal');
                const unitPrice = formatCurrency(item.negotiatedPrice || item.product.basePrice);
                pdf.text(`Precio: ${unitPrice}`, margin + 5, yPos);
                yPos += 5;

                if (item.negotiatedCylinderPrice) {
                    const cylinderPrice = formatCurrency(item.negotiatedCylinderPrice);
                    pdf.text(`Precio Cilindro: ${cylinderPrice}`, margin + 5, yPos);
                    yPos += 5;
                }

                pdf.text(`Cantidad: ${item.soldQuantity} unidades`, margin + 5, yPos);
                yPos += 5;

                if (item.returnedQuantity > 0) {
                    pdf.text(`Devueltos: ${item.returnedQuantity}`, margin + 5, yPos);
                    yPos += 5;
                }

                const subtotal = formatCurrency(
                    (item.negotiatedPrice || item.product.basePrice) * item.soldQuantity -
                    (item.negotiatedCylinderPrice || item.product.emptyCylinderPrice) * item.returnedQuantity
                );
                pdf.text(`Subtotal: ${subtotal}`, margin + 5, yPos);
                yPos += 10;
            });

            // Check if we need a new page for the summary
            if (yPos > pdf.internal.pageSize.getHeight() - 50) {
                pdf.addPage();
                yPos = margin;
            }

            // Draw a line
            pdf.setDrawColor(200, 200, 200); // Light gray
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text("Total:", pageWidth - margin - 50, yPos);
            pdf.text(formatCurrency(sale.totalAmount), pageWidth - margin, yPos, { align: 'right' });
            yPos += 15;

            // Legal note
            pdf.setFontSize(smallFontSize);
            pdf.setFont('helvetica', 'normal');
            const legalNote = "Este comprobante electrónico ha sido generado automáticamente y es válido sin firma ni sello según la normativa vigente.";

            // Center the legal note
            const textWidth = pdf.getStringUnitWidth(legalNote) * smallFontSize / pdf.internal.scaleFactor;
            const textX = (pageWidth - textWidth) / 2;
            pdf.text(legalNote, textX, yPos);

            // Save the PDF
            pdf.save(`venta-${sale.code}.pdf`);

            toast("El comprobante ha sido descargado correctamente");
        } catch (err) {
            console.error("Error al generar PDF:", err);
            toast.error("No se pudo generar el PDF. Intente usar la función de impresión del navegador.");
        } finally {
            setGeneratingPDF(false);
        }
    };

    const shareSale = async () => {
        if (!sale) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Comprobante de Venta #${sale.code}`,
                    text: `Comprobante de venta por ${formatCurrency(sale.totalAmount)}`,
                    url: window.location.href,
                });
            } else {
                copyToClipboard(window.location.href);
            }
        } catch (err) {
            console.error("Error al compartir:", err);
        }
    };

    const printReceipt = () => {
        window.print();
    };

    if (loading) return <FullScreenLoader />;
    if (!sale) return <div className="p-4 text-center">Venta no encontrada</div>;

    return (
        <div className="flex  px-4 flex-col min-h-screen ">
            <div className="print:hidden">
                <Header
                    title="Comprobante de Venta"
                    onBack={() => navigate(-1)}
                    hideAvatar
                />
            </div>
            <div className="max-w-4xl mx-auto w-full flex-1  print:px-0">

                <div
                    ref={receiptRef}
                    className="bg-white rounded-xl  mt-4 border-gray-100 print:shadow-none print:border-none print:mt-0"
                >
                    {/* Encabezado */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                                Venta #{sale.code}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {format(new Date(sale.createdAt), "PPPP 'a las' HH:mm", { locale: es })}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 print:hidden">
                            <Button variant="outline" size="sm" onClick={printReceipt} disabled={generatingPDF}>
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir
                            </Button>
                            <Button variant="outline" size="sm" onClick={shareSale} disabled={generatingPDF}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartir
                            </Button>
                            <Button variant="outline" size="sm" onClick={generatePDF} disabled={generatingPDF}>
                                <FileDown className="w-4 h-4 mr-2" />
                                {generatingPDF ? "Generando..." : "Descargar PDF"}
                            </Button>
                        </div>
                    </div>

                    {/* Sección de Información */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Información del Cliente</h3>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-gray-500">Nombre:</span>{" "}
                                    {sale.client.name}
                                </p>
                                <p>
                                    <span className="text-gray-500">Documento:</span>{" "}
                                    {sale.client.document}
                                </p>
                                <p>
                                    <span className="text-gray-500">Teléfono:</span>{" "}
                                    {sale.client.phone || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold">Información de la Venta</h3>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-gray-500">Chofer:</span>{" "}
                                    {sale.user.name}
                                </p>
                                <p>
                                    <span className="text-gray-500">Método de Pago:</span>{" "}
                                    {getPaymentMethodLabel(sale.paymentMethod)}
                                </p>
                                {/*  <p>
                                    <span className="text-gray-500">Estado de Pago:</span>{" "}
                                    <Badge
                                        variant={sale.debt > 0 ? "destructive" : "default"}
                                        className="capitalize"
                                    >
                                        {sale.debt > 0 ? `DEUDA ${formatCurrency(sale.debt)}` : "PAGADO"}
                                    </Badge>
                                </p> */}
                            </div>
                        </div>
                    </div>

                    {/* Lista de Productos */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-4">Detalle de Venta</h3>
                        <div className="space-y-4">
                            {sale.items.map((item, index) => (
                                <div key={index} className="border rounded-lg p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <p>
                                                    Precio Unitario:{" "}
                                                    {formatCurrency(
                                                        item.negotiatedPrice || item.product.basePrice
                                                    )}
                                                </p>
                                                {item.negotiatedCylinderPrice && (
                                                    <p>
                                                        Precio Cilindro:{" "}
                                                        {formatCurrency(item.negotiatedCylinderPrice)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="font-medium">
                                                {item.soldQuantity} unidades
                                            </p>
                                            {item.returnedQuantity > 0 && (
                                                <p className="text-sm text-red-600">
                                                    Devueltos: {item.returnedQuantity}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-500">
                                                Subtotal:{" "}
                                                {formatCurrency(
                                                    (item.negotiatedPrice || item.product.basePrice) *
                                                    item.soldQuantity -
                                                    (item.negotiatedCylinderPrice ||
                                                        item.product.emptyCylinderPrice) *
                                                    item.returnedQuantity
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xl font-semibold">
                                <span>Total:</span>
                                <span>{formatCurrency(sale.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page {
                            size: A4;
                            margin: 15mm;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #root, #root * {
                            visibility: visible;
                        }
                        .print\\:hidden {
                            display: none !important;
                        }
                    }
                `
            }} />
        </div>
    );
}
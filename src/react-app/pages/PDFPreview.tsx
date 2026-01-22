import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Printer, X, Download } from 'lucide-react';
import PricingRequestPDF from '@/react-app/components/PricingRequestPDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PricingRequest {
  id: number;
  request_number: string;
  supplier_name: string;
  due_date: string;
  responsible_person: string;
  responsible_phone: string;
  issue_date: string;
  items: Array<{
    line_item: string;
    part_number: string;
    description: string;
    unit: string;
    quantity: string;
  }>;
}

export default function PDFPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<PricingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/pricing-requests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRequest(data);
        }
      } catch (error) {
        console.error('Error fetching request:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pdfRef.current || !request) {
      alert('خطأ: المحتوى غير متاح للتحميل');
      return;
    }
    
    setGenerating(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: pdfRef.current.scrollWidth,
        windowHeight: pdfRef.current.scrollHeight
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Pricing_Request_${request.request_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl">لم يتم العثور على الطلب</p>
          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="print:hidden fixed top-0 left-0 right-0 z-[9999] bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">معاينة PDF</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span>{generating ? 'جاري الإنشاء...' : 'تحميل PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span>طباعة</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>إغلاق</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-0 pb-8" ref={pdfRef}>
        <PricingRequestPDF
          requestNumber={request.request_number}
          issueDate={request.issue_date}
          supplierName={request.supplier_name}
          dueDate={request.due_date}
          responsiblePerson={request.responsible_person}
          responsiblePhone={request.responsible_phone}
          lineItems={request.items.map(item => ({
            lineItem: item.line_item,
            partNumber: item.part_number,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity
          }))}
        />
      </div>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}

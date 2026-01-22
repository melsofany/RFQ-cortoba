import logo from '../assets/images/logo.png';

interface LineItem {
  lineItem: string;
  partNumber: string;
  description: string;
  unit: string;
  quantity: string;
}

interface PricingRequestPDFProps {
  requestNumber: string;
  issueDate: string;
  supplierName: string;
  dueDate: string;
  responsiblePerson: string;
  responsiblePhone: string;
  lineItems: LineItem[];
}

export default function PricingRequestPDF({
  requestNumber,
  issueDate,
  supplierName,
  dueDate,
  responsiblePerson,
  responsiblePhone,
  lineItems
}: PricingRequestPDFProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="pdf-content bg-white max-w-4xl mx-auto flex flex-col p-6" style={{ minHeight: 'auto', width: '100%', overflow: 'hidden' }}>
      <div className="w-full flex flex-col">
        {/* Blue Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-2 px-6 mb-2 rounded-t-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold tracking-wide mb-0 uppercase">CORTOBA SUPPLIES</h1>
              <p className="text-[10px] opacity-90 leading-tight">شركة قرطبة للتوريدات</p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="bg-white rounded p-1 h-14 w-14 flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] opacity-90 leading-tight">
            <p>Email: info@cortoba-supplies.com | Phone: 01009988569 | Address: Alam El-Roum St., Marsa Matrouh</p>
          </div>
        </div>

        {/* Title */}
        <div className="border border-blue-700 rounded mb-2 flex items-center justify-center py-1">
          <h2 className="text-sm font-bold text-blue-800">PRICING REQUEST</h2>
        </div>

        {/* Request Info - Single Row */}
        <div className="mb-2 bg-gray-50 p-2 rounded">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Request No:</span>
              <span className="text-gray-900">{requestNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Issue Date:</span>
              <span className="text-gray-900">{formatDate(issueDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Supplier:</span>
              <span className="text-gray-900">{supplierName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Expiry Date:</span>
              <span className="text-gray-900">{formatDate(dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-2">
          <table className="w-full text-[9px] border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <th className="px-1 py-0.5 text-center w-6">No.</th>
                <th className="px-1 py-0.5 text-center w-20">Part Number</th>
                <th className="px-1 py-0.5 text-left">Description</th>
                <th className="px-1 py-0.5 text-center w-14">Unit</th>
                <th className="px-1 py-0.5 text-center w-10">Qty</th>
                <th className="px-1 py-0.5 text-center w-16">Price</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-1 py-0.5 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center font-mono">{item.partNumber}</td>
                  <td className="border border-gray-300 px-1 py-0.5 leading-tight">{item.description}</td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center">{item.unit}</td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center bg-gray-50"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Responsible Person */}
        <div className="mb-4 bg-gray-50 p-2 rounded">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Responsible:</span>
              <span className="text-gray-900">{responsiblePerson}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Phone:</span>
              <span className="text-gray-900">{responsiblePhone}</span>
            </div>
          </div>
        </div>

        {/* Footer - Positioned directly after content */}
        <div className="pt-2 border-t border-gray-200 mt-2">
          <p className="text-center text-[10px] text-gray-500">
            © 2026 Cortoba Supplies Company - All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}

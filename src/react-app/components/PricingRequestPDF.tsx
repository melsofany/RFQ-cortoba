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
    <div className="pdf-content bg-white max-w-4xl mx-auto flex flex-col" style={{ minHeight: '297mm', paddingTop: '0' }}>
      {/* Blue Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-4 px-6 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold tracking-wide mb-1 uppercase">CORTOBA SUPPLIES</h1>
            <p className="text-xs opacity-90">شركة قرطبة للتوريدات</p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="bg-white rounded-lg p-1 h-20 w-20 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
        <div className="text-center text-xs opacity-90">
          <p>Email: info@cortoba-supplies.com | Phone: 01009988569 | Address: Alam El-Roum St., Marsa Matrouh</p>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col">
        {/* Title */}
        <div className="border-2 border-blue-700 rounded-lg mb-4 flex items-center justify-center py-2">
          <h2 className="text-lg font-bold text-blue-800">PRICING REQUEST</h2>
        </div>

        {/* Request Info - Single Row */}
        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
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
        <div className="mb-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <th className="px-2 py-1.5 text-center w-10">No.</th>
                <th className="px-2 py-1.5 text-center">Part Number</th>
                <th className="px-2 py-1.5 text-left">Description</th>
                <th className="px-2 py-1.5 text-center w-20">Unit</th>
                <th className="px-2 py-1.5 text-center w-16">Quantity</th>
                <th className="px-2 py-1.5 text-center w-24">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{item.partNumber}</td>
                  <td className="border border-gray-300 px-2 py-1.5">{item.description}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{item.unit}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center bg-gray-50"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Responsible Person */}
        <div className="mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Responsible Person:</span>
              <span className="text-gray-900">{responsiblePerson}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Phone:</span>
              <span className="text-gray-900">{responsiblePhone}</span>
            </div>
          </div>
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-300">
          <p className="text-center text-xs text-gray-600">
            © 2026 Cortoba Supplies Company - All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}

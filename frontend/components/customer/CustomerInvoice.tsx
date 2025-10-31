'use client';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
  tax_amount: string;
  total_amount: string;
  vendor?: {
    id: number;
    business_name: string;
    business_email?: string;
    business_phone?: string;
    business_address?: string;
    business_city?: string;
    business_state?: string;
    business_pincode?: string;
    gstin?: string;
    store?: {
      store_name: string;
      customer_support_email?: string;
      customer_support_phone?: string;
    };
  };
}

interface Order {
  id: number;
  order_number: string;
  invoice_number?: string;
  invoice_generated_at?: string;
  subtotal: string;
  tax_amount: string;
  shipping_charge: string;
  discount_amount: string;
  total_amount: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  billing_name: string;
  billing_phone: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_pincode: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

interface CustomerInvoiceProps {
  order: Order;
  onClose: () => void;
}

export default function CustomerInvoice({ order, onClose }: CustomerInvoiceProps) {
  // Get vendor from first order item
  const firstVendor = order.items?.[0]?.vendor;

  const generateInvoice = () => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .platform-header { text-align: right; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #E5E7EB; }
          .platform-header p { font-size: 10px; color: #6B7280; margin: 2px 0; }
          .platform-header .platform-name { font-size: 12px; font-weight: bold; color: #374151; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #DC2626; padding-bottom: 20px; }
          .vendor-info h1 { color: #DC2626; font-size: 28px; margin-bottom: 10px; }
          .vendor-info p { margin: 5px 0; font-size: 14px; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { font-size: 32px; color: #DC2626; margin-bottom: 10px; }
          .invoice-details p { margin: 5px 0; font-size: 14px; }
          .sold-by { background-color: #FEF3C7; border: 2px solid #F59E0B; border-radius: 8px; padding: 15px; margin-bottom: 30px; }
          .sold-by h3 { color: #92400E; font-size: 16px; margin-bottom: 8px; }
          .sold-by p { color: #78350F; font-size: 13px; margin: 3px 0; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .address-box { flex: 1; margin-right: 20px; }
          .address-box:last-child { margin-right: 0; }
          .address-box h3 { font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; }
          .address-box p { margin: 5px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #F3F4F6; padding: 12px; text-align: left; font-size: 13px; border-bottom: 2px solid #DC2626; }
          td { padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 300px; }
          .totals table { margin-bottom: 20px; }
          .totals td { padding: 8px; }
          .totals .grand-total { font-size: 18px; font-weight: bold; background-color: #FEE2E2; }
          .payment-info { background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .payment-info h3 { font-size: 16px; margin-bottom: 10px; }
          .payment-info p { margin: 5px 0; font-size: 14px; }
          .platform-footer { margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-top: 2px solid #E5E7EB; text-align: center; font-size: 11px; color: #6B7280; }
          .platform-footer h4 { font-size: 12px; color: #374151; margin-bottom: 8px; font-weight: bold; }
          .platform-footer p { margin: 3px 0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Platform Header -->
          <div class="platform-header">
            <p class="platform-name">Multi-Vendor E-commerce Platform</p>
            <p>www.multivendor.com | support@multivendor.com | +91 1234567890</p>
          </div>

          <!-- Header -->
          <div class="header">
            <div class="vendor-info">
              <h1>${firstVendor?.business_name || 'Multi-Vendor E-commerce'}</h1>
              <p><strong>GSTIN:</strong> ${firstVendor?.gstin || 'N/A'}</p>
              <p>${firstVendor?.business_address || ''}</p>
              <p>${firstVendor?.business_city || ''}, ${firstVendor?.business_state || ''} - ${firstVendor?.business_pincode || ''}</p>
              <p><strong>Email:</strong> ${firstVendor?.business_email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${firstVendor?.business_phone || 'N/A'}</p>
            </div>
            <div class="invoice-details">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> ${order.invoice_number || 'N/A'}</p>
              <p><strong>Order No:</strong> ${order.order_number}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <!-- Sold By Section -->
          ${firstVendor?.store?.store_name ? `
          <div class="sold-by">
            <h3>🏪 Sold By: ${firstVendor.store.store_name}</h3>
            <p><strong>Business Name:</strong> ${firstVendor.business_name}</p>
            <p><strong>GSTIN:</strong> ${firstVendor.gstin || 'N/A'}</p>
            <p><strong>Address:</strong> ${firstVendor.business_address}, ${firstVendor.business_city}, ${firstVendor.business_state} - ${firstVendor.business_pincode}</p>
            <p><strong>Support:</strong> ${firstVendor.store.customer_support_email || firstVendor.business_email} | ${firstVendor.store.customer_support_phone || firstVendor.business_phone}</p>
          </div>
          ` : ''}

          <!-- Addresses -->
          <div class="addresses">
            <div class="address-box">
              <h3>Bill To</h3>
              <p><strong>${order.billing_name}</strong></p>
              <p>${order.billing_address}</p>
              <p>${order.billing_city}, ${order.billing_state} - ${order.billing_pincode}</p>
              <p>Phone: ${order.billing_phone}</p>
              <p>Email: ${order.billing_email}</p>
            </div>
            <div class="address-box">
              <h3>Ship To</h3>
              <p><strong>${order.shipping_name}</strong></p>
              <p>${order.shipping_address}</p>
              <p>${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
              <p>Phone: ${order.shipping_phone}</p>
              <p>Email: ${order.shipping_email}</p>
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Tax</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">₹${parseFloat(item.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">₹${parseFloat(item.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">₹${parseFloat(order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Tax (GST):</td>
                <td class="text-right">₹${parseFloat(order.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td class="text-right">₹${parseFloat(order.shipping_charge).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              ${parseFloat(order.discount_amount) > 0 ? `
              <tr>
                <td>Discount:</td>
                <td class="text-right">-₹${parseFloat(order.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              ` : ''}
              <tr class="grand-total">
                <td><strong>Grand Total:</strong></td>
                <td class="text-right"><strong>₹${parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Payment Info -->
          <div class="payment-info">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
            <p><strong>Payment Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
          </div>

          <!-- Platform Footer -->
          <div class="platform-footer">
            <h4>Order placed on Multi-Vendor E-commerce Platform</h4>
            <p><strong>Platform GSTIN:</strong> 27AABCU9603R1ZM</p>
            <p>Website: www.multivendor.com | Support: support@multivendor.com | Phone: +91 1234567890</p>
            <p style="margin-top: 8px; font-size: 10px;">This invoice is generated by Multi-Vendor E-commerce Platform on behalf of the seller.</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const downloadInvoice = () => {
    const invoiceHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice - ${order.order_number}</title></head><body><h1>Invoice ${order.invoice_number}</h1><p>Download functionality - Full HTML would go here</p></body></html>`;
    
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.invoice_number || order.order_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
            <p className="text-sm text-gray-500 mt-1">
              {order.invoice_number || order.order_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  {firstVendor?.business_name || 'Multi-Vendor E-commerce'}
                </h3>
                <p className="text-sm text-red-700">
                  <strong>GSTIN:</strong> {firstVendor?.gstin || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-red-700 font-semibold">TAX INVOICE</div>
                <div className="text-xs text-red-600 mt-1">{order.invoice_number || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 font-medium mb-1">Order Number</div>
                <div className="text-gray-900">{order.order_number}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-1">Order Date</div>
                <div className="text-gray-900">{new Date(order.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="text-gray-500 font-medium mb-2">Total Amount</div>
              <div className="text-3xl font-bold text-gray-900">
                ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={generateInvoice}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Invoice
            </button>
            <button
              onClick={downloadInvoice}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


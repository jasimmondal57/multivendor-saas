'use client';

import { Order } from '@/lib/admin';

interface InvoiceGeneratorProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceGenerator({ order, onClose }: InvoiceGeneratorProps) {
  // Get first vendor from items (for multi-vendor orders, ideally generate separate invoices per vendor)
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
          .company-info h1 { color: #DC2626; font-size: 28px; margin-bottom: 5px; }
          .company-info p { font-size: 12px; color: #666; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { font-size: 24px; color: #DC2626; margin-bottom: 10px; }
          .invoice-info p { font-size: 12px; margin: 3px 0; }
          .sold-by { background-color: #FEF3C7; padding: 12px 15px; margin-bottom: 20px; border-left: 4px solid #F59E0B; border-radius: 4px; }
          .sold-by h3 { font-size: 13px; color: #92400E; margin-bottom: 5px; font-weight: bold; }
          .sold-by p { font-size: 11px; color: #78350F; margin: 2px 0; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .address-box { width: 48%; }
          .address-box h3 { font-size: 14px; color: #DC2626; margin-bottom: 10px; text-transform: uppercase; }
          .address-box p { font-size: 12px; margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          thead { background-color: #DC2626; color: white; }
          th { padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 300px; }
          .totals tr td { border: none; padding: 8px 12px; }
          .totals tr:last-child { background-color: #DC2626; color: white; font-weight: bold; font-size: 14px; }
          .platform-footer { margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-top: 2px solid #E5E7EB; text-align: center; font-size: 11px; color: #6B7280; }
          .platform-footer h4 { font-size: 12px; color: #374151; margin-bottom: 8px; font-weight: bold; }
          .platform-footer p { margin: 3px 0; }
          .footer { margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #999; }
          .notes { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 3px solid #DC2626; }
          .notes h4 { font-size: 12px; margin-bottom: 8px; color: #DC2626; }
          .notes p { font-size: 11px; color: #666; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
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
            <div class="company-info">
              <h1>${firstVendor?.business_name || 'Multi-Vendor E-commerce'}</h1>
              <p>${firstVendor?.business_address || '123 Business Street'}, ${firstVendor?.business_city || 'Mumbai'}, ${firstVendor?.business_state || 'Maharashtra'} ${firstVendor?.business_pincode || '400001'}</p>
              <p>Phone: ${firstVendor?.business_phone || '+91 1234567890'} | Email: ${firstVendor?.business_email || 'support@multivendor.com'}</p>
              <p><strong>GSTIN:</strong> ${firstVendor?.gstin || 'N/A'}</p>
            </div>
            <div class="invoice-info">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> ${order.invoice_number || 'INV-' + order.order_number}</p>
              <p><strong>Order No:</strong> ${order.order_number}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
              <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
            </div>
          </div>

          <!-- Sold By Section (Like Flipkart/Amazon) -->
          <div class="sold-by">
            <h3>🏪 Sold By: ${firstVendor?.store?.store_name || firstVendor?.business_name || 'N/A'}</h3>
            <p><strong>Business Name:</strong> ${firstVendor?.business_name || 'N/A'}</p>
            <p><strong>GSTIN:</strong> ${firstVendor?.gstin || 'N/A'}</p>
            <p><strong>Address:</strong> ${firstVendor?.business_address || 'N/A'}, ${firstVendor?.business_city || 'N/A'}, ${firstVendor?.business_state || 'N/A'} - ${firstVendor?.business_pincode || 'N/A'}</p>
            <p><strong>Contact:</strong> ${firstVendor?.store?.customer_support_phone || firstVendor?.business_phone || 'N/A'} | ${firstVendor?.store?.customer_support_email || firstVendor?.business_email || 'N/A'}</p>
          </div>

          <!-- Addresses -->
          <div class="addresses">
            <div class="address-box">
              <h3>Bill To:</h3>
              <p><strong>${order.customer?.name || 'N/A'}</strong></p>
              <p>${order.customer?.email || 'N/A'}</p>
              <p>${order.customer?.phone || 'N/A'}</p>
              <p>${order.billing_address || 'N/A'}</p>
            </div>
            <div class="address-box">
              <h3>Ship To:</h3>
              <p><strong>${order.customer?.name || 'N/A'}</strong></p>
              <p>${order.shipping_address || order.billing_address || 'N/A'}</p>
            </div>
          </div>

          <!-- Order Items -->
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.product_name || 'N/A'}</td>
                  <td>${item.product_sku || 'SKU-' + (item.product_id || 'N/A')}</td>
                  <td class="text-right">${item.quantity || 0}</td>
                  <td class="text-right">₹${(item.price || 0).toLocaleString('en-IN')}</td>
                  <td class="text-right">₹${((item.total_amount || item.total_price || (item.quantity || 0) * (item.price || 0))).toLocaleString('en-IN')}</td>
                </tr>
              `).join('') || '<tr><td colspan="5">No items</td></tr>'}
            </tbody>
          </table>

          <!-- Totals -->
          <table class="totals">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">₹${(order.subtotal || order.total_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Discount:</td>
              <td class="text-right">- ₹${(order.discount_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td class="text-right">₹${(order.shipping_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Tax (GST):</td>
              <td class="text-right">₹${(order.tax_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Total Amount:</td>
              <td class="text-right">₹${(order.total_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <!-- Notes -->
          <div class="notes">
            <h4>Payment Information:</h4>
            <p>Payment Method: ${order.payment_method || 'N/A'}</p>
            <p>Payment Status: ${order.payment_status || 'N/A'}</p>
            <p>Transaction ID: ${order.payment_transaction_id || 'N/A'}</p>
          </div>

          <div class="notes" style="margin-top: 15px;">
            <h4>Terms & Conditions:</h4>
            <p>1. Goods once sold will not be taken back or exchanged.</p>
            <p>2. All disputes are subject to Mumbai jurisdiction only.</p>
            <p>3. This is a computer-generated invoice and does not require a signature.</p>
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
            <p><strong>Thank you for your business!</strong></p>
            <p style="margin-top: 5px;">This is a system-generated invoice.</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
    }
  };

  const downloadInvoice = () => {
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
          .company-info h1 { color: #DC2626; font-size: 28px; margin-bottom: 5px; }
          .company-info p { font-size: 12px; color: #666; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { font-size: 24px; color: #DC2626; margin-bottom: 10px; }
          .invoice-info p { font-size: 12px; margin: 3px 0; }
          .sold-by { background-color: #FEF3C7; padding: 12px 15px; margin-bottom: 20px; border-left: 4px solid #F59E0B; border-radius: 4px; }
          .sold-by h3 { font-size: 13px; color: #92400E; margin-bottom: 5px; font-weight: bold; }
          .sold-by p { font-size: 11px; color: #78350F; margin: 2px 0; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .address-box { width: 48%; }
          .address-box h3 { font-size: 14px; color: #DC2626; margin-bottom: 10px; text-transform: uppercase; }
          .address-box p { font-size: 12px; margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          thead { background-color: #DC2626; color: white; }
          th { padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 300px; }
          .totals tr td { border: none; padding: 8px 12px; }
          .totals tr:last-child { background-color: #DC2626; color: white; font-weight: bold; font-size: 14px; }
          .platform-footer { margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-top: 2px solid #E5E7EB; text-align: center; font-size: 11px; color: #6B7280; }
          .platform-footer h4 { font-size: 12px; color: #374151; margin-bottom: 8px; font-weight: bold; }
          .platform-footer p { margin: 3px 0; }
          .footer { margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #999; }
          .notes { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 3px solid #DC2626; }
          .notes h4 { font-size: 12px; margin-bottom: 8px; color: #DC2626; }
          .notes p { font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Platform Header -->
          <div class="platform-header">
            <p class="platform-name">Multi-Vendor E-commerce Platform</p>
            <p>www.multivendor.com | support@multivendor.com | +91 1234567890</p>
          </div>

          <div class="header">
            <div class="company-info">
              <h1>${firstVendor?.business_name || 'Multi-Vendor E-commerce'}</h1>
              <p>${firstVendor?.business_address || '123 Business Street'}, ${firstVendor?.business_city || 'Mumbai'}, ${firstVendor?.business_state || 'Maharashtra'} ${firstVendor?.business_pincode || '400001'}</p>
              <p>Phone: ${firstVendor?.business_phone || '+91 1234567890'} | Email: ${firstVendor?.business_email || 'support@multivendor.com'}</p>
              <p><strong>GSTIN:</strong> ${firstVendor?.gstin || 'N/A'}</p>
            </div>
            <div class="invoice-info">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> ${order.invoice_number || 'INV-' + order.order_number}</p>
              <p><strong>Order No:</strong> ${order.order_number}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
              <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
            </div>
          </div>

          <!-- Sold By Section (Like Flipkart/Amazon) -->
          <div class="sold-by">
            <h3>🏪 Sold By: ${firstVendor?.store?.store_name || firstVendor?.business_name || 'N/A'}</h3>
            <p><strong>Business Name:</strong> ${firstVendor?.business_name || 'N/A'}</p>
            <p><strong>GSTIN:</strong> ${firstVendor?.gstin || 'N/A'}</p>
            <p><strong>Address:</strong> ${firstVendor?.business_address || 'N/A'}, ${firstVendor?.business_city || 'N/A'}, ${firstVendor?.business_state || 'N/A'} - ${firstVendor?.business_pincode || 'N/A'}</p>
            <p><strong>Contact:</strong> ${firstVendor?.store?.customer_support_phone || firstVendor?.business_phone || 'N/A'} | ${firstVendor?.store?.customer_support_email || firstVendor?.business_email || 'N/A'}</p>
          </div>

          <div class="addresses">
            <div class="address-box">
              <h3>Bill To:</h3>
              <p><strong>${order.customer?.name || 'N/A'}</strong></p>
              <p>${order.customer?.email || 'N/A'}</p>
              <p>${order.customer?.phone || 'N/A'}</p>
              <p>${order.billing_address || 'N/A'}</p>
            </div>
            <div class="address-box">
              <h3>Ship To:</h3>
              <p><strong>${order.customer?.name || 'N/A'}</strong></p>
              <p>${order.shipping_address || order.billing_address || 'N/A'}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.product_name || 'N/A'}</td>
                  <td>${item.product_sku || 'SKU-' + (item.product_id || 'N/A')}</td>
                  <td class="text-right">${item.quantity || 0}</td>
                  <td class="text-right">₹${(item.price || 0).toLocaleString('en-IN')}</td>
                  <td class="text-right">₹${((item.total_amount || item.total_price || (item.quantity || 0) * (item.price || 0))).toLocaleString('en-IN')}</td>
                </tr>
              `).join('') || '<tr><td colspan="5">No items</td></tr>'}
            </tbody>
          </table>
          <table class="totals">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">₹${(order.subtotal || order.total_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Discount:</td>
              <td class="text-right">- ₹${(order.discount_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td class="text-right">₹${(order.shipping_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Tax (GST):</td>
              <td class="text-right">₹${(order.tax_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Total Amount:</td>
              <td class="text-right">₹${(order.total_amount || 0).toLocaleString('en-IN')}</td>
            </tr>
          </table>
          <div class="notes">
            <h4>Payment Information:</h4>
            <p>Payment Method: ${order.payment_method || 'N/A'}</p>
            <p>Payment Status: ${order.payment_status || 'N/A'}</p>
            <p>Transaction ID: ${order.payment_transaction_id || 'N/A'}</p>
          </div>
          <div class="notes" style="margin-top: 15px;">
            <h4>Terms & Conditions:</h4>
            <p>1. Goods once sold will not be taken back or exchanged.</p>
            <p>2. All disputes are subject to Mumbai jurisdiction only.</p>
            <p>3. This is a computer-generated invoice and does not require a signature.</p>
          </div>

          <!-- Platform Footer -->
          <div class="platform-footer">
            <h4>Order placed on Multi-Vendor E-commerce Platform</h4>
            <p><strong>Platform GSTIN:</strong> 27AABCU9603R1ZM</p>
            <p>Website: www.multivendor.com | Support: support@multivendor.com | Phone: +91 1234567890</p>
            <p style="margin-top: 8px; font-size: 10px;">This invoice is generated by Multi-Vendor E-commerce Platform on behalf of the seller.</p>
          </div>

          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p style="margin-top: 5px;">This is a system-generated invoice.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order.order_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Generate Invoice</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Order Number:</p>
            <p className="font-bold text-gray-900">{order.order_number}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Customer:</p>
            <p className="font-bold text-gray-900">{order.customer?.name || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Total Amount:</p>
            <p className="font-bold text-gray-900 text-xl">₹{(order.total_amount || 0).toLocaleString('en-IN')}</p>
          </div>

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
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


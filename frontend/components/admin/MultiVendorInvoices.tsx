'use client';

import { useState } from 'react';
import { Order } from '@/lib/admin';

interface VendorGroup {
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
  items: NonNullable<Order['items']>;
  subtotal: number;
  tax: number;
  total: number;
}

interface MultiVendorInvoicesProps {
  order: Order;
  onClose: () => void;
}

export default function MultiVendorInvoices({ order, onClose }: MultiVendorInvoicesProps) {
  // Group items by vendor
  const vendorGroups: VendorGroup[] = [];
  const vendorMap = new Map<number, VendorGroup>();

  order.items?.forEach(item => {
    const vendorId = item.vendor?.id || 0;
    
    if (!vendorMap.has(vendorId)) {
      vendorMap.set(vendorId, {
        vendor: item.vendor,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      });
    }

    const group = vendorMap.get(vendorId)!;
    group.items.push(item);
    const itemPrice = parseFloat(item.price?.toString() || '0');
    const itemTotal = parseFloat(item.total_amount?.toString() || item.total_price?.toString() || '0');
    const itemSubtotal = itemPrice * item.quantity;
    const itemTax = itemTotal - itemSubtotal; // Calculate tax as difference

    group.subtotal += itemSubtotal;
    group.tax += itemTax;
    group.total += itemTotal;
  });

  vendorMap.forEach(group => vendorGroups.push(group));

  // Calculate shipping per vendor (split equally)
  const shippingPerVendor = parseFloat(order.shipping_amount?.toString() || '0') / vendorGroups.length;

  const generateVendorInvoice = (vendorGroup: VendorGroup, vendorIndex: number, action: 'print' | 'download') => {
    const invoiceNumber = vendorGroups.length > 1
      ? `${order.invoice_number || 'INV-' + order.order_number}-V${vendorIndex + 1}`
      : `${order.invoice_number || 'INV-' + order.order_number}`;
    const vendorTotal = vendorGroup.total + shippingPerVendor;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${invoiceNumber}</title>
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
          .multi-vendor-note { background-color: #EFF6FF; border: 1px solid #3B82F6; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
          .multi-vendor-note p { color: #1E40AF; font-size: 12px; margin: 3px 0; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Platform Header -->
          <div class="platform-header">
            <p class="platform-name">Multi-Vendor E-commerce Platform</p>
            <p>www.multivendor.com | support@multivendor.com | +91 1234567890</p>
          </div>

          <!-- Multi-Vendor Note (only show if multiple vendors) -->
          ${vendorGroups.length > 1 ? `
          <div class="multi-vendor-note">
            <p><strong>📦 Multi-Vendor Order:</strong> This is invoice ${vendorIndex + 1} of ${vendorGroups.length} for order ${order.order_number}</p>
            <p>This invoice contains items sold by <strong>${vendorGroup.vendor?.business_name || 'N/A'}</strong> only.</p>
          </div>
          ` : ''}

          <!-- Header -->
          <div class="header">
            <div class="vendor-info">
              <h1>${vendorGroup.vendor?.business_name || 'Multi-Vendor E-commerce'}</h1>
              <p><strong>GSTIN:</strong> ${vendorGroup.vendor?.gstin || 'N/A'}</p>
              <p>${vendorGroup.vendor?.business_address || ''}</p>
              <p>${vendorGroup.vendor?.business_city || ''}, ${vendorGroup.vendor?.business_state || ''} - ${vendorGroup.vendor?.business_pincode || ''}</p>
              <p><strong>Email:</strong> ${vendorGroup.vendor?.business_email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${vendorGroup.vendor?.business_phone || 'N/A'}</p>
            </div>
            <div class="invoice-details">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
              <p><strong>Order No:</strong> ${order.order_number}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <!-- Sold By Section -->
          ${vendorGroup.vendor?.store?.store_name ? `
          <div class="sold-by">
            <h3>🏪 Sold By: ${vendorGroup.vendor.store.store_name}</h3>
            <p><strong>Business Name:</strong> ${vendorGroup.vendor.business_name}</p>
            <p><strong>GSTIN:</strong> ${vendorGroup.vendor.gstin || 'N/A'}</p>
            <p><strong>Address:</strong> ${vendorGroup.vendor.business_address}, ${vendorGroup.vendor.business_city}, ${vendorGroup.vendor.business_state} - ${vendorGroup.vendor.business_pincode}</p>
            <p><strong>Support:</strong> ${vendorGroup.vendor.store.customer_support_email || vendorGroup.vendor.business_email} | ${vendorGroup.vendor.store.customer_support_phone || vendorGroup.vendor.business_phone}</p>
          </div>
          ` : ''}

          <!-- Addresses -->
          <div class="addresses">
            <div class="address-box">
              <h3>Bill To</h3>
              <p><strong>${order.customer?.name || 'N/A'}</strong></p>
              <p>${order.billing_address || 'N/A'}</p>
              <p>Phone: ${order.customer?.phone || 'N/A'}</p>
              <p>Email: ${order.customer?.email || 'N/A'}</p>
            </div>
            <div class="address-box">
              <h3>Ship To</h3>
              <p><strong>${order.customer?.name || 'N/A'}</strong></p>
              <p>${order.shipping_address || 'N/A'}</p>
              <p>Phone: ${order.customer?.phone || 'N/A'}</p>
              <p>Email: ${order.customer?.email || 'N/A'}</p>
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
              ${vendorGroup.items.map(item => {
                const itemPrice = parseFloat(item.price?.toString() || '0');
                const itemTotal = parseFloat(item.total_amount?.toString() || item.total_price?.toString() || '0');
                const itemSubtotal = itemPrice * item.quantity;
                const itemTax = itemTotal - itemSubtotal;
                return `
                <tr>
                  <td>${item.product_name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">₹${itemTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">₹${vendorGroup.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Tax (GST):</td>
                <td class="text-right">₹${vendorGroup.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td class="text-right">₹${shippingPerVendor.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr class="grand-total">
                <td><strong>Grand Total:</strong></td>
                <td class="text-right"><strong>₹${vendorTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Payment Info -->
          <div class="payment-info">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> ${order.payment_method?.toUpperCase() || 'N/A'}</p>
            <p><strong>Payment Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            ${vendorGroups.length > 1 ? `<p><strong>Note:</strong> Payment for entire order (₹${parseFloat(order.total_amount?.toString() || '0').toLocaleString('en-IN')}) was made together. This invoice shows only items from this vendor.</p>` : ''}
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

    if (action === 'print') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } else {
      // Download as HTML file
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Download Invoices</h2>
            <p className="text-sm text-gray-500 mt-1">
              Order #{order.order_number} - {vendorGroups.length} Vendor{vendorGroups.length > 1 ? 's' : ''}
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Multi-Vendor Order</h3>
                <p className="text-xs text-blue-700">
                  This order contains items from {vendorGroups.length} different vendor{vendorGroups.length > 1 ? 's' : ''}. 
                  Each vendor has a separate invoice for their items.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {vendorGroups.map((vendorGroup, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {vendorGroup.vendor?.business_name || 'Unknown Vendor'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      GSTIN: {vendorGroup.vendor?.gstin || 'N/A'}
                    </p>
                    {vendorGroup.vendor?.store?.store_name && (
                      <p className="text-sm text-gray-600 mt-1">
                        Store: {vendorGroup.vendor.store.store_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Invoice {index + 1} of {vendorGroups.length}</div>
                    <div className="text-sm font-mono text-gray-700">
                      {order.invoice_number || 'INV-' + order.order_number}-V{index + 1}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Items</div>
                      <div className="font-semibold text-gray-900">{vendorGroup.items.length} item{vendorGroup.items.length > 1 ? 's' : ''}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Total Amount</div>
                      <div className="font-semibold text-gray-900">
                        ₹{(vendorGroup.total + shippingPerVendor).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {vendorGroup.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.product_name} (x{item.quantity})</span>
                      <span className="font-medium text-gray-900">
                        ₹{parseFloat(item.total_amount?.toString() || item.total_price?.toString() || '0').toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => generateVendorInvoice(vendorGroup, index, 'print')}
                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={() => generateVendorInvoice(vendorGroup, index, 'download')}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


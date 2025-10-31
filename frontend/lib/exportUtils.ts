/**
 * Export Utilities for Admin Panel
 * Supports CSV, Excel, and PDF export formats
 */

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers
  const headers = columns
    ? columns.map(col => col.label)
    : Object.keys(data[0]);

  // Get keys
  const keys = columns
    ? columns.map(col => col.key)
    : Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      keys.map(key => {
        const value = getNestedValue(row, key);
        // Escape commas and quotes
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format (using CSV with .xlsx extension)
 * For true Excel format, you would need a library like xlsx
 */
export function exportToExcel(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // For now, we'll use CSV format with .xlsx extension
  // In production, use a library like 'xlsx' for true Excel format
  const headers = columns
    ? columns.map(col => col.label)
    : Object.keys(data[0]);

  const keys = columns
    ? columns.map(col => col.key)
    : Object.keys(data[0]);

  const csvContent = [
    headers.join('\t'),
    ...data.map(row =>
      keys.map(key => {
        const value = getNestedValue(row, key);
        return String(value ?? '');
      }).join('\t')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * Export data to PDF format
 * This is a simple implementation. For production, use a library like jsPDF
 */
export function exportToPDF(data: any[], filename: string, columns?: { key: string; label: string }[], title?: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create HTML table
  const headers = columns
    ? columns.map(col => col.label)
    : Object.keys(data[0]);

  const keys = columns
    ? columns.map(col => col.key)
    : Object.keys(data[0]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title || filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #DC2626;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #DC2626;
          color: white;
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title || filename}</h1>
      <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${keys.map(key => `<td>${getNestedValue(row, key) ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Multi-Vendor E-commerce Platform - Admin Panel</p>
        <p>Total Records: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Helper function to get nested object values
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Helper function to download blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Format data for export (remove unnecessary fields, format dates, etc.)
 */
export function formatDataForExport(data: any[], excludeFields: string[] = []): any[] {
  return data.map(item => {
    const formatted: any = {};
    Object.keys(item).forEach(key => {
      if (!excludeFields.includes(key)) {
        let value = item[key];
        
        // Format dates
        if (value instanceof Date) {
          value = value.toLocaleString('en-IN');
        } else if (typeof value === 'string' && isISODate(value)) {
          value = new Date(value).toLocaleString('en-IN');
        }
        
        // Format nested objects
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          value = JSON.stringify(value);
        }
        
        formatted[key] = value;
      }
    });
    return formatted;
  });
}

/**
 * Check if string is ISO date
 */
function isISODate(str: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  return isoDateRegex.test(str);
}

/**
 * Export orders to CSV
 */
export function exportOrders(orders: any[], format: 'csv' | 'excel' | 'pdf' = 'csv') {
  const columns = [
    { key: 'order_number', label: 'Order Number' },
    { key: 'customer.name', label: 'Customer Name' },
    { key: 'customer.email', label: 'Customer Email' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Order Date' },
  ];

  const filename = `orders_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV(orders, filename, columns);
  } else if (format === 'excel') {
    exportToExcel(orders, filename, columns);
  } else if (format === 'pdf') {
    exportToPDF(orders, filename, columns, 'Orders Report');
  }
}

/**
 * Export products to CSV
 */
export function exportProducts(products: any[], format: 'csv' | 'excel' | 'pdf' = 'csv') {
  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'price', label: 'Price' },
    { key: 'stock_quantity', label: 'Stock' },
    { key: 'vendor.business_name', label: 'Vendor' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created Date' },
  ];

  const filename = `products_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV(products, filename, columns);
  } else if (format === 'excel') {
    exportToExcel(products, filename, columns);
  } else if (format === 'pdf') {
    exportToPDF(products, filename, columns, 'Products Report');
  }
}

/**
 * Export customers to CSV
 */
export function exportCustomers(customers: any[], format: 'csv' | 'excel' | 'pdf' = 'csv') {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Joined Date' },
  ];

  const filename = `customers_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV(customers, filename, columns);
  } else if (format === 'excel') {
    exportToExcel(customers, filename, columns);
  } else if (format === 'pdf') {
    exportToPDF(customers, filename, columns, 'Customers Report');
  }
}

/**
 * Export vendors to CSV
 */
export function exportVendors(vendors: any[], format: 'csv' | 'excel' | 'pdf' = 'csv') {
  const columns = [
    { key: 'business_name', label: 'Business Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Joined Date' },
  ];

  const filename = `vendors_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV(vendors, filename, columns);
  } else if (format === 'excel') {
    exportToExcel(vendors, filename, columns);
  } else if (format === 'pdf') {
    exportToPDF(vendors, filename, columns, 'Vendors Report');
  }
}


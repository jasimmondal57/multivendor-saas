<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>TDS Certificate - {{ $certificate['certificate_number'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            padding: 20px;
        }
        
        .certificate-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #000;
        }
        
        .header h2 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #333;
        }
        
        .header p {
            font-size: 10px;
            color: #666;
        }
        
        .certificate-info {
            margin-bottom: 20px;
            background-color: #f5f5f5;
            padding: 10px;
            border: 1px solid #ddd;
        }
        
        .certificate-info table {
            width: 100%;
        }
        
        .certificate-info td {
            padding: 5px;
        }
        
        .certificate-info .label {
            font-weight: bold;
            width: 40%;
        }
        
        .section-title {
            background-color: #333;
            color: #fff;
            padding: 8px 10px;
            font-weight: bold;
            font-size: 12px;
            margin-top: 15px;
            margin-bottom: 10px;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .details-table th,
        .details-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .details-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .amount-box {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
        }
        
        .amount-box .label {
            font-size: 12px;
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
        }
        
        .amount-box .amount {
            font-size: 18px;
            font-weight: bold;
            color: #d32f2f;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }
        
        .signature-section {
            margin-top: 40px;
            display: table;
            width: 100%;
        }
        
        .signature-box {
            display: table-cell;
            width: 50%;
            padding: 10px;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
            text-align: center;
            font-weight: bold;
        }
        
        .notes {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 10px;
            margin-top: 20px;
            font-size: 9px;
        }
        
        .notes h4 {
            font-size: 10px;
            margin-bottom: 5px;
            color: #1976d2;
        }
        
        .notes ul {
            margin-left: 15px;
        }
        
        .notes li {
            margin-bottom: 3px;
        }
        
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0, 0, 0, 0.05);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="watermark">TDS CERTIFICATE</div>
    
    <div class="certificate-container">
        <!-- Header -->
        <div class="header">
            <h1>TAX DEDUCTED AT SOURCE CERTIFICATE</h1>
            <h2>Section 194-O of Income Tax Act, 1961</h2>
            <p>E-commerce Transactions</p>
        </div>
        
        <!-- Certificate Information -->
        <div class="certificate-info">
            <table>
                <tr>
                    <td class="label">Certificate Number:</td>
                    <td><strong>{{ $certificate['certificate_number'] }}</strong></td>
                    <td class="label">Financial Year:</td>
                    <td><strong>{{ $certificate['financial_year'] }}</strong></td>
                </tr>
                <tr>
                    <td class="label">Date of Issue:</td>
                    <td colspan="3"><strong>{{ \Carbon\Carbon::parse($certificate['generated_at'])->format('d-M-Y') }}</strong></td>
                </tr>
            </table>
        </div>
        
        <!-- Deductor Details -->
        <div class="section-title">PART A - DEDUCTOR DETAILS (E-commerce Operator)</div>
        <table class="details-table">
            <tr>
                <th width="30%">Name</th>
                <td>{{ $certificate['deductor']['name'] }}</td>
            </tr>
            <tr>
                <th>TAN (Tax Deduction Account Number)</th>
                <td>{{ $certificate['deductor']['tan'] }}</td>
            </tr>
            <tr>
                <th>PAN (Permanent Account Number)</th>
                <td>{{ $certificate['deductor']['pan'] }}</td>
            </tr>
            <tr>
                <th>Address</th>
                <td>{{ $certificate['deductor']['address'] ?: 'Not Available' }}</td>
            </tr>
        </table>
        
        <!-- Deductee Details -->
        <div class="section-title">PART B - DEDUCTEE DETAILS (E-commerce Participant/Vendor)</div>
        <table class="details-table">
            <tr>
                <th width="30%">Name</th>
                <td>{{ $certificate['deductee']['name'] }}</td>
            </tr>
            <tr>
                <th>PAN (Permanent Account Number)</th>
                <td>{{ $certificate['deductee']['pan'] ?: 'Not Available' }}</td>
            </tr>
            <tr>
                <th>Address</th>
                <td>{{ $certificate['deductee']['address'] ?: 'Not Available' }}</td>
            </tr>
        </table>
        
        <!-- TDS Details -->
        <div class="section-title">PART C - TAX DEDUCTION DETAILS</div>
        <table class="details-table">
            <tr>
                <th width="30%">Section of Income Tax Act</th>
                <td><strong>{{ $certificate['tds_details']['section'] }}</strong></td>
            </tr>
            <tr>
                <th>Period of Transaction</th>
                <td>
                    {{ \Carbon\Carbon::parse($certificate['tds_details']['period_start'])->format('d-M-Y') }} 
                    to 
                    {{ \Carbon\Carbon::parse($certificate['tds_details']['period_end'])->format('d-M-Y') }}
                </td>
            </tr>
            <tr>
                <th>Date of Deduction</th>
                <td>{{ \Carbon\Carbon::parse($certificate['tds_details']['deduction_date'])->format('d-M-Y') }}</td>
            </tr>
        </table>
        
        <!-- Amount Details -->
        <table class="details-table">
            <tr>
                <th width="50%">Gross Amount of Sale/Transaction</th>
                <td style="text-align: right;"><strong>₹ {{ number_format($certificate['tds_details']['gross_amount'], 2) }}</strong></td>
            </tr>
            <tr>
                <th>Rate of TDS</th>
                <td style="text-align: right;"><strong>{{ $certificate['tds_details']['tds_rate'] }}%</strong></td>
            </tr>
            <tr style="background-color: #ffebee;">
                <th>Tax Deducted at Source (TDS)</th>
                <td style="text-align: right; color: #d32f2f;"><strong>₹ {{ number_format($certificate['tds_details']['tds_amount'], 2) }}</strong></td>
            </tr>
            <tr>
                <th>Net Amount Paid to Vendor</th>
                <td style="text-align: right;"><strong>₹ {{ number_format($certificate['tds_details']['net_amount'], 2) }}</strong></td>
            </tr>
        </table>
        
        <!-- Highlighted TDS Amount -->
        <div class="amount-box">
            <div class="label">TOTAL TAX DEDUCTED AT SOURCE</div>
            <div class="amount">₹ {{ number_format($certificate['tds_details']['tds_amount'], 2) }}</div>
        </div>
        
        <!-- Important Notes -->
        <div class="notes">
            <h4>IMPORTANT NOTES:</h4>
            <ul>
                <li>This certificate is issued as per Section 194-O of the Income Tax Act, 1961.</li>
                <li>The TDS amount mentioned above has been deducted and will be deposited to the Government of India.</li>
                <li>This certificate can be used for claiming credit of TDS while filing Income Tax Return.</li>
                <li>Please verify the details mentioned in this certificate with Form 26AS available on the Income Tax e-filing portal.</li>
                <li>For any discrepancies, please contact the deductor immediately.</li>
                <li>This is a computer-generated certificate and does not require a physical signature.</li>
            </ul>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p style="text-align: center; font-size: 9px; color: #666;">
                This is a system-generated certificate issued by {{ $certificate['deductor']['name'] }}<br>
                Generated on {{ \Carbon\Carbon::parse($certificate['generated_at'])->format('d-M-Y h:i A') }}
            </p>
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line">
                    Authorized Signatory<br>
                    {{ $certificate['deductor']['name'] }}
                </div>
            </div>
            <div class="signature-box">
                <div class="signature-line">
                    Date: {{ \Carbon\Carbon::parse($certificate['generated_at'])->format('d-M-Y') }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>


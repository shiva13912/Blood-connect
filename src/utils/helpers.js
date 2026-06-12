/**
 * Formats a date string to a friendly human-readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Exports an array of donor objects to a CSV file (Excel compatible)
 */
export const exportToCSV = (donors, filename = 'bloodconnect_donors.csv') => {
  if (!donors || donors.length === 0) return;

  const headers = [
    'Name',
    'Age',
    'Gender',
    'Blood Group',
    'City',
    'Phone',
    'Email',
    'Eligibility',
    'Last Donation Date',
    'Total Donations',
    'Availability'
  ];

  const rows = donors.map((donor) => [
    `"${donor.name.replace(/"/g, '""')}"`,
    donor.age,
    donor.gender,
    donor.bloodGroup,
    `"${donor.city.replace(/"/g, '""')}"`,
    `"${donor.phone || ''}"`,
    `"${donor.email || ''}"`,
    donor.eligibility ? 'Eligible' : 'Ineligible',
    donor.lastDonationDate || 'Never',
    donor.totalDonations || 0,
    donor.availability ? 'Available' : 'Unavailable'
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Triggers a browser print dialog with a beautifully formatted donor report (saves as PDF)
 */
export const exportToPDF = (donors) => {
  if (!donors || donors.length === 0) return;

  const printWindow = window.open('', '_blank');
  
  const donorRows = donors
    .map(
      (d) => `
    <tr>
      <td>${d.name}</td>
      <td>${d.age}</td>
      <td>${d.gender}</td>
      <td class="blood-badge">${d.bloodGroup}</td>
      <td>${d.city}</td>
      <td>${d.phone || 'N/A'}</td>
      <td>${d.eligibility ? 'Eligible' : 'Ineligible'}</td>
      <td>${formatDate(d.lastDonationDate)}</td>
      <td>${d.totalDonations || 0}</td>
      <td>${d.availability ? 'Yes' : 'No'}</td>
    </tr>
  `
    )
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>BloodConnect AI - Donor Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #334155;
            padding: 40px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563EB;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            color: #2563EB;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
          }
          .meta {
            font-size: 14px;
            color: #64748B;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #F8FAFC;
            color: #1E293B;
            text-align: left;
            padding: 12px;
            font-weight: 600;
            border-bottom: 2px solid #E2E8F0;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 14px;
          }
          .blood-badge {
            font-weight: bold;
            color: #EF4444;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 20px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">BloodConnect AI</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748B;">Intelligent Blood Donor Management Platform</p>
          </div>
          <div class="meta">
            <p><strong>Report:</strong> Active Donors Listing</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Records:</strong> ${donors.length}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood</th>
              <th>City</th>
              <th>Contact</th>
              <th>Eligibility</th>
              <th>Last Donation</th>
              <th>Donations</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            ${donorRows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by BloodConnect AI Emergency Management System. &copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

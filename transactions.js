function fetchDetails() {
  const usc = document.getElementById("usc_number_input").value;

  if (!usc) {
    alert("Please enter a valid USC or Service Number.");
    return;
  }

  fetch(`http://localhost:3000/transactions/${usc}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const resultContainer = document.getElementById("result-container");
      resultContainer.innerHTML = ''; // Clear previous results

      if (data.error) {
        resultContainer.innerHTML = `<p style="color:red;">${data.error}</p>`;
        document.getElementById("print-button-container").style.display = "none";
        return;
      }

      // Create a table for the results
      let table = `<table>
        <tr>
          <th>Reference Number</th>
          <th>USC Number</th>
          <th>Service No</th>
          <th>Year</th>
          <th>Month</th>
          <th>Units</th>
          <th>Bill Amount</th>
        </tr>`;

      data.forEach(entry => {
        table += `
          <tr>
            <td>${entry.Reference_Number}</td>
            <td>${entry.Usc_Number}</td>
            <td>${entry.Service_No}</td>
            <td>${entry.Year}</td>
            <td>${entry.Month}</td>
            <td>${entry.Units}</td>
            <td>₹${entry.Bill_Amount}</td>
          </tr>`;
      });

      table += `</table>`;
      resultContainer.innerHTML = table;

      // Show print button
      document.getElementById("print-button-container").style.display = "block";
    })
    .catch(err => {
      document.getElementById("result-container").innerHTML =
        `<p style="color:red;">Error fetching data: ${err.message}</p>`;
      document.getElementById("print-button-container").style.display = "none";
      console.error("Fetch error:", err);
    });
}

function printTransactionDetails() {
  const content = document.getElementById("result-container").innerHTML;
  if (!content.trim()) {
    alert("No transaction details to print.");
    return;
  }

  const usc = document.getElementById("usc_number_input").value.trim();
  const now = new Date();

  // Format date and time as YYYY-MM-DD_HH-MM-SS
  const formattedDateTime = now.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
  const filename = `USC_${usc}_${formattedDateTime}`;

  const printWindow = window.open('', '', 'width=1000,height=700');

  const printContent = `
    <html>
    <head>
      <title>${filename}</title> <!-- This sets the PDF file name -->
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        h1 { margin-bottom: 5px; }
        h2 { margin-top: 0; font-weight: normal; font-size: 18px; color: #555; }
        p { font-size: 14px; color: #666; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h1>CENTRAL POWER DISTRIBUTION COMPANY LIMITED</h1>
      <h2>CONSUMER TRANSACTION DETAILS</h2>
      <p>Date & Time: ${now.toLocaleString()}</p>
      ${content}
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();  // User will "Save as PDF" and get filename from <title>
  printWindow.close();
}

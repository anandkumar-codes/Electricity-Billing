function fetchDetails() {
    const usc = document.getElementById('usc_number_input').value.trim();

    if (!usc) {
      alert('Please enter a valid USC Number or Service Number');
      return;
    }

    fetch(`http://localhost:3000/consumer/details/${usc}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          document.getElementById('consumer-details-table').innerHTML = `<p style="color:red;">${data.error}</p>`;
          alert(data.error);
        } else {
          const tableHTML = `
            <table border="1" cellpadding="5">
              <tr>
                <th>USC Number</th>
                <th>Consumer Name</th>
                <th>Category</th>
                <th>Contracted Load</th>
                <th>Connection Type</th>
                <th>Meter Number</th>
                <th>Service Number</th>
              </tr>
              <tr>
                <td>${data.Usc_Number}</td>
                <td>${data.Consumer_Name}</td>
                <td>${data.Category}</td>
                <td>${data.Contracted_Load}</td>
                <td>${data.Connection_Type}</td>
                <td>${data.Meter_No}</td>
                <td>${data.Service_No}</td>
              </tr>
            </table>
          `;
          document.getElementById('consumer-details-table').innerHTML = tableHTML;
          document.querySelector('.bill-details').classList.remove('hidden');
          document.querySelector('.btn-generate').classList.remove('hidden');
          document.querySelector('.reference').classList.remove('hidden');
          document.getElementById('usc_number_input').readOnly = true;
          document.getElementById('usc_number_input').style.backgroundColor="white";
        }
      })
      .catch(err => {
        console.error(err);
        document.getElementById('consumer-details-table').innerHTML = `<p style="color:red;">Error fetching details</p>`;
      });
  }


window.addEventListener('DOMContentLoaded', () => {
  // Set current year
  document.getElementById('year').value = new Date().getFullYear();

  const unitsInput = document.getElementById('units');
  const chargesInput = document.getElementById('charges');
  const billAmountInput = document.getElementById('billamount');

  unitsInput.addEventListener('input', () => {
    const units = parseFloat(unitsInput.value);

    if (isNaN(units) || units < 0) {
      chargesInput.value = '';
      billAmountInput.value = '';
      return;
    }

    let chargePerUnit = 0;

    if (units < 50) {
      chargePerUnit = 3;
    } else if (units <= 100) {
      chargePerUnit = 5;
    } else if (units <= 200) {
      chargePerUnit = 7;
    } else {
      chargePerUnit = 9;
    }

    chargesInput.value = chargePerUnit;
    billAmountInput.value = (units * chargePerUnit).toFixed(2);
  });

  // Month days logic (as discussed earlier)
  const monthSelect = document.getElementById('month');
  const yearInput = document.getElementById('year');
  const totalDaysInput = document.getElementById('total_days');

  monthSelect.addEventListener('change', () => {
    const selectedMonth = monthSelect.value;
    const year = parseInt(yearInput.value) || new Date().getFullYear();

    const monthDays = {
      January: 31,
      February: isLeapYear(year) ? 29 : 28,
      March: 31,
      April: 30,
      May: 31,
      June: 30,
      July: 31,
      August: 31,
      September: 30,
      October: 31,
      November: 30,
      December: 31
    };

    totalDaysInput.value = selectedMonth ? monthDays[selectedMonth] : '';
  });

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
  
  // Generate REF + 6-digit unique number
  function generateReferenceNo() {
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    const refNo = 'REF' + randomSixDigits;
    document.getElementById("reference").value = refNo;
  }

  generateReferenceNo()
});


document.querySelector(".btn-generate").addEventListener("click", () => {
  const refNo = document.getElementById("reference").value;
  const usc = document.getElementById("usc_number_input").value;
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;
  const units = document.getElementById("units").value;
  const billamount = document.getElementById("billamount").value;

  // ✅ Validate month selection
  if (month === "-- Select Month --") {
    alert("Please select a valid month.");
    return; // Stop execution
  }

  
  // ✅ Check if bill amount is empty or invalid
  if (!billamount || isNaN(billamount)) {
    alert("Please generate the bill before submitting.");
    return; // Stop further execution
  }

  // To get service number from the table (already fetched)
  const serviceNo = document.querySelector("#consumer-details-table table tr:nth-child(2) td:last-child").textContent;

  const billData = {
    reference_number: refNo,
    usc_number: usc,
    service_no: serviceNo,
    year: parseInt(year),
    month: month,
    units: parseInt(units),
    billamount: parseFloat(billamount)
  };

  fetch("http://localhost:3000/bill", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(billData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || "Bill saved successfully");
    if (!data.message.includes("already")) {
      generateBillPDF(billData); // ✅ Generate PDF only if not duplicate
      setTimeout(() => {
        window.location.reload(); // ✅ Refresh after short delay
      }, 1500); // Wait 1.5 seconds to allow PDF to download
    }
  })
  .catch(err => {
    console.error("Error saving bill:", err);
    alert("Failed to save bill");
  });
});



async function generateBillPDF(billData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  // Header: date left, time right
  doc.setFontSize(10);
  doc.text(`Date: ${dateStr}`, 15, 10); // Left corner
  doc.text(`Time: ${timeStr}`, 160, 10); // Right corner

  // Centered Company Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CENTRAL POWER DISTRIBUTION COMPANY LIMITED", 105, 20, null, null, "center");

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Electricity Consumer Bill", 105, 28, null, null, "center");

  // Table content
  const rows = [
    ["Reference Number", billData.reference_number],
    ["USC Number", billData.usc_number],
    ["Service Number", billData.service_no],
    ["Billing Year", billData.year.toString()],
    ["Billing Month", billData.month],
    ["Units Consumed", billData.units.toString()],
    ["Bill Amount", `${billData.billamount.toFixed(2)}`]
  ];

  // Generate table using AutoTable
  doc.autoTable({
    startY: 40,
    head: [["Field", "Value"]],
    body: rows,
    styles: {
      halign: "left",
      valign: "middle",
      fontSize: 11
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: 15, right: 15 }
  });

  // Save file
  doc.save(`${billData.reference_number}_Bill.pdf`);
}



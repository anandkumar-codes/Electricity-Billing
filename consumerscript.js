window.addEventListener("DOMContentLoaded", () => {
  // Generate random 8-digit number for USC
  document.getElementById("usc_number").value = generateRandomNumber(8);

  // Generate random 10-digit number for Meter Number
  document.getElementById("meter_no").value = generateRandomNumber(10);

  // Generate random 10-digit number for Service Number
  document.getElementById("service_no").value = generateRandomNumber(10);
});

// Helper function to generate a number with specified digits
function generateRandomNumber(length) {
  const min = Math.pow(10, length - 1); // e.g., 10000000
  const max = Math.pow(10, length) - 1; // e.g., 99999999
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    usc_number: document.getElementById("usc_number").value,
    consumer_name: document.getElementById("consumer_name").value,
    consumer_mobile: document.getElementById("consumer_mobile").value,
    id_type: document.getElementById("id_type").value,
    id_no: document.getElementById("id_no").value,
    house_no: document.getElementById("house_no").value,
    ero: document.getElementById("ero").value,
    district: document.getElementById("district").value,
    state: document.getElementById("state").value,
    pin: document.getElementById("pin").value,
    date_time: document.getElementById("date_time").value,
    category: document.getElementById("category").value,
    contracted_load: document.getElementById("contracted_load").value,
    connection_type: document.getElementById("connection_type").value,
    meter_no: document.getElementById("meter_no").value,
    service_no: document.getElementById("service_no").value
  };

  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    document.getElementById("userForm").reset();
  })
  .catch(err => {
    console.error("Error:", err);
    alert("Registration failed.");
  });
});

 

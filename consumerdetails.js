function fetchDetails() {
  const usc = document.getElementById("usc_number_input").value;


  fetch(`http://localhost:3000/consumer/${usc}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        // Populate fields
        document.getElementById("consumer_name").value = data.Consumer_Name;
        document.getElementById("consumer_mobile").value = data.Consumer_Mobile;
        document.getElementById("id_type").value = data.ID_Type;
        document.getElementById("id_no").value = data.ID_No;
        document.getElementById("house_no").value = data.House_No;
        document.getElementById("ero").value = data.ERO;
        document.getElementById("district").value = data.District;
        document.getElementById("state").value = data.State;
        document.getElementById("pin").value = data.PIN;
        document.getElementById("date_time").value = data.Date_Time?.split("T")[0]; // ISO date fix
        document.getElementById("category").value = data.Category;
        document.getElementById("contracted_load").value = data.Contracted_Load;
        document.getElementById("connection_type").value = data.Connection_Type;
        document.getElementById("meter_no").value = data.Meter_No;
        document.getElementById("service_no").value = data.Service_No;

        document.getElementById("result").style.display = "block";
        document.getElementById("usc_number_input").disabled = true;
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Failed to fetch details.");
    });
}

// UPDATE consumer
document.getElementById("updateForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const usc = document.getElementById("usc_number_input").value;

  const updatedData = {
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

  fetch(`http://localhost:3000/consumer/${usc}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);

      // ✅ Refresh the page
      location.reload();
    })
    .catch(err => {
      console.error("Update failed:", err);
      alert("Update failed.");
    });
});


// DELETE consumer
function deleteConsumer() {
  const usc = document.getElementById("usc_number_input").value.trim();

  if (!usc) {
    alert("Please enter a valid USC number to delete.");
    return;
  }

  if (!confirm("Are you sure you want to delete this consumer? This action cannot be undone.")) {
    return;
  }

  fetch(`http://localhost:3000/consumer/${usc}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);

      // Clear all fields if deletion is successful
      if (data.message.includes("success")) {
        document.getElementById("updateForm").reset();
      }
    })
    .catch(err => {
      console.error("Delete failed:", err);
      alert("An error occurred while deleting the consumer.");
    });
}


const username = "";
const password = "";

const url = "http://localhost:4000/register";

const data = {
  username: username,
  password: password,
};

fetch(url, {
  method: "POST", // Specify the method
  headers: {
    "Content-Type": "application/json", // Specify the content type
  },
  body: JSON.stringify(data), // Convert the JavaScript object to a JSON string
})
  .then((response) => {
    if (!response.ok) {
      // Handle the error
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json(); // Parse the JSON in the response
  })
  .then((data) => {
    console.log("Success:", data); // Handle the success
  })
  .catch((error) => {
    console.error("Error:", error); // Handle the error
  });

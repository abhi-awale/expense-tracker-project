//   function flipCard() {
//     document.getElementById("card").classList.toggle("flipped");
//   }
document.addEventListener("mousemove", (e) => {
    const blobs = document.querySelectorAll(".blob");

    const x = (window.innerWidth / 2 - e.clientX) / 20;
    const y = (window.innerHeight / 2 - e.clientY) / 20;

    blobs.forEach(blob => {
        const depth = blob.getAttribute("data-depth");

        const moveX = x * (depth / 50);
        const moveY = y * (depth / 50);

        blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// select form elements
const form = document.querySelector("form");

const inputs = {
  firstName: form.querySelector('#fname'),
  lastName: form.querySelector('#lname'),
  email: form.querySelector('#email'),
  password: form.querySelector('#password'),
  confirmPassword: form.querySelector('#confirm_password'),
};

// create error element
function showError(input, message) {
  let error = input.nextElementSibling;

  if (!error || !error.classList.contains("error-text")) {
    error = document.createElement("div");
    error.className = "error-text";
    input.parentNode.insertBefore(error, input.nextSibling);
  }

  error.innerText = message;
  input.style.borderColor = "#ef4444";
}

function clearError(input) {
  let error = input.nextElementSibling;
  if (error && error.classList.contains("error-text")) {
    error.remove();
  }
  input.style.borderColor = "";
}

// validation functions
function validate() {
  let isValid = true;

  // First Name
  if (!inputs.firstName.value.trim()) {
    showError(inputs.firstName, "First name is required");
    isValid = false;
  } else {
    clearError(inputs.firstName);
  }

  // Last Name
  if (!inputs.lastName.value.trim()) {
    showError(inputs.lastName, "Last name is required");
    isValid = false;
  } else {
    clearError(inputs.lastName);
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inputs.email.value)) {
    showError(inputs.email, "Enter a valid email");
    isValid = false;
  } else {
    clearError(inputs.email);
  }

  // Password
  if (inputs.password.value.length < 6) {
    showError(inputs.password, "Minimum 6 characters required");
    isValid = false;
  } else {
    clearError(inputs.password);
  }

  // Confirm Password
  if (inputs.password.value !== inputs.confirmPassword.value) {
    showError(inputs.confirmPassword, "Passwords do not match");
    isValid = false;
  } else {
    clearError(inputs.confirmPassword);
  }

  return isValid;
}

// popup helper
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type}`;
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);
}

// submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validate()) return;

  const payload = {
    firstName: inputs.firstName.value.trim(),
    lastName: inputs.lastName.value.trim(),
    email: inputs.email.value.trim(),
    password: inputs.password.value,
  };

  try {
    const res = await axios.post("/api/auth/register", payload);

    showPopup("Registration successful 🎉");

    // redirect after success
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);

  } catch (err) {
    const message =
      err.response?.data?.message || "Something went wrong";

    showPopup(message, "error");
  }
});
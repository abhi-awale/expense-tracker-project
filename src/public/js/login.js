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

const form = document.querySelector("form");

const inputs = {
  email: form.querySelector('#email'),
  password: form.querySelector('#password'),
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validate()) return;

  const payload = {
    email: inputs.email.value.trim(),
    password: inputs.password.value,
  };

  try {
    const res = await axios.post("/api/auth/login", payload, {
      withCredentials: true // 🔥 MUST for cookies
    });

    console.log("Login response:", res.data);

    // 🔍 Check cookies in browser devtools (not here)
    console.log("Cookies (if not httpOnly):", document.cookie);

    showPopup("Login successful 🎉");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);

  } catch (err) {
    const message =
      err.response?.data?.message || "Something went wrong";

    showPopup(message, "error");
  }
});
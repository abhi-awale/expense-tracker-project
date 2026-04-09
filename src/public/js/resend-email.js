const resend = document.getElementById("resend-link");
const userId = resend.dataset.userId;

resend.addEventListener("click", async () => {
  if (resend.classList.contains("disabled")) return;

  resend.classList.add("disabled");
  const originalText = resend.textContent;
  resend.textContent = "Resending...";

  try {
    const res = await axios.get(`/api/auth/${userId}/resend-verification`);

    // success response handling
    if (res.status === 200) {
      resend.textContent = "Email Sent.";
    }

  } catch (err) {
    console.error(err);

    resend.textContent =
      err.response?.data?.message || "Failed. Try again";
  }

  // cooldown (30 sec)
  setTimeout(() => {
    resend.classList.remove("disabled");
    resend.textContent = originalText;
  }, 30000);
});
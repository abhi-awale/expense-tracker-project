const express = require('express');

const router = express.Router();

router.get('/dashboard', (req, res) => {
  const token = req.cookies.accessToken;

  console.log("Token received:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.json({
    message: "Authenticated",
    token
  });
});

module.exports = router;
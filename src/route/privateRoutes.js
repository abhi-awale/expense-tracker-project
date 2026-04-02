const express = require('express');

const router = express.Router();

router.get('dashbord', (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

module.exports = router;
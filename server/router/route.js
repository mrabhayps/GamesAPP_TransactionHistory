const express = require('express');
const transaction = require("./transactionR");

//Initilizing router.
const router = express.Router();

router.use("/transaction", transaction);
module.exports = router;
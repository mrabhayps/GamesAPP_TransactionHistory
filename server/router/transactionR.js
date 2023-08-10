const express = require("express");
const transactionCtrl = require("../controller/transactionCtrl");
const router = express.Router();

router.get("/history", transactionCtrl.getUserTxnHistory);

module.exports=router;
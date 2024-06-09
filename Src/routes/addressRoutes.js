const express = require("express");
const router = new express.Router();
const {createAddress} = require("../controller/addressCtrl");
const {authentication} = require("../middleware/tokenVerify");

//Create Address
router.post("/create", authentication, createAddress);

module.exports = router;
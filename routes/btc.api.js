const express = require("express");
const router = express.Router();
const btcSvc = require("../services/btc-address.service");
const apiHelp = require("../services/apihelper.service");

router.get("/api/btc", apiHelp.bootlegMiddleware, async(req, res, next) => {
  const result = await btcSvc.getAddress();

  res.status(result.code).json(result.data);
});

module.exports = router;

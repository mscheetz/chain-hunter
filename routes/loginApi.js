const express = require("express");
const router = express.Router();
const manager = require("../services/chainhunter-manager");
const encryptionSvc = require("../services/encryption.js");
const config = require("../config");
const dataSvc = require("../services/dataIntegrationService");
const apiHelp = require("../services/apiHelper");

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/api/login", asyncMiddleware(async (req, res, next) => {
  const headerMsg = apiHelp.headerCheck(req);
  if (!headerMsg.status) {
    apiHelp.errorResponse(res);
  } else {
    const username = req.body.username, 
          password = req.body.password;
  }
}));

router.get("/api/logout", asyncMiddleware(async (req, res, next) => {}));

module.exports = router;

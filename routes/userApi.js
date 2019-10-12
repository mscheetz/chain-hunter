const express = require("express");
const router = express.Router();
const manager = require("../services/chainhunter-manager");
const encryptionSvc = require("../services/encryption.js");
const config = require("../config");
const dataSvc = require("../services/dataIntegrationService");
const apiHelp = require("../services/apiHelper");

router.post(
  "/api/user/register",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const data = req.body.data;
    }
  })
);

router.get(
  "/api/user/hash",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const results = await dataSvc.getResultsByCountry();

      res.status(200).json(results);
    }
  })
);

module.exports = router;

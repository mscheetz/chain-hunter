const express = require("express");
const router = express.Router();
const dataSvc = require("../data/dataIntegration.service");
const apiHelp = require("../services/apihelper.service");

router.get(
  "/api/results/country",
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

router.get(
  "/api/results/country/:country/region",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const country = req.params.country;
      const results = await dataSvc.getResultsByRegion(country);

      res.status(200).json(results);
    }
  })
);

router.get(
  "/api/results/country/:country/region/:region/city",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const country = req.params.country;
      const region = req.params.region;
      const results = await dataSvc.getResultsByCity(country, region);

      res.status(200).json(results);
    }
  })
);

router.get(
  "/api/results/region",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const results = await dataSvc.getResultsByRegion();

      res.status(200).json(results);
    }
  })
);

router.get(
  "/api/results/city",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const results = await dataSvc.getResultsByCity();

      res.status(200).json(results);
    }
  })
);

router.get(
  "/api/results/timezone",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const results = await dataSvc.getResultsByTimezone();

      res.status(200).json(results);
    }
  })
);

module.exports = router;

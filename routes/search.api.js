const express = require("express");
const router = express.Router();
const searchSvc = require("../services/search-result.service");
const apiHelp = require("../services/apihelper.service");

router.get("/api/results/country", apiHelp.bootlegMiddleware, async(req,res,next) => {  
  const result = await searchSvc.getResultsByCountry();

  res.status(result.code).json(result.data);
});

router.get("/api/results/country/:country/region", apiHelp.bootlegMiddleware, async(req,res,next) => {  
  const country = req.params.country;
  const result = await searchSvc.getResultsByRegion(country);

  res.status(result.code).json(result.data);
});

router.get("/api/results/country/:country/region/:region/city", apiHelp.bootlegMiddleware, async(req,res,next) => {  
  const country = req.params.country;
  const region = req.params.region;
  const result = await searchSvc.getResultsByCity(country, region);

  res.status(result.code).json(result.data);
});

router.get("/api/results/region", apiHelp.bootlegMiddleware, async(req,res,next) => {  
  const result = await searchSvc.getResultsByRegion();

  res.status(result.code).json(result.data);
});

router.get("/api/results/city", apiHelp.bootlegMiddleware, async(req,res,next) => {  
  const result = await searchSvc.getResultsByCity();

  res.status(result.code).json(result.data);
});

router.get("/api/results/timezone", apiHelp.bootlegMiddleware, async (req, res, next) => {
  const result = await searchSvc.getResultsByTimezone();

  res.status(result.code).json(result.data);
});

router.get("/api/results/blockchains", apiHelp.bootlegMiddleware, async(req,res,next) => {  
  const result = await searchSvc.getResultsByBlockchain();

  res.status(result.code).json(result.data);
});

router.get("/api/results/latest", apiHelp.bootlegMiddleware, async(req,res,next) => {  
  const result = await searchSvc.getLastSearch();

  res.status(result.code).json(result.data);
});

module.exports = router;

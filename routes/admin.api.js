const express = require("express");
const router = express.Router();
const adminSvc = require("../services/admin.service");
const discountCodeSvc = require("../services/discount-code.service");
const dataSvc = require("../data/dataIntegration.service");
const apiHelp = require("../services/apihelper.service");
const enums = require('../classes/enums');

router.get("/api/admin/users", [apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.adminMiddleware], async (req, res, next) => {
    const result = await adminSvc.getUserCounts();

    res.status(result.code).json(result.data);
});

router.get("/api/admin/codes/discount", [apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.adminMiddleware], async (req, res, next) => {
    const result = await discountCodeSvc.getAll();

    res.status(result.code).json(result.data);
});

router.post("/api/admin/codes/discount", [apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.adminMiddleware], async (req, res, next) => {
    const discountCode = req.body;
    const result = await discountCodeSvc.addDiscountCode(discountCode);

    res.status(result.code).json(result.data);
});

router.patch("/api/admin/codes/discount", [apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.adminMiddleware], async (req, res, next) => {
    const discountCode = req.body;
    const result = await discountCodeSvc.updateDiscountCode(discountCode);

    res.status(result.code).json(result.data);
});

module.exports = router;
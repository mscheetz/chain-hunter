const express = require("express");
const router = express.Router();
const userSvc = require('../services/user.service');
const paymentSvc = require('../services/payment.service');
const apiHelp = require("../services/apihelper.service");
const encryptionSvc = require('../services/encryption.service');

router.get("/api/payment/types", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const result = await paymentSvc.getPaymentTypes();

    res.status(result.code).json(result.data);
});

router.get("/api/payment/types/detail", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const result = await paymentSvc.getPaymentTypeDetails();

    res.status(result.code).json(result.data);
});

/**
 * Update a user's account
 */
router.post("/api/payment/upgrade", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
  const userId = res.locals.userId;
  const accountUuid = req.body.accountUuid;
  const promoCode = req.body.promoCode;
  
  const result = await paymentSvc.upgradeAccount(userId, promoCode, accountUuid);

  res.status(result.code).json(result.data);
});

router.post("/api/payment/order", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
    const userId = res.locals.userId;
    const order = req.body;

    const result = await paymentSvc.createOrder(userId, order.accountTypeId, order.paymentTypeId, order.price, order.discountCode);

    res.status(result.code).json(result.data);
});

router.get("/api/payment/order/:id", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
    const orderId = req.params.id;

    const result = await paymentSvc.getOrder(orderId);

    res.status(result.code).json(result.data);
});

router.post("/api/payment/cc", [ apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
    const userId = res.locals.userId;
    let payment = req.body;
    payment.userId = userId;

    const result = await paymentSvc.processCreditCardPayment(payment);

    res.status(result.code).json(result.data);
});

router.post("/api/payment/crypto", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
    const userId = res.locals.userId;
    let order = req.body;
    order.userId = userId;

    const result = await paymentSvc.processCryptoPayment(order.userId);

    res.status(result.code).json(result.data);
});

module.exports = router;
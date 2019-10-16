const express = require("express");
const router = express.Router();
const userSvc = require('../services/userService');
const apiHelp = require("../services/apiHelper");

router.get(
  "/api/user/:userId",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const userId = req.params.userId;

      const results = await userSvc.getUserByUserId(userId);

      res.status(200).json(results);
    }
  })
)

/**
 * Add a user
 */
router.post(
  "/api/user",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const data = req.body.data;

      const results = await userSvc.registerUser(data);

      res.status(200).json(results);
    }
  })
);

/**
 * Update a user
 */
router.put(
  "/api/user",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const data = req.body.data;

      const results = await userSvc.updateUser(data);

      res.status(200).json(results);
    }
  })
);

/**
 * Update a user's password
 */
router.post(
  "/api/user/password",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const data = req.body.data;

      const results = await userSvc.changePassword(data.userId, data.oldPassword, data.newPassword);

      res.status(200).json(results);
    }
  })
);

/**
 * Get user data
 */
router.get(
  "/api/user/data:userId",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const userId = req.params.userId;

      const results = await userSvc.getUserData(userId);

      res.status(200).json(results);
    }
  })
);

/**
 * Add new user data
 */
router.post(
  "/api/user/data",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const data = req.body.data;

      const results = await userSvc.addUserData(data.userId, data.hash, data.symbol, data.type);

      res.status(200).json(results);
    }
  })
);

/**
 * Add new user data
 */
router.delete(
  "/api/user/data",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const data = req.body.data;

      const results = await userSvc.deleteUserData(data.userId, data.hash, data.symbol, data.type);

      res.status(200).json(results);
    }
  })
);

module.exports = router;

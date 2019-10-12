const express = require("express");
const router = express.Router();
const userSvc = require('../data/userService');
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

      const results = await userSvc.changePassword(data.username, data.oldPassword, data.newPassword);

      res.status(200).json(results);
    }
  })
);

module.exports = router;

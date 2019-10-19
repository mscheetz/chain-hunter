const express = require("express");
const router = express.Router();
const userSvc = require('../services/userService');
const apiHelp = require("../services/apiHelper");
const encryptionSvc = require('../services/encryption');

router.get("/api/user/login", apiHelp.asyncMiddleware(async (req, res, next) => {
  res.status(200).json("howdy folks!");
}));

router.post(
  "/api/user/login",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const email = req.body.email,
        password = req.body.password;

        const result = await userSvc.login(email, password);

        res.status(result.code).json(result.data);
    }
  })
);

router.post(
  "/api/user/forgotpassword",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const email = req.body.email;

        const result = await userSvc.forgotPassword(email);

        res.status(result.code).json(result.data);
    }
  })
);



router.post(
  "/api/user/login/shucks",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const password = req.body.password;

      const result = await encryptionSvc.hashPassword(password);

      res.status(200).json(result);
    }
  })
);

router.get("/api/logout", apiHelp.asyncMiddleware(async (req, res, next) => {}));

router.get(
  "/api/user/:userId",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    encryptionSvc.validateToken(req, res, next);
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const userId = req.params.userId;

      const result = await userSvc.getUserByUserId(userId);

      res.status(result.code).json(result.data);
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

      const result = await userSvc.registerUser(data);

      res.status(result.code).json(result.data);
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

      const result = await userSvc.updateUser(data);

      res.status(result.code).json(result.data);
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

      const result = await userSvc.changePassword(data.userId, data.oldPassword, data.newPassword);

      res.status(result.code).json(result.data);
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

      const result = await userSvc.getUserData(userId);

      res.status(result.code).json(result.data);
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

      const result = await userSvc.addUserData(data.userId, data.hash, data.symbol, data.type);

      res.status(result.code).json(result.data);
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

      const result = await userSvc.deleteUserData(data.userId, data.hash, data.symbol, data.type);

      res.status(result.code).json(result.data);
    }
  })
);

module.exports = router;

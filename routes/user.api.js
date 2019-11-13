const express = require("express");
const router = express.Router();
const userSvc = require('../services/user.service');
const apiHelp = require("../services/apihelper.service");
const encryptionSvc = require('../services/encryption.service');

router.get("/api/user/login", apiHelp.asyncMiddleware(async (req, res, next) => {
  res.status(200).json("howdy folks!");
}));

router.post("/api/user/login", apiHelp.bootlegMiddleware, async (req, res, next) => {
  const email = req.body.email,
    password = req.body.password;

  const result = await userSvc.login(email, password);

  res.status(result.code).json(result.data);
});

router.post("/api/user/guest", apiHelp.bootlegMiddleware, async (req, res, next) => {
  const result = await userSvc.guestLogin();

  res.status(result.code).json(result.data);
});

router.get("/api/user/validate/:userId", apiHelp.asyncMiddleware(async (req, res, next) => {
    const userId = req.params.userId;

    const result = await userSvc.validateUser(userId);

    res.status(result.code).json(result.data);
  })
);

router.post("/api/user/password/forgot/init", apiHelp.bootlegMiddleware, async (req, res, next) => {
  const email = req.body.email;

  const result = await userSvc.forgotPasswordInit(email);

  res.status(result.code).json(result.data);
});

router.get("/api/user/password/forgot/verify/:token", apiHelp.bootlegMiddleware, async (req, res, next) => {
  const token = req.params.token;

  const result = await userSvc.validatePasswordReset(token);

  res.status(result.code).json(result.data);
});

router.post("/api/user/password/forgot/action", apiHelp.bootlegMiddleware, async (req, res, next) => {
  console.log('req.body', req.body);
  const token = req.body.token,
    password = req.body.password;

  const result = await userSvc.forgotPasswordAction(token, password);

  res.status(result.code).json(result.data);
});

router.post("/api/user/login/shucks", apiHelp.bootlegMiddleware, async (req, res, next) => {
  const password = req.body.password;

  const result = await encryptionSvc.hashPassword(password);

  res.status(200).json(result);
});

router.get("/api/logout", apiHelp.asyncMiddleware(async (req, res, next) => { }));

router.get("/api/user/id/:userId", [apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware], async (req, res, next) => {
    const userId = req.params.userId;
    const tokenUserId = res.locals.userId;
    if(userId !== tokenUserId) {
      apiHelp.errorResponse(res);
    }

    const result = await userSvc.getUserByUserId(userId);

    res.status(result.code).json(result.data);
});

/**
 * Add a user
 */
router.post("/api/user", apiHelp.bootlegMiddleware, async (req, res, next) => {
  const data = req.body.data;

  const result = await userSvc.registerUser(data);

  res.status(result.code).json(result.data);
});

/**
 * Update a user
 */
router.put("/api/user", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
  const user = req.body;
  
  const result = await userSvc.updateUser(user);

  res.status(result.code).json(result.data);
});

/**
 * Update a user's password
 */
router.post("/api/user/password", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
  const data = req.body;

  const result = await userSvc.changePassword(data.userId, data.password, data.newPassword);

  res.status(result.code).json(result.data);
});

/**
 * Get user data
 */
router.get("/api/user/data", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
  const userId = res.locals.userId;

  const result = await userSvc.getUserData(userId);

  res.status(result.code).json(result.data);
});

/**
 * Add new user data
 */
router.post("/api/user/data", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
  const userId = res.locals.userId;
  const data = req.body;
  
  const result = await userSvc.addUserData(userId, data.hash, data.symbol, data.type);

  res.status(result.code).json(result.data);
});

/**
 * Remove user data
 */
router.delete("/api/user/data/:id", [ apiHelp.bootlegMiddleware, apiHelp.authMiddleware, apiHelp.userMiddleware ], async (req, res, next) => {
  const id = req.params.id;

  const result = await userSvc.deleteUserData(id);

  res.status(result.code).json(result.data);
});

/**
 * Validate an invite code
 */
router.post("/api/user/invite/validate", [ apiHelp.bootlegMiddleware ], async(req, res, next) => {
  const data = req.body;
  
  const result = await userSvc.validateInviteCode(data.code);

  res.status(result.code).json(result.data);
});

/**
 * Register a new user
 */
router.post("/api/user/register", [ apiHelp.bootlegMiddleware ], async(req, res, next) => {
  const data = req.body;

  const result = await userSvc.registerUser(data.email, data.password, data.inviteCode);

  res.status(result.code).json(result.data);
});

/**
 * Get account types
 */
router.get("/api/user/accounts", [ apiHelp.bootlegMiddleware ], async(req, res, next) => {
  const result = await userSvc.getAccountTypes();
  
  res.status(result.code).json(result.data);
});

module.exports = router;

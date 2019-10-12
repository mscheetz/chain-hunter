const express = require("express");
const router = express.Router();
const userSvc = require("../data/userService");
const apiHelp = require("../services/apiHelper");

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  "/api/login",
  asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const username = req.body.username,
        password = req.body.password;

      const validLogin = await userSvc.userLogin(username, password);

      if (validLogin) {
        res.status(200).json(true);
      } else {
        res.status(401).json(false);
      }
    }
  })
);

router.get("/api/logout", asyncMiddleware(async (req, res, next) => {}));

module.exports = router;

const express = require("express");
const router = express.Router();
const manager = require("../services/chainhunter-manager");
const dataSvc = require("../services/dataIntegrationService");
const apiHelp = require("../services/apiHelper");

router.get(
  "/api/blockchain/active",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res, headerMsg.message);
    } else {
      const result = await manager.getActiveChains();

      res.status(200).json(result);
    }
  })
);

router.get(
  "/api/blockchain/future",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const result = await manager.getFutureChains();

      res.status(200).json(result);
    }
  })
);

router.get(
  "/api/blockchain/empty",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const result = await manager.getEmptyBlockchains();

      res.status(200).json(result);
    }
  })
);

router.get(
  "/api/blockchain/:toFind",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const toFind = req.params.toFind;
      const result = await manager.getBlockchains(toFind);

      res.status(200).json(result);
    }
  })
);

router.get(
  "/api/blockchain/:chain/:toFind",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const chain = req.params.chain.toLowerCase();
      const toFind = req.params.toFind;
      const result = await manager.getBlockchain(chain, toFind);

      if (result.address || result.contract || result.transaction) {
        let updateType = "";
        if (result.address) {
          updateType = "address";
        } else if (result.contract) {
          updateType = "contract";
        } else if (result.transaction) {
          updateType = "transaction";
        }

        await dataSvc.updateSearchResult(
          headerMsg.ip,
          req.ipInfo,
          chain,
          updateType
        );
      }

      res.status(200).json(result);
    }
  })
);

router.get(
  "/api/blockchain/address/:chain/:address/txs",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const chain = req.params.chain.toLowerCase();
      const address = req.params.address;
      const result = await manager.getTransactions(chain, address);

      await dataSvc.updateSearchResult(
        headerMsg.ip,
        req.ipInfo,
        chain,
        "addressTransactions"
      );

      res.status(200).json(result);
    }
  })
);

router.get(
  "/api/blockchain/address/:chain/:address/tokens",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      const chain = req.params.chain.toLowerCase();
      const address = req.params.address;
      const result = await manager.getTokens(chain, address);

      await dataSvc.updateSearchResult(
        headerMsg.ip,
        req.ipInfo,
        chain,
        "addressTokens"
      );

      res.status(200).json(result);
    }
  })
);

router.get(
  "/api/blockchain/empty",
  apiHelp.asyncMiddleware(async (req, res, next) => {
    const headerMsg = apiHelp.headerCheck(req);
    if (!headerMsg.status) {
      apiHelp.errorResponse(res);
    } else {
      await dataSvc.updateSearchResult(
        headerMsg.ip,
        req.ipInfo,
        "none",
        "empty"
      );

      res.status(200).json(true);
    }
  })
);

module.exports = router;

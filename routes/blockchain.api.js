const express = require("express");
const router = express.Router();
const manager = require("../services/chainhunter.manager");
const dataSvc = require("../data/dataIntegration.service");
const apiHelp = require("../services/apihelper.service");
const enums = require('../classes/enums');

router.get("/api/blockchain/active", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const result = await manager.getActiveChains();

    res.status(200).json(result);
});

router.get("/api/blockchain/arrrrrgggggs", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const result = await manager.getActiveChainsII();

    res.status(200).json(result);
});

router.get("/api/blockchain/future", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const result = await manager.getFutureChains();

    res.status(200).json(result);
});

router.get("/api/blockchain/empty", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const result = await manager.getEmptyBlockchains();

    res.status(200).json(result);
});

router.get("/api/blockchain/:toFind", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const toFind = req.params.toFind;
    const result = await manager.getBlockchains(toFind);

    res.status(200).json(result);
});

router.get("/api/blockchain/:chain/:toFind", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const chain = req.params.chain.toLowerCase();
    const toFind = req.params.toFind;
    const ip = res.locals.ip;
    const result = await manager.getBlockchain(chain, toFind, ip, req.ipInfo);

    res.status(200).json(result);
});

router.get("/api/blockchain/address/:chain/:address", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const chain = req.params.chain.toLowerCase();
    const address = req.params.address;
    const ip = res.locals.ip;
    const result = await manager.getBlockchain(chain, address, ip, req.ipInfo, enums.searchType.address);

    res.status(200).json(result);
});

router.get("/api/blockchain/address/:chain/:address/txs", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const chain = req.params.chain.toLowerCase();
    const address = req.params.address;
    const ip = res.locals.ip;
    const result = await manager.getTransactions(chain, address, ip, req.ipInfo);

    res.status(200).json(result);
});

router.get("/api/blockchain/address/:chain/:address/tokens", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const chain = req.params.chain.toLowerCase();
    const address = req.params.address;
    const ip = res.locals.ip;
    const result = await manager.getTokens(chain, address, ip, req.ipInfo);

    res.status(200).json(result);
});

router.get("/api/blockchain/contract/:chain/:address", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const chain = req.params.chain.toLowerCase();
    const address = req.params.address;
    const ip = res.locals.ip;
    const result = await manager.getBlockchain(chain, address, ip, req.ipInfo, enums.searchType.contract);

    res.status(200).json(result);
});

router.get("/api/blockchain/txn/:chain/:hash", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const chain = req.params.chain.toLowerCase();
    const hash = req.params.hash;
    const ip = res.locals.ip;
    const result = await manager.getBlockchain(chain, hash, ip, req.ipInfo, enums.searchType.transaction);

    res.status(200).json(result);
});

router.get("/api/blockchain/empty", apiHelp.bootlegMiddleware, async (req, res, next) => {
    const ip = res.locals.ip;
    await dataSvc.updateSearchResult(
      ip,
      req.ipInfo,
      "none",
      "empty"
    );

    res.status(200).json(true);
});

module.exports = router;
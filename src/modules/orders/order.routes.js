
const express = require("express");
const router = express.Router();

const controller = require("./order.controller");
const authenticate = require("../auth/auth.middleware");

router.post("/", authenticate, controller.create);
router.get("/", authenticate, controller.list);
router.get("/:orderId", authenticate, controller.getById);

module.exports = router;

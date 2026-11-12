
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const controller = require("./dish.controller");
const authenticate = require("../auth/auth.middleware");

// Configuração do armazenamento das imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../../../public/uploads"));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `dish-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    cb(null, uniqueName);
  }
});

// Aceita somente imagens de até 5 MB
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Envie somente arquivos de imagem."));
    }
  }
});

router.post(
  "/restaurants/:restaurantId/dishes",
  authenticate,
  upload.single("image"),
  controller.create
);

router.get("/restaurants/:restaurantId/dishes", controller.list);

router.get("/dishes/:dishId", controller.getById);

router.put("/dishes/:dishId", authenticate, controller.update);

router.delete("/dishes/:dishId", authenticate, controller.remove);

module.exports = router;

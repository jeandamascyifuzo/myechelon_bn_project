const router = require("express").Router();
module.exports = { createService, getServices, getService, deleteService, updateService } = require('../controllers/Service')

const { verifyToken, verifyTokenAndAdmin } = require('../middleware/verifyToken')


router.post("/create", createService);

router.get("/", getServices)

router.get("/:id", getService)

router.delete("/:id", deleteService)

router.patch("/:id", updateService)


module.exports = router
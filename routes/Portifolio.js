const router = require("express").Router();
const { createPortifolio, getPortifolios, getPortifolio, deletePortifolio, updatePortifolio } = require('../controllers/Portifolio')
const { verifyToken, verifyTokenAndAdmin } = require('../middleware/verifyToken')



router.post("/create", createPortifolio);

router.get("/",  getPortifolios);

router.get("/:id",  getPortifolio);

router.delete("/:id",  deletePortifolio);

router.patch("/:id",  updatePortifolio);


module.exports = router
const router = require("express").Router();
const { createMessage, getMessages, getMessage, deletedMessage } = require('../controllers/Message')
const { verifyToken, verifyTokenAndAdmin } = require('../middleware/verifyToken')


router.post("/send", createMessage);

router.get("/",  getMessages);

router.get("/:id",  getMessage);

router.delete("/:id",  deletedMessage);


module.exports = router
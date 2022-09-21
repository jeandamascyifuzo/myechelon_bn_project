const router = require("express").Router();

const { createUser, getUsers, getUser, deletedUser, updatedUser, userLogin } = require('../controllers/User')
const { verifyToken, verifyTokenAndAdmin } = require('../middleware/verifyToken')


router.post("/create", createUser);

router.get("/", getUsers);

router.get("/:id",  getUser);

router.delete("/:id",  deletedUser);

router.put("/:id",  updatedUser);

router.post("/login", userLogin)


module.exports = router
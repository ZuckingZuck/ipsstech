const router = require("express").Router();
const { LoginUser, CreateUser } = require("../controller/auth");


router.post("/login", LoginUser);
router.post("/register", CreateUser);

module.exports = router;
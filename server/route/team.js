const router = require("express").Router();
const { GetTeams } = require("../controller/team");

router.get("/", GetTeams);

module.exports = router;
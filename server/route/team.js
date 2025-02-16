const router = require("express").Router();
const { GetTeams, GetMyTeams, GetMyLeds } = require("../controller/team");
const {addUsertoRequest, requireAuth } = require("../middleware/authControl");

router.get("/", GetTeams);

router.use(addUsertoRequest);
router.use(requireAuth);

router.get("/myteams", GetMyTeams);
router.get("/myleds", GetMyLeds);

module.exports = router;
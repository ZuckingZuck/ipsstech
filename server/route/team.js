const router = require("express").Router();
const { GetTeams, GetMyTeams, GetMyLeds, GetTeamById, GetTeamMembers, RemoveTeamMember } = require("../controller/team");
const {addUsertoRequest, requireAuth } = require("../middleware/authControl");

router.get("/", GetTeams);

router.use(addUsertoRequest);
router.use(requireAuth);

router.get("/myteams", GetMyTeams);
router.get("/myleds", GetMyLeds);
router.get("/:teamId", GetTeamById);
router.get("/:teamId/members", GetTeamMembers);
router.delete("/:teamId/members/:memberId", RemoveTeamMember);

module.exports = router;
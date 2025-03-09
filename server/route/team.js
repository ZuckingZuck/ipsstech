const router = require("express").Router();
const { GetTeams, GetMyTeams, GetMyLeds, GetTeamById, GetTeamMembers, RemoveTeamMember, CreateTeam, DeleteTeam } = require("../controller/team");
const {addUsertoRequest, requireAuth } = require("../middleware/authControl");

router.get("/", GetTeams);

router.use(addUsertoRequest);
router.use(requireAuth);

router.post("/", CreateTeam);
router.get("/myteams", GetMyTeams);
router.get("/myleds", GetMyLeds);
router.get("/:teamId", GetTeamById);
router.get("/:teamId/members", GetTeamMembers);
router.delete("/:teamId/members/:memberId", RemoveTeamMember);
router.delete("/:teamId", DeleteTeam);

module.exports = router;
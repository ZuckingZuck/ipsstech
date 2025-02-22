const router = require("express").Router();
const { AddAdvert, GetAdverts, AppealtoAdvert, ApproveAppeal, GetAdvertDetail, GetMyAdvertDetail, RejectAppeal } = require("../controller/advert");
const { addUsertoRequest, requireAuth } = require("../middleware/authControl");


router.get("/", GetAdverts);
router.get("/:id", GetAdvertDetail);

router.use(addUsertoRequest);
router.use(requireAuth);
router.get("/myadvert/:id", GetMyAdvertDetail)
router.post("/", AddAdvert);
router.post("/appeal/:id", AppealtoAdvert);
router.get("/appeal/approve/:id", ApproveAppeal);
router.get("/appeal/reject/:id", RejectAppeal);


module.exports = router;
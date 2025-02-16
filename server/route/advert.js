const router = require("express").Router();
const { AddAdvert, GetAdverts, AppealtoAdvert, ApproveAppeal, GetAdvertDetail } = require("../controller/advert");
const { addUsertoRequest, requireAuth } = require("../middleware/authControl");


router.get("/", GetAdverts);
router.get("/:id", GetAdvertDetail);
router.use(addUsertoRequest);
router.use(requireAuth);

router.post("/", AddAdvert);
router.post("/appeal/:id", AppealtoAdvert);
router.post("/appeal/approve/:id", ApproveAppeal);


module.exports = router;
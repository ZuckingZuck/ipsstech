const AdvertDB = require("../model/advert");
const TeamDB = require("../model/team");
const TeamAppealDB = require("../model/teamAppeal");

const AddAdvert = async (req, res) => {
    console.log("istek geldi");
    try {
        const user = req.user;
        const advert = req.body;

        // Yeni bir takım oluştur
        const newTeam = new TeamDB({ name: `${user.name}'s Team`, leader: user._id }); // `leader` olarak `user._id` kullanıldı
        await newTeam.save();

        // Yeni bir ilan oluştur
        const newAdvert = new AdvertDB({
            title: advert.title,
            description: advert.description,
            fields: advert.fields,
            skills: advert.skills,
            owner: user._id, // `owner` olarak `user._id` kullanıldı
            teamId: newTeam._id,
        });

        await newAdvert.save();

        res.status(200).json(newAdvert);
    } catch (err) {
        console.log(err); // `error` değil `err` olarak değiştirildi
        res.status(500).json(err);
    }
};


const GetAdverts = async (req, res) => {
    try {
        const adverts = await AdvertDB.find().populate("owner", "name surname").populate("teamId", "name");
        res.status(200).json(adverts);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const GetAdvertDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const advert = await AdvertDB.findOne({_id: id}).populate("owner", "name surname").populate("teamId", "name");
        res.status(200).json(advert);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const AppealtoAdvert = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const { extra } = req.body;

        // İlanı bul
        const advert = await AdvertDB.findById(id);
        if (!advert) {
            return res.status(404).json({ error: "İlan bulunamadı." });
        }

        // Kullanıcının zaten başvurup başvurmadığını kontrol et
        const checkAppeal = await TeamAppealDB.findOne({ advertId: advert._id, applicant: user._id });
        if (checkAppeal) {
            return res.status(409).json({ error: "Zaten başvuru yapmışsınız." });
        }

        // Yeni başvuru oluştur
        const newAppeal = new TeamAppealDB({
            advertId: advert._id,
            applicant: user._id, // `user._id` kullanıldı
            extra: extra
        });

        await newAppeal.save();
        res.status(200).json({ message: "Başvurunuz başarıyla tamamlandı." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Sunucu hatası." });
    }
};


const ApproveAppeal = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;

        const appeal = await TeamAppealDB.findById(id);
        if (!appeal) {
            return res.status(404).json({ message: "Başvuru bulunamadı." });
        }

        const advert = await AdvertDB.findById(appeal.advertId);
        if (!advert) {
            return res.status(404).json({ message: "İlan bulunamadı." });
        }

        if (user._id.toString() !== advert.owner.toString()) {
            return res.status(403).json({ message: "Bu takıma üye eklemek için yetkiniz yok." });
        }

        const team = await TeamDB.findById(advert.teamId);
        if (!team) {
            return res.status(404).json({ message: "Takım bulunamadı." });
        }

        if (!team.members.includes(appeal.applicant._id)) {
            team.members.push(appeal.applicant._id);
            appeal.status = "Accepted";

            await Promise.all([appeal.save(), team.save()]); // Paralel kaydetme (daha hızlı)

            return res.status(200).json({ message: "Kullanıcının başvurusu kabul edildi." });
        } else {
            return res.status(409).json({ message: "Kullanıcı zaten takıma üye." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};




module.exports = { AddAdvert, GetAdverts, GetAdvertDetail, AppealtoAdvert, ApproveAppeal };
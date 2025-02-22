const mongoSanitize = require("express-mongo-sanitize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserDB = require("../model/user");
const user = require("../model/user");

const CreateUser = async (req, res) => {
    try {
        let { name, surname, email, phone, password } = req.body;
        // MongoDB Injection temizliği
        name = mongoSanitize.sanitize(name);
        surname = mongoSanitize.sanitize(surname);
        email = mongoSanitize.sanitize(email);
        phone = mongoSanitize.sanitize(phone);

        const existingUser = await UserDB.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserDB({
            name,
            surname,
            email,
            phone,
            password: hashedPassword,
        });

        await newUser.save();

        // JWT Token oluştur
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // 7 gün geçerli olacak
        );

        res.status(201).json({ 
            message: 'Kullanıcı başarıyla kaydedildi', 
            token, // JWT Token gönderiliyor
            user: {
                _id: user._id,
                name: newUser.name,
                surname: newUser.surname,
                email: newUser.email,
                phone: newUser.phone
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kullanıcı kaydı sırasında bir hata oluştu' });
    }
};


const LoginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        // MongoDB Injection temizliği (sadece email için)
        email = mongoSanitize.sanitize(email);

        // E-posta adresi ile kullanıcıyı bul
        const user = await UserDB.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });
        }

        // Parolayı doğrula
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Parola hatalı.' });
        }

        // JWT Token oluştur
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({ 
            message: 'Giriş başarılı', 
            token,
            user: {
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
    }
};

module.exports = { CreateUser, LoginUser };
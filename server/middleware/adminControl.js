const jwt = require("jsonwebtoken");
const AdminDB = require("../model/Admin");

const adminAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Auth token required!" });
  }

  const token = authorization.split(" ")[1];
  try {
    const { adminId } = jwt.verify(token, process.env.SECRET_KEY);
    const admin = await AdminDB.findOne({ _id: adminId });
    if (admin) {
      req.admin = admin;
      next();
    }else{
        res.status(403).json({error: "Yetkisiz erişim!"});
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

const isAdmin = (req, res, next) => {
    const admin = req.admin;
    if(!admin){
        return res.status(403).json({ error: 'Bu işlemi gerçekleştirmek için admin yetkilerine sahip değilsiniz' });
    }

    if (admin.role === "admin" || admin.role === "SuperAdmin") {
        next();
    }else{
        return res.status(403).json({ error: 'Bu işlemi gerçekleştirmek için admin yetkilerine sahip değilsiniz' });
    }
};

const isSuperAdmin = (req, res, next) => {
    const admin = req.admin;
    if (!admin || admin.role !== "SuperAdmin") {
        return res.status(403).json({ error: 'Bu işlemi gerçekleştirmek için admin yetkilerine sahip değilsiniz' });
    }

    next();
};

module.exports = {adminAuth, isAdmin, isSuperAdmin};
const jwt = require("jsonwebtoken");
const UserDB = require("../model/user");

const addUsertoRequest = async (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split(" ")[1];
    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserDB.findOne({ _id: userId }).select("-password -phone");
      if (user) {
        req.user = user;
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: "Request is not authorized" });
    }
  }else{ next() }
};

const requireAuth = async (req, res, next) => {
  const user = req.user;
    if(!user){
        return res.status(401).json({ error: 'Bu işlemi gerçekleştirmek için giriş yapmış olmalısınız.' });
    }else{
      next();
    }
}

module.exports = {addUsertoRequest, requireAuth};
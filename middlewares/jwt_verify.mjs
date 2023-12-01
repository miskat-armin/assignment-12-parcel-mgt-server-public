const JWTVerify = async ( req, res, next) => {
    const token = req.cookies?.token;
    
    if(!token){
        return res.status(401).send({status: "unAuthorized Access", code: "401"})
    }

    next();
}

export default JWTVerify;
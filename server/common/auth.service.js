const dotenv = require("dotenv");
const helper=require('./helper');
dotenv.config();

const varifySecretKey=async function(req,res,next){
	const path=req.path;
    const host=req.host;
    const refferer=req.headers.referer;
    const secretKey = req.headers.secretkey;

    if(!secretKey){
        helper.sendJSON(res,{},true,401,"Secret Key Missing !!",0);
        return;
    }
    else if(secretKey == process.env.SECRET_KEY){
        next();
    }
    else{
        helper.sendJSON(res,{},true,401,"invalid secret key !!",0);
        return;
    }

}

module.exports={
    varifySecretKey
};

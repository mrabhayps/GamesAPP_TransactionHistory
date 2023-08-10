var sequelize = require('sequelize');
var models = require('../models/index');

const statusCodeMsg=require('./statusCode.json');
const Constant= require('./constant');
const sendJSON=async function(res,data,error,statusCode,message,recordTotal){
    res.json({
        "meta":{
            error:error,
            statusCode:statusCode,
            statusText:statusCodeMsg[`${statusCode}`],
            message:message,
            recordTotal:recordTotal
        },
        "data":data
    });

}


module.exports={
    sendJSON
}

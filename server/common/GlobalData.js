
const sequelize = require('sequelize');
const models = require('../models/index');

const setGameData= async function (){
    try{
        let data = await models.gmsGames.findAll({
            where: { 
                status: 1
            }, 
            raw:true
        });
        for(let i=0;i<data.length;i++){
            let key="GID_"+data[i]['id'];
            global.GAMES_DETAILS[key]=data[i];
        }
        return true;
    }
    catch(error)
    {
        console.log("Error in (setGameData)");
        console.log(error);
        return false;
    }
}

const setBattleList= async function(){
    try{
        let data = await models.sequelize.query(`SELECT  id, title FROM gmsBattle`,{ type: sequelize.QueryTypes.SELECT });
        global.BATTLE_LIST=data;
        return true;
    }
    catch(error){
        console.log("Error in (setBattleList) : ")
        console.log(error);
        return false;
    }
}

const setGameList= async function(){
    try{
        let data = await models.sequelize.query(`SELECT  id, name FROM gmsGames`,{ type: sequelize.QueryTypes.SELECT });
        global.GAME_LIST=data;
        return true;
    }
    catch(error){
        console.log("Error in (setGameList) : ")
        console.log(error);
        return false;
    }
}


module.exports = {
    setGameData,
    setBattleList,
    setGameList
}
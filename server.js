const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const route = require('./server/router/route');
const globalData= require('./server/common/GlobalData');
const auth= require('./server/common/auth.service');
const helper = require('./server/common/helper');

//Loading environment variable define in .env file.
dotenv.config();


app.use(cors());
app.use(require('express-useragent').express())
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: `!! Welcome to transaction history API  ${process.env.NODE_ENV} !!` });
});

app.get("/serverHealthStatus", (req, res) => {
  helper.sendJSON(res,{"serverStatus":process.env.SERVER_HEALTH_STATUS},false,200,"Server status get successfully.",0);            
  return;
});

//varify Secret key
app.use(auth.varifySecretKey);


app.use("/api/v1",route);

// set port, listen for requests
const PORT = process.env.PORT || 80;
const environment= process.env.NODE_ENV;
app.listen(PORT, async () => {
  await setGlobalData();
  console.log(`${environment} Server is running on port ${PORT}.`);
});

const setGlobalData=async function(){
  console.log("Global Game data setting starting . . .");
  global.GAMES_DETAILS={};
  await globalData.setGameData();
  console.log("Global Game data setting End.");

  console.log("Battle list data start . . .");
  await globalData.setBattleList();
  console.log("Battle list data end . . .");

  console.log("Game list data start . . .");
  await globalData.setGameList();
  console.log("Game list data end . . .");


}

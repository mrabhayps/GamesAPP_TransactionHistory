'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

const dotenv = require("dotenv");
//Loading environment variable define in .env file.
dotenv.config();

const env = process.env.NODE_ENV || 'UAT';
let DB_CONFIG = {
  "dialect": process.env.DILECT,
  "port" : process.env.DB_PORT,
  "username": process.env.USERNAME,
  "password": process.env.PASSWORD,
  "database": process.env.DATABASE,
  "host": process.env.HOST,
  "operatorsAliases": process.env.OPERATORSALIASES,
  "timezone": process.env.TIMEZONE,
  "dialectOptions": {
    "useUTC": true, 
    "dateStrings": true,
    "typeCast": true     
  }
}

let DB_CONFIG_FANTASY = {
  "dialect": process.env.DILECT,
  "port" : process.env.DB_PORT,
  "username": process.env.USERNAME_FANTASY,
  "password": process.env.PASSWORD_FANTASY,
  "database": process.env.DATABASE_FANTASY,
  "host": process.env.HOST_FANTASY,
  "operatorsAliases": process.env.OPERATORSALIASES,
  "timezone": process.env.TIMEZONE,
  "dialectOptions": {
    "useUTC": true, 
    "dateStrings": true,
    "typeCast": true     
  }
}

const config = DB_CONFIG;
const config_fantasy = DB_CONFIG_FANTASY;

const db = {};


let sequelize = new Sequelize(config.database, config.username, config.password, config);
let sequelize1 = new Sequelize(config_fantasy.database, config_fantasy.username, config_fantasy.password, config_fantasy);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.sequelize1 = sequelize1;

module.exports = db;

const Bot = require('./src/Bot')
const FactorioAPI = require('./src/FactorioAPI')
require('dotenv').config()

const factorioAPI = new FactorioAPI();
const bot = new Bot(process.env.SLACK_TOKEN, factorioAPI);
bot.start();


const Bot = require('./src/Bot')
require('dotenv').config()

const bot = new Bot(process.env.SLACK_TOKEN);
bot.start();


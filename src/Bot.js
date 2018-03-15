
const Botkit = require('botkit')

class Bot {
  constructor(token) {
    this.controller = Botkit.slackbot()

    this.bot = this.controller.spawn({
      token
    })
  }

  start() {
    this.bot.startRTM((err, bot, payload) => {
      if (err) {
        throw new Error('Could not connect to Slack')
      }

      // close the RTM for the sake of it in 5 seconds
      setTimeout(() => {
        bot.closeRTM()
      }, 5000)
    })
  }

  bindEvents() {
    this.controller.hears(['^spooky$'], (bot, message) => {
      // default behavior, post as the bot user
      bot.whisper(message, 'Booo! This message is ephemeral and private to you')
    })
  }
}


module.exports = Bot

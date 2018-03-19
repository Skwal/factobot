const Botkit = require('botkit')
const FactorioAPI = require('./FactorioAPI')
require('dotenv').config()

class Bot {
  /**
   * @param {String} token
   * @param {FactorioAPI} factorioAPI
   */
  constructor() {
    this.controller = Botkit.slackbot()

    this.bot = this.controller.spawn({
      token: process.env.SLACK_TOKEN
    })

    this.init()
  }

  init() {
    this.api = new FactorioAPI()
  }

  start() {
    this.bot.startRTM((err) => {
      if (err) {
        this.stop()
        throw new Error('Could not connect to Slack')
      }

      this.bindEvents();
    })
  }

  stop() {
    this.bot.closeRTM()
  }

  bindEvents() {
    this.controller.on('rtm_close', (bot, err) => {
      if (err) {
        console.error('RTM Close failed unexpectedly!')
      }
      this.start()
    });

    this.controller.on('mention', (bot, message) => this.handleMention(message))
    this.controller.on('ambient', (bot, message) => this.handleAmbient(message))
  }

  handleMention(message) {
    this.bot.reply(message, 'Hello!')
  }

  handleAmbient(message) {
    if (message.text.indexOf('server status') >= 0) {
      this.bot.reply(message, 'Let me check...')
      this.api.getServerStatus().then((server) => this.replyWithSeverStatus(message, server))
    }
  }

  getTimeString(time) {
    const hours = Math.floor(time / 60)
    const minutes = time % 60

    return hours + 'h ' + minutes + 'm'
  }

  /**
   * @param {String} title
   * @param {String} value
   * @param {Boolean} short
   */
  getServerStatusField(title, value, short) {
    return {
      title: title,
      value: value,
      short: short
    }
  }

  getServerStatusMessage(server) {
    const time_elapsed = this.getTimeString(server.game_time_elapsed)
    const players = server.players && server.players.length ? server.players.join(', ') : 'None'

    return [
      {
        title: 'Game Details',
        color: '#7CD197',
        fields: [
          this.getServerStatusField("Name", server.name, true),
          this.getServerStatusField("Version", server.application_version.game_version, true),
          this.getServerStatusField("Time Elapsed", time_elapsed, true),
          this.getServerStatusField("Description", server.description, false),
          this.getServerStatusField("Players Online", players, false)
        ],
      }
    ]
  }

  replyWithSeverStatus(message, server) {
    if (!server || !server.game_id) {
      this.bot.reply(message, "Couldn't find the game. Did the id change? Let's see if I find a new one...")
      this.init()
      this.api.getServerStatus().then((server) => this.replyWithSeverStatus(message, server))
      return
    }

    this.bot.reply(message, {
      text: "Here it is:",
      attachments: this.getServerStatusMessage(server)
    })
  }
}

module.exports = Bot

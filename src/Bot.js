
const Botkit = require('botkit')

class Bot {
  /**
   * @param {String} token
   * @param {FactorioAPI} factorioAPI
   */
  constructor(token, factorioAPI) {
    this.controller = Botkit.slackbot()

    this.api = factorioAPI

    this.bot = this.controller.spawn({
      token
    })
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
        throw new Error('RTM Close failed unexpectedly!')
      }
      this.start();
    });

    this.controller.on('mention', (bot, message) => {
      if (message.text.indexOf('status') >= 0) {
        this.bot.reply(message, 'WORKED!')
      } else {
        this.bot.reply(message, 'yes?')
      }
    })

    this.controller.on('ambient', (bot, message) => {
      if (message.text.indexOf('server status') >= 0) {
        this.bot.reply(message, 'Let me check...')

        this.api.getServerStatus().then((server) => {

          const hours = Math.floor(server.game_time_elapsed / 60);
          const minutes = server.game_time_elapsed % 60;

          const time_elapsed = hours + 'h ' + minutes + 'm'
          const players = server.players

          this.bot.reply(message, {
            text: "Here it is:",
            attachments: [
              {
                title: 'Game Details',
                color: '#7CD197',
                fields: [
                  {
                    title: "Name",
                    value: server.name,
                    short: true
                  },
                  {
                    title: "Version",
                    value: server.application_version.game_version,
                    short: true
                  },
                  {
                    title: "Time Elapsed",
                    value: time_elapsed,
                    short: true
                  },
                  {
                    title: "Description",
                    value: server.description,
                    short: false
                  },
                  {
                    title: "Players Online",
                    value: players && players.length ? players.join(', ') : 'None',
                    short: false
                  }
                ],
              }
            ]
          })
        })
      }
    })

  }
}

module.exports = Bot

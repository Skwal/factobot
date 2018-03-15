require('dotenv').config()
const rp = require('request-promise')

class FactorioAPI {
  constructor() {
    const username = process.env.FACTORIO_LOGIN
    const base64Password = process.env.FACTORIO_PASSWORD
    const buffer = Buffer.from(base64Password, 'base64')
    const password = buffer.toString("ascii")

    this.authenticateAPI(username, password).then((body) => {
      this.username = username;
      this.token = body[0];
      this.authenticated = true;

      this.getServerId().then((id) => {
        this.id = id
      })
    })
  }

  authenticateAPI(username, password) {
    const apiAuthOptions = {
      method: 'POST',
      uri: 'https://auth.factorio.com/api-login',
      qs: {
        username: username,
        password: password,
        require_ownership: true
      },
      json: true
    };

    return rp(apiAuthOptions)
  }

  getServerList() {
    const options = {
      method: 'GET',
      uri: 'https://multiplayer.factorio.com/get-games',
      qs: {
        username: this.username,
        token: this.token
      },
      json: true
    }
    return rp(options)
  }

  getServerId() {
    return this.getServerList().then((list) => {
      for (let i = 0, total = list.length; i < total; i++) {
        if (list[i].name.indexOf('8D\'s repair men') >= 0) {
          // console.log(list[i])
          return list[i].game_id
        }
      }
    })
  }

  getServerStatus() {
    const options = {
      method: 'GET',
      uri: 'https://multiplayer.factorio.com/get-game-details/' + this.id,
      json: true
    }
    return rp(options)
  }
}


module.exports = FactorioAPI

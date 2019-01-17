"use strict"

const file     = require('./src/file')
const telegram = require('./src/bot')

file.read('data/settings.json')
.then(config => {
  const bot = telegram(config)
  bot.startPolling()
})
.catch(() => {
  file.write('data/settings.json', {
    bot: {
      token: '',
      admin: [{id: 0, name: ''}]
    },
    accounts: [{name: '', secret: '', alias: ''}]
  })
  .then(() => console.log('[+] Please edit the configuration file first!'))
  .catch(err => {
    console.log(`[-] Failed to save config: ${err}`)
  })
})

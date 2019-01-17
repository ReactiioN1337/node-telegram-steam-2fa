"use strict"

const Telegraf = require('telegraf')
const session  = require('telegraf/session')
const Stage    = require('telegraf/stage')
const Scene    = require('telegraf/scenes/base')
const Markup   = require('telegraf/markup')
const R        = require('ramda')
const totp     = require('steam-totp')
const {leave}  = Stage

module.exports = config => {
  const find_admin = ctx => {
    return R.findIndex(R.propEq('id', ctx.from.id), config.bot.admin)
  }

  const find_account = alias => {
    return R.findIndex(R.propEq('alias', alias), config.accounts)
  }

  const user_selection = new Scene('user-selection')
  user_selection.enter(ctx => {
    const buttons = R.map(name => {
      return Markup.callbackButton(name, `select:${name}`)
    }, R.compose(R.pluck('alias'), R.sortBy(R.prop('alias')))(config.accounts))

    return ctx.reply('Select an account to generate a 2FA code!',
      Markup.inlineKeyboard(buttons, {columns: 3}).oneTime().resize().extra()
    )
  })
  user_selection.action(/select:(.+)/, ctx => {
    const leave_this = msg => {
      return ctx.answerCbQuery()
      .then(() => ctx.scene.leave())
      .then(() => ctx.deleteMessage())
      .then(() => ctx.replyWithMarkdown(msg))
    }

    const index = find_account(ctx.match[1])
    if (index === -1) {
      return leave_this(`Failed to find account: \`${ctx.match[1]}\``)
    }

    const account = config.accounts[index]
    const code    = totp.generateAuthCode(config.accounts[index].secret)

    return leave_this(`2FA Code for \`${account.name}\`: \`${code}\``)
  })

  const bot   = new Telegraf(config.bot.token)
  const stage = new Stage()
  stage.command('cancel', ctx => {
    return ctx.reply('Canceled the current action!')
    .then(() => leave())
  })

  stage.register(user_selection)

  bot.use(session())
  bot.use(stage.middleware())
  bot.command('list', ctx => {
    if (find_admin(ctx) !== -1) {
      ctx.scene.enter('user-selection')
    }
  })

  bot.command('start', ctx => {
    const index = find_admin(ctx)
    if (index === -1) {
      return ctx.replyWithMarkdown(`Your Telegram id is: \`${ctx.from.id}\``)
    }
    ctx.replyWithMarkdown(`Welcome, \`${config.bot.admin[index].name}\``)
  })

  return bot
}

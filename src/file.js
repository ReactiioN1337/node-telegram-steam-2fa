"use strict"

const fs      = require('fs-extra')
const root    = require('app-root-path')
const Promise = require('bluebird')

module.exports = {
  read: filename => {
    return new Promise((resolve, reject) => {
      fs.readJson(root.resolve(filename), (err, obj) => {
        if (err) {
          return reject(err)
        }
        return resolve(obj)
      })
    })
  },
  write: (filename, obj) => {
    return new Promise((resolve, reject) => {
      fs.writeJson(root.resolve(filename), obj, {spaces: 2, EOL: '\n'}, err => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    })
  }
}

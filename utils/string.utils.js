const config = require('../config/application.config')
const mongoose = require('mongoose')

const badWordsRegex = config.regex.bannedWords.map(bannedWord => new RegExp(bannedWord, 'gi'))
const documentRegex = new RegExp('([0-9]{3}[.]?[0-9]{3}[.]?[0-9]{3}[-]?[0-9]{2})')
const emailRegex = /\S+@\S+\.\S+/

const checkBannedWord = string => badWordsRegex.some(badWord => badWord.test(string))

module.exports.validateEmail = string => {
  return emailRegex.test(string)
}

module.exports.randomStringGenerator = length => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

module.exports.removeSpecialChars = string => string.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')

module.exports.removeAccents = string => string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

module.exports.sanitizeUserName = string => string.replace(/[`~!@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '')

module.exports.extractNumbersFromString = string => string.replace(/[^0-9]/g, '')

module.exports.checkAllBadWords = string => {
  if (checkBannedWord(string) || documentRegex.test(string)) {
    return false
  }

  return true
}

module.exports.formatCurrency = value => {
  let val = (value / 1).toFixed(2).replace('.', ',')
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

module.exports.checkBannedWord = checkBannedWord

module.exports.isValidObjectId = string => string && string.length === 24 && mongoose.Types.ObjectId.isValid(string)

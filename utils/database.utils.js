module.exports.bannedHook = function () {
  this.where({ banned: false })
}

module.exports.softDeleteHook = function () {
  this.where({ disabled: false })
}

module.exports.updatedAtHook = function (next) {
  if (this._id) {
    this.updatedAt = Date.now()
  } else {
    this._update.$set = this._update.$set || {}
    this._update.$set.updatedAt = Date.now()
  }

  next()
}

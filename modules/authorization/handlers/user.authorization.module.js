const userPermissions = require('../permissions/user.permissions')
const { isHimselfOrAdmin } = require('../../../utils/authorization.utils')

const handlers = {
  [userPermissions.CAN_UPDATE]: isHimselfOrAdmin,
}

module.exports = handlers

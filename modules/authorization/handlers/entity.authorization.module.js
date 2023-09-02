/**
 * @description It's a general permission handler, we use this only when there's no need to use complex permissions.
 */
module.exports.canAccessEntity = (userRequesting, entityId) =>
	userRequesting._id.equals(entityId.userId) || userRequesting.role === 'admin'

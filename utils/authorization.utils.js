module.exports.isHimselfOrAdmin = (userRequesting, userRequested) =>
	userRequesting._id.equals(userRequested.id) || userRequesting.role === 'admin'

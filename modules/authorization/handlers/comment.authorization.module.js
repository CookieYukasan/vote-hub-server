const commentPermissions = require('../permissions/comment.permissions')
const Embed = require('../../../data/models/embed.model')

const handlers = {
	[commentPermissions.CAN_DELETE_COMMENT]: async (userRequesting, comment) => {
		if (userRequesting._id.equals(comment.userId) || userRequesting.role === 'admin') {
			return true
		}

		const embed = await Embed.findOne({
			_id: comment.embedId,
		})

		return userRequesting._id.equals(embed.userId)
	},
}

module.exports = handlers

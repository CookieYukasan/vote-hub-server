const { validateFields } = require('../utils/validation.utils')
const messages = require('../config/messages.config')
const { sentryCaptureException } = require('../modules/log/sentry.module')

module.exports = (rules, customMessages) => {
	return async (req, res, next) => {
		try {
			await validateFields(req.body, rules, customMessages)
			next()
		} catch (err) {
			if (err.message) {
				sentryCaptureException(err)
			}
			res.status(400).send({ message: err.errors ? err.errors : messages.random_error })
		}
	}
}

const Sentry = require('@sentry/node')
const config = require('../../config/application.config')

Sentry.init({
	dsn: config.sentry.trackingLink,
	tracesSampleRate: 1.0,
})

module.exports.sentryCaptureException = err => {
	if (!config.app.isDev) {
		return Sentry.captureException(err)
	}

	console.error(err)
}

module.exports.sentryCaptureExceptionAxios = err => {
	if(!config.app.isDev) {
		Sentry.setExtra('error', JSON.stringify(err))
		return Sentry.captureException(err)
	}

	console.error(err)
}

module.exports.getSentryInstance = () => Sentry
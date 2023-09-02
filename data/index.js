const fs = require('fs')
/**
 * Load all the models.
 */
const modelsPath = `${__dirname}/models`
fs.readdirSync(modelsPath).forEach(file => {
	if (file.indexOf('.js') !== -1) {
		require(`${modelsPath}/${file}`)
	}
})

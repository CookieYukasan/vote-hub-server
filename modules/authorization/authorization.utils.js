module.exports.getHandlerResponse = (handler, permission, ...args) =>
	permission && typeof handler[permission] === 'function' && handler[permission](...args)

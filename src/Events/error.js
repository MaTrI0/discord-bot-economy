const Event = require('../Classes/Handlers/Events')
class ErrorEvent extends Event {
	constructor() {
		super('error', false)
	}
	async execute({ stack }) {
		console.log(`[ERROR]`, stack)
	}
}
module.exports = ErrorEvent

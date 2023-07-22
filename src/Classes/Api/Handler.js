const { lstatSync, readdirSync } = require('node:fs')
const { join } = require('path')
const { Collection } = require('discord.js')
const path = require('path')

class Handler {
	constructor(client) {
		this.client = client
		this._commands = new Collection()
		this._events = new Collection()
	}

	#walkSync(dir, files = []) {
		if (!lstatSync(dir).isDirectory()) {
			files.push(dir)
			return files
		}
		readdirSync(dir).forEach(file => this.#walkSync(join(dir, file), files))
		return files
	}

	get events() {
		return (this._events = this.#walkSync(join(__dirname, `../../Events`)).map(
			file => new (require(file))()
		))
	}

	get commands() {
		this.#walkSync(join(__dirname, '../../Commands')).forEach(file => {
			if (path.extname(file) === '.js') {
				let command = new (require(file))()
				command.cmd.forEach(cmd => this._commands.set(cmd, command))
				console.log(`[HANDLER][COMMAND]`, `${command.cmd} is loaded`)
			}
		})
		return this._commands
	}
}

module.exports = { Handler }

const { MongoClient } = require('mongodb')
const { Handler } = require('../Api/Handler')

const { Client, REST, Routes } = require('discord.js')
const ConfigUtil = require('../Api/Config')

class EconomyClient extends Client {
	constructor(options) {
		super(options)
		this.mongoDb = new MongoClient('mongodb://0.0.0.0:27017')
		this.handler = new Handler(this)
		this.config = new ConfigUtil()
		this.token = this.config.TOKEN
		this.intervals = {}
	}

	async init() {
		await this.mongoDb
			.connect()
			.then(() => {
				console.log('\x1b[32m%s\x1b[0m', `[DATABASE] Connected to MongoDB`)
				return (this._database = this.mongoDb.db(this.config.MONGO_URI))
			})
			.catch(err =>
				console.log(
					'\x1b[31m%s\x1b[0m',
					`[DATABASE] Failed to connect to MongoDB`,
					err
				)
			)

		await this.getEvents()
			.then(() =>
				console.log('\x1b[32m%s\x1b[0m', `[HANDLER][EVENT] Events are loaded`)
			)
			.catch(error =>
				console.log('\x1b[31m%s\x1b[0m', `[HANDLER][EVENT]`, error)
			)

		await this.login()
			.then(() =>
				console.log(
					'\x1b[32m%s\x1b[0m',
					`[LOGIN] Logged as ${this.user.username}`
				)
			)
			.catch(error => console.log('\x1b[31m%s\x1b[0m', `[LOGIN]`, error))

		await this.register_commands()
	}

	async getEvents() {
		this.handler.events.forEach(event => {
			if (event.once) {
				this.once(event.name, (...args) => event.execute(...args, this))
				console.log('\x1b[34m%s\x1b[0m', `[EVENT] ${event.name} ✅`)
			} else {
				this.on(event.name, (...args) => event.execute(...args, this))
				console.log('\x1b[34m%s\x1b[0m', `[EVENT] ${event.name} ✅`)
			}
		})
	}

	async register_commands() {
		console.log(
			'\x1b[32m%s\x1b[0m',
			'[COMMAND_REGISTER] регистрация слэш комманд..'
		)

		const commands = []
		commands.push({
			name: 'admin-panel',
			description: 'панель управления ботом',
			options: [],
		})

		const rest = new REST({ version: 10 }).setToken(this.token)

		try {
			await rest.put(Routes.applicationCommands('1132386336058388510'), {
				body: commands,
			})
			console.log(
				'\x1b[32m%s\x1b[0m',
				'[COMMAD_REGISTER] регистрация слэш комманд завершена успешна!'
			)
		} catch (e) {
			console.log('\x1b[31m%s\x1b[0m', `[COMMAND_REGISTER] ${e}`)
			throw e
		}
	}

	get database() {
		return this._database
	}
}

module.exports = EconomyClient

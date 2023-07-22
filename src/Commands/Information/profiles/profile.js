const Command = require('../../../Classes/Handlers/Commands')
const {
	CommandInteraction,
	EmbedBuilder,
	AttachmentBuilder,
} = require('discord.js')

const EconomyClient = require('../../../Classes/Clients/EconomyClient')
const { createCanvas, loadImage, registerFont } = require('canvas')
const fs = require('fs')

const ConfigUtil = require('../../../Classes/Api/Config')
const Config = new ConfigUtil()

class ProfileCommand extends Command {
	constructor() {
		super(
			'profile',
			'информация о профиле пользователя',
			[],
			[],
			[],
			[Config.CommandType.SLASH],
			[Config.CommandCategory.SERVER],
			[]
		)
	}
	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @param { EconomyClient } client
	 */
	async execute(interaction, client) {
		try {
			const MemberDB = await client.database.collection('members')

			const DataMember = await MemberDB.findOne({
				member_id: interaction.member.id,
				guild_id: interaction.guild.id,
			})
			drawProfile(interaction.member, DataMember)
				.then(async () => {
					const file = new AttachmentBuilder(
						`../Commands/Information/profiles/profiles/${interaction.member.id}.png`,
						`${interaction.member.id}.png`
					)
					const embed = new EmbedBuilder()
						.setColor('#2f3136')
						.setTitle(`Профиль — ${interaction.user.username}`)
						.setImage(`attachment://${interaction.member.id}.png`)

					await interaction.reply({
						embeds: [embed],
						files: [file],
					})
				})
				.catch(err => {
					// console.log('\x1b[31m%s\x1b[0m', `[COMMAND] ${err}`)
					throw err
				})
		} catch (e) {
			// console.log('\x1b[31m%s\x1b[0m', `[COMMAND] ${e}`)
			throw e
		}
	}

	async componentListener(client, interaction) {}
}

function drawProfile(member, DataMember) {
	return new Promise(async (resolve, reject) => {
		if (member == undefined) reject(`**member** not specified`)
		const user_id = member.id

		let bg = `../Commands/Information/profiles/background.png`,
			av = `../Commands/Information/profiles/a.png`

		if (
			member.user.avatarURL({ format: 'jpg' }) != null &&
			member.user.avatarURL({ format: 'jpg' }) != undefined
		) {
			av = member.user.avatarURL({ format: 'jpg' })
		}

		let imageBg, imageLayouts, imageAvatar
		try {
			if (fs.existsSync(`./profiles/${user_id}.png`)) {
				fs.stat(
					`../Commands/Information/profiles/profiles/${user_id}.png`,
					function (err, stats) {
						let date = new Date(stats['mtime'])
						if (timeDifference(date, Date.now()) < 10) {
							resolve(true)
						}
					}
				)
			}

			imageBg = await loadImage(bg)
			console.log(imageBg)
			imageLayouts = await loadImage(
				`../Commands/Information/profiles/CanvasLayoutsWhites.png`
			)
			console.log(imageLayouts)
			imageAvatar = await loadImage(av)
			console.log(imageAvatar)
			if (!imageBg) throw Error('imageBG не загружен')
		} catch (err) {
			reject(err)
		}

		const canvas = createCanvas(640, 280)
		const context = canvas.getContext('2d')
		context.fillStyle = '#000'
		context.fillRect(0, 0, 640, 280)

		context.drawImage(imageBg, 0, 0, 640, 280)
		context.drawImage(imageLayouts, 0, 0, 640, 280)

		const canvasAvatar = createCanvas(106, 106)
		const contextAvatar = canvasAvatar.getContext('2d')
		contextAvatar.beginPath()
		contextAvatar.arc(106 / 2, 106 / 2, 106 / 2, 0, Math.PI * 2, true)
		contextAvatar.closePath()
		contextAvatar.clip()
		contextAvatar.drawImage(imageAvatar, 0, 0, 106, 106)
		contextAvatar.strokeStyle = '#fff'
		contextAvatar.stroke()
		context.drawImage(canvasAvatar, 18, 116, 106, 106)

		registerFont('../Commands/Information/profiles/beer-money12.ttf', {
			family: 'REX',
		})
		let str = member.nickname ? member.nickname : member.user.username
		title = str.replace('/', ' ')
		context.font = '14pt REX'
		context.fillStyle = '#000'
		context.fillText(title, 22, 253)
		context.fillStyle = '#fff'
		context.fillText(title, 22, 251)

		context.font = '26pt REX'
		context.fillStyle = '#000'
		context.fillText(DataMember.lvl, 235, 264)

		let MemberClan = 'Отсутствует'
		if (DataMember.clan) MemberClan = DataMember.clan
		context.font = '25pt REX'
		const clan = MemberClan
		context.fillStyle = '#000'
		context.fillText(clan, 320, 68)
		context.fillStyle = '#fff'
		context.fillText(clan, 320, 66)

		let MemberStatus = 'Отсутствует'
		if (DataMember.status) MemberStatus = DataMember.status
		context.font = '25pt REX'
		const status = MemberStatus
		context.fillStyle = '#000'
		context.fillText(status, 320, 130)
		context.fillStyle = '#fff'
		context.fillText(status, 320, 128)

		const minutes = Math.floor((DataMember.voiceTime / 1000 / 60) % 60)
		const hours = Math.floor(DataMember.voiceTime / 1000 / 60 / 60)
		context.font = '25pt REX'
		const string = `${hours} ч., ${minutes} м.`
		context.fillStyle = '#000'
		context.fillText(string, 320, 190)
		context.fillStyle = '#fff'
		context.fillText(string, 320, 188)

		let MemberMarry = 'Отсутствует'
		if (DataMember.marry) MemberMarry = DataMember.marry
		context.font = '25pt REX'
		const mary = MemberMarry
		context.fillStyle = '#000'
		context.fillText(mary, 320, 259)
		context.fillStyle = '#fff'
		context.fillText(mary, 320, 257)

		const buffer = canvas.toBuffer('image/png')
		fs.writeFileSync(
			`../Commands/Information/profiles/profiles/${user_id}.png`,
			buffer
		)
		resolve()
	})
}

function timeDifference(timestamp1, timestamp2) {
	let date1 = new Date()
	date1.setTime(timestamp1)
	let date2 = new Date()
	date2.setTime(timestamp2)

	let difference = date1.getTime() - date2.getTime()

	let dayDifference = Math.floor(difference / 1000 / 60 / 60 / 24)
	difference -= dayDifference * 1000 * 60 * 60 * 24

	let hoursDifference = Math.floor(difference / 1000 / 60 / 60)
	difference -= hoursDifference * 1000 * 60 * 60

	let minutesDifference = Math.floor(difference / 1000 / 60)

	return Math.abs(minutesDifference)
}

module.exports = ProfileCommand

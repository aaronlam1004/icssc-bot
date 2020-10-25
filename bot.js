const Discord = require("discord.js");
const bot = new Discord.Client();

const {websocRequest} = require("./WebSoc.js")

require('dotenv').config();
const config = require("./config.json");

bot.on("ready", () => {
	console.log("ICSSC bot started!!!");
});

bot.on("message", message => {
	var content = message.content.split(/ +/);
	if (content[0] === "<@!" + bot.user.id + ">") {
		if (content[1] == null) {
			message.reply(config.documentation);
		}
		else {
			switch(content[1])
			{
				case "$request":
					if (content[2] != null && Object.keys(config.channels).includes(content[2].toLowerCase())) {
						var roomName = message.author.username + "'s Room";

						var roomSettings = {
							type: "voice", 
							parent: config.channels[content[2]],
						};

						if (content[3] != null) {
							roomSettings.permissionOverwrites = [
								{
									id: message.guild.id,
									deny: ["CONNECT"]
								}
							]
							for (var i = 3; i < content.length; i++) {
								if (content[i].substring(0, 3) === "<@!") {
									roomSettings.permissionOverwrites.push({
										id: content[i].substring(3, content[i].length - 1),
										allow: ["CONNECT"]
									});
								}
							}
						}

						message.guild.channels.create(roomName, roomSettings).then(channel => {
							setTimeout(inactiveCheck, 15000, channel);
						});
						message.reply("Your room has been created. Please head into your room or else it will be deleted and you will have to request again. Just leave the room once your done and the room will be deleted on it's own.")
					}
					break;

				case "$flip":
					const flip = Math.random()
					if (flip < .5) {
						message.reply("Heads");
					}
					else {
						message.reply("Tails");
					}
					break;

				case "$rng":
					if (content[2] != null) {
						const num = parseInt(content[2]);
						message.reply(Math.floor(Math.random() * num - 1) + 1);
						break;
					}

				case "$websoc":
					var options = content.slice(2);
					var search = {};

					if (options.length > 1) {
						search.Dept = options.slice(0, options.length - 1).join(' ');

						if (search.Dept.toLowerCase() == "ics") {
							search.Dept = "I&C SCI";
						}
						if (search.Dept.toLowerCase() == "cs") {
							search.Dept = "COMPSCI";
						}

						search.Dept = search.Dept.toUpperCase();
						search.CourseNum = options[options.length - 1].toUpperCase();
					}

					if ("Dept" in search && "CourseNum" in search) {
						websocRequest(search).then((res) => {
							var s = ""
							var collect = false;
							var lines = res.split("\n");
							for (var i = 0; i < lines.length; i++) {
								if (lines[i][0] === search.Dept[0]) {
									collect = true;
								}
								if (collect) {
									if (lines[i] == "") {
										collect = false;
									}
									else {
										s += lines[i] + "\n";
									}
								}
							}
							while (s.length != 0) {
								message.channel.send("\`\`\`" + s.substring(0, 1994) + "\`\`\`");
								s = s.substring(1994);
							}
							message.channel.send("<@" + message.author.id + ">")
						});
					}
			}
		}
	}
});

function inactiveCheck(channel) {
	if (channel.members.size == 0) {
		channel.delete();
	}
	else {
		setTimeout(inactiveCheck, 5000, channel);
	}
}

bot.login(process.env.CLIENT_TOKEN);
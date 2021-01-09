const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");

const {websocRequest} = require("./WebSoc.js");
const {getLeaderboard} = require("./bitsbytes.js");
const bitsbytes = require("./bitsbytes.json");

require('dotenv').config();
const config = require("./config.json");

// When the bot is ready to run
bot.on("ready", () => {
    console.log("ICSSC bot started!!!");
});

// When the bot receives a message
bot.on("message", message => {
    var content = message.content.split(/ +/); // Split the contents of the message by spaces

    // If the first thing in the message is the  mention of the bot
    if (content[0] === "<@!" + bot.user.id + ">") {

        // If the entire content is just the bot mention
        if (content[1] == null) {
            message.reply(config.documentation);
        }
        else {
            switch(content[1])
            {
                // To make a class text channel (only applices to SCHOOL category)
                case "$class":
                    if (content[2] != null) {
                        var roomName = content[2];
                        var roomSettings = {
                            type: "text",
                            parent: config.channels["classrooms"]
                        };
                        message.guild.channels.create(roomName, roomSettings);
                        message.reply(`${roomName} has been created.`);
                    }
                    break;

                // To make a transient voice channel for study rooms (only applices to SCHOOL category)
                case "$study":
                    var roomName = message.author.username + "'s Study Room";

                    var roomSettings = {
                        type: "voice", 
                        parent: config.channels["classrooms"]
                    };

                    if (content[2] != null) {
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
                    break;

                // Get study break photos
                case "$break":
                    fs.readdir("./media/books", (err, books) => {
                        var bookIndex = Math.floor(Math.random() * Object.keys(books).length);
                        var book = "./media/books/" + books[bookIndex];
                        message.reply("You look like you could use a study break!", {files: [book]});
                    });
                    break;

                // Does a WebSoc request and gets the results back
                case "$websoc":
                    var options = content.slice(2);
                    var search = {};

                    if (options.length > 1) {
                        search.Dept = options.slice(0, options.length - 1).join(' ');

                        // Converts ics to I&C SCI
                        if (search.Dept.toLowerCase() == "ics") {
                            search.Dept = "I&C SCI";
                        }

                        // Converts cs to COMPSCI
                        if (search.Dept.toLowerCase() == "cs") {
                            search.Dept = "COMPSCI";
                        }

                        // Every other request needs to be specific WebSoc name (PHYSICS, MATH, etc.)

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
                    break;

                // Gets the Bits-and-Bytes leaderboard
                case "$leaderboard":
                    getLeaderboard((leaderboard) => {
                        var leaderboard = Object.entries(leaderboard).sort(([,a], [,b]) => b - a);
                        var ranking  = "";
                        for (var i = 0; i < leaderboard.length; i++) {
                            ranking += `${i + 1}. ${leaderboard[i][0]} (${leaderboard[i][1]})`;
                            if (i == 0) {
                                ranking += " :star:\n";
                            }
                            else {
                                ranking += "\n";
                            }
                        }

                        var leaderboard = new Discord.MessageEmbed();
                        leaderboard.setTitle("Bits-and-Bytes Temporary Leadeboard (not counted right and not including points for coming to events)");
                        leaderboard.setColor("#ff3333");
                        leaderboard.setDescription(ranking);
                        message.channel.send(leaderboard);
                    }); 

                    break;

                // Get a random waifu from a selection
                case "$waifu":
                    fs.readdir("./media/waifus", (err, waifus) => {
                        var index = Math.floor(Math.random() * Object.keys(waifus).length);
                        var waifu = waifus[index];
                        var waifuName = waifu.substring(0, waifu.length - 4)
                        message.reply(`Your current waifu is **${waifuName}**!`, {files: ["./media/waifus/" + waifu]});
                    });
                    break;

                // Get your BTS bias
                case "$bias":
                    fs.readdir("./media/bts", (err, members) => {
                        var index = Math.floor(Math.random() * Object.keys(members).length);
                        var bias = members[index];
                        var biasName = bias.substring(0, bias.length - 4)
                        message.reply(`Your current BTS bias is :star:**${biasName}**:star:!`, {files: ["./media/bts/" + bias]});
                    });
                    break;
                
                // Keep it a secret
                case "$secret":
                    if (message.member.voice.channel) {
                        message.member.voice.channel.join().then(connection => {
                            var dispatcher = connection.play("./media/shhh keep it a secret babe.mp3");
                            dispatcher.on("finish", () => {
                                dispatcher.destroy();
                                connection.disconnect();
                            });
                        });
                    }
                    else {
                        message.reply("You must be in a voice channel in order for this command to work.");
                    }
                    break;


                // Play Oregiaru openings randomly
                case "❤️":
                    var op = Math.floor(Math.random() * 3) + 1;
                    if (message.member.voice.channel) {
                        message.member.voice.channel.join().then(connection => {
                            var dispatcher = connection.play(`./media/Oregairu${op}.mp3`);
                            dispatcher.setVolume(0.5);
                            dispatcher.on("finish", () => {
                                dispatcher.destroy();
                                connection.disconnect();
                            });
                        });
                    }
                    else {
                        message.reply("You must be in a voice channel in order for this command to work.");
                    }
                    break;

                // Flip a coin
                case "$flip":
                    const flip = Math.random()
                    if (flip <= .5) {
                        message.reply("Heads");
                    }
                    else {
                        message.reply("Tails");
                    }
                    break;

                // Get a random number up to a user input
                case "$rng":
                    if (content[2] != null) {
                        const num = parseInt(content[2]);
                        const roll = Math.floor(Math.random() * (num - 1)) + 1;
                        message.reply(roll);
                    }
                    break;

                
            }
        }
    }
});

// Checks to see if there are any members in a voice channel
function inactiveCheck(channel) {
    if (channel.members.size == 0) {
        channel.delete();
    }
    else {
        setTimeout(inactiveCheck, 5000, channel);
    }
}

// Start the bot using the CLIENT_TOKEN
bot.login(process.env.CLIENT_TOKEN);
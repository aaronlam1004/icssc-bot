const Discord = require("discord.js");
const bot = new Discord.Client();

const {websocRequest} = require("./WebSoc.js");
const {getLeaderboard} = require("./bitsbytes.js");

require('dotenv').config();
const config = require("./config.json");
const bitsbytes = require("./bitsbytes.json");

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
            leaderboard.setTitle("Bits-and-Bytes Leaderboard");
            leaderboard.setColor("#ff3333");
            leaderboard.setDescription(ranking);
            message.channel.send(leaderboard);
          }); 

          break;
          
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
          break;

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
        
        case "$waifu":
          const waifus = {
            "Yukino Yukinoshita": "./media/waifus/Yukino.png",
            "Yui Yuigahama": "./media/waifus/Yui.png",
            "Iroha Isshiki": "./media/waifus/Iroha.png",
            "Shoko Nishimiya": "./media/waifus/Shoko.jpg",
            "Mio Natsume": "./media/waifus/Mio.jpg",
            "Ena Komiya": "./media/waifus/Komiya.jpg",
            "Mai Sakurajima": "./media/waifus/Mai.jpg",
            "An Amakasu": "./media/waifus/Amakasu.jpg"
          };
          var index = Math.floor(Math.random() * Object.keys(waifus).length);
          var waifu = Object.keys(waifus)[index];
          message.reply(`Your current waifu is **${waifu}**!`, {files: [waifus[waifu]]});
          break;

        case "$bias":
          var date = new Date();
          const BTS = {
            Jin: "./media/bts/Jin.jpg",
            Suga: "./media/bts/Suga.jpg",
            "J-Hope": "./media/bts/J-Hope.jpg",
            RM: "./media/bts/RM.jpg",
            Jimin: "./media/bts/Jimin.jpg",
            V: "./media/bts/V.jpg",
            Jungkook: "./media/bts/Jungkook.jpg"
          };
          var index = Math.floor(Math.random() * Object.keys(BTS).length);
          var stan = Object.keys(BTS)[index];
          message.reply(`Your current BTS bias is :star:**${stan}**:star:!`, {files: [BTS[stan]]});
          break;

        case "$flip":
          const flip = Math.random()
          if (flip <= .5) {
            message.reply("Heads");
          }
          else {
            message.reply("Tails");
          }
          break;

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

function inactiveCheck(channel) {
  if (channel.members.size == 0) {
    channel.delete();
  }
  else {
    setTimeout(inactiveCheck, 5000, channel);
  }
}

bot.login(process.env.CLIENT_TOKEN);

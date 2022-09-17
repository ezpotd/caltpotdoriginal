const {
    Client,
    IntentsBitField,
    Partials
} = require('discord.js');
const helper = require("./helper.js")
const cron = require("node-cron")
const myIntents = new IntentsBitField(32767);
const client1 = new Client({
    intents: myIntents,
    'partials': [Partials.Channel]
});
async function sendpotd() {
    client1.channels.fetch('1020143932467843142').then(channel => helper.rpotd(helper.getdate()).then(response => {
        if (response != null) {
            channel.send(response.image)
        } else {
            channel.send("The PoTD will be late.")
        }
    }));
}
client1.on('messageCreate', async message => {
            if (!message.author.bot) {
                if (message.content.slice(0, 5) == ";rank") {
                    helper.getrank(message.author.id).then(rank => {
                            if (!(rank === null) {
                                    helper.getpoints(message.author.id).then(points => {
                                        message.reply("You have " + points.points + " points and are ranked at rank " + rank + ".")
                                    })
                                }
                            })
                    }

                    if (message.content.slice(0, 8) == ";setpotd" && (message.author.id == "706270994616156231" || message.author.id == "817492484409524235" || message.author.id == "808401180980019211" || message.author.id == "785522377676554242")) {
                        const args = message.content.split(" ");
                        if (isNumeric(args[1]) && isNumeric(args[3]) && isNumeric(args[5])) {
                            helper.addpotd(parseInt(args[1]), args[2], parseInt(args[3]), args[4], parseInt(args[5])).then(message.reply("Set."));
                        } else {
                            message.reply("Invalid syntax.");
                        }
                    }

                    if (message.content.slice(0, 5) == ";give" && (message.author.id == "706270994616156231" || message.author.id == "817492484409524235" || message.author.id == "808401180980019211" || message.author.id == "785522377676554242")) {
                        const args = message.content.split(" ");
                        if (isNumeric(args[2])) {
                            helper.addpoints(message.author.id, parseInt(args[2])).then(response => {
                                message.reply("They now have " +
                                    response.points + " points.")
                            });
                        }
                    }

                    if (message.content.slice(0, 6) == ";reset" && (message.author.id == "706270994616156231" || message.author.id == "817492484409524235" || message.author.id == "808401180980019211" || message.author.id == "785522377676554242")) {
                        helper.sreset();
                    }


                    if (message.channel.type == 1) {
                        if (isNumeric(message.content)) {
                            if (!(1 == await helper.tries(message.author.id).then(response => {
                                    if (response === null) return 0;
                                    return response.success
                                }))) {
                                if (0 == await helper.rpotd(helper.getdate()).then(response => {
                                        return response.answer - message.content
                                    })) {
                                    helper.correct(message.author.id).then(multiplier => {
                                        helper.rpotd(helper.getdate()).then(potd => {
                                            helper.addpoints(message.author.id, multiplier.attempts * potd.points / 5);
                                            message.reply("Correct! You recieved " + multiplier.attempts * potd.points / 5 + " points.");
                                        })
                                    })
                                } else {
                                    helper.preload(message.author.id).then(() => {
                                        helper.tries(message.author.id).then(response => {
                                            message.reply("Wrong. You have " + response.attempts % 5 + " attempts remaining.")
                                        })
                                    });
                                }
                            } else {
                                message.reply("You cannot answer the POTD.");
                            }
                        }
                    }

                }
            });

        cron.schedule('0 19 * * *', () => {
            sendpotd();
            helper.clear();
        });


        client1.login(process.env['token']);


        function isNumeric(str) {
            if (typeof str != "string") return false
            return !isNaN(str) && !isNaN(parseFloat(str))
        }

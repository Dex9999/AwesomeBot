import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import smashSchema from '../../models/smash-schema';
import axios from "axios";

const username = 'MDZH231'
const key = 'nGtb7EGLXq3xAG6Y2VYNYCLwfTWDeYR0VsPWJYQ3'

// const username = 'Dex999999999'
// const key = 'HweiPosMkFdwlcXLLaVEMgd5z3zqPevM7ZBvGp2K'

export default {
    
    category: 'Smash',
    description: 'Fetches smash tournament stats, if no arguments, shows current tourney',

    slash: false,
    testOnly: false,

    callback: async ({ message, args }) => {
        message.channel.sendTyping()
        // if(args.length > 0 && parseInt(args[0]) == NaN){
        //     return "you can't input text"
        // }
        await axios.get(`https://${username}:${key}@api.challonge.com/v1/tournaments.json`)
            .then(async (res) => {
                var doc = await smashSchema.findOne( { discNick: 'current tourney' } )

                if(args.length > 0 || doc != null){
                var tourney: number = doc.discordID
                if(args.length > 0){
                    if(parseInt(args[0]) != NaN){
                        var tourney: number = (parseInt(args[0]))
                    }
                }
                
                
                console.log('RES:', res.data[tourney])
                const tourneyID = res.data[tourney].tournament.id
                const embed = new MessageEmbed()
                    .setTitle('Tournament: ' + res.data[tourney].tournament.name)
                    .setDescription(res.data[tourney].tournament.description)
                    .setColor('ORANGE')
                    //.setFooter(message.member?.displayName!)
                message.reply({
                    embeds:  [embed]
                })
                message.channel.sendTyping()
                await axios.get(`https://${username}:${key}@api.challonge.com/v1/tournaments/${tourneyID}/participants.json`)
                .then(async (res) => {
                console.log('P_RES:', res.data)
                console.log('P_RES:', res.data.length)
                //try to make it find the amount of participants and do a for loop to create the fields of participants names
                const embed = new MessageEmbed()
                    .setTitle('Participants: ')
                    .setColor('ORANGE')
                    //.setFooter(message.member?.displayName!)
                for (var _i = 0; _i < res.data.length; _i++) {
                    var person = await smashSchema.findOne( { challongeID: { $in: res.data[_i].participant.id}  } ).exec()
                    if(person.heroes != null){
                        embed.addField(res.data[_i].participant.name, 'Main(s): ' + person.heroes)
                    }else{
                        embed.addField(res.data[_i].participant.name, 'ID: ' + res.data[_i].participant.id)
                    }
                }
                
                message.reply({
                    embeds:  [embed]
                })
                message.channel.sendTyping()
                    await axios.get(`https://${username}:${key}@api.challonge.com/v1/tournaments/${tourneyID}/matches.json`)
                    .then(async (res) => {
                        const matchEmbed = new MessageEmbed()
                        .setTitle('Matches: ')
                        .setColor('ORANGE')
                        //.setFooter(message.member?.displayName!)
                        for (var _i = 0; _i < res.data.length; _i++) {
                            console.log(res.data[_i].match)
                            var person1 = await smashSchema.findOne( { challongeID: { $in: res.data[_i].match.player1_id}  } ).exec()
                            var person2 = await smashSchema.findOne( { challongeID: { $in: res.data[_i].match.player2_id}  } ).exec()
                        console.log(person1, person2)
                        if(res.data[_i].match.winner_id != null){
                        if(person1 != null && person2 != null){
                        if(res.data[_i].match.winner_id == res.data[_i].match.player1_id){
                            var p1: string = '__'+person1.challongeNick+'__'
                            var p2: string = person2.challongeNick
                        } else {
                            var p1: string = person1.challongeNick
                            var p2: string = '__'+person2.challongeNick+'__'
                        }
                            if(res.data[_i].match.round < 0){
                                matchEmbed.addField("Loser's Round: "+ Math.abs(res.data[_i].match.round) +'\n'+'Match: ' + (_i + 1), p1 + ' vs ' + p2)
                            }else{matchEmbed.addField('Round: '+ res.data[_i].match.round +'\n'+'Match: ' + (_i + 1), p1 + ' vs ' + p2)}
                        }
                        else{matchEmbed.addField('Match: ' + (_i + 1), 'one of the players ids are not in the database')}
                        } else{
                        if(person1 != null && person2 != null){
                            if(res.data[_i].match.round < 0){
                                matchEmbed.addField("Loser's Round: "+ Math.abs(res.data[_i].match.round) +'\n'+'Match: ' + (_i + 1), person1.challongeNick + ' vs ' + person2.challongeNick)
                            }else{matchEmbed.addField('Round: '+ res.data[_i].match.round +'\n'+'Match: ' + (_i + 1), person1.challongeNick + ' vs ' + person2.challongeNick)}
                        }
                        else{matchEmbed.addField('Match: ' + (_i + 1), 'one of the players ids are not in the database')}
                        }
                        }
                        message.reply({
                            embeds:  [matchEmbed]
                        })
                    })
                    .catch((err) => {
                        console.error('ERR:', err)
                    })
            })
            .catch((err) => {
                console.error('ERR:', err)
            })
        
        } else{
            const embed = new MessageEmbed()
                    .setTitle('Tournaments: ')
                    .setColor('ORANGE')
                    //.setFooter(message.member?.displayName!)
                    //add matches!!! mb numbers reaction
                    for (var _i = 0; _i < res.data.length; _i++) {
                        embed.addField(res.data[_i].tournament.name, 'Simple ID: ' + _i)
                    }
                    message.reply({
                        embeds:  [embed]
                    })
        }
            })
            .catch((err) => {
                console.error('ERR:', err)
            })
            
        
    }
} as ICommand

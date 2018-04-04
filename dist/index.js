'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _discord = require('discord.js');

var Discord = _interopRequireWildcard(_discord);

var _lodash = require('lodash');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

const usage = `Usage:
const bot = new DiscordSimpleBot({
  debug: boolean, // Log BotActions into console
  token: string, // Token for Auth
});
`;

class DiscordSimpleBot {

  // inner state

  // discord.js client
  constructor(config) {
    this.isClientStarted = false;
    this.commands = [];

    this.handleMessage = message => {
      // No support other message channels yet (DMs? GroupDMs?)
      if (message.channel.type !== 'text' || !message.channel.guild) {
        return message.channel.send('Questions? Ping me on http://twitter.com/iam4x');
      }

      this.commands.forEach(command => {
        // accept `!foo` `!foo xxx xxx`
        const triggerMatchRegex = new RegExp(`^(!)?${command.trigger}($| .+$)`);
        if (
        // not matching server restriction
        // $ExpectError
        command.server && message.channel.guild.name !== command.server ||
        // not matching channel restriction
        command.channel && message.channel.name !== command.channel ||
        // not matching trigger
        !triggerMatchRegex.test(message.content)) {
          return;
        }

        // command.action is a function, run it
        if ((0, _lodash.isFunction)(command.action)) {
          var _message$content$spli = message.content.split(' '),
              _message$content$spli2 = _toArray(_message$content$spli);

          const args = _message$content$spli2.slice(1);

          // $FlowFixMe


          command.action({
            args,
            author: message.author,
            reply: answer => message.channel.send(answer)
          });
        }

        // command.action is a string, respond directly
        if ((0, _lodash.isString)(command.action)) {
          message.channel.send(command.action);
        }
      });

      return undefined;
    };

    if (!config || !(0, _lodash.isPlainObject)(config)) {
      throw new Error(usage);
    }

    this.clientConfig = config;
    this.client = new Discord.Client(config);

    // log debug messages
    if (config.debug) {
      this.client.on('ready', () => console.log(`Loggin in as ${this.client.user.tag}`));
    }

    // listen for messages
    this.client.on('message', this.handleMessage);

    // login bot on next tick
    setTimeout(() => this.start());
  }

  on(eventName, callback) {
    if (!eventName || !callback) {
      throw new Error('Usage: bot.on(eventName, callback)');
    }

    this.client.on(eventName, callback);
  }

  start() {
    if (!this.isClientStarted) {
      this.client.login(this.clientConfig.token);
      this.isClientStarted = true;
    }
  }

  registerAction(command) {
    if (!this.commands.find(c => c.trigger === command.trigger) && ((0, _lodash.isString)(command.action) || (0, _lodash.isFunction)(command.action))) {
      this.commands.push(command);
    } else {
      throw new Error('Usage: bot.registerAction({ trigger, action })');
    }
  }

}

exports.default = DiscordSimpleBot;
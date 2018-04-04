/* @flow */

import * as Discord from 'discord.js';
import { isPlainObject, isString, isFunction } from 'lodash';

import type { Client, Message } from 'discord.js';

type SimpleBotConfig = {
  token: string,
  debug?: boolean,
};

type Command = {
  trigger: string,
  action:
    | string
    | (({
        author: { username: string },
        args: string[],
        reply: Function,
      }) => *),
  channel?: string,
  server?: string,
};

const usage = `Usage:
const bot = new DiscordSimpleBot({
  debug: boolean, // Log BotActions into console
  token: string, // Token for Auth
});
`;

class DiscordSimpleBot {
  // discord.js client
  client: Client;
  clientConfig: SimpleBotConfig;

  // inner state
  isClientStarted: boolean = false;
  commands: Command[] = [];

  constructor(config: SimpleBotConfig) {
    if (!config || !isPlainObject(config)) {
      throw new Error(usage);
    }

    this.clientConfig = config;
    this.client = new Discord.Client(config);

    // log debug messages
    if (config.debug) {
      this.client.on('ready', () =>
        console.log(`Loggin in as ${this.client.user.tag}`)
      );
    }

    // listen for messages
    this.client.on('message', this.handleMessage);

    // login bot on next tick
    setTimeout(() => this.start());
  }

  on(eventName: string, callback: Function) {
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

  registerAction(command: Command) {
    if (
      !this.commands.find(c => c.trigger === command.trigger) &&
      (isString(command.action) || isFunction(command.action))
    ) {
      this.commands.push(command);
    } else {
      throw new Error('Usage: bot.registerAction({ trigger, action })');
    }
  }

  handleMessage = (message: Message) => {
    // No support other message channels yet (DMs? GroupDMs?)
    if (message.channel.type !== 'text' || !message.channel.guild) {
      return message.channel.send(
        'Questions? Ping me on http://twitter.com/iam4x'
      );
    }

    this.commands.forEach(command => {
      // accept `!foo` `!foo xxx xxx`
      const triggerMatchRegex = new RegExp(`^(!)?${command.trigger}($| .+$)`);
      if (
        // not matching server restriction
        // $ExpectError
        (command.server &&
          (message.channel: any).guild.name !== command.server) ||
        // not matching channel restriction
        (command.channel && message.channel.name !== command.channel) ||
        // not matching trigger
        !triggerMatchRegex.test(message.content)
      ) {
        return;
      }

      // command.action is a function, run it
      if (isFunction(command.action)) {
        const [, ...args] = message.content.split(' ');

        // $FlowFixMe
        command.action({
          args,
          author: message.author,
          reply: (answer: any) => message.channel.send(answer),
        });
      }

      // command.action is a string, respond directly
      if (isString(command.action)) {
        message.channel.send(command.action);
      }
    });

    return undefined;
  };
}

export default DiscordSimpleBot;

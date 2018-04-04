# 🤖 Simple Discord bot

> JavaScript/Node.js library to create simple answer bots for [Discord](https://discordapp.com/) messaging app
> **This library is not production bullet-proof ready, use at your own risk**

![Simple Discord Bot](https://media.giphy.com/media/l2S2z0CDcVsgfyuOZg/giphy.gif)

* `$ npm install -S simple-discord-bot` OR
* `$ yarn add simple-discord-bot`

## Requirements

* Nodejs v6
* A discord bot token ([guide how to get one](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token))

## Usage

### Create your bot instance

First, you will need to create your bot instance aka login to the bot.

```js
const DiscordSimpleBot = require('simple-discord-bot');
const bot = new DiscordSimpleBot({ token: 'XXXX' });
```

### Register a simple answer

Then you can create actions, theses actions will react to a message sent by a user. You can filter actions to trigger them only on a specified channel or a server.

Let's create a simple action, the ping request:

```js
bot.registerAction({
  trigger: 'ping',
  action: 'pong'
});
```

> Writing `ping` or `!ping` in the channel where the bot is present will trigger the action.

### Register an action with a function

For more complex operations you can register a function to your action:

```js
bot.registerAction({
  trigger: 'hi',
  action: function(params) {
    // params = {
    //   author: {},
    //   args: string[],
    //   reply: Function
    // }
    reply(`Welcome ${params.author.username}! How are you?`);
  }
});
```

### Register an action accepting arguments

Most of the time you want user to interact with the bot by providing options, it's easy to do it:

```js
bot.registerAction({
  trigger: 'weather',
  action: function(params) {
    const city = params.args[0];
    if (!city) return reply('Usage: !weather Paris');

    [...]

    reply(`The temperature in ${city} is ...`);
  }
});
```

## API

### `new DiscordSimpleBot(SimpleBotOptions)`

```js
SimpleBotOptions = {
  token: 'XXXX' // Secret bot token
}
```

### `registerAction(Action)`

```js
Action = {
  trigger: string // Message (with or without prefix '!') to match
  action: string | ActionFunction // Action to start on when trigger match
}

ActionFunction = function(params) {
  // params = {
  //   author: { username: string },
  //   args: string[],
  //   reply: Function
  // }
}
```

## TODO

* [ ] Spam protection
* [ ] Documentation on how to make great messages
* [ ] Support of attachment in answers
* [ ] Ideas? Create an issue!

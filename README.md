#### Relation

### Todo
- more drivers
- migrations support
- more cli tools

Relation takes inspiration from knex and sequelize, but the end goal to to completely mimick Laravel's Eloquent package. In order to achieve the best syntax possible, we are using ES6 Proxies, which is now supported in the latest version of node. Currently, only mysql is supported, but adding a new driver is trivial.

## Why this over xyz?

Read [this wiki page](https://github.com/navjobs/relation/wiki/Comparison-with-other-ORMs---Query-Builders) for why this is better than knex and sequelize. The gist is this: syntax, and lazy loading relationships.

```
npm install relation --save

//if using mysql driver
npm install mysql --save
```

### Setup

You must set the following environment variables in your app. We recommend creating a `.env` file and using [dotenv](https://github.com/motdotla/dotenv)

```
DB_DRIVER=mysql
DB_HOST=localhost
DB_USERNAME=test
DB_PASSWORD=secret
DB_NAME=blah
```

### Create a Model

`chat.js`

```js
import { Model } from 'relation'

export default class Chat extends Model {

  /*
  overwrite table name, this function is optional

  static tableName() {
    return 'dashboard_chats'
  }
  */
}


```

### Using the Model

As long as the plural version of the model is available in the database (you can overwrite this), you can query the database.

```js
import Chat from './chat'

async function getChats {
  let chats = await Chat.all()
  console.log(chats)
}
```

#### Supported methods

- `.all()` returns everything in the table
- `.where({ fieldName: 'value' })` returns any matching results
- `.create({ field: 'value'})` create a new row
- `.update({ field: 'value',primaryKey:'value'})` update an existing row
- `.createOrUpdate({ field: 'value',primaryKey:'value'})` create if not exists, or update an existing row
- `.select('column', 'column2')` contrain rows to select
- `.first()` returns first results
- `.limit(5)` limits the query

### Query Building

```js

Chat.select('messages', 'id').where({ messages: 'blah' }).get()

Chat.where({ messages: 'blah' }).get()

Chat.select('messages').first()

Chat.where({ messages: 'blah' }).limit(2).get()


```

### Relationships

This is a huge WIP, feel free to contribute :)

Supported:
- One To One
- One To Many

Todo:
- Many To Many
- Has Many Through
- Polymorphic Relations
- Many To Many Polymorphic Relations

#### One to One Example

```js
import { Model } from 'relation'


export default class User extends Model {

}

export default class Chat extends Model {
  user() {
    return this.hasOne(User)
  }
}

let chat = await Chat.first()

//any relationship will return a promise with the result
let user = await chat.user

expect(user.name).to.be.equal('Bob')

```

#### One to Many Example

```js
import { Model } from 'relation'


export default class User extends Model {
  chats() {
    return this.hasMany(Chat)
  }
}

export default class Chat extends Model {

}

let user = await User.first()

//has many results return a query builder instance
let chats = await user.chats.first()


```

### Migrations

Will go over this soon...

### CLI

If you install relation globally (`npm install relation -g`) you can access the CLI methods to help create migrations, models, etc.

#### Migrations

`relation make:migration User -m` -m will create a model as well

This will create a migration file that will allow you to build out tables.

#### Models

`relation make:model User`

Creates a file in your current directory `/models/user.js` with a default model

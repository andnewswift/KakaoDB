# KakaoDB

A simple and efficient DB module for chatbot development.

KT 9.0.0 is native supported.

note: this project is currently in alpha state, it might be unstable or lacking features.

<img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/CC-BY-NC-SA.svg" width="128">


### Prerequisites

```
ROOTED device
MessengerBot R (with API2, recommended)
```

## Documentation

### initialize

```js
const modules = require('index');
const kakaoDB = new modules.KakaoDB();
```

### example

```js
kakaoDB.index();
//10000 <= returns current chat_logs row count

kakaoDB.get('chat_logs')
//[object Object] <= returns last row of chat_logs table in JSON format

kakaoDB.get('chat_logs').msg
//"안녕하세요!"

kakaoDB.get('chat_logs', 10000);
//[object Object] <= returns 10000th row of chat_logs table in JSON format

kakaoDB.get('chat_logs', '1234567890123456789', {
    id: 'id'
});
//[object Object] <= returns chat_logs row with id=1234567890123456789 in JSON format

kakaoDB.get(null, null, {
    query: 'SELECT * FROM chat_logs WHERE id = 1234567890123456789'
});
//[object Object] <= returns chat_logs row with id=1234567890123456789 in JSON format

kakaoDB.get(null, null, {
    query: 'SELECT * FROM chat_logs WHERE user_id = 123456789',
    range: [3/*, true*/] //if true added, it will return last matching rows in descending orders instead of first
});
//[[object Object],[object Object],[object Object]] <= returns first 3 JSON in array format
```

### table list
| table name | default key | location |
| --- | --- | --- |
| chat_logs | _id | DB1 |
| friends | id | DB2 |
| chat_rooms | id | DB1 |
| open_link | id | DB2 |


### JSON structure

Since decrypting / parsing impacts performance,
getter is used to calculate key values just-in-time.

```js
#data = {
    __reference__: {},
    __primitive__: {},
    __props__: {},
    get __data__() {
        for (let i in this.__primitive__) this[i];
        return this.__reference__;
    }
};
```

So, it's not recommended to call unused keys.

If you want to batch print all keys, use ``__data__`` key.

```js
JSON.stringify(kakaoDB.get('chat_logs').__data__, null, 4);

/*
{
    "v": {
        "notDecoded": false,
        "origin": "MSG",
        "c": "01-23 01:23:45",
        "isSingleDefaultEmoticon": false,
        "defaultEmoticonsCount": 0,
        "isMine": false,
        "enc": 30
    },
    "_id": 12345,
    "id": "1234567890123456789",
    "type": 1,
    "chat_id": "123456789012345",
    "user_id": "123456789",
    "message": "~~~",
    "attachment": "null",
    "created_at": 1234567890,
    "deleted_at": 0,
    "client_message_id": 123456789,
    "prev_id": "1234567890123456788",
    "referer": "0",
    "supplement": null
}
*/
```

### ETC

Preset for advanced users: kakao-db/preset.js
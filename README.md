Maestro is a cloud management tool with a mongodb-like feel

## Maestro API

### maestro(options)

```javascript
var maestro = require("maestro").connect({
  groups: {
    "rabbitmq": {"group": "rabbitmq"}
  }
});
```


### maestro.group(name, query)

Defines a group of servers based on a search query

```javascript
var rabbitGroup = maestro.group("rabbitmq", {"name":"rabbitmq"});
```

### maestro.getServer(query, options, callback);

Finds a server.

  - `query` - query for a given server
  - `options` (optional)
    - `create` - create if a server cannot be found
    - `ping` - ping this IP to find the best server

```javascript
maestro.getServer({ name: "windows-7", host: "ec2-east" }, { ping: reqIp }, function(err, server) {
  
});
```

### maestro.runCommand(query, command, options, callback);

runs a command against the given servers

  - `query` - the server search query
  - `command` - the command to run against the servers
  - `options` (optional)
    - `limit` - max number of servers to invoke against

```javascript
maestro.runCommand({ createdAt: Date.now() }, { "shutdown": 1 });
```

### group.algorithm(type)

  - `type` - type of algorithm when selecting servers
    - `roundRobin` -
    - `leastConn` - grab the server that's least busy (default)

### group.autoScale(options)

auto-scales group of servers

  - `options`
    - `max` - max number of servers to auto scale
    - `algo` - type of algorithm: machine learning is defualt

### group.watch(query, listeners, delay);

Watches for any changes that might occur with any servers

```javascript

group.watch({ name: "mongodb", "status.cpu": { $gt:60 } }, {
  "shutdown": function() {
    //handle on shutdown
  },
  "destroy": function() {
  },
  "startup": function() {
  },
  "reboot": function() {
  },
  "statusChange": function(event) {
    group.createServer();
  }
});

//shutdown a server if it's been idle for more than 10 minutes
group.watch({ name: "mongodb", "status.cpu": { $lt: 10 }}, {
  "statusChange": function(server) {
    server.shutdown();
  }
}, 1000 * 60 * 10);
```


## Server (Performer) API

### server.getStatus(callback)

returns current status about the given server.

### server.shutdown(callback)

sends shutdown signal

### server.destroy(callback) 

destroys the server

### server.startup(callback)

starts up the server

### server.reboot(callback)

reboots the server

### server.numConnections

the number of physical connections to the server


## Perfomer Client API

### maestro.addServer(options, callback);

adds a server to maestro

  - `options` - options needed for adding the server
    - `secret` - the secret key used to add the server
    - `info` - the information about the server including the name
      - `name` 
      - `status`

### maestro.updateServer(query, update, onUpdate)

Updates maestro on the server status


    





      
      
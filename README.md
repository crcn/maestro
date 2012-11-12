Maestro is a cloud management tool with a mongodb-like feel

## Maestro API

### maestro(options)

### maestro.group()

Defines a group of servers

```javascript
var rabbitGroup = maestro.group("rabbitmq");
```

### group.getServer(query, options, callback)

Finds a server.

  - `query` - query for a given server
  - `options` (optional)
    - `create` - create if a server cannot be found
    - `ping` - ping this IP to find the best server

```javascript
maestro.getServer({ name: "windows-7", host: "ec2-east" }, { ping: reqIp }, function(err, server) {
  
});
```

### group.runCommand(query, command, options, callback);

runs a command against the given servers

  - `query` - the server search query
  - `command` - the command to run against the servers
  - `options` (optional)
    - `limit` - max number of servers to invoke against

```javascript
group.runCommand({ createdAt: Date.now() }, { "shutdown": 1 });
```

### Server (Performer) API

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



      
      
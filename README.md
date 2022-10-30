<div align="center">
  <h1>
    <br/>
      bunyan-gelf
    <br />
  </h1>
    <sup>
    <a href="https://www.npmjs.com/package/bunyan-gelf">
      <img src="https://img.shields.io/npm/v/bunyan-gelf.svg" alt="npm package" />
    </a>
    <a href="https://www.npmjs.com/package/bunyan-gelf">
      <img src="https://img.shields.io/npm/dt/bunyan-gelf.svg" alt="npm downloads" />
    </a>
  </sup>
</div>

Bunyan stream to send logs in GELF format to GELF related log collecting services).


Installation
------------

With yarn:
```
yarn add bunyan-gelf
```

With npm:
```
npm install bunyan-gelf
```

Example
-------
For more information about bunyan streams read the official bunyan [documentation](https://github.com/trentm/node-bunyan#streams).


```javascript
const bunyan = require('bunyan');
const BunyanToGelfStream = require('bunyan-gelf');

const streams = [{
 type: 'raw',
 stream: new BunyanToGelfStream({
   host: 'log-service.example', // GELF related service url (without any protocol)
   port: 9999,
   protocol: 'tcp', // Supported: 'tcp' and 'udp' (default: 'udp')
 }),
}];

const Logger = bunyan.createLogger({
  name: 'myapp',
  streams,
  serializers: bunyan.stdSerializers,
});

module.exports = Logger;
```

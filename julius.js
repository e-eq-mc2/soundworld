var net = require('net');

class Julius {
  constructor() {
  }

  connect(port, host, callback = () => {}) {
    this.port = port
    this.host = host

    this.client = net.createConnection(port, host, function() {
      callback();
    });
  }

  resume() {
    this.client.write("RESUME\n")
  }

  terminate() {
    this.client.write("TERMINATE\n")
  }

  pause() {
    this.client.write("PAUSE\n")
  }


  status() {
    this.client.write("STATUS\n")
  }

  version() {
    this.client.write("VERSION\n")
  }


  data (callback) {
    let res = ""
    this.client.on('data', (data) => {
      const parts = data.toString().split(/\.\n/)

      parts.forEach( (part) => {
        if(  part == '' ) {
          let score = 0
          let words = ""
          res.split(/\n/).forEach( (line) => {
            const ms = line.match(/SCORE="(.*?)"/)
            if ( ms ) {
              score = parseFloat(ms[1])
            }

            const mw = line.match(/WORD="(.*?)"/)
            if( mw ) {
              const word = mw[1]
              if ( word ) words += word
            }
          })

          if( words.length > 0 ) callback(words, score, res) 
          res = ""
        } else {
          res += part 
        }
      })
    });
  }

  end(callback = function(){}) {
    client.on('end', () => {
      console.log('disconnected.');
    });
  }
}

module.exports = Julius

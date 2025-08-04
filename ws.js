var ws = require('ws');
var https = require('https');
var fs = require('fs');

var processRequest = function( req, res ) {
    res.setHeader("Location", redirectUrl);
    res.statusCode = 302;
    res.end();
};


var options = {
    key : fs.readFileSync('./app/Certificate/key.pem'),
    cert : fs.readFileSync('./app/Certificate/cert.pem'),
};

var cometApp = https.createServer(options, processRequest).listen(4433, function() {
    console.log('Comet server [WSS] on *:4433');
});

var cometServerOptions = {
    server: cometApp,
    verifyClient: function(request) {
//      Some client verifying
        return true;
    }
};

var cometServer = new ws.Server(cometServerOptions);

cometServer.on('connection', function(socket) {
    socket.on('message', function(data) {
        console.log('New message received : ' + data);
    });
});
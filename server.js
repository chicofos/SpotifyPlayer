var express = require('express');
var http = require('http');
var app = express();
var port = process.env.PORT || 3000;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config');

//socket.io
// var server = http.createServer(app);
// var io = require('socket.io').listen(server);

//view engine
app.engine('.html', require('ejs').__express);

//configuration
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes
var routes = require('./routes')(app);
// require('./realtime')(server);


app.listen(port, () =>{
    console.log(` Server running on port ${port}`);
});
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = require('http').Server(app);

let data = [];
let monthly_stats;
let total_requests_number = 0;
let recent_credentials = null;
let currentIp = "";
// Models
const Watcher = require("./helpers/Watcher");
let watchers = [];
let blockedIps = [];

// MYSQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'honeypot_db'
});

connection.connect();

connection.query('SELECT * from request', function (error, results, fields) {
	if (error) throw error;
	results.forEach(row => {
		blockedIps[row.ip] = row.ip;
	});
});

// connection.end();
// END MYSQL

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	let item = {
		'ip': formatIpAddress(req.ip),
		'service': req.protocol,
		'request': req.method + ' ' + req.originalUrl,
		'http_request_path': req.originalUrl,
		'request_headers': formatHeaders(req.headers)
	};
	// var date = new Date() 
	let request = {
		'ip': item.ip,
		'service': item.service,
		'request': item.request,
		'user_agent': item.request_headers,
		'http_request_path': item.http_request_path
	};
	// BRUTE FORCE DETECTION
	// jika ip address bukan localhost or serverIP
	let serverIP = '192.168.43.225'
	if (item.ip != "::1" && item.ip != "localhost" && item.ip != serverIP) {
		// let honeypotRoute = "/login"
		if(request.request == "POST /login"){
			currentIp = item.ip
			watch(item.ip, request)
		}
	}
	next()
});

async function watch(ip, request){
	if(watchers[ip] == undefined){
		const w = new Watcher(ip, 0, request)
		watchers[ip] = w
	}
	watchers[ip].pool += 1
	await hold(ip);
}

function hold(ip){
	setTimeout(()=>{
		if(watchers[ip] != undefined && watchers[ip].pool > 2){		// 2 IS CONSTRAINT (TOLERANCE) REQUEST TO SERVER
			console.log("[SERVER]: Hey this IP, " + ip + " is suspicious. I'am saving this IP." )
			if(blockedIps[ip] == ip){
				console.log("IP address already saved")
			}else{
				// simpan d tabel
				connection.query('INSERT INTO request SET ?', watchers[ip].request, function (error, results, fields) {
					if (error) throw error;
					console.log('IP address saved');
					blockedIps[ip] = ip
				});
			}
			// connection.end();
		}
		delete watchers[ip];
	}, 5000) // 5000 IS TIME CONSTRAINT TO WATCH CLIENT REQUEST ACTIVITY
}

function formatHeaders (headers, indent) {
	if (typeof headers !== 'object' || headers.length === 0) return;
	indent = indent ? indent : '';
	let s = '';
	for (let key in headers) {
		let val = headers[key];
		if (typeof val === 'object' && val !== null) {
			s+= key + ':\r\n';
			s+= formatHeaders(val, indent + " - ");
		}
		else s+= indent + key + ': ' + val + '\r\n';
	}
	return s;
};

function formatIpAddress(address) {
	if (address.length !== 0 && address.substr(0, 7) === "::ffff:") return address.substr(7);
	return address;
};

// function emitData (item) {
// 	total_requests_number++;
// 	item.timestamp = Date.now();
// 	item.ip = formatIpAddress(item.ip);
// 	// io.emit('broadcast', item);
// 	data[data.length] = item;
// 	// helper.saveToDatabase(item);
// };
// TODO:: require socket.io and then connect to front end
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

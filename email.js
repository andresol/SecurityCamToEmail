var express = require('express')
var http = require('http');
var nodemailer = require('nodemailer');
var app = express();
var transporter = nodemailer.createTransport('smtp://smtp.altibox.no');
var mailOptions = {
    from: '"Andre Sollie" <andre@sollie.info>', // sender address
    to: 'andre@sollie.info', // list of receivers
    subject: 'Ringeklokka', // Subject line
    text: 'test', // plaintext body
    html: '<b>Hello world ?</b>' // html body
};
app.get('/', function (req, res) {
  var str = '';
	http.get({
		hostname: '192.168.1.228',
		port: 80,
		path: '/web/cgi-bin/hi3510/param.cgi?cmd=snap',
		agent: false  // create a new agent just for this one request
	}, (resquest) => {
		 resquest.on('data', function (chunk) {
			    str += chunk;
			  });
			  resquest.on('end', function () {
          var url = /^.*path="(.*)"/.exec(str);
          var img = [];
          http.get({
            hostname: '192.168.1.228',
            port: 80,
            path: url[1],
            agent: false  // create a new agent just for this one request
          }, (resquest) => {
             resquest.on('data', function (chunk) {
                  img.push(chunk);
                });
                resquest.on('end', function () {
                  var buffer = Buffer.concat(img);
                  mailOptions.attachments = [{'filename': 'email.jpg', 'content': buffer}];
                  transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });
                res.writeHead(200, {'Content-Type': 'image/jpeg' });
                res.end(Buffer.concat(img), 'binary');
                });
          });

			  });
	});

})

app.listen(3733)

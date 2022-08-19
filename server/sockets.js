'use strict';

var jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

var clients = [];
module.exports = function (app, io) {
	io.use(function(socket, next) {
		if (socket.handshake.query.user_token) {
			jwt.verify(socket.handshake.query.user_token, config.superSecret, function(err, decoded) {
				if (err) {
					console.log(err)
					return next(new Error('error'));
				} else {
					socket.decoded = decoded;
					next();
				}
			});
		} else {
			return next(new Error('error'));
		}
	}).on('connection', function(socket) {
		let userData = {
			socketId: socket.id
		};
		clients.push(socket);
		console.log('connecting client & now total clients are: ', clients.length)
		
		socket.on('getData', params => {
			params.user = socket.decoded.userid;
			getChatData(params).then(data => {
				socket.emit('chatsData', data);
				socket.emit('getDiscussionBoard');
			}).catch(error => {
				socket.emit('chatsDataError', error?error:'Error Occured!');
			});
		});

		socket.on('disconnect', function() {
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].id == socket.id) {
					clients.splice(i, 1);
				}
			}
			console.log('disconnecting client & now total clients are: ', clients.length)
		});
	});
}
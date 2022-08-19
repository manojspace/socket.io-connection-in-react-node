import React from 'react';
import io from 'socket.io-client/dist/socket.io';

const SOCKET_URL = "http://localhost:3001";

const socketIo = io.connect((SOCKET_URL), {query: {user_token: tokenData.user_token}});

class Chat extends React.Component {
	componentDidMount() {
		if (socketIo && socketIo.connected) {
			socket = socketIo;
			socket.on('chatsData', data => {
				if (this._isMounted) {
					this.setState({chats: data, loadingChat: false, chatsDataError: null})
				}
			})
		}
	}

	getChatData = () => {
		if (socketIo) {
			let params = {};
			socketIo.emit('getChatData', params);
		}
	}
}
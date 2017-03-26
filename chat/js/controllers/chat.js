app.controller('Chat', [
	'$scope', '$controller', '$rootScope', 'chatService', '$element', '$http',
	function($, $controller, $rootScope, chatService, $element, $http) {
	
	// převezmutí funkcí z Base ctrl
	angular.extend(this, $controller('Base', {$scope: $}));
	
	$.constructor = function () {
		$.userid = '';
		$.username = $rootScope.username;	
		$.users = [];
		$.recepients = [];
		$.usersCount = 0;
		$.messages = {};
		$.chatForm = $element[0].querySelector('form');
		
		$.loginToServerViaHttp();
	};
	
	$.loginToServerViaHttp = function () {
		$http
			.post($.LOGIN_URL, {
				username: $.username,
				password: '1234'
			})
			.success(function(data, status, headers, config) {
				if (data.success) {
					$.userid = data.userid;
					$.initChatService();
				} else {
					console.log(data.message);
					$rootScope.loginErrorMessage = data.message;
					$.go('login');
				}
			});
	};
	
	$.initChatService = function () {
		chatService
			.open($.WEBSOCKET_URL)
			.onLogin($.onLoginAndLogoutHandler)
			.onLogout($.onLoginAndLogoutHandler)
			.onChatting($.onChattingHandler)
			.login($.userid, $.username);
	};
	
	$.submitHandler = function () {
		// pozor na radio inputy - nejsou vhodné pro ng-model:
		$.currentRcp = $.chatForm.rcp.value;
		
		chatService.chatting({
			userid: $.userid,
			username: $.username,
			content: $.content,
			recepient: $.currentRcp
		});
		$.content = '';
	};
	
	$.onLoginAndLogoutHandler = function (data) {
		if (typeof(data.messages) != 'undefined') {
			$.messages = data.messages.reverse();
		}
		$.users = data.users;
		$.recepients = data.recepients;
		$.usersCount = data.usersCount;
		$.$apply();
	};
	
	$.onChattingHandler = function (data) {
		data.isMe = $.userid == data.userid;
		$.messages.unshift(data);
		$.$apply();
	};
	
	$.logoutHandler = function () {
		chatService.logout(4000, 'Logout');
		$.go('login');
	};
	
	$.constructor();
}]);
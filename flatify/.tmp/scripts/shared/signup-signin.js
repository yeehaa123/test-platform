(function() {
  var user, validationApp;

  validationApp = angular.module('validationApp', ['firebase']);

  validationApp.constant('firebaseUrl', 'https://cth-site.firebaseio.com/users/');

  validationApp.service('firebase', function(firebaseUrl) {
    return new Firebase(firebaseUrl);
  });

  validationApp.service('loginService', function(firebase, $firebaseSimpleLogin) {
    return $firebaseSimpleLogin(firebase);
  });

  validationApp.service('users', function(firebase, $firebase) {
    return $firebase(firebase);
  });

  validationApp.service('authentication', function($q, userService, loginService) {
    var login, logout;
    login = function() {
      var deferred;
      deferred = $q.defer();
      loginService.$login('github').then(function(data) {
        var user, userFound;
        user = {
          githubId: data.id,
          avatar_url: data.thirdPartyUserData.avatar_url,
          userName: data.username,
          fullName: data.displayName,
          email: data.thirdPartyUserData.emails[0].email
        };
        userFound = userService.findUserById(data.id);
        if (userFound) {
          return deferred.resolve(userFound);
        } else {
          return deferred.reject(user);
        }
      });
      return deferred.promise;
    };
    logout = function() {
      return loginService.$logout();
    };
    return {
      login: login,
      logout: logout
    };
  });

  validationApp.service('userService', function(users) {
    var findUserById;
    findUserById = function(githubId) {
      var gitHubKeys, userFound;
      userFound = false;
      gitHubKeys = users.$getIndex();
      return gitHubKeys.forEach(function(key) {
        var user;
        user = users[key];
        if (user.githubId === githubId) {
          userFound = user;
        }
        return userFound;
      });
    };
    return {
      users: users,
      findUserById: findUserById
    };
  });

  validationApp.controller('registrationController', function($scope, userService) {
    var userEvents, users;
    users = userService.users;
    $scope.$on('user:loggedin', userEvents);
    $scope.$on('user:loggedout', userEvents);
    return userEvents = function(evt, user, current) {
      console.log(evt);
      return console.log(user);
    };
  });

  $scope.yearOptions = {
    "ba1": "Bachelor year 1",
    "ba2": "Bachelor year 2",
    "ba3": "Bachelor year 3",
    "ma1": "Master year 1",
    "ma2": "Master year 2",
    "oth": "Other"
  };

  $scope.submitForm = function(isValid) {
    return console.log(isValid);
  };

  user = {
    'githubId': $scope.newUser.githubId,
    'avatarUrl': $scope.newUser.avatar_url
  };

  ({
    'userName': $scope.newUser.userName({
      'name': {
        'first': $scope.newUser.name.first,
        'last': $scope.newUser.name.last
      }
    }),
    'email': $scope.newUser.email,
    'studno': $scope.newUser.studno,
    'studyYear': $scope.newUser.studyYear,
    'study': $scope.newUser.study,
    'codingExperience': $scope.newUser.codingExperience,
    'motivation': $scope.newUser.motivation
  });

  if (isValid) {
    users.$add(user).then(function(ref) {
      return $scope.$emit('user:registered', user);
    });
  }

}).call(this);

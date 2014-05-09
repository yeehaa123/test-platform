(function() {
  var validationApp;

  validationApp = angular.module('validationApp', ['firebase']);

  validationApp.constant('firebaseUrl', 'https://cth-site.firebaseio.com/users/');

  validationApp.service('firebase', [
    'firebaseUrl', function(firebaseUrl) {
      return new Firebase(firebaseUrl);
    }
  ]);

  validationApp.service('loginService', [
    'firebase', '$firebaseSimpleLogin', function(firebase, $firebaseSimpleLogin) {
      return $firebaseSimpleLogin(firebase);
    }
  ]);

  validationApp.service('users', [
    'firebase', '$firebase', function(firebase, $firebase) {
      return $firebase(firebase);
    }
  ]);

  validationApp.service('authentication', [
    '$q', 'userService', 'loginService', function($q, userService, loginService) {
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
            user = $.extend(user, {
              html: 0,
              css: 0,
              javaScript: 0,
              ruby: 0,
              python: 0,
              php: 0,
              java: 0,
              c: 0
            });
            console.log(user);
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
    }
  ]);

  validationApp.factory('userService', [
    'users', function(users) {
      var findUserById;
      findUserById = function(githubId) {
        var gitHubKeys, userFound;
        userFound = false;
        gitHubKeys = users.$getIndex();
        gitHubKeys.forEach(function(key) {
          var user;
          user = users[key];
          if (user.githubId === githubId) {
            return userFound = user;
          }
        });
        return userFound;
      };
      return {
        users: users,
        findUserById: findUserById
      };
    }
  ]);

  validationApp.controller('registrationController', [
    '$scope', 'userService', '$rootScope', function($scope, userService, $rootScope) {
      var backgroundComplete, backgroundInfoVisible, experienceInfoVisible, motivationInfoVisible, otherExperience, userInfoComplete, userInfoVisible, users;
      users = userService.users;
      $scope.helpShown = false;
      userInfoVisible = false;
      backgroundInfoVisible = false;
      experienceInfoVisible = false;
      motivationInfoVisible = true;
      otherExperience = true;
      $scope.showUserInfo = function(user) {
        return userInfoVisible || !userInfoComplete(user);
      };
      $scope.showBackgroundInfo = function(user) {
        return (!backgroundComplete(user) || backgroundInfoVisible) && userInfoComplete(user);
      };
      $scope.showExperienceInfo = function(user) {
        return (!$scope.experienceComplete(user) || experienceInfoVisible) && backgroundComplete(user);
      };
      $scope.showMotivationInfo = function(user) {
        return $scope.experienceComplete(user) && motivationInfoVisible;
      };
      $scope.toggleUserInfo = function() {
        return userInfoVisible = !userInfoVisible;
      };
      $scope.toggleBackgroundInfo = function() {
        return backgroundInfoVisible = !backgroundInfoVisible;
      };
      $scope.toggleExperienceInfo = function() {
        return experienceInfoVisible = !experienceInfoVisible;
      };
      $scope.toggleMotivationInfo = function() {
        return motivationInfoVisible = !motivationInfoVisible;
      };
      $scope.showHelp = function() {
        return $scope.helpShown = true;
      };
      $scope.showOthersInput = function() {
        if ($scope.knowOthers === "yes") {
          return otherExperience = true;
        } else if ($scope.knowOthers === "no") {
          return otherExperience = false;
        }
      };
      userInfoComplete = function(user) {
        return user.userName && user.firstName && user.lastName && user.email && user.studno;
      };
      backgroundComplete = function(user) {
        return userInfoComplete && user.study && user.studyYear;
      };
      $scope.experienceComplete = function(user) {
        return user.others || !otherExperience;
      };
      $scope.yearOptions = {
        "ba1": "Bachelor year 1",
        "ba2": "Bachelor year 2",
        "ba3": "Bachelor year 3",
        "ma1": "Master year 1",
        "ma2": "Master year 2",
        "oth": "Other"
      };
      $scope.submitExperience = function() {
        return console.log($scope.newUser.experience);
      };
      return $scope.submitForm = function(isValid) {
        var user;
        user = {
          'githubId': $scope.newUser.githubId,
          'avatarUrl': $scope.newUser.avatar_url,
          'userName': $scope.newUser.userName,
          'name': {
            'first': $scope.newUser.firstName,
            'last': $scope.newUser.lastName
          },
          'email': $scope.newUser.email,
          'studno': $scope.newUser.studno,
          'studyYear': $scope.newUser.studyYear,
          'study': $scope.newUser.study,
          'codingExperience': {
            'html': $scope.newUser.html,
            'css': $scope.newUser.css,
            'javaScript': $scope.newUser.javaScript,
            'ruby': $scope.newUser.ruby,
            'python': $scope.newUser.python,
            'php': $scope.newUser.php
          },
          'motivation': $scope.newUser.motivation
        };
        if ($scope.newUser.others) {
          user.codingExperience.others = $scope.newUser.others.split(", ");
        }
        if (isValid) {
          return users.$add(user).then(function(ref) {
            return $scope.$emit('user:registered', user);
          });
        }
      };
    }
  ]);

}).call(this);

validationApp = angular.module('validationApp', ['firebase'])

validationApp.constant('firebaseUrl', 'https://cth-site.firebaseio.com/users/')

validationApp.service('firebase', [
  'firebaseUrl',
  (firebaseUrl) ->
    new Firebase(firebaseUrl)
])

validationApp.service('loginService', [
   'firebase', '$firebaseSimpleLogin',
   (firebase, $firebaseSimpleLogin) ->
     $firebaseSimpleLogin(firebase)
])

validationApp.service('users', [
  'firebase', '$firebase',
  (firebase, $firebase) ->
     $firebase(firebase)
])


validationApp.service('authentication', [
  '$q', 'userService', 'loginService',
  ($q, userService, loginService) ->

    login = () ->
      deferred = $q.defer()

      loginService.$login('github')
        .then (data) ->
          user =
            githubId: data.id,
            avatar_url: data.thirdPartyUserData.avatar_url,
            userName: data.username,
            fullName: data.displayName,
            email: data.thirdPartyUserData.emails[0].email

          userFound = userService.findUserById(data.id)

          if (userFound)
            deferred.resolve(userFound)
          else
            deferred.reject(user)

       deferred.promise

    logout = () ->
      loginService.$logout()

     {
      login: login,
      logout: logout,
    }
])

validationApp.factory('userService', [
  'users',
  (users) ->

    findUserById = (githubId) ->

      userFound = false
      gitHubKeys = users.$getIndex()


      gitHubKeys.forEach (key) ->
        user = users[key]
        if (user.githubId is githubId)
          userFound = user

      userFound

     {
        users: users,
        findUserById: findUserById
    }
])


validationApp.controller('registrationController', [
  '$scope', 'userService', '$rootScope',
  ($scope, userService, $rootScope) ->

    users = userService.users

    $scope.userInfoComplete = (user) ->
      user.userName && user.firstName && user.lastName &&
      user.email && user.studno

    $scope.backgroundComplete = (user) ->
      $scope.userInfoComplete && user.study && user.studyYear

    $scope.experienceComplete = (user) ->
      $scope.userInfoComplete && $scope.backgroundComplete &&
      user.html &&  user.css && user.javaScript && user.ruby 


    $scope.yearOptions =
      "ba1": "Bachelor year 1",
      "ba2": "Bachelor year 2",
      "ba3": "Bachelor year 3",
      "ma1": "Master year 1",
      "ma2": "Master year 2",
      "oth": "Other"

    $scope.submitForm = (isValid) ->

      user =
        'githubId': $scope.newUser.githubId
        'avatarUrl': $scope.newUser.avatar_url
        'userName': $scope.newUser.userName
        'name':
          'first': $scope.newUser.firstName
          'last': $scope.newUser.lastName
        'email': $scope.newUser.email
        'studno': $scope.newUser.studno
        'studyYear': $scope.newUser.studyYear
        'study': $scope.newUser.study
        'codingExperience': 
          'html': $scope.newUser.html
          'css': $scope.newUser.css
          'javaScript': $scope.newUser.javaScript
          'ruby': $scope.newUser.ruby
        'motivation': $scope.newUser.motivation

      if (isValid)
        users.$add(user).then (ref) ->
          $scope.$emit('user:registered', user)
])

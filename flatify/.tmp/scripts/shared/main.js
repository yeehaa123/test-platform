(function() {
  'use strict';
  var app;

  app = angular.module('app.controllers', ['validationApp']);

  app.controller('AppCtrl', [
    '$scope', '$location', '$rootScope', 'authentication', function($scope, $location, $rootScope, authentication) {
      $scope.isSpecificPage = function() {
        var path;
        path = $location.path();
        return _.contains(['/404', '/pages/500', '/pages/login', '/pages/signin', '/pages/signin1', '/pages/signin2', '/pages/signup', '/pages/signup1', '/pages/signup2', '/pages/lock-screen'], path);
      };
      $scope.currentUser = false;
      $scope.newUser = false;
      $scope.courseInfoVisible = true;
      $scope.main = {
        brand: 'Coding the Humanities',
        name: 'Lisa Doe'
      };
      $rootScope.$on('$routeChangeStart', function(event, next) {
        if (!$scope.currentUser && !next.isLogin) {
          $rootScope.savedLocation = $location.url();
          return $location.path('/');
        }
      });
      $scope.$on("user:registered", function(evt, user, current) {
        $scope.currentUser = user;
        return $scope.newUser = false;
      });
      $scope.login = function() {
        return authentication.login().then((function(registereduser) {
          $scope.currentUser = registereduser;
          return $scope.$broadcast("user:loggedin", $scope.currentUser);
        }), function(newUser) {
          $scope.courseInfoVisible = !$scope.courseInfoVisible;
          return $scope.newUser = newUser;
        });
      };
      $scope.logout = function() {
        $scope.$broadcast("user:loggedout", $scope.currentUser);
        $scope.currentUser = false;
        return authentication.logout();
      };
      return $scope.toggleCourseInfo = function() {
        return $scope.courseInfoVisible = !$scope.courseInfoVisible;
      };
    }
  ]);

  app.controller('NavCtrl', [
    '$scope', 'taskStorage', 'filterFilter', function($scope, taskStorage, filterFilter) {
      var tasks;
      tasks = $scope.tasks = taskStorage.get();
      $scope.taskRemainingCount = filterFilter(tasks, {
        completed: false
      }).length;
      return $scope.$on('taskRemaining:changed', function(event, count) {
        return $scope.taskRemainingCount = count;
      });
    }
  ]);

  app.controller('DashboardCtrl', [
    '$scope', function($scope) {
      $scope.comboChartData = [['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua New Guinea', 'Rwanda', 'Average'], ['2014/05', 165, 938, 522, 998, 450, 614.6], ['2014/06', 135, 1120, 599, 1268, 288, 682], ['2014/07', 157, 1167, 587, 807, 397, 623], ['2014/08', 139, 1110, 615, 968, 215, 609.4], ['2014/09', 136, 691, 629, 1026, 366, 569.6]];
      return $scope.salesData = [['Year', 'Sales', 'Expenses'], ['2010', 1000, 400], ['2011', 1170, 460], ['2012', 660, 1120], ['2013', 1030, 540]];
    }
  ]);

}).call(this);

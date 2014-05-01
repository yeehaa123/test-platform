'use strict'

app = angular.module('app.controllers', ['validationApp'])

# overall control
app.controller('AppCtrl', [
    '$scope', '$location', '$rootScope', 'authentication',
    ($scope, $location, $rootScope, authentication) ->
        $scope.isSpecificPage = ->
            path = $location.path()
            return _.contains( ['/404', '/pages/500', '/pages/login', '/pages/signin', '/pages/signin1', '/pages/signin2', '/pages/signup', '/pages/signup1', '/pages/signup2', '/pages/lock-screen'], path )

        $scope.currentUser = false
        $scope.newUser = false

        $scope.main =
            brand: 'Coding the Humanities'
            name: 'Lisa Doe' # those which uses i18n can not be replaced with two way binding var for now.

        $rootScope.$on '$routeChangeStart', (event, next) ->
          if (!$scope.currentUser && !next.isLogin)
            $rootScope.savedLocation = $location.url()
            $location.path('/')

        $scope.$on "user:registered", (evt, user, current) ->
           $scope.currentUser = user
           $scope.newUser = false

        $scope.login = ->
          authentication.login().then ((registereduser) ->
            $scope.currentuser = registereduser
            $scope.$broadcast "user:loggedin", $scope.currentUser
          ), (newUser) ->
            $scope.newUser = newUser


        $scope.logout = ->
          $scope.$broadcast "user:loggedout", $scope.currentUser
          $scope.currentUser = false
          authentication.logout()
])

app.controller('NavCtrl', [
    '$scope', 'taskStorage', 'filterFilter'
    ($scope, taskStorage, filterFilter) ->
        # init
        tasks = $scope.tasks = taskStorage.get()
        $scope.taskRemainingCount = filterFilter(tasks, {completed: false}).length

        $scope.$on('taskRemaining:changed', (event, count) ->
            $scope.taskRemainingCount = count
        )
])

app.controller('DashboardCtrl', [
    '$scope'
    ($scope) ->

        $scope.comboChartData = [
            ['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua New Guinea', 'Rwanda', 'Average']
            ['2014/05',  165,      938,         522,             998,           450,      614.6]
            ['2014/06',  135,      1120,        599,             1268,          288,      682]
            ['2014/07',  157,      1167,        587,             807,           397,      623]
            ['2014/08',  139,      1110,        615,             968,           215,      609.4]
            ['2014/09',  136,      691,         629,             1026,          366,      569.6]
        ]

        $scope.salesData = [
            ['Year', 'Sales', 'Expenses']
            ['2010',  1000,      400]
            ['2011',  1170,      460]
            ['2012',  660,       1120]
            ['2013',  1030,      540]
        ]

])

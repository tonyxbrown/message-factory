'use strict';

/**
 * @ngdoc Controller
 * @name CreateAppCtrl
 * @description
 * # CreateAppCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('CreateAppCtrl', ['$scope', '$window', '$location', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $timeout, $filter, config_ui, MFAPIService) {

    $scope.appResults = {};

    $scope.loadPageOptions = function() {
      MFAPIService.getAppNames().then(function(result) {
        if (result && result.data && result.data.results) {
          $scope.appObjects = result.data.results;
        }
        else {
          $scope.appObjects = [];
        }
      });
      MFAPIService.getLanguages().then(function(result) {
        $scope.languages = result.data;
      });
    };

    $scope.loadPageOptions();

    $scope.newAppSubmit = function() {
      console.log("newAppSubmit(); form options:",$scope.requestedAppName,$scope.requestedSlots);

      if ($scope.requestedAppName && $scope.requestedSlots) {
        var messageToPost = {
          "appName": $scope.requestedAppName,
          "request": $scope.requestedSlots
        };
        MFAPIService.createApp(messageToPost).then(function(result) {
          console.log("createApp call returned. result: ",result);
          if (result.error) {
            $scope.appResults.status = 'error';
            $scope.appResults.error = result.error;
            return;
          }
          $scope.appResults = result.data;
        });
      }
    };

  }]);

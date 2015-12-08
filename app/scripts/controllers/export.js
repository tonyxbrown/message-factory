'use strict';

/**
 * @ngdoc Controller
 * @name ExportCtrl
 * @description
 * # ExportCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('ExportCtrl', ['$scope', '$window', '$location', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $timeout, $filter, config_ui, MFAPIService) {

    $scope.appResults = {};

    $scope.loadPageOptions = function() {
      MFAPIService.getAppNames().then(function(result) {
        $scope.appObjects = result.data.results;
      });
    };

    $scope.loadPageOptions();

    $scope.exportSubmit = function() {
      console.log("newAppSubmit(); form options:",$scope.selectedApp);

      if ($scope.selectedApp && $scope.selectedApp.appName) {
        MFAPIService.exportExcel($scope.selectedApp.appName);
      }
    };

  }]);

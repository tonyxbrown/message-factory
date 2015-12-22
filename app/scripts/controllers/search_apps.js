'use strict';

/**
 * @ngdoc Controller
 * @name SearchAppCtrl
 * @description
 * # SearchAppCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('SearchAppCtrl', ['$scope', '$window', '$location', '$state', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $state, $timeout, $filter, config_ui, MFAPIService) {

    $scope.loadPageOptions = function() {
      MFAPIService.getAppNames().then(function(result) {
        if (result && result.data && result.data.results) {
          $scope.appObjects = result.data.results;
        }
        else {
          $scope.appObjects = [];
        }
        $scope.displayed = $scope.appObjects;
        $scope.initialLoad = false;
        $scope.isLoading = false;
      });
    };

    $scope.hasError = false;
    $scope.initialLoad = true;
    $scope.isLoading = true;

    $scope.loadPageOptions();

    /**
     * @name SearchCtrl.selectRow
     * @param row_po
     * @description used on click of a table row, navigates to detail page
     * Search page only navigates to a root detail page instead of a detail page
     * as subview within main
     */
    $scope.selectRow = function(row) {
      console.log("Message " + row + " selected. Go to edit modal.",row);
      $scope.currentRow = row;
      $('#editModal').modal('show');
    };

    $scope.closeModal = function() {
      $('#editModal').modal('hide');
    };

    $scope.saveUpdate = function() {

      if ($scope.modalAppName && $scope.modalPrefix &&
        $scope.modalEmail && $scope.modalPhone) {
        // grab values and format into post
        var messageToPost = {
          "appName": $scope.modalAppName,
          "email": $scope.modalEmail,
          "phone": $scope.modalPhone
        };

        // post object
        MFAPIService.editApp(messageToPost).then(function (result) {
          console.log("editApp call returned. result: ", result);
        });

        $('#editModal').modal('hide');
        setTimeout($scope.pageReload, 500);
      }
      else {
        console.log("Do not have required form data to update this App");
      }
    };

    $scope.pageReload = function() {
      $state.go($state.current, {}, {reload: true});
    };

    $('#editModal').on('show.bs.modal', function () {

      var app = $scope.currentRow;
      var appName = app.appName;

      var modal = $(this);
      modal.appName = appName;

      modal.find('.modal-title').html("Edit App: <span>" + appName + "</span>");

      $scope.modalAppName = app.appName;
      $scope.modalAvailableSlot = app.availableSlot.length;
      $scope.modalPrefix = app.prefix;
      $scope.modalEmail = app.email;
      $scope.modalPhone = app.phone;
    });

  }]);

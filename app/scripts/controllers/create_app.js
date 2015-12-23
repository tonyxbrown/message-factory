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
    $scope.additionalEmails = [];
    $scope.additionalPhones = [];
    $scope.requestedEmails = {};
    $scope.requestedPhones = {};

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

    $scope.addAnotherEmail = function() {
      var email_id = $scope.additionalEmails.length + 1;
      $scope.additionalEmails.push(email_id);
    };

    $scope.addAnotherPhone = function() {
      var phone_id = $scope.additionalPhones.length + 1;
      $scope.additionalPhones.push(phone_id);
    };

    $scope.newAppSubmit = function() {
      console.log("newAppSubmit(); form options:",$scope.requestedAppName,$scope.requestedSlots);

      if ($scope.requestedAppName && $scope.requestedSlots && $scope.requestedEmail && $scope.requestedPhone) {
        var messageToPost = {
          "appName": $scope.requestedAppName,
          "request": $scope.requestedSlots
        };

        // Additional Emails/Phones logic - append to messageToPost
        var count = 0;
        var emailsArray = [];
        emailsArray.push($scope.requestedEmail);
        if ($scope.requestedEmails) {
          for (var obj in $scope.additionalEmails) {
            if ($scope.requestedEmails[(count+1).toString()]) {
              emailsArray.push($scope.requestedEmails[(count+1).toString()]);
            }
            count++;
          }
        }
        var count = 0;
        var phonesArray = [];
        phonesArray.push($scope.requestedPhone);
        if ($scope.requestedPhones) {
          for (var obj in $scope.additionalPhones) {
            if ($scope.requestedPhones[(count+1).toString()]) {
              phonesArray.push($scope.requestedPhones[(count+1).toString()]);
            }
            count++;
          }
        }
        messageToPost.email = emailsArray;
        messageToPost.phone = phonesArray;

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

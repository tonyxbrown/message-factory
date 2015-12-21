'use strict';

/**
 * @ngdoc Controller
 * @name CreateMessageCtrl
 * @description
 * # CreateMessageCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('CreateMessageCtrl', ['$scope', '$window', '$location', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $timeout, $filter, config_ui, MFAPIService) {

    $scope.additionalLanguages = [];
    $scope.selectedExternalMessages = {};
    $scope.selectedLanguages = {};

    $scope.loadPageOptions = function() {
      MFAPIService.getAppNames().then(function(result) {
        $scope.appObjects = result.data.results;
      });
      MFAPIService.getLanguages().then(function(result) {
        $scope.languages = result.data;
        var languagesReverse = {};
        for (var key in result.data) {
          languagesReverse[result.data[key]] = key;
        }
        $scope.languagesReverse = languagesReverse;
      });
    };

    $scope.loadPageOptions();

    $scope.addAnotherLanguage = function() {
      var lang_id = $scope.additionalLanguages.length + 1;
      $scope.additionalLanguages.push(lang_id);
    };

    $scope.newMessageSubmit = function() {

      var languageToUse = ($scope.languages[$scope.selectedLanguage] || "ENU");

      console.log("newMessageSubmit(); form options:",$scope.selectedApp,$scope.selectedMsgCode,$scope.selectedInternalMessage,
        $scope.selectedExternalMessage,$scope.selectedMessageLevel,languageToUse);

      // Some Validation
      if ($scope.selectedMessageLevel && $scope.selectedMessageLevel.toLowerCase() === "error") {
        if ($scope.selectedMsgCode && $scope.selectedMsgCode > 0) {
          console.error("Message code must be negative for errors");
          return;
        }
      }
      else if ($scope.selectedMessageLevel && $scope.selectedMessageLevel.toLowerCase() !== "error") {
        if ($scope.selectedMsgCode && $scope.selectedMsgCode < 0) {
          console.error("Message code must be positive for non-errors");
          return;
        }
      }

      if ($scope.selectedApp && $scope.selectedApp.appName && $scope.selectedMsgCode && $scope.selectedInternalMessage &&
        $scope.selectedExternalMessage && $scope.selectedMessageLevel) {
        var messageCodeConcat = $scope.selectedApp.prefix.toString() + "." + $scope.selectedMsgCode.toString();
        var messageToPost = {
          "appName": $scope.selectedApp.appName,
          "msgCode": messageCodeConcat,
          "message": $scope.selectedExternalMessage,
          "messageInternal": $scope.selectedInternalMessage,
          "messageLevel": $scope.selectedMessageLevel,
          "language": languageToUse
        };

        // Additional Languages logic - append to messageToPost
        if ($scope.selectedLanguages) {
          var count = 0;
          for (var obj in $scope.additionalLanguages) {
            console.log("add lang for: ",obj);
            if ($scope.selectedLanguages[(count+1).toString()] && $scope.selectedExternalMessages[(count+1).toString()]) {
              messageToPost[$scope.languages[$scope.selectedLanguages[(count+1).toString()]]] = $scope.selectedExternalMessages[(count+1).toString()];
            }
            count++;
          }
        }

        MFAPIService.createMessages([messageToPost]).then(function(result) {
          console.log("createMessages call returned. result: ",result);
          $scope.appResults = result.data;
          if (!$scope.create_another) {
            $location.url("/search");
          }
          else { // otherwise stay here
            var prevSelectedApp = $scope.selectedApp;
            $scope.selectedMsgCode = ""; // clear msgCode because they must select a new one to create another code
            $scope.loadPageOptions(); // reload page options, should remove a message code option from dropdown
            $scope.selectedApp = prevSelectedApp;
          }
        });
      }
      else {
        console.error("Do not have required form data to submit new Message");
      }
    };

  }]);

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

    $scope.loadPageOptions = function() {
      MFAPIService.getAppNames().then(function(result) {
        console.log("result:",result);
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

    $scope.newMessageSubmit = function() {

      var languageToUse = ($scope.languages[$scope.selectedLanguage] || "ENU");

      console.log("newMessageSubmit(); create_another: ",$scope.create_another);
      console.log("newMessageSubmit(); form options:",$scope.selectedApp,$scope.selectedMsgCode,$scope.selectedInternalMessage,
        $scope.selectedExternalMessage,$scope.selectedMessageLevel,languageToUse);

      if ($scope.selectedApp && $scope.selectedApp.appName && $scope.selectedMsgCode && $scope.selectedInternalMessage &&
        $scope.selectedExternalMessage && $scope.selectedMessageLevel) {
        var messageCodeConcat = parseInt($scope.selectedApp.prefix.toString() + $scope.selectedMsgCode.toString());
        var messageToPost = {
          "appName": $scope.selectedApp.appName,
          "msgCode": messageCodeConcat,
          "message": $scope.selectedExternalMessage,
          "messageInternal": $scope.selectedInternalMessage,
          "messageLevel": $scope.selectedMessageLevel,
          "language": languageToUse
        };
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
        console.log("Do not have required form data to submit new Message");
      }
    };

    //$scope.closeProgressModal = function() {
    //  $('#progressModal').modal('hide');
    //};
    //
    //$('#progressModal').on('show.bs.modal', function (event) {
    //  var button = $(event.relatedTarget); // Button that triggered the modal
    //  var po = button.data('po'); // po number
    //  var collection = POAPIService.getPOByNumber(ctrl.poCollection,po);
    //  var approvalHistory = collection.approval_history;
    //  console.log("collection:",collection);
    //
    //  var progressHTML = "";
    //  for (var i=0; i<approvalHistory.length; i++) {
    //    var approvalPercent = (approvalHistory[i].approved === "3") ? 100 : (parseInt(approvalHistory[i].approved) * 30);
    //    if (approvalPercent === 0 || !approvalPercent) { approvalPercent = 2; }
    //    var d = new Date(parseInt(approvalHistory[i].timestamp));
    //    var approvalDate = d.toLocaleString();
    //
    //    progressHTML += "<div class='progress'>";
    //    if (approvalHistory[i].status.toLowerCase().indexOf("decline") !== -1) {
    //      progressHTML += "<div class='progress-bar progress-bar-danger' role='progressbar' ";
    //    }
    //    else if (approvalHistory[i].status.toLowerCase().indexOf("approve") !== -1) {
    //      progressHTML += "<div class='progress-bar progress-bar-success' role='progressbar' ";
    //    }
    //    else if (approvalHistory[i].status.toLowerCase().indexOf("recommitted") !== -1) {
    //      progressHTML += "<div class='progress-bar progress-bar-warning' role='progressbar' ";
    //    }
    //    else {
    //      progressHTML += "<div class='progress-bar' role='progressbar' ";
    //    }
    //    progressHTML += "aria-valuenow='"+ approvalPercent + "' ";
    //    progressHTML += "aria-valuemin='0' aria-valuemax='100' ";
    //    progressHTML += "style='width: "+ approvalPercent +"%;' >";
    //    progressHTML += "</div>";
    //    progressHTML += "</div>";
    //    progressHTML += "<p class='help-block'>" + approvalHistory[i].status + " by " + approvalHistory[i].approval_name + " - " + approvalDate + "</p>";
    //  }
    //
    //  var modal = $(this);
    //
    //  modal.find('.progress-modal-title').html("Approval Progress History - " + po);
    //  modal.find('.progress-container').html(progressHTML);
    //
    //});

  }]);

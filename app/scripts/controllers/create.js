'use strict';

/**
 * @ngdoc Controller
 * @name CreateCtrl
 * @description
 * # CreateCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('CreateCtrl', ['$scope', '$window', '$location', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $timeout, $filter, config_ui, MFAPIService) {

    $scope.loadPageOptions = function() {
      MFAPIService.getAppNames().then(function(result) {
        $scope.appNames = result.data;
      });
      MFAPIService.getLanguages().then(function(result) {
        $scope.languages = result.data;
      });
    };

    $scope.loadPageOptions();

    $scope.newMessageSubmit = function() {
      console.log("newMessageSubmit(); form options:",$scope.selectedAppName,$scope.selectedMsgCode,$scope.selectedInternalMessage,
      $scope.selectedMessageLevel,$scope.selectedLanguage);

      if ($scope.selectedAppName && $scope.selectedMsgCode && $scope.selectedInternalMessage &&
        $scope.selectedMessageLevel && $scope.selectedLanguage) {
        var messageToPost = {
          "appName": $scope.selectedAppName,
          "msgCode": $scope.selectedMsgCode,
          "internalMessage": $scope.selectedInternalMessage,
          "messageLevel": $scope.selectedMessageLevel,
          "language": $scope.selectedLanguage
        };
        MFAPIService.createMessages([messageToPost]).then(function(result) {
          console.log("createMessages call returned. result: ",result);
        });
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

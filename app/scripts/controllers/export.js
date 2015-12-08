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
        MFAPIService.exportExcel($scope.selectedApp.appName).then(function(result) {
          console.log("exportExcel call returned. result: ",result);
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

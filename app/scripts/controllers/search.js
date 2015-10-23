'use strict';

/**
 * @ngdoc Controller
 * @name SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('SearchCtrl', ['$scope', '$window', '$location', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $timeout, $filter, config_ui, MFAPIService) {

    var ctrl = this;

    /**
     * @name callServer
     * @memberof SearchCtrl
     * @param tableState
     * @description makes request to server using PODataModel object, called each time table is updated
     * with search or sort queries
     */
    this.callServer = function callServer(tableState) {
      ctrl.isLoading = true;
      console.log("callServer, tableState:",tableState);
      var searchFields = tableState.search.predicateObject;
      //var queryStringParams = "";
      //for (var key in searchFields) {
      //  var obj = searchFields[key];
      //  console.log("key,obj",key,obj);
      //  if (queryStringParams) { queryStringParams += "&"; }
      //  queryStringParams += key + "=" + obj;
      //}

      var start = 0;
      var max = 10;
      $scope.loadMessages = function(params) {
        MFAPIService.getMessages(start,max,params).then(function(result) {
          var data = result.data;

          ctrl.displayed = data;

          ctrl.isLoading = false;
          start += 10;
        });
      };

      $scope.loadMessages(searchFields);

    };

    /**
     * @name SearchCtrl.hasPreviousPages
     * @description used for smart-table pagination to determine if pages exist
     * before currently displayed first page number
     */
    $scope.hasPreviousPages = function() {
      console.log("hasPreviousPages()");
      if ($('.pagination > li > a') && $('.pagination > li > a').html()) {
        if ($('.pagination > li > a').html() !== "1") {
          return true;
        }
      }
      return false;
    };

    /**
     * @name SearchCtrl.hasNextPages
     * @description used for smart-table pagination to determine if pages exist
     * after currently displayed last page number
     */
    $scope.hasNextPages = function() {
      if ($('.pagination > li:last-child > a') && $('.pagination > li:last-child > a').html()) {
        var lastDisplayedNumber = parseInt($('.pagination > li:last-child > a').html());
        if (lastDisplayedNumber >= 5) {
          if (ctrl.numberOfPages > lastDisplayedNumber) {
            return true;
          }
          return false;
        }
      }
      return false;
    };

    /**
     * @name SearchCtrl.selectRow
     * @param row_po
     * @description used on click of a table row, navigates to detail page
     * Search page only navigates to a root detail page instead of a detail page
     * as subview within main
     */
    $scope.selectRow = function(row_po) {
      $location.url("/detail?po_num="+row_po);
    };

    /**
     * @name SearchCtrl.getRowMax
     * @returns {number}
     * @description get max rows per page, based on height of browser window
     */
    $scope.getRowMax = function() {
      var h = $window.innerHeight;
      var max = config_ui.num_rows_height_trigger;
      var a = config_ui.num_rows_desktop;
      var b = config_ui.num_rows_tablet;

      if (h > max) { return a; }
      return b;
    };

    $scope.numPerPage = $scope.getRowMax();

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

'use strict';

/**
 * @ngdoc Controller
 * @name SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('SearchCtrl', ['$scope', '$window', '$location', '$timeout', '$filter', 'config_ui', 'POAPIService', function ($scope, $window, $location, $timeout, $filter, config_ui, POAPIService) {

    var ctrl = this;
    this.poCollection = [];

    /**
     * @name callServer
     * @memberof SearchCtrl
     * @param tableState
     * @description makes request to server using PODataModel object, called each time table is updated
     * with search or sort queries
     */
    this.callServer = function callServer(tableState) {
      ctrl.isLoading = true;

      /**
       * @TODO pagination - need to pass a start and number then the 'displayed' table will be just the items
       * on screen.  Then when user clicks another page this async function gets called again and will create
       * a new 'displayed' data set for the table
       */
      var start = 0;
      var max = 10;
      $scope.loadPOs = function() {
        POAPIService.getAll(start,max).then(function(pos) {
          var filtered = tableState.search.predicateObject ? $filter('filter')(pos, tableState.search.predicateObject) : pos;

          if (tableState.sort.predicate) {
            filtered = $filter('orderBy')(filtered, tableState.sort.predicate, tableState.sort.reverse);
          }

          for (var i=0; i<filtered.length; i++) {
            var approvalPercent = (filtered[i].approval_history[filtered[i].approval_history.length-1].approved === "3") ? 100 : (parseInt(filtered[i].approval_history[filtered[i].approval_history.length-1].approved) * 30);
            if (approvalPercent === 0 || !approvalPercent) { approvalPercent = 2; }
            filtered[i].approvedPercent = approvalPercent;
          }

          ctrl.poCollection = filtered;

          //tableState.pagination.numberOfPages = Math.ceil(filtered.length / 7);
          ctrl.isLoading = false;
          start += 10;
        });
      };

      $scope.loadPOs();

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

    $scope.getApprovedClass = function(status) {
      if (status.toLowerCase().indexOf("decline") !== -1) {
        return "progress-bar-danger";
      }
      else if (status.toLowerCase().indexOf("approve") !== -1) {
        return "progress-bar-success";
      }
      else if (status.toLowerCase().indexOf("recommitted") !== -1) {
        return "progress-bar-warning";
      }
      return "";
    };

    $scope.closeProgressModal = function() {
      $('#progressModal').modal('hide');
    };

    $('#progressModal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var po = button.data('po'); // po number
      var collection = POAPIService.getPOByNumber(ctrl.poCollection,po);
      var approvalHistory = collection.approval_history;
      console.log("collection:",collection);

      var progressHTML = "";
      for (var i=0; i<approvalHistory.length; i++) {
        var approvalPercent = (approvalHistory[i].approved === "3") ? 100 : (parseInt(approvalHistory[i].approved) * 30);
        if (approvalPercent === 0 || !approvalPercent) { approvalPercent = 2; }
        var d = new Date(parseInt(approvalHistory[i].timestamp));
        var approvalDate = d.toLocaleString();

        progressHTML += "<div class='progress'>";
        if (approvalHistory[i].status.toLowerCase().indexOf("decline") !== -1) {
          progressHTML += "<div class='progress-bar progress-bar-danger' role='progressbar' ";
        }
        else if (approvalHistory[i].status.toLowerCase().indexOf("approve") !== -1) {
          progressHTML += "<div class='progress-bar progress-bar-success' role='progressbar' ";
        }
        else if (approvalHistory[i].status.toLowerCase().indexOf("recommitted") !== -1) {
          progressHTML += "<div class='progress-bar progress-bar-warning' role='progressbar' ";
        }
        else {
          progressHTML += "<div class='progress-bar' role='progressbar' ";
        }
        progressHTML += "aria-valuenow='"+ approvalPercent + "' ";
        progressHTML += "aria-valuemin='0' aria-valuemax='100' ";
        progressHTML += "style='width: "+ approvalPercent +"%;' >";
        progressHTML += "</div>";
        progressHTML += "</div>";
        progressHTML += "<p class='help-block'>" + approvalHistory[i].status + " by " + approvalHistory[i].approval_name + " - " + approvalDate + "</p>";
      }

      var modal = $(this);

      modal.find('.progress-modal-title').html("Approval Progress History - " + po);
      modal.find('.progress-container').html(progressHTML);

    });

  }]);

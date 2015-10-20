'use strict';

/**
 * @ngdoc Controller
 * @name ErrorsCtrl
 * @description
 * # ErrorsCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('ErrorsCtrl', ['$scope', '$window', '$location', 'config_ui', '$timeout', 'POAPIService', function ($scope, $window, $location, config_ui, $timeout, POAPIService) {

    // want to have some hook here to the logged in user
    //$scope.user_type = "admin"; // currently using admin to indicate quick decision link capability
    $scope.user_type = "cfo";
    //$scope.user_type = "buyer";
    //$scope.user_type = "ceo";
    $scope.commentText = "";

    var start = 0;
    var max = 10;
    $scope.loadPOs = function() {
      POAPIService.getNew(start,max).then(function(pos) {
        pos = POAPIService.parsePOs(pos,'status',['','new','recommitted']); // @TODO don't use this after real APIs are connected
        $scope.poCollection = pos;
        start += 10;
      });
    };

    $scope.loadPOs();


    $scope.$on('$destroy', function() {
      // reject/cancel the poModelRequest ajax promise, if needed
      //if (poModelRequest && (poModelRequest.$$state.pending || poModelRequest.$$state.processScheduled)) {
      //  console.log("Need to resolve/cancel http request in poModelRequest: ", poModelRequest);
      //  //poModelRequest.resolve();
      //}
    });

    /**
     * @name NewCtrl.approvePO
     * @param po_num_selected
     * @description user selects Approve button, changes status of po to 'approved', refreshes page
     * to remove selected item
     */
    $scope.approvePO = function(po_num_selected) {
      POAPIService.updateProperty($scope.poCollection,po_num_selected,'status',"approved");
      $scope.poCollection = POAPIService.parsePOs($scope.poCollection,'status',['','new','recommitted']);
    };

    /**
     * @name NewCtrl.declinePO
     * @param po_num_selected
     * @description user selects Decline button, changes status of po to 'declined', refreshes page
     * to remove selected item
     */
    $scope.declinePO = function(po_num_selected) {
      POAPIService.updateProperty($scope.poCollection,po_num_selected,'status',"declined");
      $scope.poCollection = POAPIService.parsePOs($scope.poCollection,'status',['','new','recommitted']);

    };

    $scope.pausePO = function(po_num_selected) {
      POAPIService.updateProperty($scope.poCollection,po_num_selected,'isPaused',true);
    };

    $scope.playPO = function(po_num_selected) {
      POAPIService.updateProperty($scope.poCollection,po_num_selected,'isPaused',false);
    };

    $scope.receivePO = function(po_num_selected) {
      POAPIService.updateProperty($scope.poCollection,po_num_selected,'status',"received");
      $scope.poCollection = POAPIService.parsePOs($scope.poCollection,'status',['','new','recommitted']);
    };

    /**
     * @name NewCtrl.selectRow
     * @param row_po
     * @description used on click of a table row, navigates to detail page
     */
    // used to select a table row - global for use in approved/declined/new/received.js files
    $scope.selectRow = function(row_po) {
      $location.url("/main/detail?po_num="+row_po);
    };

    /**
     * @name NewCtrl.getRowMax
     * @returns {number}
     * @description get max rows per page, based on height of browser window
     */
    // used to get max rows per page - global for use in approved/declined/new/received.js files
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

    $scope.closeModal = function() {
      $scope.commentText = "";
      $('#myModal').modal('hide');
    };

    $scope.saveComments = function() {
      // grab modal's po, decision type, comments
      var po = $('.modal-title span').text();
      var decision = $('.modal .btn-primary').text().toLowerCase();
      var comment = $scope.commentText;
      console.log("Log comment: " + comment + " for " + decision + " of po number: " + po);

      var commentObj = {};
      commentObj.comment = comment;
      commentObj.name = "Tony Brown";
      commentObj.timestamp = Date.now();
      if (decision === "approve") {
        POAPIService.updateProperty($scope.poCollection,po,'approver_comments',commentObj,'append');
        $scope.closeModal();
        $scope.approvePO(po);
      }
      else if (decision === "decline") {
        POAPIService.updateProperty($scope.poCollection,po,'decline_reason',commentObj,'append');
        $scope.closeModal();
        $scope.declinePO(po);
      }
      else {
        console.error("something went wrong in modal, we don't know if we are approving or declining");
        // @TODO close and clear modal and show some error?
      }

      // clear data in $scope.commentText and rest of form?
      //$('#myModal').modal('hide'); // hide whenever done
    };

    $('#progressModal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var po = button.data('po'); // po number
      var collection = POAPIService.getPOByNumber($scope.poCollection,po);
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

    $('#myModal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var decision = button.data('decision'); // Extract info from data-* attributes
      var po = button.data('po'); // need this po number to display and delete record
      var approver = "Tony Brown";
      var dateString = (new Date()).toLocaleString();
      // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
      // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
      var modal = $(this);
      modal.po = po;
      modal.find('.help-block').html("Comment added by " + approver + " at " + dateString);
      if (decision.toLowerCase() === "approve") {
        modal.find('.modal-title').html("Approve Purchase Order: <span>" + po + "</span>");
        modal.find('.modal-body input').val(decision);
        modal.find('.btn-primary').text("Approve");
      }
      else if (decision.toLowerCase() === "decline") {
        modal.find('.modal-title').html("Decline Purchase Order: <span>" + po + "</span>");
        modal.find('.modal-body input').val(decision);
        modal.find('.btn-primary').text("Decline");
      }
    });

  }]);

'use strict';

/**
 * @ngdoc Controller
 * @name ErrorsCtrl
 * @description
 * # ErrorsCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('ErrorsCtrl', ['$scope', '$window', '$location', 'config_ui', '$timeout', 'MFAPIService', function ($scope, $window, $location, config_ui, $timeout, MFAPIService) {

    var start = 0;
    var max = 1000;
    $scope.loadMessages = function() {
      var params = {
        messageLevel: 'Error',
        orderBy: 'msgCode',
        order: 'desc'
      };
      MFAPIService.getMessages(start,max,params).then(function(result) {
        $scope.messages = result.data;
        start += 10;
      });
    };

    $scope.loadMessages();


    $scope.$on('$destroy', function() {
      // reject/cancel the poModelRequest ajax promise, if needed
      //if (poModelRequest && (poModelRequest.$$state.pending || poModelRequest.$$state.processScheduled)) {
      //  console.log("Need to resolve/cancel http request in poModelRequest: ", poModelRequest);
      //  //poModelRequest.resolve();
      //}
    });

    /**
     * @name AllCtrl.selectRow
     * @param row_po
     * @description select a message
     */
      // used to select a table row - not sure where this will go
    $scope.selectRow = function(row_msgcode) {
      console.log("Message " + row_msgcode + " selected. Go to either edit or detail page.");
      //$location.url("/main/detail?po_num="+row_po);
    };

    $scope.numPerPage = 10;


    //$scope.closeProgressModal = function() {
    //  $('#progressModal').modal('hide');
    //};
    //
    //$scope.closeModal = function() {
    //  $scope.commentText = "";
    //  $('#myModal').modal('hide');
    //};

    //$scope.saveComments = function() {
    //  // grab modal's po, decision type, comments
    //  var po = $('.modal-title span').text();
    //  var decision = $('.modal .btn-primary').text().toLowerCase();
    //  var comment = $scope.commentText;
    //  console.log("Log comment: " + comment + " for " + decision + " of po number: " + po);
    //
    //  var commentObj = {};
    //  commentObj.comment = comment;
    //  commentObj.name = "Tony Brown";
    //  commentObj.timestamp = Date.now();
    //  if (decision === "approve") {
    //    POAPIService.updateProperty($scope.poCollection,po,'approver_comments',commentObj,'append');
    //    $scope.closeModal();
    //    $scope.approvePO(po);
    //  }
    //  else if (decision === "decline") {
    //    POAPIService.updateProperty($scope.poCollection,po,'decline_reason',commentObj,'append');
    //    $scope.closeModal();
    //    $scope.declinePO(po);
    //  }
    //  else {
    //    console.error("something went wrong in modal, we don't know if we are approving or declining");
    //    // @TODO close and clear modal and show some error?
    //  }
    //
    //  // clear data in $scope.commentText and rest of form?
    //  //$('#myModal').modal('hide'); // hide whenever done
    //};

    //$('#progressModal').on('show.bs.modal', function (event) {
    //  var button = $(event.relatedTarget); // Button that triggered the modal
    //  var po = button.data('po'); // po number
    //  var collection = POAPIService.getPOByNumber($scope.poCollection,po);
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
    //
    //$('#myModal').on('show.bs.modal', function (event) {
    //  var button = $(event.relatedTarget); // Button that triggered the modal
    //  var decision = button.data('decision'); // Extract info from data-* attributes
    //  var po = button.data('po'); // need this po number to display and delete record
    //  var approver = "Tony Brown";
    //  var dateString = (new Date()).toLocaleString();
    //  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    //  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    //  var modal = $(this);
    //  modal.po = po;
    //  modal.find('.help-block').html("Comment added by " + approver + " at " + dateString);
    //  if (decision.toLowerCase() === "approve") {
    //    modal.find('.modal-title').html("Approve Purchase Order: <span>" + po + "</span>");
    //    modal.find('.modal-body input').val(decision);
    //    modal.find('.btn-primary').text("Approve");
    //  }
    //  else if (decision.toLowerCase() === "decline") {
    //    modal.find('.modal-title').html("Decline Purchase Order: <span>" + po + "</span>");
    //    modal.find('.modal-body input').val(decision);
    //    modal.find('.btn-primary').text("Decline");
    //  }
    //});

  }]);

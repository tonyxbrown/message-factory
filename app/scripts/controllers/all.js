'use strict';

/**
 * @ngdoc Controller
 * @name AllCtrl
 * @description
 * # AllCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('AllCtrl', ['$scope', '$window', '$location', '$state', 'config_ui', '$timeout', 'MFAPIService', function ($scope, $window, $location, $state, config_ui, $timeout, MFAPIService) {

    var ctrl = this;
    this.displayed = [];

    this.callServer = function callServer(tableState) {
      console.log("callServer(); tableState: ",tableState);
      var start = 0;
      var max = 1000;

      $scope.loadMessages = function() {
        var orderBy = "";
        var order = "";
        if (tableState) {
          if (tableState.sort) {
            if (tableState.sort.predicate) {
              orderBy = tableState.sort.predicate;
              order = (tableState.sort.reverse) ? "desc" : "asc";
            }
          }
        }
        var params = {};
        if (orderBy) { params.orderBy = orderBy; }
        if (order) { params.order = order; }
        MFAPIService.getMessages(start,max,params).then(function(result) {
          $scope.messages = result.data;
          ctrl.displayed = result.data;
          start += 10;
        });
      };

      $scope.loadMessages();
    };

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
    $scope.selectRow = function(row) {
      console.log("Message " + row + " selected. Go to either edit or detail page.",row);
      //$location.url("/main/detail?po_num="+row_po);
      //$('#editModal').modal('show',row);
      $scope.currentRow = row;
      $('#editModal').modal('show');
      //$('#editModal').trigger("show",{msgRow: row});
    };

    $scope.numPerPage = 10;

    //let tour = new Shepherd.Tour({
    //  defaults: {
    //    classes: 'shepherd-theme-square-dark'
    //  }
    //});
    //tour.addStep('example', {
    //  title: 'Tab Navigation',
    //  text: 'Select All to see both Errors and Messages',
    //  attachTo: '.navbar-nav bottom',
    //  advanceOn: '.docs-link click'
    //});
    //tour.addStep('example', {
    //  title: 'Messages/Errors Table',
    //  text: 'Here you will see all your messages',
    //  attachTo: '.table-container bottom'
    //});
    //
    //tour.start();

    $scope.closeModal = function() {
      $('#editModal').modal('hide');
    };

    $scope.saveUpdate = function() {

    };

    $scope.deleteMessage = function() {
      if ($scope.currentRow && $scope.currentRow.msgCode) {
        var messageToDelete = {
          "msgCode": $scope.currentRow.msgCode
        };
        MFAPIService.deleteMessage(messageToDelete).then(function(result) {
          console.log("deleteMessage call returned. result: ",result);
        });
      }
      $('#editModal').modal('hide');
      $('#confirm-delete').modal('hide');
      setTimeout($scope.pageReload,500);

    };

    $scope.pageReload = function() {
      $state.go($state.current, {}, {reload: true});
    };

    $('#editModal').on('show.bs.modal', function () {

      var msg = $scope.currentRow;
      var msgCode = msg.msgCode;

      var modal = $(this);
      modal.msgCode = msgCode;

      modal.find('.modal-title').html("Edit Message: <span>" + msgCode + "</span>");
      $scope.modalMessageCode = msg.msgCode;
      $scope.modalAppName = msg.appName;
      $scope.modalInternalMessage = msg.messageInternal;
      $scope.modalMessageLevel = msg.messageLevel;
      $scope.modalLanguage = msg.language;
    });

  }]);

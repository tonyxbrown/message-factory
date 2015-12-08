'use strict';

/**
 * @ngdoc Controller
 * @name SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('SearchCtrl', ['$scope', '$window', '$location', '$state', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $state, $timeout, $filter, config_ui, MFAPIService) {

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

      var params = {};
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
      if (tableState.search && tableState.search.predicateObject) {
        params = tableState.search.predicateObject;
      }
      if (orderBy) { params.orderBy = orderBy; }
      if (order) { params.order = order; }

      var start = 0;
      var max = 1000;
      $scope.loadMessages = function(params) {
        MFAPIService.getMessages(start,max,params).then(function(result) {
          ctrl.displayed = result.data;
          ctrl.isLoading = false;
        });
      };

      $scope.loadMessages(params);

    };

    /**
     * @name SearchCtrl.hasPreviousPages
     * @description used for smart-table pagination to determine if pages exist
     * before currently displayed first page number
     */
    $scope.hasPreviousPages = function() {
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
     * @name SearchCtrl.langLookup
     * @param langCode
     * @description find the long name for a language given the short language code
     * ie. ENU -> English_(United_States)
     */
    $scope.langLookup = function(langCode) {
      return ($scope.languagesReverse && $scope.languagesReverse[langCode]) ?
        $scope.languagesReverse[langCode] : langCode;
    };

    /**
     * @name SearchCtrl.selectRow
     * @param row_po
     * @description used on click of a table row, navigates to detail page
     * Search page only navigates to a root detail page instead of a detail page
     * as subview within main
     */
    $scope.selectRow = function(row) {
      console.log("Message " + row + " selected. Go to edit modal.",row);
      $scope.currentRow = row;
      $('#editModal').modal('show');
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


    $scope.closeModal = function() {
      $('#editModal').modal('hide');
    };

    $scope.saveUpdate = function() {
      // grab values and format into post
      var messageToPost = {
        "_id": $scope.currentRow._id,
        "appName": $scope.modalAppName.appName,
        "msgCode": $scope.modalMessageCode,
        "message": $scope.modalMessage,
        "messageInternal": $scope.modalInternalMessage,
        "messageLevel": $scope.modalMessageLevel,
        "language": $scope.modalLanguage
      };

      // post object
      MFAPIService.editMessage(messageToPost).then(function(result) {
        console.log("editMessage call returned. result: ",result);
      });

      $('#editModal').modal('hide');
      setTimeout($scope.pageReload,500);
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
      for (var i=0; i<$scope.appObjects.length; i++) {
        if ($scope.appObjects[i].appName === msg.appName) {
          $scope.modalAppName = $scope.appObjects[i];
        }
      }
      $scope.modalMessage = msg.message;
      $scope.modalInternalMessage = msg.messageInternal;
      $scope.modalMessageLevel = msg.messageLevel;
      $scope.modalLanguage = msg.language;
    });

  }]);

'use strict';

/**
 * @ngdoc Controller
 * @name SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
/**
 * @ngdoc Filter
 * @name highlightFilter
 * @description
 * will add either highlight-term or highlight-term-secondary class to any text found to match the
 * global input or filter input strings
 */
  .filter('highlightFilter', ['$sce',
    function($sce) {
      return function(input, terms) {

        if (!input || !terms.globalInput) { return input; }

        var replace_regex = null;
        var newString = null;

        // regex matching for exact string requests
        if (terms.globalInput) {
          if ((terms.globalInput.charAt(0) === "'" && terms.globalInput.charAt(terms.globalInput.length-1) === "'") ||
            (terms.globalInput.charAt(0) === '"' && terms.globalInput.charAt(terms.globalInput.length-1) === '"') ) {
            var globalInputClean = terms.globalInput.substring(1,terms.globalInput.length-1);
            replace_regex = new RegExp(globalInputClean,"ig");
            newString = input.replace(replace_regex,function(match) {
              return "<span class='highlight-term'>"+match+"</span>";
            });
          }
          else {
            // do a match of any of the words
            var globalInputSplit = terms.globalInput.split(" ");
            globalInputSplit = globalInputSplit.join("|");
            replace_regex = new RegExp(globalInputSplit,"ig");
            newString = input.replace(replace_regex,function(match) {
              return "<span class='highlight-term'>"+match+"</span>";
            });
          }
        }
        if (terms.searchFilter) {
          if ((terms.searchFilter.charAt(0) === "'" && terms.searchFilter.charAt(terms.searchFilter.length-1) === "'") ||
            (terms.searchFilter.charAt(0) === '"' && terms.searchFilter.charAt(terms.searchFilter.length-1) === '"') ) {
            var searchFilterClean = terms.searchFilter.substring(1,terms.searchFilter.length-1);
            replace_regex = new RegExp(searchFilterClean,"ig");
            newString = newString.replace(replace_regex,function(match) {
              return "<span class='highlight-term-secondary'>"+match+"</span>";
            });
          }
          else {
            // do a match of any of the words
            var searchFilterSplit = terms.searchFilter.split(" ");
            searchFilterSplit = searchFilterSplit.join("|");
            replace_regex = new RegExp(searchFilterSplit,"ig");
            newString = newString.replace(replace_regex,function(match) {
              return "<span class='highlight-term-secondary'>"+match+"</span>";
            });
          }
        }

        return $sce.trustAsHtml(newString);

      };
    }])
  .controller('SearchCtrl', ['$scope', '$window', '$location', '$state', '$timeout', '$filter', 'config_ui', 'MFAPIService', function ($scope, $window, $location, $state, $timeout, $filter, config_ui, MFAPIService) {

    $scope.loadPageOptions = function() {
      MFAPIService.getAppNames().then(function(result) {
        if (result && result.data && result.data.results) {
          $scope.appObjects = result.data.results;
        }
        else {
          $scope.appObjects = [];
        }
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
        if (tableState.search.predicateObject.appName && tableState.search.predicateObject.appName === "?") {
          delete tableState.search.predicateObject.appName;
        }
        if (tableState.search.predicateObject.language && tableState.search.predicateObject.language === "?") {
          delete tableState.search.predicateObject.language;
        }
        //if (tableState.search.predicateObject.language) {
        //  tableState.search.predicateObject.language = tableState.search.predicateObject.language.replace("string:","");
        //}
        if (tableState.search.predicateObject) {
          params = tableState.search.predicateObject;
        }
      }
      if (orderBy) { params.orderBy = orderBy; }
      if (order) { params.order = order; }

      var start = 0;
      var max = 1000;
      $scope.loadMessages = function(params) {
        MFAPIService.getMessages(start,max,params).then(function(result) {
          // get current table language from dropdown
          // loop through ctrl.displayed and add a displayMessage property to each
          // set this displayMessage property to either .message or .whatever language selected
          if (tableState && tableState.search && tableState.search.predicateObject && tableState.search.predicateObject.language) {
            var langToUse = tableState.search.predicateObject.language.replace("string:","");
            langToUse = $scope.languages[langToUse];
            if (langToUse && langToUse !== "ENU") {
              for (var i=0; i<result.data.length; i++) {
                result.data[i].displayMessage = result.data[i][langToUse] || " ";
              }
            }
          }
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
      for (var prop in row) {
        if ($scope.languagesReverse[prop]) {
          var lang_id = $scope.addAnotherLanguage();
          $scope.modalMessages[lang_id] = row[prop];
          $scope.modalLanguages[lang_id] = $scope.languagesReverse[prop];

        }
      }
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

    $scope.additionalLanguages = [];
    $scope.modalMessages = {};
    $scope.modalLanguages = {};
    $scope.addAnotherLanguage = function() {
      console.log("search.js - addAnotherLanguage()");
      var lang_id = $scope.additionalLanguages.length + 1;
      $scope.additionalLanguages.push(lang_id);
      return lang_id;
    };

    $scope.closeModal = function() {
      $('#editModal').modal('hide');
    };

    $scope.saveUpdate = function() {

      var languageToUse = ($scope.languages[$scope.modalLanguage] || "ENU");

      if ($scope.modalAppName && $scope.modalAppName.appName && $scope.modalMessageCode && $scope.modalInternalMessage &&
        $scope.modalMessage && $scope.modalMessageLevel) {
        // grab values and format into post
        var messageToPost = {
          "_id": $scope.currentRow._id,
          "appName": $scope.modalAppName.appName,
          "msgCode": $scope.modalMessageCode,
          "message": $scope.modalMessage,
          "messageInternal": $scope.modalInternalMessage,
          "messageLevel": $scope.modalMessageLevel,
          "language": languageToUse
        };

        // Additional Languages logic - append to messageToPost
        if ($scope.modalMessages) {
          var count = 0;
          for (var obj in $scope.additionalLanguages) {
            console.log("add lang for: ", obj);
            if ($scope.modalLanguages[(count + 1).toString()] && $scope.modalMessages[(count + 1).toString()]) {
              messageToPost[$scope.languages[$scope.modalLanguages[(count + 1).toString()]]] = $scope.modalMessages[(count + 1).toString()];
            }
            count++;
          }
        }

        // post object
        MFAPIService.editMessage(messageToPost).then(function (result) {
          console.log("editMessage call returned. result: ", result);
        });

        $('#editModal').modal('hide');
        setTimeout($scope.pageReload, 500);
      }
      else {
        console.log("Do not have required form data to update this Message");
      }
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
      $scope.modalLanguage = $scope.langLookup(msg.language);
    });

  }]);

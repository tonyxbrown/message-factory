'use strict';

/**
 * @ngdoc Controller
 * @name MainCtrl
 * @description
 * # MainCtrl
 * Controller of the messageFactoryApp
 */
angular.module('messageFactoryApp')
  .controller('MainCtrl', function () {

  })
  .controller('SubnavCtrl', ['$scope', '$location', function ($scope, $location) {

    /**
     * @name MainCtrl.getClass
     * @param path
     * @returns {*}
     * @description determines if subnav option (all/errors/messages) should show an active state
     */
    $scope.getClass = function(path) {
      console.log("getClass:",$location.path(),path);
      if ($location.path() === path) {
        console.log("return active for path:",path);
        return "active";
      }
      else {
        return "";
      }
    };

  }]);



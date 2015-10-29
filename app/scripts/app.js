'use strict';

/**
 * @ngdoc App
 * @name messageFactoryApp
 * @description
 * # messageFactoryApp
 *
 * Main module of the application. Lists global configs, global filters, and routes.
 */
angular
  .module('messageFactoryApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'smart-table'
  ])
  .constant('config_ui', {
    'projectcode': 'MFUI',
    'num_rows_tablet': 7,
    'num_rows_desktop': 13,
    'environment': window.configOptions.environment,
    'loglevel': window.configOptions.loglevel
  })
  .constant('config_backend', {
    //'base_url': 'canned_data/',
    //'mf_api': 'all_messages.json',
    //'mf_admin_api': 'success.json',
    //'mf_appnames_api': 'all_app_names.json',
    //'mf_languages_api': 'all_languages.json'

    'base_url': window.configOptions.base_url,
    //'mf_api': 'admin/findAllMessage',
    'mf_api': 'mf',
    'mf_admin_createmessages_api': 'admin/createMessages',
    'mf_admin_createapp_api': 'admin/createApp',
    'mf_appnames_api': 'admin/findAllApp',
    'mf_languages_api': 'admin/findAllLanguage'
  })
/**
 * @ngdoc Controller
 * @name AppCtrl
 * @description
 * # AppCtrl
 * Controller of the messageFactoryApp
 */
  .controller('AppCtrl', function($rootScope, $scope, $location, config_ui) {

    // override console messages based on loglevel
    if (config_ui.loglevel <= 2) { console.log = function() {}; }
    if (config_ui.loglevel <= 1) { console.warn = function() {}; }
    if (config_ui.loglevel === 0) { console.error = function() {}; }

    /**
     * @name rootScope.back
     * @description defines back function to use window.history.back()
     * This back function is called from Return button on Detail page.
     * Handles use case of direct link via email - will go back to Main page, New tab
     */
    $rootScope.back = function () {
      if (document.referrer || window.history.length > 4) { // referrer = "" if we came from a direct link via email
        window.history.back();
      }
      else {
        $location.url("/main");
      }
    };

    // Allows canned data retrieval to filter rows for unique items
    Array.prototype.unique = function() {
      return this.reduce(function(accum, current) {
        if (accum.indexOf(current) < 0) {
          accum.push(current);
        }
        return accum;
      }, []);
    };

    console.log("config_ui:",config_ui);
    // Enable feedback mechanism for dev and qa environments.
    // Requires a rest backend to post feedback
    if (config_ui.environment === "qa" || config_ui.environment === "dev") {
      $.feedback({
        ajaxURL: window.configOptions.ajaxURL,
        html2canvasURL: window.configOptions.html2canvasURL
      });
    }

    /*
     onDocumentClick() using to toggle off mobile menu if it is open and user taps/clicks anywhere
     */
    var onDocumentClick = function() {
      var menuElement = angular.element(document.querySelector('.navbar-toggle'));
      if (menuElement.attr('aria-expanded') === "true") { // if menu is open
        var collapseElement = angular.element(document.querySelector('.navbar-collapse'));
        if (collapseElement.hasClass('collapse in')) { // ensure menu is actually open and not animating open
          menuElement.trigger('click');
        }
      }
    };

    var button = angular.element(document);
    button.on('click', onDocumentClick);

    $scope.$on('$destroy', function() {
      button.off('click', onDocumentClick);
    });

    /**
     * @name AppCtrl.checkToggle
     * @returns {boolean}
     * @description checks current location url, if we are on login screen then it will return false
     * This is used to determine if menu buttons should be shown (they are hidden until logged in)
     */
    $scope.checkToggle = function() {
      if ($location.url() === "/login") {
        return false;
      }
      return true;
    };

  })
  //.config(['$httpProvider', function($httpProvider) {
  //  $httpProvider.interceptors.push('apiInterceptor');
  //}])
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/main");
    $urlRouterProvider.when('/main', '/main/all');
    $stateProvider
      .state('main', {
        url: "/main",
        templateUrl: "views/main.html"
      })
      .state('main.all', {
        url: "/all",
        templateUrl: "views/all.html"
      })
      .state('main.errors', {
        url: "/errors",
        templateUrl: "views/errors.html"
      })
      .state('main.messages', {
        url: "/messages",
        templateUrl: "views/messages.html"
      })
      .state('createmessage', {
        url: "/createmessage",
        templateUrl: "views/create_message.html"
      })
      .state('createapp', {
        url: "/createapp",
        templateUrl: "views/create_app.html"
      })
      .state('export', {
        url: "/export",
        templateUrl: "views/export.html"
      })
      .state('search', {
        url: "/search",
        templateUrl: "views/search.html"
      });
  });
'use strict';

angular.module('messageFactoryApp')
  /**
   * @ngdoc Service
   * @name MFAPIService
   * @description MFAPIService contains api calls for item search, full item detail, and full po detail
   */
  .service('MFAPIService', ['$q', '$http', 'MFFactory', 'config_backend', function($q, $http, MFFactory, config_backend) {
    return {
      /**
       * @name getMessages
       * @memberof MFAPIService
       * @param start
       * @param number
       * @param params
       * @returns {Function|promise}
       * @description Main method to retrieve all items
       */
      getMessages: function(start, number, params) {
        var deferred = $q.defer();
        var queryStringData = "";
        if (params) {
          if (params.msgCode) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "msgCode=" + params.msgCode; }
          if (params.appName) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "appName=" + params.appName; }
          if (params.messageLevel) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "messageLevel=" + params.messageLevel; }
          if (params.language) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "language=" + params.language; }
          if (params.message) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "queryString=" + params.message; }
          //if (params.messageInternal) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "messageInternal=" + params.messageInternal; }
          if (params.orderBy) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "orderBy=" + params.orderBy; }
          if (params.order) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "order=" + params.order; }
        }
        if (start) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "pageNumber=" + start; }
        if (number) { queryStringData += ((queryStringData.length !== 0) ? "&" : "") + "perPage=" + 30; }
        console.log("queryStringData: ", queryStringData);
        var req = {
          method: 'GET',
          url: config_backend.base_url + config_backend.mf_api + "?" + queryStringData
        };

        $http(req).success(function(result) {
          var data = result.results;
          //var currentPage = result.currentPage;
          var totalPages = result.totalPages;
          var messages = [];
          for (var i = 0; i < data.length; i ++) {
            messages.push(new MFFactory(data[i]));
          }
          deferred.resolve({
            data: messages,
            numberOfPages: totalPages
          });
        }).error(function(err) {
          console.error("error with API request:",err);
          deferred.resolve({
            data: null,
            numberOfPages: 0,
            error: "API Request Error"
          });
        });

        return deferred.promise;
      },

      /**
       * @name getAppNames
       * @memberof MFAPIService
       * @returns {Function|promise}
       * @description Main method to retrieve all available app names
       */
      getAppNames: function() {
        var deferred = $q.defer();

        var req = {
          method: 'GET',
          url: config_backend.base_url + config_backend.mf_appnames_api
        };

        $http(req).success(function(result) {
          deferred.resolve({
            data: result
          });
        }).error(function(err) {
          console.error("error with API request:",err);
          deferred.resolve({
            data: null,
            error: "API Request Error"
          });
        });

        return deferred.promise;
      },

      /**
       * @name getLanguages
       * @memberof MFAPIService
       * @returns {Function|promise}
       * @description Main method to retrieve all available languages
       */
      getLanguages: function() {
        var deferred = $q.defer();

        var req = {
          method: 'GET',
          //url:'canned_data/all_languages.json'
          url: config_backend.base_url + config_backend.mf_languages_api
        };

        $http(req).success(function(result) {
          deferred.resolve({
            data: result.results
          });
        }).error(function(err) {
          console.error("error with API request:",err);
          deferred.resolve({
            data: null,
            error: "API Request Error"
          });
        });

        return deferred.promise;
      },

      /**
       * @name exportExcel
       * @memberof MFAPIService
       * @param appName
       * @returns {Function|promise}
       * @description Opens url in new window which should download the txt file to be opened in excel
       */
      exportExcel: function(appName) {
        console.log("adding appName to queryString: ",appName);

        var queryStringData = "appName=" + appName;
        window.open(config_backend.base_url + config_backend.mf_admin_export + "?" + queryStringData);

      },

      /**
       * @name createMessages
       * @memberof MFAPIService
       * @param start
       * @param number
       * @param params
       * @returns {Function|promise}
       * @description Method to create 1 or many new messages
       * If creating with multiple language messages, do something like:
       * 'message': 'something english',
       * 'CHT': 'something chinese',
       * etc.
       */
      createMessages: function(messages) {
        var deferred = $q.defer();
        var postData = {};
        if (messages.length > 1) { postData.many = messages; }
        else { postData = messages[0]; }
        console.log("adding request data: ",postData);
        var req = {
          method: 'POST',
          url: config_backend.base_url + config_backend.mf_admin_createmessages_api,
          data: $.param(postData),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };

        $http(req).then(function successCallback(result) {
          deferred.resolve({
            data: result.data
          });
        }, function errorCallback(result) {
          console.error("error with API request:",result);
          deferred.resolve({
            data: null,
            error: "API Request Error"
          });
        });

        return deferred.promise;
      },

      /**
       * @name editMessage
       * @memberof MFAPIService
       * @param message
       * @returns {Function|promise}
       * @description Method to edit 1 existing message
       * If creating with multiple language messages, do something like:
       * 'message': 'something english',
       * 'CHT': 'something chinese',
       * etc.
       */
      editMessage: function(message) {
        var deferred = $q.defer();
        var postData = message;
        console.log("adding request data: ",postData);
        var req = {
          method: 'PUT',
          url: config_backend.base_url + config_backend.mf_admin_editmessage_api,
          data: $.param(postData),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };

        $http(req).then(function successCallback(result) {
          deferred.resolve({
            data: result.data
          });
        }, function errorCallback(result) {
          console.error("error with API request:",result);
          deferred.resolve({
            data: null,
            error: "API Request Error"
          });
        });

        return deferred.promise;
      },

      /**
       * @name createApp
       * @memberof MFAPIService
       * @param appInfo
       * @returns {Function|promise}
       * @description Method to a new app
       */
      createApp: function(appInfo) {
        var deferred = $q.defer();
        var postData = appInfo;
        console.log("adding request data: ",postData);
        var req = {
          method: 'POST',
          url: config_backend.base_url + config_backend.mf_admin_createapp_api,
          data: $.param(postData),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };

        $http(req).then(function successCallback(result) {
          deferred.resolve({
            data: result.data
          });
        }, function errorCallback(result) {
          console.error("error with API request:",result);
          deferred.resolve({
            data: result,
            error: "API Request Error"
          });
        });

        return deferred.promise;
      },

      /**
       * @name deleteMessage
       * @memberof MFAPIService
       * @param msgCode
       * @returns {Function|promise}
       * @description Method to delete a message
       */
      deleteMessage: function(msgCodeObj) {
        var deferred = $q.defer();
        var postData = msgCodeObj;
        console.log("adding request data: ",postData);
        var req = {
          method: 'DELETE',
          url: config_backend.base_url + config_backend.mf_admin_delete_api,
          data: $.param(postData),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };

        $http(req).then(function successCallback(result) {
          deferred.resolve({
            data: result.data
          });
        }, function errorCallback(result) {
          console.error("error with API request:",result);
          deferred.resolve({
            data: result,
            error: "API Request Error"
          });
        });

        return deferred.promise;
      }
    };
  }])
  //.factory('apiInterceptor', ['$q', '$timeout', function($q, $timeout) {
  //  var apiInterceptor = {
  //    "response": function(response) {
  //      if (response.config.url.indexOf("json") === -1) {
  //        return response;
  //      }
  //      console.log("intercepting response: ", response);
  //      var deferred = $q.defer();
  //
  //      $timeout(function() {
  //        deferred.resolve(response);
  //      }, 250);
  //
  //      return deferred.promise;
  //    }
  //  };
  //  return apiInterceptor;
  //}])
  /**
   * @ngdoc Factory
   * @name MFFactory
   * @description MFFactory objects created here
   */
  .factory('MFFactory', function() {
    function MFFactory(data) {
      for (var attr in data) {
        if (data.hasOwnProperty(attr)) {
          this[attr] = data[attr];
        }
      }
    }

    return MFFactory;
  })
  /**
   * @ngdoc Factory
   * @name ItemDataService
   * @description ItemDataService for getting and setting purchase order data
   */
  .factory('ItemDataService', function() {
    var poData = {};
    function set(data) {
      poData = data;
    }
    function get() {
      return poData;
    }
    return {
      set: set,
      get: get
    };
  })
  /**
   * @ngdoc Factory
   * @name SearchDataService
   * @description SearchDataService for getting and setting Search table data
   */
  .factory('SearchDataService', function() {
    var displayedData = {};
    var tableState = {};
    function set(displayed,state) {
      displayedData = displayed;
      tableState = state;
    }
    function get() {
      return {'displayed':displayedData, 'state': tableState};
    }
    return {
      set: set,
      get: get
    };
  });


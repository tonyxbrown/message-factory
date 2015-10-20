'use strict';

angular.module('messageFactoryApp')
  /**
   * @ngdoc Service
   * @name POAPIService
   * @description POAPIService contains api calls for item search, full item detail, and full po detail
   */
  .service('POAPIService', ['$q', '$http', 'POFactory', 'config_backend', function($q, $http, POFactory, config_backend) {
    return {
      /**
       * @name getPurchases
       * @memberof POAPIService
       * @param start
       * @param number
       * @param params
       * @returns {Function|promise}
       * @description Main search method to retrieve all items according to global search input and filter input
       */
      getPurchases: function(start, number, params) {
        var deferred = $q.defer();
        // parse params search terms and fields into url params
        var searchtext = "";
        var searches = params.search.predicateObject;
        var sortOrderBy = (params.sort && params.sort.predicate) ? params.sort.predicate : "";
        var sortDirection = (params.sort && params.sort.reverse) ? "descending" : "ascending";
        var apiToUse = config_backend.item_search_api;

        // add search terms and counts, ie. igniter/0/10
        if (searches.global) {
          if (searches.globalFilter) {
            searchtext += encodeURIComponent(searches.global) + "/" + encodeURIComponent(searches.globalFilter) + "/" + start + "/" + number;
            apiToUse = config_backend.item_search_api2;
          }
          else {
            searchtext += encodeURIComponent(searches.global) + "/" + start + "/" + number;
          }
        }

        // add sort term and direction, ie. vendorName/descending
        if (sortOrderBy) {
          //rename sortOrderBy with database names
          if (sortOrderBy === "itemName") { sortOrderBy = "ItemRef_FullName"; }
          else if (sortOrderBy === "itemDescription") { sortOrderBy = "Desc"; }
          else if (sortOrderBy === "itemPartNumber") { sortOrderBy = "ManufacturerPartNumber"; }
          else if (sortOrderBy === "itemCustomer") { sortOrderBy = "CustomerRef_FullName"; }
          else if (sortOrderBy === "vendorName") { sortOrderBy = "VendorRef_FullName"; }
          else if (sortOrderBy === "referenceNumber") { sortOrderBy = "RefNumber"; }
          else if (sortOrderBy === "date") { sortOrderBy = "TxnDate"; }

          searchtext += "/" + sortOrderBy + "/" + sortDirection;
        }

        searchtext = encodeURIComponent(searchtext);
        console.log("getPurchases(); searchtext:",searchtext);

        $http.get(config_backend.base_url + apiToUse + searchtext).success(function(result) {
          var data = result.purchases;
          var totalCount = result.totalCount;
          var purchases = [];
          for (var i = 0; i < data.length; i ++) {
            purchases.push(new POFactory(data[i]));
          }
          deferred.resolve({
            data: purchases,
            numberOfPages: Math.ceil(totalCount / number)
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
       * @name getItemDetail
       * @memberof POAPIService
       * @param item_number
       * @returns {Function|promise}
       * @description Get full details about an item, only needed if directly linking to item detail page
       * or if refreshing item detail page
       */
      getItemDetail: function(item_number) {
        console.log("item_number:",item_number);
        var deferred = $q.defer();

        $http.get(config_backend.base_url+config_backend.item_detail_api + encodeURIComponent(item_number)).success(function(data) {
          deferred.resolve(data);
        });

        return deferred.promise;
      },
      /**
       * @name getPODetail
       * @memberof POAPIService
       * @param po_number
       * @returns {Function|promise}
       * @description Get full details about a PO
       */
      getPODetail: function(po_number) {
        console.log("po_number:",po_number);
        var deferred = $q.defer();

        $http.get(config_backend.base_url+config_backend.po_detail_api + encodeURIComponent(po_number)).success(function(data) {
          deferred.resolve(data);
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
   * @name POFactory
   * @description POFactory objects created here
   */
  .factory('POFactory', function() {
    function POFactory(data) {
      for (var attr in data) {
        if (data.hasOwnProperty(attr)) {
          this[attr] = data[attr];
        }
      }
    }

    return POFactory;
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


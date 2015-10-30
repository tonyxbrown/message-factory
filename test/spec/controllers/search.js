'use strict';

describe('Controller: SearchCtrl', function () {

  // load the controller's module
  beforeEach(module('messageFactoryApp'));

  var SearchCtrl,
    scope, location;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $window, $location) {
    scope = $rootScope.$new();
    location = $location;
    SearchCtrl = $controller('SearchCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('previous pages are found correctly', function() {
    var pagination_html = "<li><a>2</a></li><li><a>3</a></li><li><a>4</a></li><li><a>5</a></li><li><a>6</a></li>";
    var divElement = document.createElement('div');
    divElement.setAttribute('class','pagination');
    divElement.innerHTML = pagination_html;
    document.getElementsByTagName('body')[0].appendChild(divElement);
    expect(scope.hasPreviousPages()).toBeTruthy();

  });

  it('next pages are found correctly', function() {
    var pagination_html = "<li><a>2</a></li><li><a>3</a></li><li><a>4</a></li><li><a>5</a></li><li><a>6</a></li>";
    var divElement = document.createElement('div');
    divElement.setAttribute('class','pagination');
    divElement.innerHTML = pagination_html;
    document.getElementsByTagName('body')[0].appendChild(divElement);
    SearchCtrl.numberOfPages = 10;
    expect(scope.hasNextPages()).toBeTruthy();
  });

  it('callServer with empty state will return without API call', function() {
    var tableState = {
      pagination: {
        number: 10,
        start: 0,
        totalItemCount: 0
      },
      search: "",
      sort: ""
    };
    SearchCtrl.callServer(tableState);
    expect(SearchCtrl.numberOfPages).toBe(undefined);
  });


});

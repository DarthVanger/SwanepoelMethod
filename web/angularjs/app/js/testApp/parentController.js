(function() {
  'use strict';

  var app = angular.module('testModule');

  app.controller('parentController', function($scope) {
    $scope.parentTest = 'parent-scope-test';
  });

  app.controller('childController', function($scope) {
    $scope.childTest = $scope.parentTest + '-child-controller-here!';
  });

})();

(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('extrema', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'extrema.html'
    }
  });
})(); // end closure

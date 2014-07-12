(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('pseudoextrema', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'pseudoextrema.html'
    }
  });
})(); // end closure

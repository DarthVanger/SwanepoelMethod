(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('waitingExtremaCalculation', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'waiting-extrema-calculation.html'
    }
  });
})(); // end closure

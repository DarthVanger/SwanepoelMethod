(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('finalExtremaArray', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'final-extrema-array.html',
      controller: 'CalculationFlowCtrl'
    }
  });
})(); // end closure

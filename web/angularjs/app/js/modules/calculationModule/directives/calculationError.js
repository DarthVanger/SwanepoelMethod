(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('calculationError', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'calculation-error.html'
    }
  });
})(); // end closure

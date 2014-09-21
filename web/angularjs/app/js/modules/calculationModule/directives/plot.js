(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('plot', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'plot.html'
    }
  });
})(); // end closure

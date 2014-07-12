(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('envelopes', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'envelopes.html'
    }
  });
})(); // end closure

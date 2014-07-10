(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('rawExperimentalData', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'raw-experimental-data.html'
    }
  });
})(); // end closure

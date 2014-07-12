(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('findingExtremaPage', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'finding-extrema-page.html'
    }
  });
})(); // end closure

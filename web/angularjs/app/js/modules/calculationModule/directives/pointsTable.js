(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('pointsTable', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'points-table.html'
    }
  });
})(); // end closure

(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('pointsTable', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'points-table-template.html',
      scope: {
        points: '=',
        tableName: '@name'
      }
    };
  });
})(); // end closure

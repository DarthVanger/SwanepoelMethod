(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('loading', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'loading-template.html',
      scope: {
        IMG_PATH: '=imgPath',
        message: '@'
      }
    };
  });
})(); // end closure

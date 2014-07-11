(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('waitingFilmSpectrumFileUpload', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + 'waitingFilmSpectrumUpload.html'
    }
  });
})(); // end closure

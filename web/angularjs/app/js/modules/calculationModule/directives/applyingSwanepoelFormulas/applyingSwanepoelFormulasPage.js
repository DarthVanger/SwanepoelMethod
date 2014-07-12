(function() {
  'use strict';

  var app = angular.module('calculationModule');

  app.directive('applyingSwanepoelFormulasPage', function(CALCULATION_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: CALCULATION_MODULE_TEMPLATES_PATH + '/applyingSwanepoelFormulas/applying-swanepoel-formulas-page.html',
      controller: 'FormulasCtrl'
    }
  });
})(); // end closure

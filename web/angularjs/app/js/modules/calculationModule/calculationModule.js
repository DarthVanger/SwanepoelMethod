/** calculation module
 *
 *  Provides calculation controller and calculation services (calculus, formulas).
 */
(function() {
  'use sctrict';

  var app = angular.module('calculationModule', ['dataManagerModule', 'plotterModule']);

  app.value('CALCULATION_MODULE_TEMPLATES_PATH', '/angularjs/app/partials/calculationModule/');

})();

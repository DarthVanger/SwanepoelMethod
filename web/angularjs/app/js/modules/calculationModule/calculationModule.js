/** calculation module
 *
 *  Provides calculation controller and calculation services (calculus, formulas).
 */
(function() {
  'use sctrict';

  var app = angular.module('calculationModule', ['dataManagerModule', 'plotterModule', 'ui.router']);

  app.value('CALCULATION_MODULE_TEMPLATES_PATH', '/angularjs/app/partials/calculationModule/');

// DEPRECATED
/*
  app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/finding-extrema");
    $stateProvider
 //     .when('/finding-extrema', {
 //       templateUrl: '/angularjs/app/partials/calculationModule/finding-extrema-page.html',
 //       controller: 'CalculationFlowCtrl'
      .state('finding-extrema', {
        templateUrl: '/angularjs/app/partials/calculationModule/finding-extrema-page.html',
        controller: 'CalculationFlowCtrl'
      })
      .state('finding-extrema.step1', {
        url: '/step1',
        templateUrl: '/angularjs/app/partials/calculationModule/step-1-adjust-raw-experimental-data.html',
        controller: 'Step1AdjustRawExperimentalDataCtrl'
      });
  });
*/

})();

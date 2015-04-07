(function() {
  'use strict';

  // interpolate provider is changing '{{' to '{[{', so it doesn't interfer with Symfony's twig
  var app = angular.module('app', ['ngRoute', 'ui.router', 'dataManagerModule', 'calculationModule', 'plotterModule']);

  app.config(function($interpolateProvider) {
      $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });

 // DEPRECATED
 // app.config(['$routeProvider', function($routeProvider) {
 //   $routeProvider
 //     .when('/finding-extrema', {
 //       templateUrl: '/angularjs/app/partials/calculationModule/finding-extrema-page.html',
 //       controller: 'CalculationFlowCtrl'
 //     })
 //     .when('/applying-swanepoel-formulas', {
 //       templateUrl: '/angularjs/app/partials/calculationModule/applyingSwanepoelFormulas/applying-swanepoel-formulas-page.html',
 //       controller: 'FormulasCtrl'
 //     })
 //     .otherwise({
 //       redirectTo: '/finding-extrema'
 //     });
 // }]);
  app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/finding-extrema");
    $stateProvider
      .state('finding-extrema', {
        url: '/finding-extrema',
        templateUrl: '/angularjs/app/partials/calculationModule/pages/finding-extrema.html',
        controller: 'CalculationFlowCtrl'
      })
      .state('finding-extrema.loading', {
        templateUrl: '/angularjs/app/partials/calculationModule/loading.html'
      })
      .state('finding-extrema.step0', {
        templateUrl: '/angularjs/app/partials/calculationModule/steps/step-0-upload-data.html',
        controller: 'Step0UploadDataCtrl'
      })
      .state('finding-extrema.step1', {
        templateUrl: '/angularjs/app/partials/calculationModule/steps/step-1-adjust-uploaded-data.html',
        controller: 'Step1AdjustUploadedDataCtrl'
      })
      .state('finding-extrema.step2', {
        templateUrl: '/angularjs/app/partials/calculationModule/steps/step-2-find-extrema.html',
        controller: 'Step2FindExtremaCtrl'
      })
      .state('finding-extrema.step3', {
        templateUrl: '/angularjs/app/partials/calculationModule/steps/step-3-envelopes.html',
        controller: 'Step3EnvelopesCtrl'
      })
      .state('finding-extrema.step4', {
        templateUrl: '/angularjs/app/partials/calculationModule/steps/step-4-pseudo-extrema.html',
        controller: 'Step4PseudoExtremaCtrl'
      })
      .state('finding-extrema.step5', {
        templateUrl: '/angularjs/app/partials/calculationModule/pages/applying-swanepoel-formulas.html',
        controller: 'FormulasCtrl'
      });
  });


  app.controller('AppController', function($scope) {
    $scope.IMG_PATH = 'angularjs/app/img';
    $scope.ASSETS_PATH = 'angularjs/app';
  });

})();

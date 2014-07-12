(function() {
  'use strict';

  // interpolate provider is changing '{{' to '{[{', so it doesn't interfer with Symfony's twig
  var app = angular.module('app', ['ngRoute', 'dataManagerModule', 'calculationModule', 'plotterModule']);

  app.config(function($interpolateProvider){
      $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/finding-extrema', {
        templateUrl: '/angularjs/app/partials/calculationModule/finding-extrema-page.html',
        controller: 'CalculationFlowCtrl'
      })
      .when('/applying-swanepoel-formulas', {
        templateUrl: '/angularjs/app/partials/calculationModule/applyingSwanepoelFormulas/applying-swanepoel-formulas-page.html',
        controller: 'FormulasCtrl'
      })
      .otherwise({
        redirectTo: '/finding-extrema'
      });
  }]);

  app.controller('AppController', function($scope) {
    $scope.IMG_PATH = 'angularjs/app/img';
  });

})();

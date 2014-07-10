(function() {
  'use strict';

  // interpolate provider is changing '{{' to '{[{', so it doesn't interfer with Symfony's twig
  var app = angular.module('app', ['dataManagerModule', 'calculationModule', 'plotterModule'])
    .config(function($interpolateProvider){
      $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });

  app.controller('AppController', function($scope) {
    $scope.IMG_PATH = 'angularjs/app/img';
  });

})();

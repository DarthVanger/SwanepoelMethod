(function() {
  'use strict';

  // interpolate provider is changing '{{' to '{[{', so it doesn't interfer with Symfony's twig
  var app = angular.module('test', [])
    .config(function($interpolateProvider){
      $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });

  app.controller('TestController', function($scope) {
    $scope.IMG_PATH = 'img_path';
  });

  app.directive('testDirective', function() {
    return {
      restrict: 'A',
      scope: {
        templateValue: '@',
        IMG_PATH: '=imgPath'
      },
      template: 'templateValue: {{templateValue}}, img_path: {{IMG_PATH}}'
    };
  });

})();

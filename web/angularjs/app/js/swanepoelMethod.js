(function() {
  'use strict';

  // interpolate provider is changing '{{' to '{[{', so it doesn't interfer with Symfony's twig
  var app = angular.module('swanepoelMethod', ['fileManagerModule', 'calculationModule', 'plotterModule'])
    .config(function($interpolateProvider){
      $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });

})();

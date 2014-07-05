(function() {
  'use strict';

  // interpolate provider is changing {{ to {[{
  var app = angular.module('swanepoelMethod', ['lr.upload', 'calculation', 'plotter', 'fileUpload']).config(function($interpolateProvider){
          $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
      }
  );

  app.controller('cos', function($scope, calculus, plotter) {

    $scope.cosPoints = [];
    for (var i=0; i<20*Math.PI; i+=0.1){ 
      $scope.cosPoints.push([i, Math.sin(1.5*i) * Math.exp(.09*i) + 5*i]); 
    }

    $scope.extrema = calculus.findExtrema($scope.cosPoints);

    $scope.drawPlot = plotter.plot('#flot-plot', [
      { data: $scope.cosPoints, label: "experiment"},
      { data: $scope.extrema.minima, label: "minima"},
      { data: $scope.extrema.maxima, label: "maxima"}
    ]);

    $scope.onSuccess = function(response) {
      console.log(response.data);
    }

  }); // end controller 

   app.directive('fileUploadForm', function() {
    return {
      restrict: 'E',
      templateUrl: '/angularjs/app/partials/fileUploadForm.html'
    };
  });

})();

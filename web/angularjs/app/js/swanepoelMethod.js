(function() {
  'use strict';

  // interpolate provider is changing {{ to {[{
  var app = angular.module('swanepoelMethod', ['fileManagerModule', 'calculationEngine', 'plotterModule']).config(function($interpolateProvider){
          $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
      }
  );

  app.controller('cos', function($scope, $http, Calculus, Plotter, FileManager, FileSystemAPI) {
    $scope.FileManager = FileManager;

    $scope.experimentalData = 'not loaded yet';
    $scope.$watch('FileManager.experimentalData', function(experimentalData) {
      $scope.experimentalData = experimentalData;
      //$scope.experimentalDataIsLoaded = experimentalDataIsLoaded;

      $scope.extrema = Calculus.findExtrema($scope.experimentalData);

      $scope.plotData = [
        { data: $scope.experimentalData, label: "experiment"},
        { data: $scope.extrema.minima, label: "minima"},
        { data: $scope.extrema.maxima, label: "maxima"}
      ];

      $scope.$watch(function() { return $('#flot-plot').hasClass('ng-visible') }, function() {
        Plotter.plot('#flot-plot', $scope.plotData);
      });

    });

    //$scope.cosPoints = [];
    //for (var i=0; i<20*Math.PI; i+=0.1){ 
    //  $scope.cosPoints.push([i, Math.sin(1.5*i) * Math.exp(.09*i) + 5*i]); 
    //}

    //FileSystemAPI.saveFile('cosPoints.csv', FileManager.convertToCsv($scope.cosPoints)).then(function(response) {
    //  console.log('upload success, response = ' + response.data); 
    //});

    //$scope.extrema = Calculus.findExtrema($scope.cosPoints);

    //$scope.drawPlot = Plotter.plot('#flot-plot', [
    //  { data: $scope.cosPoints, label: "experiment"},
    //  { data: $scope.extrema.minima, label: "minima"},
    //  { data: $scope.extrema.maxima, label: "maxima"}
    //]);

  }); // end controller 

   app.directive('fileUploadForm', function() {
    return {
      restrict: 'E',
      templateUrl: '/angularjs/app/partials/fileUploadForm.html'
    };
  });

})();

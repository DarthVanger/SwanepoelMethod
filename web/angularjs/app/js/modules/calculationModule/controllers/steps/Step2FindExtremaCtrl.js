(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step2FindExtremaCtrl', function($scope, $http, $compile, DataManager, Calculus, Formulas, Plotter) {
    var self = this;

    console.log("Step2 init");
    $scope.uiStep = 2;




  /** showRawFilmSpectrum
   *  Shows raw experimental data with the plot.
   */
  function showData() {
    console.log('debug', 'showRawFilmSpectrum() called');

    $scope.plotData[0] = { data: $scope.filmSpectrum, label: "film spectrum"};
    Plotter.plot('data-plot', $scope.plotData, $scope.plotOptions);
    console.log('film spectrum = ' + DataManager.data.filmSpectrum);
    //handsontableOptions.data = $scope.filmSpectrum;
    //$('#data-table').handsontable(handsontableOptions);
  };

  }); // end controller
})(); // end closure

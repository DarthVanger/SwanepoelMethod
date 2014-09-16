(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step0UploadDataCtrl', function($scope, $http, $compile, DataManager, Calculus, Formulas, Plotter) {
    var self = this;

    console.log("Step0 init");
    loadInitialExperimentalData();
    $scope.uiStep = 0;

    // listen for new film spectrum file upload start to reset calculation progress
    $scope.$on('NewFilmSpectrumFileUploadStart', function() {
      console.log('debug', 'CalculationFlowCtrl: caught \'NewFilmSpectrumFileUploadStart\'');
      //resetCalculationProgress();
    });

    // listen for file upload success, to update the experimental data
    $scope.$on('NewFilmSpectrumFileUploaded', function(event, filename) {
      console.log('debug', 'CalculationController: Catched \'NewFilmSpectrumFileUploaded\' event');
      // reset calculation progress, because new data was loaded
      resetCalculationProgress();
      $scope.calculationProgress.filmSpectrumFileUploaded = true;
      // load new data from file
      DataManager.loadFilmSpectrumFromFile(filename).then(function(result) {
        $scope.calculationProgress.filmSpectrumDataLoaded = true;
        // update the data
        $scope.filmSpectrum = result.data;
        $scope.extremaRightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length-1][0];
        // begin with first step again
        showRawFilmSpectrum();
      });
    });

    /** loadInitialExperimentalData
     *  Loads last uploaded file data as initial data to show instead of blank page.
     */
    function loadInitialExperimentalData() {
      var INITIAL_SUBSTRATE_REFRACTIVE_INDEX = .92;

      console.log('debug', 'loadInitialExperimentalData() called');
      DataManager.getLastUploadedFilmSpectrum().then(function(result) {
        //console.log('debug', 'CalculationController: getting last experimental data, data = ' + result.data);
        console.log('debug', 'loadInitialExperimentalData(): last uploaded film spectrum loaded');
        $scope.calculationProgress.filmSpectrumFileUploaded = true;
        $scope.calculationProgress.filmSpectrumDataLoaded = true;
        $scope.filmSpectrum = result.data; 
        DataManager.data.filmSpectrum = result.data;
        $scope.extremaRightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length-1][0];
      }); 
    }


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

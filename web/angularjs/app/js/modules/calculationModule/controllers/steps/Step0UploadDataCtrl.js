(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step0UploadDataCtrl', function($scope, $http, $compile, $state, DataManager, Calculus, Formulas, Plotter) {
    var self = this;

    console.log("Step0 init");
    $scope.uiStep = 0;

    // listen for new film spectrum file upload start to show 'loading...'
    $scope.$on('NewFilmSpectrumFileUploadStart', function() {
      console.log('debug', 'CalculationFlowCtrl: caught \'NewFilmSpectrumFileUploadStart\'');
      $scope.loading = true;
      //resetCalculationProgress();
    });

    // listen for file upload success, to update the experimental data
    $scope.$on('NewFilmSpectrumFileUploaded', function(event, filename) {
      console.log('debug', 'CalculationController: Catched \'NewFilmSpectrumFileUploaded\' event');
      // load new data from file
      DataManager.loadFilmSpectrumFromFile(filename).then(function(result) {
        // update the data
        try {
            DataManager.data.filmSpectrum = result.data;
        } catch(exception) {
            console.log(exception)
        }
        $scope.extremaRightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length-1][0];
      });
    });

    /**
     * Use sample data instead of uploading a file.
     */
    $scope.tryWithSampleData = function() {
      //$scope.$emit('NewFilmSpectrumFileUploaded', 'sample.dat');
      // load new data from file
      DataManager.loadFilmSpectrumFromFile('sample.dat').then(function(result) {
        // update the data
        try {
            DataManager.data.filmSpectrum = result.data;
        } catch(exception) {
            console.log(exception)
        }
        $scope.extremaRightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length-1][0];

        $scope.$parent.goToNextUserStep();
      });
    }

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

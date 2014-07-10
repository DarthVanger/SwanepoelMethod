  /** CalculationFlowCtrl
   *
   *  Controls the calculation flow (process),
   *  responds to user actions.
   *
   */
(function() { 
   'use strict';

   var app = angular.module('calculationModule');

   app.controller('CalculationFlowCtrl', function($scope, DataManager, Calculus, Formulas, Plotter) {
      var self = this;

      // plot data and options for 'flot' plotting tool
      var plotData = [];
      var plotOptions = {
        grid: {
          hoverable: true,
          markings : []
        }
      };
      

      /**
       *  film spectrum data in double array format.
       *  E.g. [ [1,2], [3,4], ... ]
       */
      $scope.filmSpectrum = 'not loaded yet';

      $scope.substrateRefractiveIndex = 500;

      /**
       *  Calculation progress stages, which show/hide corresponding divs,
       *  when toggled true/false.
       */
      $scope.calculationProgress = {
        filmSpectrumFileUploaded: false,
        filmSpectrumDataLoaded: false,
        calculatingExtrema: false,
        extremaFound: false
      };

      // values to calculate
      $scope.extrema = 'not calculated yet';

      /******************* Controller logic **************************/

      // load some initial data to show not blank page
      angular.element(document).ready(function () {
        loadInitialExperimentalData(); 
      });
      
      /****** watchers & listeners for spectra upload & refractive index change *******/

      $scope.$watch('substrateRefractiveIndex', function(newValue, oldValue) {
        resetCalculationProgress();
        showRawFilmSpectrum();
      });

      // listen for new film spectrum file upload start to reset calculation progress
      $scope.$on('NewFilmSpectrumFileUploadStart', function() {
        console.log('debug', 'CalculationFlowCtrl: caught \'NewFilmSpectrumFileUploadStart\'');
        resetCalculationProgress();
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
          // begin with first step again
          showRawFilmSpectrum();
        });
      });

      /******** calculation step 1 - find extrema *********/

      /** findExtrema
       *  Find extrema. Is called on user button click.
       */
      $scope.findExtrema = function() {
        $scope.calculationProgress.calculatingExtrema = true;
        Calculus.findExtrema($scope.filmSpectrum, {}, function(extrema) {
          $scope.minima = extrema.minima;
          $scope.maxima = extrema.maxima;
          $scope.calculationProgress.extremaFound = true;
          plotExtrema();
        });
      }

      $scope.$watch('extremaLeftBoundary', function(newValue, oldValue) {
        plotOptions.grid.markings[1] = 
          { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaLeftBoundary, to: $scope.extremaLeftBoundary} };
        Plotter.plot('extrema-plot', plotData, plotOptions);
      });
      $scope.$watch('extremaRightBoundary', function(newValue, oldValue) {
        plotOptions.grid.markings[2] = 
          { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaRightBoundary, to: $scope.extremaRightBoundary} };
        Plotter.plot('extrema-plot', plotData, plotOptions);
      });

      $scope.updateExtremaConsideringNewBoundaries = function() {
        console.log('update extrema considering new boundaries called');
        Calculus.findExtrema($scope.filmSpectrum, {
          leftBoundary: $scope.extremaLeftBoundary,
          rightBoundary: $scope.extremaRightBoundary
        }, function(extrema) {
          $scope.minima = extrema.minima;
          $scope.maxima = extrema.maxima;
          updateExtremaOnPlot(); 
        });
      };

      // TBD: Next step is to add 'start calculations button'
      // and launch extrema calculation on its click,
      // showing 'calculating' animated icon, then
      // showing extrema coordinates and plot.
      // Then implement extrema bounds and sensivity.
      // Also implement $broadcasting calculation error on exception catch.
      // Implement 'back' button also.

      /********* Private methods ***********/

      /** loadInitialExperimentalData
       *  Loads last uploaded file data as initial data to show instead of blank page.
       */
      var loadInitialExperimentalData = function() {
        DataManager.getLastUploadedFilmSpectrum().then(function(result) {
          //console.log('debug', 'CalculationController: getting last experimental data, data = ' + result.data);
          $scope.calculationProgress.filmSpectrumFileUploaded = true;
          $scope.calculationProgress.filmSpectrumDataLoaded = true;
          $scope.filmSpectrum = result.data; 
          showRawFilmSpectrum();
        }); 
      }


      /** showRawFilmSpectrum
       *  Shows raw experimental data with the plot.
       */
      var showRawFilmSpectrum = function() {
        $scope.calculationProgress.filmSpectrumFileUploaded = true;
        $scope.calculationProgress.filmSpectrumDataLoaded = true;

        plotData = [
          { data: $scope.filmSpectrum, label: "film spectrum"},
        ];
        // setting up substrate refracting index horizontal line
        plotOptions.grid.markings = [
          {
            color: '#000',
            lineWidth: 2,
            yaxis: { from: $scope.substrateRefractiveIndex, to: $scope.substrateRefractiveIndex }
          }
        ];
        Plotter.plot('experimental-data', plotData, plotOptions);
      };

      /** plotExtrema
       *  Plots extrema to '#extrema-plot'
       */
      var plotExtrema = function() {
        plotData.push(
          {data: $scope.minima, label: "minima"},
          {data: $scope.maxima, label: "maxima"}
        );
        Plotter.plot('extrema-plot', plotData, plotOptions);
      };

      /** updateExtremaOnPlot
       *  Updates extrema on plot '#extrema-plot'
       */
      var updateExtremaOnPlot = function() {
        plotData[1] = {data: $scope.minima, label: "minima"};
        plotData[2] = {data: $scope.maxima, label: "maxima"};
        Plotter.plot('extrema-plot', plotData, plotOptions);
      };

      /** resetCalculationProgress
       *  Sets all progress flags of $scope.calculationProgress to false.
       *  This will automatically hide everything from screen, except file upload button.
       *
       *  @return void
       */
       var resetCalculationProgress = function() {
         for(var progressFlag in $scope.calculationProgress) {
           progressFlag = false; 
         }
       }
    }); // end CalculationCtrl
})(); // end closure

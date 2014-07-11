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
        lines: { show: false},
        points: { show: true, fill: true, radius: 1, symbol: 'circle' },
        grid: { hoverable: true },
        legend: { position: 'sw' },
        tooltip: true
      };

      //var plotOptions = {
      //  grid: {
      //    hoverable: true,
      //    markings : []
      //  }
      //};
      

      /**
       *  film spectrum data in double array format.
       *  E.g. [ [1,2], [3,4], ... ]
       */
      $scope.filmSpectrum = 'not loaded yet';

      $scope.substrateRefractiveIndex;

      /**
       *  Calculation progress stages, which show/hide corresponding divs,
       *  when toggled true/false.
       */
      $scope.calculationProgress = {
        filmSpectrumFileUploaded: false,
        filmSpectrumDataLoaded: false,
        calculatingExtrema: false,
        extremaFound: false,
        calculatingEnvelopes: false,
        envelopesFound: false
      };
      $scope.calculationError;
      $scope.calculationErrorCatched = false;

      // extrema scope variables
      $scope.extrema = 'not calculated yet';
      $scope.extremaLeftBoundary = 600;
      $scope.extremaRightBoundary;
      $scope.extremaYThreshold = 5;

      /******************* Controller logic **************************/

      angular.element(document).ready(function () {
        console.log('debug', 'document ready, loading inital exp data');

        /**
         *  Listen to CalculationError
         */
        $scope.$on('CalculationError', function(event, error) {
          console.log('debug', 'catched broadcast of calculation error:), message = ' + error.message);
          $scope.calculationError = error.message;
          $scope.calculationErrorCatched = true;
        });

      // load some initial data to show not blank page
        loadInitialExperimentalData(); 
      
        /****** watchers & listeners for spectra upload & refractive index change *******/

        $scope.$watch('substrateRefractiveIndex', function(newValue, oldValue) {
          if(newValue) {
            console.log('debug', 'substrateRefractiveIndex changed, newValue = ' + newValue + ', old value = ' + oldValue);
            resetCalculationProgress();
            showRawFilmSpectrum();
          }
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
            $scope.extremaRightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length-1][0];
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
          console.log('$scope.findExtrema() called');
          Calculus.findExtrema($scope.filmSpectrum, {
            //leftBoundary: $scope.leftBoundary,
            //rightBoundary: $scope.filmSpectrum($scope.filmSpectrum.length),
            //yThreshold: $scope.yThreshold
          }, function(extrema) {
            console.log('$scope.findExtrema: Calculus.findExtrema success');
            $scope.minima = extrema.minima;
            $scope.maxima = extrema.maxima;
            $scope.calculationProgress.extremaFound = true;
            plotExtrema();
          });
        }
        
        /**
         *  Extrema boundary change watchers. They Redraw plot on change!
         */ 
        $scope.$watch('extremaLeftBoundary', function(newValue, oldValue) {
          console.log('debug', 'extremaLeftBoundary changed. newValue = ' + newValue + ', oldValue = ' + oldValue);
          if(newValue) {
            plotOptions.grid.markings[1] = 
              { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaLeftBoundary, to: $scope.extremaLeftBoundary} };
            Plotter.plot('extrema-plot', plotData, plotOptions);
          }
        });
        $scope.$watch('extremaRightBoundary', function(newValue, oldValue) {
          if(newValue) {
            plotOptions.grid.markings[1] = 
              { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaLeftBoundary, to: $scope.extremaLeftBoundary} };
            plotOptions.grid.markings[2] = 
              { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaRightBoundary, to: $scope.extremaRightBoundary} };
            Plotter.plot('extrema-plot', plotData, plotOptions);
          }
        });

        /**
         *  Recalculate extrema is called by button click, after user have changed options.
         */
        $scope.recalculateExtrema = function() {
          console.log('RecalculateExtrema() called');
          try {
            resetCalculationProgressTo('calculatingExtrema');
            Calculus.findExtrema($scope.filmSpectrum, {
              leftBoundary: $scope.extremaLeftBoundary,
              rightBoundary: $scope.extremaRightBoundary,
              yThreshold: $scope.extremaYThreshold
            }, function(extrema) {
              $scope.minima = extrema.minima;
              $scope.maxima = extrema.maxima;
              $scope.calculationProgress.extremaFound = true;
              updateExtremaOnPlot(); 
            });
          } catch(error) {
            console.log('debug', 'catched calculationError, message = ' + error.message);
            $scope.$broadcast('CalculationError', error);
          }
        };

        /********* Calculation Step 2 - find envelopes ***************/
        
        $scope.findEnvelopes = function() {
          console.log('debug', 'findEnvelopes called');
          $scope.calculationProgress.calculatingEnvelopes = true;
          try {
            Calculus.findEnvelope($scope.minima, function(envelope) {
              //$scope.calculationProgress.envelopesFound = true;
              $scope.minimaEnvelope = envelope; 
            });
          } catch (error) {
            $scope.$broadcast('CalculationError', error);
          }
        }


        // TBD:
        // Also implement $broadcasting calculation error on exception catch.
        // Implement 'back' button also.
      
      }); // end document.ready()

      /****************************************************************/
      /*********************** Private methods ************************/
      /****************************************************************/

      /** loadInitialExperimentalData
       *  Loads last uploaded file data as initial data to show instead of blank page.
       */
      var loadInitialExperimentalData = function() {
        var INITIAL_SUBSTRATE_REFRACTIVE_INDEX = 500;

        console.log('debug', 'loadInitialExperimentalData() called');
        DataManager.getLastUploadedFilmSpectrum().then(function(result) {
          //console.log('debug', 'CalculationController: getting last experimental data, data = ' + result.data);
          console.log('debug', 'loadInitialExperimentalData(): last uploaded film spectrum loaded');
          $scope.calculationProgress.filmSpectrumFileUploaded = true;
          $scope.calculationProgress.filmSpectrumDataLoaded = true;
          $scope.filmSpectrum = result.data; 
          $scope.extremaRightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length-1][0];

          $scope.substrateRefractiveIndex = INITIAL_SUBSTRATE_REFRACTIVE_INDEX;
          // changing substrateRefractiveIndex will launch showRawFilmData(), because its being $watched.
        }); 
      }


      /** showRawFilmSpectrum
       *  Shows raw experimental data with the plot.
       */
      var showRawFilmSpectrum = function() {
        console.log('debug', 'showRawFilmSpectrum() called');
        $scope.calculationProgress.filmSpectrumFileUploaded = true;
        $scope.calculationProgress.filmSpectrumDataLoaded = true;

        plotData[0] = { data: $scope.filmSpectrum, label: "film spectrum"};
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
        // plotData[0] should be  film spectrum
        plotData[1] =
          {data: $scope.minima, label: "minima"};
        plotData[2] = 
          {data: $scope.maxima, label: "maxima"};
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
           $scope.calculationProgress[progressFlag] = false; 
         }
       }

       /**
        * Resets calculation progress to @param calculationProgressPoint point
        */
       var resetCalculationProgressTo = function(calculationProgressPoint) {
         var reachedDesiredPoint = false;
         for(var progressFlag in $scope.calculationProgress) {
           if(!reachedDesiredPoint) {
             $scope.calculationProgress[progressFlag] = true; 
           } else {
             $scope.calculationProgress[progressFlag] = false;
           }
           if(progressFlag === calculationProgressPoint) {
             reachedDesiredPoint = true;
           }
         }
       }
    }); // end CalculationCtrl
})(); // end closure

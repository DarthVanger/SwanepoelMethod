  /** CalculationFlowCtrl
   *
   *  Controls the calculation flow (process),
   *  responds to user actions.
   *
   */
(function() { 
   'use strict';

   var app = angular.module('calculationModule', []);

   app.controller('CalculationFlowCtrl', function($scope, DataManager, Calculus, Formulas, Plotter) {
      var self = this;

      /**
       *  Experimental data in double array format.
       *  E.g. [ [1,2], [3,4], ... ]
       */
      $scope.filmSpectrum= 'not loaded yet';

      /**
       *  Calculation progress stages, which show/hide corresponding divs,
       *  when toggled true/false.
       */
      $scope.calculationProgress = {
        filmSpectrumFileUploaded: false,
        filmSpectrumDataLoaded: false
      }

      this.extrema = 'not calculated yet';

      // load some initial data to show not blank page
      angular.element(document).ready(function () {
        loadInitialExperimentalData(); 
      });

      // listen for file upload, to update the experimental data
      $scope.$on('NewFilmSpectrumFileUploaded', function(event, filename) {
        console.log('debug', 'CalculationController: Catched \'NewFilmSpectrumFileUploaded\' event');
        // reset calculation progress, because new data was loaded
        resetCalculationProgress();
        $scope.calculationProgress.filmSpectrumFileUploaded = true;
        // load new data from file
        ExperimentalDataManager.loadFilmSpectrumFromFile(filename).then(function(result) {
          $scope.calculationProgress.filmSpectrumDataLoaded = true;
          // update the data
          $scope.filmSpectrum = result.data;
          // begin with first step again
          showRawFilmSpectrum();
        });
      });

      // TBD: Next step is to add 'start calculations button'
      // and launch extrema calculation on its click,
      // showing 'calculating' animated icon, then
      // showing extrema coordinates and plot.
      // Then implement extrema bounds and sensivity.
      // Also implement $broadcasting calculation error on exception catch.
      // Implement 'back' button also.

      /** loadInitialExperimentalData
       *  Loads last uploaded file data as initial data to show instead of blank page.
       */
      var loadInitialExperimentalData = function() {
        ExperimentalDataManager.getLastUploadedFilmSpectrum().then(function(result) {
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
        $scope.calculationProgress.filmSpectrumLoaded = true;
        var plotData = [
          { data: $scope.filmSpectrum, label: "film spectrum"}
        ];
        Plotter.plot('experimental-data', plotData);
      }

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

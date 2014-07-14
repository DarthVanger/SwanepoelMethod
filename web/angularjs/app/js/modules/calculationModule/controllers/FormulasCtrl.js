  /** 
   * Controls applying of swanepoel formulas to extrema array. 
   *
   */
(function() { 
   'use strict';

   var app = angular.module('calculationModule');

   app.controller('FormulasCtrl', function($scope, DataManager, Formulas, Plotter, Statistics) {
      var self = this;

      var handsontableOptions = {
        contextMenu: true,
        colWidths: [100, 100, 100],
        colHeaders: ['wavelength', 'T minima', 'T Maxima'],
        columns: [{type: 'numeric', format: '0.0'}, {type: 'numeric', format: '0.00'}, {type: 'numeric', format: '0.00'}]
      }

      // plot data and options for 'flot' plotting tool
      var plotData = [];
      var plotOptions = {
        lines: { show: false},
        points: { show: true, fill: true, radius: 1, symbol: 'circle' },
        grid: { hoverable: true },
        legend: { position: 'nw' },
        tooltip: true
      };

      var INITIAL_SUBSTRATE_TRANSMISSION = .92;

      
      /**
       *  Calculation progress flags.
       *  Are used with ng-show/ng-hide in html. 
       */
      $scope.calculationProgress = {
        extremaReady: false,
        spectrumReady: false,
        extremaAndSpectrumReady: false
      };
      $scope.calculationError;
      $scope.calculationErrorCatched = false;

      /**
       *  Extrema array in format
       *  [wavelength, T_min, T_max]
       */
      $scope.extrema = DataManager.data.extrema;
      $scope.filmSpectrum = DataManager.data.filmSpectrum;

      /**
       *  variables used in calculations
       */
      $scope.substrateTransmission = INITIAL_SUBSTRATE_TRANSMISSION;
      $scope.substrateRefractiveIndex = Formulas.calculateSubstrateRefractiveIndex($scope.substrateTransmission);
      $scope.refractiveIndexFirstApproximation = [];

      /**
       * auxilary calculation variables
       */
      $scope.N = [];

      /******** Calculation Step 0: waiting for input extrema data ***********/

      /**
       *  Set extremaReady flag if extrema are ready.
       *  Or load last used extrema.
       */ 
      if($scope.extrema && $scope.filmSpectrum) {
        $scope.calculationProgress.extremaAndSpectrumReady= true;
      } else {
        DataManager.getLastUploadedExtrema().then(function(result) {
          $scope.extrema = result.data; 
          $scope.calculationProgress.extremaReady = true;

          // now get last film spectrum
          DataManager.getLastUploadedFilmSpectrum().then(function(result) {

            $scope.filmSpectrum = result.data; 

            $scope.substrateTransmission = INITIAL_SUBSTRATE_TRANSMISSION;

            $scope.calculationProgress.filmSpectrumReady = true;
            $scope.calculationProgress.extremaAndSpectrumReady = true;
          }); 
        });
      }

      /**
       *  Listen to 'NewExtremaFileUploaded'
       */
      $scope.$on('NewExtremaFileUploaded', function(event, filepath) {
          console.log('debug', 'FormulasCtrl: Catched \'NewExtremaFileUploaded\' event');
          // reset calculation progress, because new data was loaded
          resetCalculationProgress();
          //$scope.calculationProgress.filmSpectrumFileUploaded = true;
          // load new data from file
          DataManager.extractDataFromFile(filepath).then(function(result) {
            console.log('debiug', 'FormulasCtrl.extracting uploaded file ok, result.data.length = ' + result.data.length);
            // update the data
            $scope.extrema = result.data;
            // toggle extrema ready flag
            $scope.calculationProgress.extremaReady = true;
          });
      });

      $scope.$watch('substrateTransmission', function(newValue, oldValue) {
        if(newValue) {
          console.log('debug', 'substrateTransmission changed, newValue = ' + newValue + ', old value = ' + oldValue);
          $scope.substrateRefractiveIndex = Formulas.calculateSubstrateRefractiveIndex(newValue);
          if($scope.calculationProgress.extremaAndSpectrumReady) {
            plotExtrema();
          }
        }
      });

      /** 
       *  Watch calculationProgress.extremaReady to init handsontable
       */
      $scope.$watch('calculationProgress.extremaAndSpectrumReady', function(newVal) {
        if(newVal) {
          showExtremaTable();
          plotExtrema();
        }
      });

      /**
       *  Update extrema after user edits in handsontable
       */
      $scope.updateExtremaFromTable = function() {
        resetCalculationProgressTo('extremaAndSpectrumReady');
        var handsontable = $('#extrema-table-formulas-page').data('handsontable');
        $scope.extrema = DataManager.filterUserInput(handsontable.getData());
        console.log('debug', 'FormulasCtrl: saving extrema table edits ok');
        showExtremaTable();
        plotExtrema();
      }

      /****** Step 1: calculating n_1 - refractive index first approximation ********/
      $scope.calculateRefractiveIndexFirstApproximation = function() {
        $scope.refractiveIndexFirstApproximation =
          Formulas.refractiveIndexFirstApproximation($scope.extrema, $scope.substrateRefractiveIndex);
        $scope.calculationResultsArray = DataManager.joinColumnToTable($scope.extrema, $scope.refractiveIndexFirstApproximation);

        $scope.calculationProgress.refractiveIndexFirstApproximationReady = true;
        showRefractiveIndexFirstApproximationTable();
      }

      $scope.calculateFilmThicknessFirstApproximation = function() {
        $scope.filmThicknessFirstApproximation =
          Formulas.filmThicknessFirstApproximation($scope.calculationResultsArray);
        // film thickness array length = resultsArray.length -2, so add two '-'.
        $scope.filmThicknessFirstApproximation.unshift('-');
        $scope.filmThicknessFirstApproximation.unshift('-');

        $scope.calculationResultsArray = DataManager.joinColumnToTable(
          $scope.calculationResultsArray, $scope.filmThicknessFirstApproximation
        );

        $scope.calculationProgress.filmThicknessFirstApproximationReady = true;
        showFilmThicknessFirstApproximationTable();
      }

      $scope.updateCalculationResultsFromTable = function(tableId) {
        //resetCalculationProgressTo('');
        var handsontable = $('#' + tableId).data('handsontable');
        $scope.calculationResultsArray = DataManager.filterUserInput(handsontable.getData());
        console.log('debug', 'FormulasCtrl: saving '+ tableId + ' table edits ok');
      }

      $scope.calculateAverageFilmThicknessFirstApproximation = function () {
        $scope.updateCalculationResultsFromTable('film-thickness-first-approximation');
        var d_1 = DataManager.extractColumnFromTable($scope.calculationResultsArray, 4);
        //console.log('debug', 'd_1 = ' + d_1);
        $scope.averageFilmThicknessFirstApproximation = Statistics.average(d_1);
        $scope.filmThicknessFirstApproximationError = Statistics.standardDeviation(d_1);
      }

      /****************************************************************/
      /*********************** Private methods ************************/
      /****************************************************************/

      /**
       *  Shows extrema using handsontable on #extrema-table-formulas-page
       */
      function showExtremaTable() {
        handsontableOptions.data = $scope.extrema;
        $('#extrema-table-formulas-page').handsontable(handsontableOptions);
      }

      var showRefractiveIndexFirstApproximationTable = function() {
        handsontableOptions.data = $scope.calculationResultsArray;
        handsontableOptions.colHeaders.push('n_1');
        handsontableOptions.columns.push({type: 'numeric', format: '0.00'});
        handsontableOptions.colWidths.push(100);
        $('#refractive-index-first-approximation').handsontable(handsontableOptions);
      }
      var showFilmThicknessFirstApproximationTable = function() {
        handsontableOptions.data = $scope.calculationResultsArray;
        handsontableOptions.colHeaders.push('d_1');
        handsontableOptions.columns.push({type: 'numeric', format: '0.00'});
        handsontableOptions.colWidths.push(100);
        $('#film-thickness-first-approximation').handsontable(handsontableOptions);
      }

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
        * Plots extrema to #extrema-plot-formulas-page 
        */
       var plotExtrema = function() {
         var minima = DataManager.extractMinima($scope.extrema);
         var maxima = DataManager.extractMaxima($scope.extrema);
         var plotData = [
           { data: $scope.filmSpectrum, label: 'film spectrum' },
           { data: minima, label: 'minima', points: {radius: 4} },
           { data: maxima, label: 'maxima', points: {radius: 4} }
         ];
         // substrate transmission line
         plotOptions.grid.markings = [
           {
             color: '#5d5',
             lineWidth: 2,
             yaxis: { from: $scope.substrateTransmission, to: $scope.substrateTransmission }
           }
         ];
         Plotter.plot('extrema-plot-formulas-page', plotData, plotOptions);
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

    }); // end FormulasCtrl
})(); // end closure

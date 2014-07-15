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
       $scope.firstExtremumIs = 'minimum';

      /******** Calculation Step 0: waiting for input extrema data ***********/

      $(document).ready(function() {
        bindListenersToExtremaPlot(); 
      });

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
        DataManager.saveFileFromArray($scope.extrema, 'tempExtrema.csv', 'extrema');
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

      /**
       *  Update calculationResultsArray after user edits in handsontable
       */
      $scope.updateCalculationResultsFromTable = function(tableId) {
        //resetCalculationProgressTo('');
        var handsontable = $('#' + tableId).data('handsontable');
        $scope.calculationResultsArray = DataManager.filterUserInput(handsontable.getData());
        console.log('debug', 'FormulasCtrl: saving '+ tableId + ' table edits ok');
      }

      /**
       *  Calculate average film thickness first approximation
       */
      $scope.calculateAverageFilmThicknessFirstApproximation = function () {
        $scope.updateCalculationResultsFromTable('film-thickness-first-approximation');
        var d_1 = DataManager.extractColumnFromTable($scope.calculationResultsArray, 4);
        //console.log('debug', 'd_1 = ' + d_1);
        $scope.averageFilmThicknessFirstApproximation = Statistics.average(d_1);
        $scope.filmThicknessFirstApproximationError = Statistics.standardDeviation(d_1);
        $scope.calculationProgress.averageFilmThicknessFirstApproximationReady = true;
      }

      /**
       *  Calculate interference orders
       */
       $scope.calculateInterferenceOrders = function() {
         $scope.interferenceOrders =
           Formulas.interferenceOrders($scope.calculationResultsArray, $scope.averageFilmThicknessFirstApproximation);
         $scope.calculationResultsArray = DataManager.joinColumnToTable($scope.calculationResultsArray, $scope.interferenceOrders);

         $scope.calculationProgress.interferenceOrdersReady = true;
         showInterferenceOrdersTable();
       }

       /**
        * Find exact interference orders
        */
       $scope.findExactInterferenceOrders = function() {
         $scope.exactInterferenceOrders =
           Formulas.exactInterferenceOrders($scope.interferenceOrders, $scope.firstExtremumIs);

         $scope.calculationResultsArray =
           DataManager.joinColumnToTable($scope.calculationResultsArray, $scope.exactInterferenceOrders);

         $scope.calculationProgress.exactInterferenceOrdersReady = true;
         showExactInterfereceOrdersTable();
       }

       /**
        * Find final film thickness
        */
        $scope.findFinalFilmThickness = function() {
          $scope.finalFilmThickness =
            Formulas.finalFilmThickness($scope.calculationResultsArray);

         $scope.calculationResultsArray =
           DataManager.joinColumnToTable($scope.calculationResultsArray, $scope.finalFilmThickness);

         $scope.calculationProgress.finalFilmThicknessReady = true;
         showFinalFilmThicknessTable();
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
      /**
       *  Shows film thickness first approximation table (#film-thickness-first-approximation).
       */
      var showFilmThicknessFirstApproximationTable = function() {
        handsontableOptions.data = $scope.calculationResultsArray;
        handsontableOptions.colHeaders.push('d_1');
        handsontableOptions.columns.push({type: 'numeric', format: '0.00'});
        handsontableOptions.colWidths.push(100);
        $('#film-thickness-first-approximation').handsontable(handsontableOptions);
      }
      /**
       *  Shows interference orders table
       */
      var showInterferenceOrdersTable = function() {
        handsontableOptions.colHeaders.push('m_0');
        handsontableOptions.columns.push({type: 'numeric', format: '0.00'});
        handsontableOptions.colWidths.push(100);
        // clone handsontableOptoins, to not change the original options, but have a copy
        var thisHandsontableOptions = clone(handsontableOptions);
        // make cells readonly
        thisHandsontableOptions.cells = function(r,c, prop) { return {readOnly: true}; };
        thisHandsontableOptions.data = $scope.calculationResultsArray;
        $('#interference-orders').handsontable(thisHandsontableOptions);
      }
      /**
       *  Shows exact interference orders table
       */
       var showExactInterfereceOrdersTable = function() {
         handsontableOptions.data = $scope.calculationResultsArray;
         handsontableOptions.colHeaders.push('m');
         handsontableOptions.columns.push({type: 'numeric', format: '0.00'});
         handsontableOptions.colWidths.push(100);
         $('#exact-interference-orders').handsontable(handsontableOptions);
       }
       /**
        * Shows final film thickness table
        */
       var showFinalFilmThicknessTable = function() {
         handsontableOptions.data = $scope.calculationResultsArray;
         handsontableOptions.colHeaders.push('d_2');
         handsontableOptions.columns.push({type: 'numeric', format: '0.00'});
         handsontableOptions.colWidths.push(100);
         $('#final-film-thickness').handsontable(handsontableOptions);
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
         $scope.minima = minima;
         var maxima = DataManager.extractMaxima($scope.extrema);
         $scope.maxima = maxima;
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
         plotOptions.grid.clickable = true;

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

      /**
       *  Binds hover listener to extrema plot.
       *  Hover shows mouse coordinates.
       */
      function bindListenersToExtremaPlot() {
        // enable showing mouse coordinates
        $("#extrema-plot-formulas-page").bind("plothover", function (event, pos, item) {
          var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
          $("#extrema-plot-mouse-coordinates").text(str);
        });
      }

      /**
       *  Returns clone of @param obj object
       */
       var clone = function(obj) {
         return jQuery.extend({}, obj);
       }

    }); // end FormulasCtrl
})(); // end closure

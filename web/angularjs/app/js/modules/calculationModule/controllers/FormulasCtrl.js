  /** 
   * Controls applying of swanepoel formulas to extrema array. 
   *
   */
(function() { 
   'use strict';

   var app = angular.module('calculationModule');

   app.controller('FormulasCtrl', function($scope, DataManager, Calculus, Formulas, Plotter) {
      var self = this;

      var handsontableOptions = {
        contextMenu: true,
        colWidths: [100, 100, 100],
        colHeaders: ['wavelength', 'T minima', 'T Maxima'],
        columns: [{type: 'numeric', format: '0.0'}, {type: 'numeric', format: '0.00'}, {type: 'numeric', format: '0.00'}]
      }
      
      /**
       *  Calculation progress flags.
       *  Are used with ng-show/ng-hide in html. 
       */
      $scope.calculationProgress = {
        extremaReady: false
      };
      $scope.calculationError;
      $scope.calculationErrorCatched = false;

      /**
       *  Extrema array in format
       *  [wavelength, T_min, T_max]
       */
      $scope.extrema = DataManager.data.extrema;

      /******** Calculation Step 0: waiting for input extrema data ***********/

      /**
       *  Set extremaReady flag if extrema are ready.
       *  Or load last used extrema.
       */ 
      if($scope.extrema) {
        $scope.calculationProgress.extremaReady = true;
      } else {
        DataManager.getLastUploadedExtrema().then(function(result) {
          $scope.extrema = result.data; 
          $scope.calculationProgress.extremaReady = true;
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

      /** 
       *  Watch calculationProgress.extremaReady to init handsontable
       */
      $scope.$watch('calculationProgress.extremaReady', function(newVal) {
        if(newVal) {
          showExtremaTable();
        }
      });

      /**
       *  Update extrema after user edits in handsontable
       */
      $scope.updateExtremaFromTable = function() {
        resetCalculationProgressTo('extremaReady');
        var handsontable = $('#extrema-table-formulas-page').data('handsontable');
        $scope.extrema = handsontable.getData();
        console.log('debug', 'FormulasCtrl: saving extrema table edits ok');
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

    }); // end FormulasCtrl
})(); // end closure

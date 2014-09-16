  /** CalculationFlowCtrl
   *  Controls the calculation flow (process), responds to user actions.
   *
   */
(function() { 
   'use strict';

   var app = angular.module('calculationModule');

   app.controller('CalculationFlowCtrl', function($scope, $http, $compile, $state, DataManager, Calculus, Formulas, Plotter) {
      var self = this;

      /**
       * Number of step the user is currently viewing
       */
      $scope.userStep = 0;
      /**
       * Change interface to next step
       */
      $scope.goToNextUserStep = function() {
        if ($scope.userStep < 10) {
          $scope.userStep++;
          $state.go('finding-extrema.step' + $scope.userStep);
        } else {
          console.log('debug', 'Cant go above last step');
        }
      }
      /**
       * Change interface to previous step
       */
      $scope.goToPreviousUserStep = function() {
        if ($scope.userStep >= 0) {
          $scope.userStep--;
          $state.go('finding-extrema.step' + $scope.userStep);
        } else {
          console.log('debug', 'Cant go below step 0');
        }
      }

      // plot data and options for 'flot' plotting tool
      $scope.plotData = [];
      $scope.plotOptions = {
        lines: { show: false},
        points: { show: true, fill: true, radius: 1, symbol: 'circle' },
        grid: { hoverable: true },
        legend: { position: 'nw' },
        tooltip: true
      };

      var handsontableOptions = {
        contextMenu: true,
        colWidths: [100, 100],
        colHeaders: ['wavelength', 'T'],
        columns: [{type: 'numeric', format: '0.0'}, {type: 'numeric', format: '0.00'},]
      };

      /**
       *  Data input settings 
       */
      $scope.dataInputSettings = {};
      $scope.dataInputSettings.convertToNanometers = false;
      $scope.dataInputSettings.convertFromPercents = true;
      // send the dataInputSettings to DataManager
      DataManager.dataInputSettings = $scope.dataInputSettings;

      /**
       *  film spectrum data in double array format.
       *  E.g. [ [1,2], [3,4], ... ]
       */
      $scope.filmSpectrum = 'not loaded yet';

      //$scope.substrateRefractiveIndex;

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
      $scope.extremaLeftBoundary = 400;
      $scope.extremaRightBoundary;
      //$scope.extremaYThreshold = .5;

      /******************* Controller logic **************************/
      
      var self = this;

      //$(document).ready(function () {
        console.log('debug', 'CalcFlowCtr: loading inital exp data');

        bindListenersToExtremaPlot();

        /**
         *  Listen to CalculationError
         */
        $scope.$on('CalculationError', function(event, error) {
          console.log('debug', 'catched broadcast of calculation error:), message = ' + error.message);
          $scope.calculationError = error.message;
          $scope.calculationErrorCatched = true;
        });


        /**
         *  Load some initial data to show not blank page
         */ 
        //loadInitialExperimentalData(); 


        // DEPRECATED
        //$scope.loadStep1 = function() {
        //  console.log("CalcFlowCtrl: Loading step1 view");
        //  $http.get('/angularjs/app/partials/calculationModule/step-1-adjust-raw-experimental-data.html').then(function(result) {
        //    $('#step-directives').html($compile(result.data)($scope));
        //  });
        //}

        /**
         *  Update film spectrum considering new data format settings
         */
         /*
        $scope.$watch('dataInputSettings.convertToNanometers', function(newVal, oldVal) {
          console.log('debug', 'convertToNanometers changed, newVal = ' + newVal + ', oldVal = ' + oldVal);
          if(newVal) {
            console.log('debug', 'converting to nanometers');
            $scope.filmSpectrum = DataManager.convertToNanometers($scope.filmSpectrum);
          } else {
            console.log('debug', 'undo converting to nanometers');
            $scope.filmSpectrum = DataManager.undoConvertToNanometers($scope.filmSpectrum);
          }
          showRawFilmSpectrum();
        });
        */
        /*
        $scope.$watch('dataInputSettings.convertFromPercents', function(newVal, oldVal) {
          console.log('debug', 'convertFromPercents changed, newVal = ' + newVal + ', oldVal = ' + oldVal);
          if(newVal) {
            $scope.filmSpectrum = DataManager.convertTransmissionFromPercents($scope.filmSpectrum);
          } else {
            $scope.filmSpectrum = DataManager.undoConvertTransmissionFromPercents($scope.filmSpectrum);
          }
          showRawFilmSpectrum();
        });
        //$scope.updateFilmSpectrumConsideringNewSettings = function() {

        //}
        */
      
        /****** Listen for spectra upload *******/

        //$scope.$watch('substrateRefractiveIndex', function(newValue, oldValue) {
        //  if(newValue) {
        //    console.log('debug', 'substrateRefractiveIndex changed, newValue = ' + newValue + ', old value = ' + oldValue);
        //    resetCalculationProgress();
        //    showRawFilmSpectrum();
        //  }
        //});

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

        /**
         *  Watcher to plot data when its ready.
         */
        $scope.$watch('calculationProgress.extremaFound', function(newVal) {
          if(newVal) {
            console.log('debug', '$watch(extremaFound): plotting extrema');
            showExtremaTable();
            plotExtrema();
          }
        });

        /** findExtrema
         *  Find extrema. Is called on user button click.
         */
        $scope.findExtrema = function() {
          $scope.calculationProgress.calculatingExtrema = true;
          var rightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length - 1][0];
          console.log('$scope.findExtrema() called');
          Calculus.findExtrema($scope.filmSpectrum, {
            leftBoundary: $scope.extremaLeftBoundary,
            rightBoundary: $scope.extremaRightBoundary
            //yThreshold: $scope.yThreshold
          }, function(extrema) {
            console.log('$scope.findExtrema: Calculus.findExtrema success');
            console.log('$scope.findExtrema: minima = ' + extrema.minima);
              console.log('$scope.findExtrema: maxima = ' + extrema.maxima);
            $scope.minima = extrema.minima;
            $scope.maxima = extrema.maxima;
            $scope.calculationProgress.extremaFound = true;
          });
        }


        /**
         *  Recalculate extrema is called by button click, after user have changed options.
         */
        $scope.recalculateExtrema = function() {
          console.log('RecalculateExtrema() called');
          try {
            resetCalculationProgressTo('calculatingExtrema');
            Calculus.findExtrema($scope.filmSpectrum, {
              leftBoundary: $scope.extremaLeftBoundary,
              rightBoundary: $scope.extremaRightBoundary
              //yThreshold: $scope.extremaYThreshold
            }, function(extrema) {
              console.log('debug', '$scope.recalculateExtrema(): extrema found');
              $scope.minima = extrema.minima;
              $scope.maxima = extrema.maxima;
              $scope.calculationProgress.extremaFound = true;
              plotExtrema();
              showExtremaTable();
            });
          } catch(error) {
            console.log('debug', 'catched calculationError, message = ' + error.message);
            $scope.$broadcast('CalculationError', error);
          }
        };

        $scope.updateExtremaFromTables = function() {
          resetCalculationProgressTo('extremaFound');
          var handsontable = $('#minima-table').data('handsontable');
          $scope.minima = DataManager.filterUserInput(handsontable.getData());
          // sort is needed for envelopes calculation
          $scope.minima = DataManager.sort($scope.minima);
          var handsontable = $('#maxima-table').data('handsontable');
          $scope.maxima = DataManager.filterUserInput(handsontable.getData());
          // sort is needed for envelopes calculation
          $scope.maxima = DataManager.sort($scope.maxima);
          showExtremaTable(); // updates the table
          plotExtrema(); // updates the plot
        }

        /********* Calculation Step 2 - find envelopes ***************/

        /**
         *  Watcher to plot data when its ready.
         */
        $scope.$watch('calculationProgress.envelopesFound', function(newVal) {
          if(newVal) {
            plotEnvelopes();  
          }
        });
        
        /**
         *  Finds envelopes and sends them to $scope.
         */
        $scope.findEnvelopes = function() {
          $scope.updateExtremaFromTables();
          console.log('debug', '$scope.findEnvelopes() called, minima = ' + $scope.minima);
          $scope.calculationProgress.calculatingEnvelopes = true;
          //var envelopeStartX = Math.min($scope.minima[0][0], $scope.maxima[0][0]);
          //console.log('debug', '$scope.findEnvelopes(): envelopeStartX = ' + envelopeStartX); 
          //var envelopeEndX = Math.max($scope.minima[$scope.minima.length-1][0], $scope.maxima[$scope.maxima.length-1][0]);
          var options = {
            envelopeStartX: $scope.extremaLeftBoundary,
            envelopeEndX: $scope.extremaRightBoundary 
          };
          //try {
            //Calculus.findEnvelope($scope.minima, options, function(envelope) {
            //Calculus.findEnvelopeLinear($scope.minima, function(envelope) {
            Calculus.splineMonotone($scope.minima, options, function(envelope) {
              //$scope.calculationProgress.envelopesFound = true;
              $scope.minimaEnvelope = envelope; 
              console.log('debug', '$scope.findEnvelopes(): minimaEnvelope.length = ' + $scope.minimaEnvelope.length);

              //Calculus.findEnvelope($scope.maxima, options, function(envelope) {
              //Calculus.findEnvelopeLinear($scope.maxima, function(envelope) {
              Calculus.splineMonotone($scope.maxima, options, function(envelope) {
                //$scope.calculationProgress.envelopesFound = true;
                $scope.maximaEnvelope = envelope; 
                $scope.calculationProgress.envelopesFound = true;
                console.log('debug', '$scope.findEnvelopes(): maximaEnvelope.length = ' + $scope.maximaEnvelope.length);
              });
            });
          //} catch (error) {
           // $scope.$broadcast('CalculationError', error);
          //}
        }

        /********* Calculation Step 3 - find pesudo extrema  ***************/

        /**
         *  Watcher to plot data when its ready.
         *  And to generate final table.
         */
        $scope.$watch('calculationProgress.pseudoExtremaFound', function(newVal) {
          if(newVal) {
            plotPseudoExtrema();
            showPseudoExtremaTable();
            generateFinalExtremaTable();
          }
        });

        $scope.findPseudoExtrema = function() {
          $scope.calculationProgress.calculatingPseudoExtrema = true;
          Calculus.findPseudoExtrema($scope.minima, $scope.maximaEnvelope, function(pseudoMaxima) {
            console.log('debug', '$scope.findPseudoExtrema: pseudoMaxima = ' + pseudoMaxima);
            $scope.pseudoMaxima = pseudoMaxima; 

            Calculus.findPseudoExtrema($scope.maxima, $scope.minimaEnvelope, function(pseudoMinima) {
              console.log('debug', '$scope.findPseudoExtrema: pseudoMinima = ' + pseudoMinima);
              $scope.pseudoMinima = pseudoMinima; 
              $scope.calculationProgress.pseudoExtremaFound = true;
            });
          });
        }

        $scope.saveFinalExtremaTable = function() {
          $scope.savingFinalExtremaFile = true;
          var handsontable = $('#final-extrema-points').data('handsontable');
          var finalExtremaArray = handsontable.getData();

          // save data to DataManger service to pass it to the next step
          DataManager.data.extrema = finalExtremaArray;
          DataManager.data.filmSpectrum = $scope.filmSpectum;
          DataManager.data.envelopes.minima = $scope.minimaEnvelope;
          DataManager.data.envelopes.maxima = $scope.maximaEnvelope;

          $scope.finalExtremaArray = finalExtremaArray;
          DataManager.saveFileFromArray(finalExtremaArray, 'finalExtrema.csv', 'extrema').then(function(result) {
            console.log('debug', '$scope.downloadFinalExtremaTable(): save file success, link = ' + result.link);
            $scope.finalExtremaFileLink = result.link;
            $scope.finalExtremaFileReady = true;
          });
        }

        $scope.continueToApplyingSwanepoelFormulas = function() {
          $scope.saveFinalExtremaTable(); // save to server & DataManager
          $scope.$emit('switchPage', {
            pageName: 'applying-swanepoel-formulas'
          });
        }
      
      //}); // end document.ready()



      /****************************************************************/
      /*********************** Private methods ************************/
      /****************************************************************/

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
          $scope.extremaRightBoundary = $scope.filmSpectrum[$scope.filmSpectrum.length-1][0];

          // changing substrateRefractiveIndex will launch showRawFilmSpectrum(), because its being $watched.
          //$scope.substrateRefractiveIndex = INITIAL_SUBSTRATE_REFRACTIVE_INDEX;

          showRawFilmSpectrum();
        }); 
      }

      /**
       *  Generates final extrema table from extrema and pseudoextrema,
       *  and shows it using handsontable.
       */ 
      var generateFinalExtremaTable = function() {
        $scope.finalMinima = DataManager.sort($scope.minima.concat($scope.pseudoMinima));
        $scope.finalMaxima = DataManager.sort($scope.maxima.concat($scope.pseudoMaxima));
        var finalExtremaArray = [];
        for(var i=0; i<$scope.finalMinima.length; i++) {
          var wavelength =  parseFloat($scope.finalMinima[i][0]);
          var T_m = parseFloat($scope.finalMinima[i][1]);
          var T_M = parseFloat($scope.finalMaxima[i][1]);
          finalExtremaArray.push([wavelength, T_m, T_M]);
        }
        $scope.finalExtremaArray = finalExtremaArray;
        var finalExtremaTable = $('#final-extrema-points').handsontable({
          data: finalExtremaArray,
          contextMenu: true,
          colWidths: [100, 100, 100],
          colHeaders: ['wavelength', 'T minima', 'T Maxima'],
          columns: [{type: 'numeric', format: '0.0'}, {type: 'numeric', format: '0.00'}, {type: 'numeric', format: '0.00'}]
        });
      }



      /** showRawFilmSpectrum
       *  Shows raw experimental data with the plot.
       */
       /*
      var showRawFilmSpectrum = function() {
        console.log('debug', 'showRawFilmSpectrum() called');
        $scope.calculationProgress.filmSpectrumFileUploaded = true;
        $scope.calculationProgress.filmSpectrumDataLoaded = true;

        plotData[0] = { data: $scope.filmSpectrum, label: "film spectrum"};
        // setting up substrate refracting index horizontal line
        //plotOptions.grid.markings = [
        //  {
        //    color: '#5d5',
        //    lineWidth: 2,
        //    yaxis: { from: $scope.substrateRefractiveIndex, to: $scope.substrateRefractiveIndex }
        //  }
        //];

        $http.get('/angularjs/app/partials/calculationModule/step-1-adjust-raw-experimental-data.html').then(function(result) {
          $('#step-directives').html($compile(result.data)($scope));
        });

        Plotter.plot('data-plot', plotData, plotOptions);
        handsontableOptions.data = $scope.filmSpectrum;
        $('#data-table').handsontable(handsontableOptions);
      };
      */

      /**
       *  Shows extrema table using handsontable
       */
      var showExtremaTable = function() {
        handsontableOptions.data = $scope.minima;
        handsontableOptions.colHeaders = ['wavelength', 'T_min'];
        console.log('debug', 'showExtremaTable(): handsontableOptions.data = ' + handsontableOptions.data);
        $('#minima-table').handsontable(handsontableOptions);
        handsontableOptions.data = $scope.maxima;
        handsontableOptions.colHeaders = ['wavelength', 'T_max'];
        $('#maxima-table').handsontable(handsontableOptions);
      }


      /** plotExtrema
       *  Plots extrema to '#extrema-plot'
       */
      var plotExtrema = function() {
        // plotData[0] should be  film spectrum
        plotData[1] = {data: $scope.minima, label: "minima", points: {radius: 4}};
        plotData[2] = {data: $scope.maxima, label: "maxima", points: {radius: 4}};
        plotOptions.grid.markings = [];
        plotOptions.grid.markings[0] = 
          { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaLeftBoundary, to: $scope.extremaLeftBoundary} };
        plotOptions.grid.markings[1] = 
          { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaRightBoundary, to: $scope.extremaRightBoundary} };
        plotOptions.grid.clickable = true;

        Plotter.plot('extrema-plot', plotData, plotOptions);
      };


      /**
       * Plots envelopes together with all previous data.
       */
      var plotEnvelopes = function() {
        // swap envelopes with extrema so envelopes are under extrema, not over
        plotData[3] = plotData[1];
        plotData[4] = plotData[2];
        plotData[1] = {data: $scope.minimaEnvelope, label: "minimaEnvelope"};
        plotData[2] = {data: $scope.maximaEnvelope, label: "maximaEnvelope"};
        Plotter.plot('envelopes-plot', plotData, plotOptions);
      }

      /**
       * Plots pseudoextrema together with all previous data.
       */
      var plotPseudoExtrema = function() {
        plotData[5] = {data: $scope.pseudoMinima, label: "pseudoMinima", points: {radius: 4}};
        plotData[6] = {data: $scope.pseudoMaxima, label: "pseudoMaxima", points: {radius: 4}};
        Plotter.plot('pseudoextrema-plot', plotData, plotOptions);
      }

      /**
       *  Shows pseudoextrema table using handsontable
       */
      var showPseudoExtremaTable = function() {
        // clone handsontableOptoins, to not change the original options, but have a copy
        var thisHandsontableOptions = clone(handsontableOptions);
        thisHandsontableOptions.data = $scope.pseudoMinima;
        thisHandsontableOptions.colHeaders = ['wavelength', 'T_min'];
        thisHandsontableOptions.cells = function(r,c, prop) { return {readOnly: true}; };
        console.log('debug', 'showExtremaTable(): handsontableOptions.data = ' + handsontableOptions.data);
        $('#pseudominima-table').handsontable(thisHandsontableOptions);
        thisHandsontableOptions.data = $scope.pseudoMaxima;
        thisHandsontableOptions.colHeaders = ['wavelength', 'T_max'];
        $('#pseudomaxima-table').handsontable(thisHandsontableOptions);
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
         plotData = [];
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
         resetPlotDataToPoint(calculationProgressPoint);
       }

       /**
        * Resets plotData to @param calculationProgressPoint point
        */
       var resetPlotDataToPoint = function(calculationProgressPoint) {
         switch (calculationProgressPoint) {
           case 'calculatingExtrema':
             // extrema use plotData up to plotData[2], so clear everything that is later
             plotData = plotData.slice(0, 3);
             break;
           case 'extremaFound':
             plotData = plotData.slice(0, 4);
             break;
         }
       }

      /**
       *  Returns clone of @param obj object
       */
       var clone = function(obj) {
         return jQuery.extend({}, obj);
       }

      /**
       *  Binds hover and click events to extrema plot.
       *  Hover shows mouse coordinates.
       *  Left click adds minima, right click adds maxima.
       *  Click on extrema removes it. 
       */
      function bindListenersToExtremaPlot() {
        
        /*** auxilary functions ***/

        /**
         *  Removes extrema point.
         *  @param point array [x,y] coordinates of extrema to remove.
         */
        var removeExtrema = function(point) {
          var index = DataManager.indexOfPoint($scope.minima, point);
          if (index > -1) {
            $scope.minima.splice(index, 1);
            plotExtrema();
            showExtremaTable();
          } else {
            index = DataManager.indexOfPoint($scope.maxima, point);
            if (index > -1) {
              $scope.maxima.splice(index, 1)
              plotExtrema();
              showExtremaTable();
            }
          }
        }

        /******************************/

        var mousePosition = {x: 0, y: 0};
        var clickItem;

        // enable showing mouse coordinates
        $("#extrema-plot").bind("plothover", function (event, pos, item) {
          mousePosition.x = pos.x;
          mousePosition.y = pos.y;
          clickItem = item; 
          var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
          $("#extrema-plot-mouse-coordinates").text(str);
        });
        
        // disable context menu for right click
        $('#extrema-plot').bind('contextmenu', function(event) {
          return false;
        });

        // enable add/remove extrema functionality to plot
        $("#extrema-plot").mousedown(function(event) {
          if ($scope.calculationProgress.envelopesFound) {
            $scope.$apply(function(){
              resetCalculationProgressTo('extremaFound');
            });
          }
          console.log('plot click, event.which = ' + event.which + ', mousePosition.x = ' + mousePosition.x);
            if(clickItem) { // clicked on film spectra point
              var x = clickItem.datapoint[0];
              var y = clickItem.datapoint[1];
            } else { // clicked on empty space
              var x = mousePosition.x;
              var y = mousePosition.y;
            }
            // add maxima or minima
            switch(event.which) {
              case 1: // left button
                // add minima
                $scope.minima.push([x, y]);
                plotExtrema();
                showExtremaTable();
                break;
              case 2: // third button (wheel)
                removeExtrema([x,y]);
                break;
              case 3: // right button
                // add maxima
                $scope.maxima.push([x, y]);
                plotExtrema();
                showExtremaTable();
                return false;
                break;
            }
        });
      }
    }); // end CalculationCtrl
})(); // end closure

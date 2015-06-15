(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step2FindExtremaCtrl', function($scope, $http, $compile, DataManager, Calculus, Formulas, Plotter, LoadingIndicator) {
    var self = this;

    console.log("Step2 init");
    LoadingIndicator.global.hide();

    // indicators for type of extrema that should be added by left mouse click on plot
    $scope.maximaActive = true;
    $scope.minimaActive = false;

    $scope.extrema = 'not calculated yet';
    if (!DataManager.data.extremaLeftBoundary) {
      DataManager.data.extremaLeftBoundary = 450;
      $scope.extremaLeftBoundary = DataManager.data.extremaLeftBoundary;
      DataManager.data.extremaRightBoundary;
      $scope.extremaRightBoundary;
    } else {
      $scope.extremaLeftBoundary = DataManager.data.extremaLeftBoundary;
      $scope.extremaRightBoundary = DataManager.data.extremaRightBoundary;
    }

    if (!DataManager.data.minima) {
      // user may be coming back from next step, so checking if he has calculated this already
      findExtrema();
    } else {
      // if user has the extrema data already, just plot it
      plotExtrema();
      bindListenersToExtremaPlot();
    }

   $scope.switchMouseClickFunction = function(extremaType) {
     switch(extremaType) {
       case 'maxima':
         $scope.maximaActive = true;
         $scope.minimaActive = false;
         break;
       case 'minima':
         $scope.minimaActive = true;
         $scope.maximaActive = false;
         break;
     }
   }

    /** 
     *  Find extrema
     */
    function findExtrema() {
      $scope.calculationProgress.calculatingExtrema = true;
      DataManager.data.extremaRightBoundary = DataManager.data.filmSpectrum[DataManager.data.filmSpectrum.length - 1][0];
      $scope.extremaRightBoundary = DataManager.data.extremaRightBoundary;
      console.log('findExtrema() called');
      Calculus.findExtrema(DataManager.data.filmSpectrum, {
        leftBoundary: $scope.extremaLeftBoundary,
        rightBoundary: $scope.extremaRightBoundary
      }, function(extrema) {
        console.log('$scope.findExtrema: Calculus.findExtrema success');
        console.log('$scope.findExtrema: minima = ' + extrema.minima);
        console.log('$scope.findExtrema: maxima = ' + extrema.maxima);
        DataManager.data.minima = extrema.minima;
        DataManager.data.maxima = extrema.maxima;
        plotExtrema();
        //showExtremaTable();
        bindListenersToExtremaPlot();
      });
    }

      /** plotExtrema
       *  Plots extrema
       */
    function plotExtrema() {
        // plotData[0] should be  film spectrum
        Plotter.data[1] = {
          data: DataManager.data.minima,
          label: "minima",
          points: {radius: 4},
          color: "blue"
        } 
        Plotter.data[2] = {
          data: DataManager.data.maxima,
          label: "maxima",
          points: {radius: 4},
          color: "red"
        }
        // clear data in case user is coming back from next step
        Plotter.data[3] = {};
        Plotter.data[4] = {};
        Plotter.data[5] = {};
        Plotter.data[6] = {};
        Plotter.options.grid.markings = [];
        Plotter.options.grid.markings[0] = 
          { color: '#000', lineWidth: 1, xaxis: { from: DataManager.data.extremaLeftBoundary, to: DataManager.data.extremaLeftBoundary} };
          console.log("right boundary: " + DataManager.data.extremaRightBoundary);
          console.log("left boundary: " + DataManager.data.extremaLeftBoundary);
        Plotter.options.grid.markings[1] = 
          { color: '#000', lineWidth: 1, xaxis: { from: DataManager.data.extremaRightBoundary, to: DataManager.data.extremaRightBoundary} };
        Plotter.options.grid.clickable = true;

        Plotter.plot();
      };

      /**
       *  Recalculate extrema
       */
      $scope.recalculateExtrema = function() {
        console.log('RecalculateExtrema() called');
        DataManager.data.extremaLeftBoundary = $scope.extremaLeftBoundary;
        DataManager.data.rightBoundary = $scope.extremaRightBoundary;
        try {
          Calculus.findExtrema(DataManager.data.filmSpectrum, {
            leftBoundary: $scope.extremaLeftBoundary,
            rightBoundary: $scope.extremaRightBoundary
          }, function(extrema) {
            console.log('debug', '$scope.recalculateExtrema(): extrema found');
            DataManager.data.minima = extrema.minima;
            DataManager.data.maxima = extrema.maxima;
            plotExtrema();
            //showExtremaTable();
          });
        } catch(error) {
          console.log('debug', 'catched calculationError, message = ' + error.message);
          $scope.$broadcast('CalculationError', error);
        }
      };

      /**
       *  Shows extrema table using handsontable
       */
       /*
      function showExtremaTable() {
        handsontableOptions.data = DataManager.data.minima;
        handsontableOptions.colHeaders = ['wavelength', 'T_min'];
        console.log('debug', 'showExtremaTable(): handsontableOptions.data = ' + handsontableOptions.data);
        $('#minima-table').handsontable(handsontableOptions);
        handsontableOptions.data = DataManager.data.maxima;
        handsontableOptions.colHeaders = ['wavelength', 'T_max'];
        $('#maxima-table').handsontable(handsontableOptions);
      }
      */

      /**
       *  Binds hover and click event listeners to extrema plot.
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
          //var index = DataManager.indexOfPoint(DataManager.data.minima, point);
          var index = DataManager.indexOfPointNear(DataManager.data.minima, point);
          if (index > -1) {
            DataManager.data.minima.splice(index, 1);
            plotExtrema();
            //showExtremaTable();
          } else {
            //index = DataManager.indexOfPoint(DataManager.data.maxima, point);
            index = DataManager.indexOfPointNear(DataManager.data.maxima, point);
            if (index > -1) {
              DataManager.data.maxima.splice(index, 1)
              plotExtrema();
              //showExtremaTable();
            }
          }
        }

        /******************************/

        var mousePosition = {x: 0, y: 0};
        var clickItem;

        // enable showing mouse coordinates
        $("#plot").bind("plothover", function (event, pos, item) {
          mousePosition.x = pos.x;
          mousePosition.y = pos.y;
          clickItem = item; 
          var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
          $("#extrema-plot-mouse-coordinates").text(str);
        });
        
        // disable context menu for right click
        $('#plot').bind('contextmenu', function(event) {
          return false;
        });

        // enable add/remove extrema functionality to plot
        $("#plot").mousedown(function(event) {
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
                if ($scope.minimaActive) {
                  // add minima
                  DataManager.data.minima.push([x, y]);
                } else {
                  // add maxima
                  DataManager.data.maxima.push([x, y]);
                }
                plotExtrema();
                //showExtremaTable();
                break;
              case 3: // right button
                removeExtrema([x,y]);
                break;
            }
        });
      }
  }); // end controller
})(); // end closure

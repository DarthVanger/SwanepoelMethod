(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step2FindExtremaCtrl', function($scope, $http, $compile, DataManager, Calculus, Formulas, Plotter) {
    var self = this;

    console.log("Step2 init");

    $scope.extrema = 'not calculated yet';
    $scope.extremaLeftBoundary = 400;
    $scope.extremaRightBoundary;

    findExtrema();

    /** 
     *  Find extrema
     */
    function findExtrema() {
      $scope.calculationProgress.calculatingExtrema = true;
      $scope.extremaRightBoundary = DataManager.data.filmSpectrum[DataManager.data.filmSpectrum.length - 1][0];
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
        bindListenersToExtremaPlot();
      });
      $('#loading').hide();
    }

      /** plotExtrema
       *  Plots extrema to '#plot'
       */
    function plotExtrema() {
        // plotData[0] should be  film spectrum
        $scope.plotData[1] = {data: DataManager.data.minima, label: "minima", points: {radius: 4}}
        $scope.plotData[2] = {data: DataManager.data.maxima, label: "maxima", points: {radius: 4}};
        $scope.plotOptions.grid.markings = [];
        $scope.plotOptions.grid.markings[0] = 
          { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaLeftBoundary, to: $scope.extremaLeftBoundary} };
        $scope.plotOptions.grid.markings[1] = 
          { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaRightBoundary, to: $scope.extremaRightBoundary} };
        $scope.plotOptions.grid.clickable = true;

        Plotter.plot('plot', $scope.plotData, $scope.plotOptions);
      };

      /**
       *  Recalculate extrema
       */
      $scope.recalculateExtrema = function() {
        console.log('RecalculateExtrema() called');
        try {
          Calculus.findExtrema(DataManager.data.filmSpectrum, {
            leftBoundary: $scope.extremaLeftBoundary,
            rightBoundary: $scope.extremaRightBoundary
            //yThreshold: $scope.extremaYThreshold
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
      var showExtremaTable = function() {
        handsontableOptions.data = $scope.minima;
        handsontableOptions.colHeaders = ['wavelength', 'T_min'];
        console.log('debug', 'showExtremaTable(): handsontableOptions.data = ' + handsontableOptions.data);
        $('#minima-table').handsontable(handsontableOptions);
        handsontableOptions.data = $scope.maxima;
        handsontableOptions.colHeaders = ['wavelength', 'T_max'];
        $('#maxima-table').handsontable(handsontableOptions);
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
          var index = DataManager.indexOfPoint(DataManager.data.minima, point);
          if (index > -1) {
            DataManager.data.minima.splice(index, 1);
            plotExtrema();
            showExtremaTable();
          } else {
            index = DataManager.indexOfPoint(DataManager.data.minima, point);
            if (index > -1) {
              DataManager.data.minima.splice(index, 1)
              plotExtrema();
              showExtremaTable();
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
                DataManager.data.minima.push([x, y]);
                plotExtrema();
                showExtremaTable();
                break;
              case 2: // third button (wheel)
                removeExtrema([x,y]);
                break;
              case 3: // right button
                // add maxima
                DataManager.data.maxima.push([x, y]);
                plotExtrema();
                showExtremaTable();
                return false;
                break;
            }
        });
      }
  }); // end controller
})(); // end closure

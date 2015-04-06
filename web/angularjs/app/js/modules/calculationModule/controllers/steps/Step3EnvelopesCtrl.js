(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step3EnvelopesCtrl', function($scope, $http, $compile, DataManager, Calculus, Formulas, Plotter, LoadingIndicator) {
    var self = this;

    console.log("Step3 init");
    LoadingIndicator.global.hide();

    // indicators for type of extrema that should be added by left mouse click on plot
    $scope.maximaActive = true;
    $scope.minimaActive = false;

    // user points for envelope edges
    DataManager.data.envelope = {
      auxiliaryPoints: {
        maxima: [],
        minima: [] 
      }
    }
    
    // set left envelopes' ends to the first point of spectrum
    DataManager.data.envelope.auxiliaryPoints.minima[0] = DataManager.sort(DataManager.data.filmSpectrum)[0];
    DataManager.data.envelope.auxiliaryPoints.maxima[0] = DataManager.sort(DataManager.data.filmSpectrum)[0];

    findEnvelopes();
    bindListenersToPlot();

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

    function findEnvelopes() {
      console.log('debug', '$scope.findEnvelopes() called, minima = ' + DataManager.data.minima);
      //var envelopeStartX = Math.min($scope.minima[0][0], $scope.maxima[0][0]);
      //console.log('debug', '$scope.findEnvelopes(): envelopeStartX = ' + envelopeStartX); 
      //var envelopeEndX = Math.max($scope.minima[$scope.minima.length-1][0], $scope.maxima[$scope.maxima.length-1][0]);
      console.log('step 3, extrema left bound = ' + DataManager.data.extremaLeftBoundary);
      console.log('step 3, extrema right bound = ' + DataManager.data.extremaRightBoundary);
      var options = {
        envelopeStartX: DataManager.data.filmSpectrum[0][0],
        envelopeEndX: DataManager.data.filmSpectrum[DataManager.data.filmSpectrum.length-1][0]
      };
        // add extra points for spline edges
        if (DataManager.data.envelope.auxiliaryPoints.minima) {
          // user has put extra points for envelopes
          // join them to extrema points to build envelopes
          var minimaSplinePoints = (DataManager.data.minima).concat(DataManager.data.envelope.auxiliaryPoints.minima);
          var maximaSplinePoints = (DataManager.data.maxima).concat(DataManager.data.envelope.auxiliaryPoints.maxima);
        } else {
          // user hasn't put any points yet
          var minimaSplinePoints = DataManager.data.minima;
          var maximaSplinePoints = DataManager.data.maxima;
        }
        Calculus.splineMonotone(minimaSplinePoints, options, function(envelope) {
          //$scope.calculationProgress.envelopesFound = true;
          envelope = cropEnvelope(envelope);  
          DataManager.data.minimaEnvelope = envelope; 
          console.log('debug', '$scope.findEnvelopes(): minimaEnvelope.length = ' + DataManager.data.minimaEnvelope.length);

          //Calculus.findEnvelope($scope.maxima, options, function(envelope) {
          //Calculus.findEnvelopeLinear($scope.maxima, function(envelope) {
          Calculus.splineMonotone(maximaSplinePoints, options, function(envelope) {
            envelope = cropEnvelope(envelope);  
            //$scope.calculationProgress.envelopesFound = true;
            DataManager.data.maximaEnvelope = envelope; 
            plotEnvelopes();
            console.log('debug', '$scope.findEnvelopes(): maximaEnvelope.length = ' + DataManager.data.maximaEnvelope.length);
          });
        });
    }

    /**
     * Plots envelopes together with all previous data.
     */
    function plotEnvelopes() {
      // set envelopes data before extrema so envelopes are under extrema, not over
      Plotter.data[1] = {
        data: DataManager.data.minimaEnvelope,
        label: "minimaEnvelope",
        color: "#ccf"
      };
      Plotter.data[2] = {
        data: DataManager.data.maximaEnvelope,
        label: "maximaEnvelope",
        color: "#fcc"
      };
      Plotter.data[3] = {
        data: DataManager.data.envelope.auxiliaryPoints.minima,
        points: {radius: 4},
        color: "#ccf"
      };
      Plotter.data[4] = {
        data: DataManager.data.envelope.auxiliaryPoints.maxima,
        points: {radius: 4},
        color: "#fcc"
      };
      Plotter.data[5] = {
        data: DataManager.data.minima,
        label: "minima",
        points: {radius: 4},
        color: "blue"
      } 
      Plotter.data[6] = {
        data: DataManager.data.maxima,
        label: "maxima",
        points: {radius: 4},
        color: "red"
      }
      Plotter.plot();
    }

    /**
     * Crop spline
     * Crops spline points so they are in approriate range
     */
    function cropEnvelope(envelope) {
      var isInRange  = function(point) {
        var x = point[0];
        var y = point[1];
        return (y>0 && y<1);
      }
      var appropriatePoints = [];
      // find values that are in appropriate range and copy them to new array
      for (var i=0; i<envelope.length; i++) {
        var point = envelope[i];
        var x = envelope[i][0];
        var y = envelope[i][1];
        if (isInRange(point)) {
          appropriatePoints.push(point);
        }
      }
      return appropriatePoints;
    }

      /**
       *  Binds hover and click event listeners to extrema plot.
       *  Hover shows mouse coordinates.
       *  Left click adds minima, right click adds maxima.
       *  Click on extrema removes it. 
       */
      function bindListenersToPlot() {
        
        /*** auxilary functions ***/

        /**
         *  Removes extrema point.
         *  @param point array [x,y] coordinates of extrema to remove.
         */
        var removeEnvelopeUserPoint = function(point) {
          var index = DataManager.indexOfPointNear(DataManager.data.envelope.auxiliaryPoints.minima, point);
          //var index = DataManager.indexOfPoint(DataManager.data.envelope.auxiliaryPoints.minima, point);
          if (index > -1) {
            DataManager.data.envelope.auxiliaryPoints.minima.splice(index, 1);
            findEnvelopes();
          } else {
            //index = DataManager.indexOfPoint(DataManager.data.envelope.auxiliaryPoints.maxima, point);
            index = DataManager.indexOfPointNear(DataManager.data.envelope.auxiliaryPoints.maxima, point);
            if (index > -1) {
              DataManager.data.envelope.auxiliaryPoints.maxima.splice(index, 1)
              findEnvelopes();
            } else {
              LoadingIndicator.plot.hide();
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
          LoadingIndicator.plot.show();
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
                  DataManager.data.envelope.auxiliaryPoints.minima.push([x, y]);
                } else {
                  // add maxima
                  DataManager.data.envelope.auxiliaryPoints.maxima.push([x, y]);
                }
                findEnvelopes();
                //showExtremaTable();
                break;
              case 3: // right button
                // remove point
                removeEnvelopeUserPoint([x,y]);
                break;
            }
        });
      } // end bindListenersToPlot()

  }); // end controller
})(); // end closure

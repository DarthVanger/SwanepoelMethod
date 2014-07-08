(function() {
  'use strict';

  var app = angular.module('calculationModule', []);
  /** Calculus service
   *  Provides methods for finding extrema, building splines.
   */
  app.service('Calculus', function() {
    /** findExtrema
     *  Finds extrema in set of points.
     *  Takes derivatives and looks where it changes sign.
     *  Minima and maxima are returned separetly, as two arrays.
     *
     *  @param data array of points, that are represented as 2d array.
     *  Example: data = [[0, 1], [2, 3], [3, 3], ...]
     *
     *  @return object, with minima and maxima variables, which are arrays of points.
     *  Example: extrema = {minima: [[0, 1], [2, 3], ...]], maxima: [[3, 3], [4, 9]]}
     */
    this.findExtrema = function(data) {
      var extrema = {minima: [], maxima: []};
      var previousDerivative = null;
        for(var i=0; i<data.length-1; i++) {
          var x = data[i][0];
          var y = data[i][1];
          var derivative = (data[i+1][1]-data[i][1]) / (data[i+1][0]-data[i][0]); 
          if(previousDerivative < 0 && derivative > 0) {
            extrema.minima.push([x,y]);
          } else if (previousDerivative > 0 && derivative < 0) {
            extrema.maxima.push([x,y]);
          }
          var previousDerivative = derivative;
        }
      return extrema;
    }
  }); // end Calculus service
})(); // end closure

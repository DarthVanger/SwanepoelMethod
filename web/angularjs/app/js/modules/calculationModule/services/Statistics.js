(function() {
  'use strict';

  var app = angular.module('calculationModule');
  
  /** Statistics service
   *  Provides methods to calculate statistical functions.
   */
   app.service('Statistics', function() {
     var self = this;

     /**
      * Finds average 
      */
     this.average = function(array) {
       checkArrayParameter(array);
       var sum = 0;
       for(var i=0; i<array.length; i++) {
         sum += array[i]; 
       }
       return sum/array.length;
     }

     /**
      * Finds standard deviation
      */
      this.standardDeviation = function(array) {
        checkArrayParameter(array);
        var avrg = this.average(array);
        var dispersion = 0;
        for(var i=0; i<array.length; i++) {
          dispersion += Math.pow(array[i] - avrg, 2)
        }
        return Math.sqrt(dispersion / array.length - 1 );
      }

      this.covariance = function(x, y) {
        if(!x || !y) throw new Error('Statistics.regressionLineCoef(): x or y is undefined or null, or smth like that.');
        if(x.length != y.length) throw new Error('Statistics.regressionLineCoef(): x.length != y.length');
        
        var xy = [];
        for(var i=0; i<x.length; i++) {
          xy.push(x[i] * y[i]);
        }

        return ( self.average(xy) - self.average(x) * self.average(y) );
      }

      /**
       *
       */
      this.regressionLineCoef = function(x, y) {
        if(!x || !y) throw new Error('Statistics.regressionLineCoef(): x or y is undefined or null, or smth like that.');
        if(x.length != y.length) throw new Error('Statistics.regressionLineCoef(): x.length != y.length');
        var covar = self.covariance(x,y);
        var varX = self.covariance(x,x);
        var b = covar/varX;
        var a = self.average(y) - b * self.average(x);

        return {'a': a, 'b': b};
      }

      /*** private methods ***/

      var checkArrayParameter = function(parameter) {
        if(!Array.isArray(parameter)) throw new Error('Statistics.average(): trying to find average of not array');
      }

   }); // end Statistics service
})(); // end closure

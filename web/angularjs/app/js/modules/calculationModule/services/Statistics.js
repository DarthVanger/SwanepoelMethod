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
       checkParameter(array);
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
        checkParameter(array);
        var avrg = this.average(array);
        var dispersion = 0;
        for(var i=0; i<array.length; i++) {
          dispersion += Math.pow(array[i] - avrg, 2)
        }
        return Math.sqrt(dispersion / array.length - 1 );
      }

      /*** private method ***/

      var checkParameter = function(parameter) {
        if(!Array.isArray(parameter)) throw new Error('Statistics.average(): trying to find average of not array');
      }

   }); // end Statistics service
})(); // end closure

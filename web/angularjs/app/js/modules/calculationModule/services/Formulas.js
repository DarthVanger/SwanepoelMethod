(function() {
  'use strict';

  var app = angular.module('calculationModule');
  
  /** Formulas service
   *  Provides methods to calculate the stuff, using Swanepoel formulas.
   */
   app.service('Formulas', function() {

     /**
      * Calculates substrate refractive index
      */
     this.calculateSubstrateRefractiveIndex = function(substrateTransmission) {
       var T_s = substrateTransmission;
       console.log('debug', 'Formulas.calculateSubstrateRefractiveIndex(): T_s = ' + T_s);
       return ( 1/T_s + Math.sqrt( 1/Math.pow(T_s, 2) - 1 ) );
     }

     this.refractiveIndexFirstApproximation = function(extrema, substrateRefractiveIndex) {
        var n_1Array = [];
        var s = substrateRefractiveIndex;
        for(var i=0; i<extrema.length; i++) {
          var n_1;
          var N;
          var T_m = extrema[i][1];
          var T_M = extrema[i][2];
          N = 2*s * ( (T_M - T_m) / (T_M*T_m) ) + ( (Math.pow(s,2) + 1) / 2 ); 
          n_1 = Math.sqrt( N + Math.sqrt( Math.pow(N,2) - Math.pow(s,2) ) );
          n_1Array.push(n_1);
        }
        return n_1Array;
    }

    this.filmThicknessFirstApproximation = function(calculationResultsArray) {
      var d_1Array = [];
      var wavelength1 = calculationResultsArray[0][0];
      var wavelength2;
      var n1 = calculationResultsArray[0][3];
      var n2;
      for(var i=1; i<calculationResultsArray.length - 1; i++) {
        var wavelength2 = calculationResultsArray[i+1][0];
        var n2 = calculationResultsArray[i+1][3];
        console.log('debug', 'Formulas.filmThicknessFirstApprox(): wavelength1 = ' + wavelength1);
        console.log('debug', 'Formulas.filmThicknessFirstApprox(): wavelength2 = ' + wavelength2);
        console.log('debug', 'Formulas.filmThicknessFirstApprox(): n1 = ' + n1);
        console.log('debug', 'Formulas.filmThicknessFirstApprox(): n2 = ' + n2);
        var d_1 = Math.abs( ( (wavelength1 * wavelength2) / (2 * (wavelength1 * n2 - wavelength2 * n1) ) ) );
        d_1Array.push(d_1);

        wavelength1 = calculationResultsArray[i][0];
        n1 = calculationResultsArray[i][3];
      }
      return d_1Array;
    }  

    this.interferenceOrders = function(calculationResultsArray, averageFilmThickness) {
      var d1 = averageFilmThickness;
      var m0Array = [];
      for(var i=0; i<calculationResultsArray.length; i++) {
        var wavelength = calculationResultsArray[i][0];
        var n1 = calculationResultsArray[i][3];
        
        var m0 = ( 2 * n1 * d1 ) / wavelength;
        m0Array.push(m0);
      }
      return m0Array;
    }

    this.exactInterferenceOrders = function(interferenceOrders, firstExtremumIs) {
      var exactOrdersArray = [];
      var currentExtremumIsMinimum = ( firstExtremumIs == 'minimum' );
      for(var i=0; i<interferenceOrders.length; i++) {
        var order = interferenceOrders[i];
        if(currentExtremumIsMinimum) {
          var exactOrder = closestHalfInteger(order);
        } else {
          var exactOrder = Math.round(order);
        }
        exactOrdersArray.push(exactOrder);
        currentExtremumIsMinimum = ! currentExtremumIsMinimum;
      }
      return exactOrdersArray;
    }

    this.finalFilmThickness = function(calculationResultsArray) {
      var d2Array = [];
      for(var i=0; i<calculationResultsArray.length; i++) {
        var wavelength = calculationResultsArray[i][0];
        var n1 = calculationResultsArray[i][3];
        var m = calculationResultsArray[i][6];

        var d2 = ( m * wavelength ) / ( 2 * n1 );

        d2Array.push(d2);
      }
      return d2Array;
    }

    var closestHalfInteger = function(number) {
      var middle;
      var result;
      if (number - Math.floor(number) > 0.5 ) {
        middle = Math.ceil(number);      
      } else {
        middle = Math.floor(number);
      }

      if (number - middle > 0) {
        result = middle + 0.5; 
      } else {
        result = middle - 0.5;
      }

      return result;
    }

   }); // end Formulas service
})(); // end closure

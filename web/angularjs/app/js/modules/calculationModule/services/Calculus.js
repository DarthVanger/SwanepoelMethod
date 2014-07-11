(function() {
  'use strict';

  var app = angular.module('calculationModule');
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
     *  @param options object {leftBoundary: , rightBoundary: , yThreshold: }.
     *    left & right boundaries define the range where to search extrema.
     *    @param yThreshold y-axis threshold of extrema search, it's used to avoid noise extrema.
     *      yThreshold by default = 0.
     *
     *  @return object, with minima and maxima variables, which are arrays of points.
     *  Example: extrema = {minima: [[0, 1], [2, 3], ...]], maxima: [[3, 3], [4, 9]]}
     */
    this.findExtrema = function(data, options, callback) {
      // read options
      var leftBoundary = options.leftBoundary ? options.leftBoundary : 0; 
      var rightBoundary = options.rightBoundary ? options.rightBoundary : data.length; 
      var yThreshold = options.yThreshold ? options.yThreshold: 0; 

      // slice data considering boundaries
      data = sliceConsideringBoundaries(data, leftBoundary, rightBoundary);

      // now find extrema by calling private method 
      //console.log('debug', 'findExtrema(): right boundary = ' + rightBoundary + ', sliced data = ' + data);
      var extrema = _findExtrema(data, yThreshold);
      // and pass it to callback
      callback(extrema);
    };
    
    /**
     *  Finds envelope :)
     *  
     *  @param data data points in 2d array format.
     *
     *  @return envelope points are returned as callback argument, in 2d array format.
     */
    this.findEnvelope = function(data, callback) {
      var envelope;
      
      callback(envelope); 
    };
  }); // end Calculus service

  /********** Private methods *************/

    var _findExtremaSimple = function(data) {

      var extrema = {minima: [], maxima: []};

      var previousDerivative = null;
      var currentDerivative = null;

      // cycle through the data
      for (var i=0; i<data.length-1; i++) {
        var x = data[i][0];
        var y = data[i][1];
        currentDerivative = (data[i+1][1]-data[i][1]) / (data[i+1][0]-data[i][0]); 
        if (previousDerivative * currentDerivative <= 0) { // found extremum 
          if(previousDerivative <= 0 && currentDerivative >= 0) {
            extrema.minima.push([x,y]);
          } else if (previousDerivative >= 0 && currentDerivative <= 0) {
            extrema.maxima.push([x,y]);
          }
        }
        previousDerivative = currentDerivative;
      }
      return extrema;
    }

  /** 
   *  Finds extrema in @param data and returns it as {minima: array, maxima: array}
   */
  var _findExtrema = function(data, yThreshold) {
    //console.log('debug', '_findExtrema(): data = ' + data);

    /**************** auxilary functions ******************/

    var thisIsMinimum = function() {
      return (previousDerivative <= 0 && currentDerivative > 0);
    }

    var addExtremum = function(x, y) {
      // add the current extremum to array
      if(thisIsMinimum()) {
        extrema.minima.push([x,y]);
      } else {
        extrema.maxima.push([x,y]);
      }

      // check if first extrema was added to array already
      // if not, add it now, because it's not noise
      if(!firstExtremumWasAddedToArray) {
        if(firstExtremumIsMinimum) {
          extrema.minima.push(firstExtremum); 
        } else {
          extrema.maxima.push(firstExtremum); 
        }
        firstExtremumWasAddedToArray = true;
        console.log('debug', 'added first extremum to array');
      }
    }


    var updateFirstExtremum = function(x, y) {
      console.log('updating first extremum, x= ' + x + ', y=' + y);
      firstExtremum = [x,y];
      if(thisIsMinimum()) {
        firstExtremumIsMinimum = true;
      } else {
        firstExtremumIsMinimum = false;
      }
    }

    var thisExtremumIsNoise = function(x, y) {
      var isNoise;
      if(thisIsMinimum()) {
        isNoise = (Math.abs(previousMaximumY - y) < yThreshold);
      } else { // this is maximum
        isNoise = (Math.abs(previousMinimumY - y) < yThreshold);
      }
      return isNoise; 
    }

    var updatePreviousExtremumY = function(y) {
      if(thisIsMinimum()) {
        previousMinimumY = y;
      } else {
        previousMaximumY = y;
      }
    }

    /*****************************************************/

    var extrema = {minima: [], maxima: []};

    var previousDerivative = null;
    var currentDerivative = null;

    // setting previousExtremumY to the first points' Y 
    var previousMinimumY;
    var previousMaximumY;

    // flags to control where is the first derivative and where is noise
    var firstExtremum = null;
    var thisIsFirstExtremum = true;
    var firstExtremumIsMinimum = null;
    var firstExtremumWasAddedToArray = false;

    // cycle through the data
    for (var i=0; i<data.length-1; i++) {
      var x = data[i][0];
      var y = data[i][1];
      currentDerivative = (data[i+1][1]-data[i][1]) / (data[i+1][0]-data[i][0]); 
      if (i == 0) { // first iteration
        previousDerivative = currentDerivative;
        continue;
      }
      if (previousDerivative * currentDerivative <= 0) { // found extremum 
        if (currentDerivative == 0 && previousDerivative != 0) {
          continue;
        }
        if (previousDerivative == 0 && currentDerivative != 0) {
          if (!thisExtremumIsNoise(x, y)) {
            addExtremum(x, y);
          }
        } else {
          if (thisIsFirstExtremum) {
            thisIsFirstExtremum = false;
            updateFirstExtremum(x,y);
          } else { 
            if (!thisExtremumIsNoise(x, y)) {
              addExtremum(x, y);
            }
            if (!firstExtremumWasAddedToArray) {
              updateFirstExtremum(x, y);
            }
          }
          updatePreviousExtremumY(y);
        }
      }
      previousDerivative = currentDerivative;
    }
    return extrema;
  }

  /**
   *  Slice data considering boundaries
   */
  var sliceConsideringBoundaries = function(data, leftBoundary, rightBoundary) {
      // find closest to boundaries X-coordinates
      var xCoordinates = extractXCoordinates(data); 
      //console.log('debug', 'xCoordinates: ' + xCoordinates);

      var leftBoundaryIndex = indexOfClosestNumber(xCoordinates, leftBoundary); 
      var rightBoundaryIndex = indexOfClosestNumber(xCoordinates, rightBoundary); 
      console.log('debug', 'leftBoundaryIndex = ' + leftBoundaryIndex);
      console.log('debug', 'leftBoundaryValue = ' + xCoordinates[leftBoundaryIndex]);

      // now slice data considering boundaries
      var slicedData= data.slice(leftBoundaryIndex, rightBoundaryIndex);
      return slicedData; 
  };
  
  /**
   *  Finds index of closest to @param num number in arrray @param array.
   */
  // src: http://stackoverflow.com/questions/8584902/get-nearest-number-out-of-array
  var indexOfClosestNumber = function(array,num){
      var i=0;
      var index = 0;
      var minDiff=1000;
      var ans;
      for(i in array){
           var m=Math.abs(num-array[i]);
           if(m<minDiff){ 
                  minDiff=m; 
                  ans=array[i]; 
                  index = i;
              }
        }
      return index;
  };

  /**
   *  Extracts X coorniates from 2d array of x-y points,
   *  And returns them as 1d array
   */
  var extractXCoordinates = function(twoDimArrayOfPoints) {
    var xCoordinates = [];
    for(var i=0; i<twoDimArrayOfPoints.length; i++) {
      xCoordinates.push(twoDimArrayOfPoints[i][0]); 
    }
    return xCoordinates;
  };

})(); // end closure

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
     *  @param options object {leftBoundary: , rightBoundary:}.
     *  left & right boundaries define the range where to search extrema
     *
     *  @return object, with minima and maxima variables, which are arrays of points.
     *  Example: extrema = {minima: [[0, 1], [2, 3], ...]], maxima: [[3, 3], [4, 9]]}
     */
    this.findExtrema = function(data, options, callback) {
      // read options
      var leftBoundary = options.leftBoundary ? options.leftBoundary : 0; 
      var rightBoundary = options.rightBoundary ? options.rightBoundary : data.length; 

      // slice data considering boundaries
      data = sliceConsideringBoundaries(data, leftBoundary, rightBoundary);

      // now find extrema by calling private single-argument method 
      var extrema = _findExtrema(data);
      // and pass it to callback
      callback(extrema);
    }
  }); // end Calculus service

  /********** Private methods *************/


  /** 
   *  Finds extrema in @param data and returns it as {minima: array, maxima: array}
   */
  var _findExtrema = function(data) {
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

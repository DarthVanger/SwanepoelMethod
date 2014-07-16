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
     *  @param options object {leftBoundary: , rightBoundary: }.
     *    left & right boundaries define the range where to search extrema.
     *
     *  @return object, with minima and maxima variables, which are arrays of points.
     *  Example: extrema = {minima: [[0, 1], [2, 3], ...]], maxima: [[3, 3], [4, 9]]}
     */
    this.findExtrema = function(data, options, callback) {
      console.log('debug', 'Calculus.findExtrema() called, data.length = ' + data.length);
      // read options
      var leftBoundary = options.leftBoundary ? options.leftBoundary : 0; 
      var rightBoundary = options.rightBoundary ? options.rightBoundary : data.length; 
      //var yThreshold = options.yThreshold ? options.yThreshold: 0; 

      // slice data considering boundaries
      data = sliceConsideringBoundaries(data, leftBoundary, rightBoundary);
      console.log('debug', 'Calculus.findExtrema(): data after slicing: data.length = ' + data.legnth);

      // now find extrema by calling private method 
      //console.log('debug', 'findExtrema(): right boundary = ' + rightBoundary + ', sliced data = ' + data);
      var extrema = _findExtrema(data);
      console.log('debug', 'Calculus.findExtrema(): extrema found. Minima = ' + extrema.minima);
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
    this.findEnvelope = function(data, options, callback) {
      var envelopeStartX = options.envelopeStartX ? options.envelopeStartX : data[0][0];
      var envelopeEndX = options.envelopeEndX ? options.envelopeEndX : data[data.length-1][0];
      var x = [];
      var y = [];
      for(var i=0; i<data.length; i++) {
        x[i] = data[i][0]; 
        y[i] = data[i][1]; 
      }
      console.log('debug', 'Calculus.findEnvelope(): x = ' + x + ', y = ' + y);
      var spline = numeric.spline(x, y);
      var SPLINE_POINTS_NUMBER = 100;
      var splineX = numeric.linspace(envelopeStartX, envelopeEndX, SPLINE_POINTS_NUMBER);

      var envelopeArray = numeric.transpose([splineX, spline.at(splineX)]);

      callback(envelopeArray); 
    };

    /**
     *  Find linear spline
     */
    this.findEnvelopeLinear = function(data, callback) {
      var envelope = [];
      var SPLINE_POINTS_NUMBER = 40;
      var INTERPOLATION_STEP= 1;
      var x0 = data[0][0];
      var y0 = data[0][1];

      for(var i=1; i<data.length; i++) {
        var x1 = data[i][0]; 
        var y1 = data[i][1]; 

        // generate points where to calculate spline
        var interpolationStep = (x1 - x0) / SPLINE_POINTS_NUMBER;
        var x = [];
        for(var j=x0; j<x1; j+=interpolationStep) {
          x.push(j); 
          //console.log('debug', 'Calculus.findEnvelopeLinear(): x = ' + x);
        }

        for(var j=0; j<x.length; j++) {
          envelope.push([x[j], line(x[j], x0, y0, x1, y1)]);
          console.log('debug', 'Calculus.findEnvelopeLinear(): line = ' + line(x[j], x0, y0, x1, y1));
        }
        x0 = x1;
        y0 = y1;
      }
      callback(envelope);
    }

    var line = function(x, x0, y0, x1, y1) {
      return y0 + (y1 - y0) * (x - x0) / (x1 -x0);
    }

    /**
     *  Finds intersection points of vertical lines through extrema and the envelope;
     */
    this.findPseudoExtrema = function(extrema, envelope, callback) {
      var pseudoExtrema = [];
      for(var i=0; i<extrema.length; i++) {
        var x = extrema[i][0];
        var y = findValueNear(envelope, x);
        pseudoExtrema.push([x, y]); 
      }
      callback(pseudoExtrema);
    }

    /**
     *  Find monotone cubic spline
     */
     this.splineMonotone = function(points, options, callback) {
       var envelopeStartX = options.envelopeStartX ? options.envelopeStartX : 0;
       var envelopeEndX = options.envelopeEndX ? options.envelopeEndX : 1000;
       var spline = [];
       var xVector = extractXCoordinates(points);
       var yVector = extractYCoordinates(points);

       var interpolant = createMonotoneInterpolant(xVector, yVector);
       //var x = numeric.linspace(envelopeStartX, envelopeEndX, SPLINE_POINTS_NUMBER);
       for (var x=envelopeStartX; x<envelopeEndX; x++) {
         spline.push([x, interpolant(x)]);
       }
       callback(spline);
     };
  }); // end Calculus service



  /********** Private methods *************/

  /**
   *  Finds y-value at x closest to @param x
   *
   *  @return Number
   */
  var findValueNear = function(pointsArray, x) {
    var pointsArrayX = extractXCoordinates(pointsArray);
    var indexOfClosestX = indexOfClosestNumber(pointsArrayX, x);
    return pointsArray[indexOfClosestX][1];
  }

  /** 
   *  Finds extrema in @param data and returns it as {minima: array, maxima: array}
   *
   */
  var _findExtrema = function(data) {
    console.log('debug', 'Calculus._findExtrema(): data.length = ' + data.length);

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
    }
    /*****************************************************/

    var extrema = {minima: [], maxima: []};

    var previousDerivative = null;
    var currentDerivative = null;

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
        // if we found a horizontal line, get to it's end.
        if (currentDerivative == 0 && previousDerivative != 0) {
          continue;
        }
        addExtremum(x, y);
      }
      previousDerivative = currentDerivative;
    }
    return extrema;
  }

  /**
   *  Slice data considering boundaries
   */
  var sliceConsideringBoundaries = function(data, leftBoundary, rightBoundary) {
      console.log('debug',
      'Calculus.findExtrema().sliceConsideringBoundaries(): data.length = ' + data.length
      + ', leftBoundary = ' + leftBoundary + ', rightBoundary = ' + rightBoundary);
      // find closest to boundaries X-coordinates
      var xCoordinates = extractXCoordinates(data); 
      //console.log('debug', 'xCoordinates: ' + xCoordinates);

      var leftBoundaryIndex = indexOfClosestNumber(xCoordinates, leftBoundary); 
      var rightBoundaryIndex = indexOfClosestNumber(xCoordinates, rightBoundary); 
      console.log('debug', 'Calculus.findExtrema().slicingData: leftBoundaryIndex = ' + leftBoundaryIndex);
      console.log('debug', 'Calculus.findExtrema().slicingData: leftBoundaryValue = ' + xCoordinates[leftBoundaryIndex]);
      console.log('debug', 'Calculus.findExtrema().slicingData: rightBoundaryIndex = ' + rightBoundaryIndex);
      console.log('debug', 'Calculus.findExtrema().slicingData: rightBoundaryValue = ' + xCoordinates[rightBoundaryIndex]);

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

  /**
   *  Extracts Y coorniates from 2d array of x-y points,
   *  And returns them as 1d array
   */
  var extractYCoordinates = function(twoDimArrayOfPoints) {
    var yCoordinates = [];
    for(var i=0; i<twoDimArrayOfPoints.length; i++) {
      yCoordinates.push(twoDimArrayOfPoints[i][1]); 
    }
    return yCoordinates;
  };


  /* Fritsch-Carlson monotone cubic spline interpolation
     Usage example:
    var f = createInterpolant([0, 1, 2, 3], [0, 1, 4, 9]);
    var message = '';
    for (var x = 0; x <= 3; x += 0.5) {
      var xSquared = f(x);
      message += x + ' squared is about ' + xSquared + '\n';
    }
    alert(message);
  */
  var createMonotoneInterpolant = function(xs, ys) {
    var i, length = xs.length;
   
    // Deal with length issues
    if (length != ys.length) { throw 'Need an equal count of xs and ys.'; }
    if (length === 0) { return function(x) { return 0; }; }
    if (length === 1) {
      // Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
      // Impl: Unary plus properly converts values to numbers
      var result = +ys[0];
      return function(x) { return result; };
    }
   
    // Rearrange xs and ys so that xs is sorted
    var indexes = [];
    for (i = 0; i < length; i++) { indexes.push(i); }
    indexes.sort(function(a, b) { return xs[a] < xs[b] ? -1 : 1; });
    var oldXs = xs, oldYs = ys;
    // Impl: Creating new arrays also prevents problems if the input arrays are mutated later
    xs = []; ys = [];
    // Impl: Unary plus properly converts values to numbers
    for (i = 0; i < length; i++) { xs.push(+oldXs[indexes[i]]); ys.push(+oldYs[indexes[i]]); }
   
    // Get consecutive differences and slopes
    var dys = [], dxs = [], ms = [];
    for (i = 0; i < length - 1; i++) {
      var dx = xs[i + 1] - xs[i], dy = ys[i + 1] - ys[i];
      dxs.push(dx); dys.push(dy); ms.push(dy/dx);
    }
   
    // Get degree-1 coefficients
    var c1s = [ms[0]];
    for (i = 0; i < dxs.length - 1; i++) {
      var m = ms[i], mNext = ms[i + 1];
      if (m*mNext <= 0) {
        c1s.push(0);
      } else {
        var dx = dxs[i], dxNext = dxs[i + 1], common = dx + dxNext;
        c1s.push(3*common/((common + dxNext)/m + (common + dx)/mNext));
      }
    }
    c1s.push(ms[ms.length - 1]);
   
    // Get degree-2 and degree-3 coefficients
    var c2s = [], c3s = [];
    for (i = 0; i < c1s.length - 1; i++) {
      var c1 = c1s[i], m = ms[i], invDx = 1/dxs[i], common = c1 + c1s[i + 1] - m - m;
      c2s.push((m - c1 - common)*invDx); c3s.push(common*invDx*invDx);
    }
   
    // Return interpolant function
    return function(x) {
      // The rightmost point in the dataset should give an exact result
      var i = xs.length - 1;
      if (x == xs[i]) { return ys[i]; }
   
      // Search for the interval x is in, returning the corresponding y if x is one of the original xs
      var low = 0, mid, high = c3s.length - 1;
      while (low <= high) {
        mid = Math.floor(0.5*(low + high));
        var xHere = xs[mid];
        if (xHere < x) { low = mid + 1; }
        else if (xHere > x) { high = mid - 1; }
        else { return ys[mid]; }
      }
      i = Math.max(0, high);
   
      // Interpolate
      var diff = x - xs[i], diffSq = diff*diff;
      return ys[i] + c1s[i]*diff + c2s[i]*diffSq + c3s[i]*diff*diffSq;
    };
  }; // end monotone cubic spline interpolation 

})(); // end closure

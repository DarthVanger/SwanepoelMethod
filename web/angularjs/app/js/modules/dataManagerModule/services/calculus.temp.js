     // comments part for yThreshold from findExtrema()
     *    @param yThreshold y-axis threshold of extrema search, it's used to avoid noise extrema.
     *      yThreshold by default = 0.

  /** FIND EXTREMA WITH Y THRESHOLD
   *  Finds extrema in @param data and returns it as {minima: array, maxima: array}
   *
   *  @param yThreshold y-threshold of extrema sensivity.
   */
  var _findExtrema = function(data, yThreshold) {
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

      // check if first extrema was added to array already
      // if not, add it now, because it's not noise
      if(!firstExtremumWasAddedToArray) {
        if(firstExtremumIsMinimum) {
          extrema.minima.push(firstExtremum); 
        } else {
          extrema.maxima.push(firstExtremum); 
        }
        firstExtremumWasAddedToArray = true;
        //console.log('debug', 'added first extremum to array');
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

    /** OLD SIMPLE FIND EXTREMA METHOD, IT'S LIKELY TO BE TRASH
     *  No y-threshold version of _findExtrema
     *  May be used if the y-threshold version becomes to buggy / complicated
     */
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

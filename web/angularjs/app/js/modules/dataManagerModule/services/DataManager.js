(function() {
  'use strict';

  var app = angular.module('dataManagerModule');

  /** DataManager service
   *  Responsible for managing files.
   */
  app.service('DataManager', function($q, FileManager) {
    var self = this;

    /**
     * Format of data written in a csv file:
     * decimalDelimeter - dot in this example: 58.87
     * numbersDelimeter - comma in this example: 58.87, 87.25
     */
    this.csvFormat = {
        name: 'dotComma',
        decimalDelimeter: '.',
        numbersDelimeter: ','
    };

    /**
     * Extrema table column numbers
     */
    this.N_1_COLUMN = 3;
    this.D_1_COLUMN = 4;
    this.M_0_COLUMN = 5;
    this.M_COLUMN = 6;
    this.D_2_COLUMN = 7;
    this.N_2_COLUMN = 8;

    this.data = {
      /**
       *  Extrema for applying formulas in format
       *  [wavelength, T_min, T_max]
       *
       *  Is updated when extrema calculations are saved 
       */
      extrema: null,
      filmSpectrum: null,
      envelopes: {
        minima: null,
        maxima: null
      }
    };

    this.dataInputSettings;

    /**
     *  Parses csv string to double array.
     *  
     *  @return double array of points.
     *  E.g. [ [1,2], [2, 4], ... ]
     */
    this.parseCsvString = function(csvString) {
        var commaSemicolonFormatRegex = /(\d+,\d+);\s*(\d+,\d+)\s*/g;
        if (commaSemicolonFormatRegex.test(csvString)) {
            // format is like "632,1112516;2,864452684"
            console.log('debug', 'File csv format is "commaSemicolon"'); 
            this.csvFormat.name = 'commaSemicolon';
            this.csvFormat.decimalDelimeter = ',';
            this.csvFormat.numbersDelimeter = ';';

            var lines = csvString.split(/\n+/);
            if (lines[lines.length-1] == '') {
                lines.splice(lines.length-1, 1);
            }
            var points = [];
            for (var i=0; i<lines.length; i++) {
                var point = lines[i].split(/\s*;\s*/);
                point[0] = point[0].replace(',', '.');
                point[1] = point[1].replace(',', '.');
                points.push(point);
            }
            var parsedData = points;
        } else {
            // assuming format is "632.111234, 2.864459"
            var parsedData = $.csv.toArrays(csvString);
        }

        console.log('debug', 'parseCsvString(): parsing ok'); 
        return parsedData;
    }

    /**
     *  Sorts [[x1,y1, ...], [x2, y2, ...], ...] array by X in asc order.
     */
    this.sort = function(pointsArray) {
      pointsArray.sort(function(x,y) {
        return x[0] - y[0];
      });
      return pointsArray;
    }

    /**
     *  Removes empty rows from @param tableDataArray
     *
     *  @param tableDataArray 2d array of rows: [[a1, b1, c1, ...], [a2, b2, c2, ...], ...]
     */
    this.filterUserInput = function(tableDataArray) {
      var badRowsIndexes = [];
      for (var i=0; i<tableDataArray.length; i++) {
        var emptyRowsCount = 0;
        for (var j=0; j<tableDataArray[i].length; j++) {
          if (tableDataArray[i][j] === null || tableDataArray[i][j] === '') {
            emptyRowsCount++;
          }
        }
        if(emptyRowsCount == tableDataArray[i].length) {
          console.log('debug', 'DataManager.filterUserInput(): found empty row');
          console.log('debug', 'Data.Manager.filterUserInput(): tableDataArray[i] = ' + tableDataArray[i]);
          badRowsIndexes.push(i);
        }
      }
      console.log('debug', 'DataManager.filterUserInput(): bad row indexes = ' + badRowsIndexes);
      if (badRowsIndexes.length < 1) { // if no bad rows
        return tableDataArray;
      } else { // if there are bad rows
        var filteredTable = [];
        for(var i=0; i<tableDataArray.length; i++) {
          if (badRowsIndexes.indexOf(i) > -1) { 
            console.log('debug', 'DataManager.filterUserInput(): removing bad row, index = ' + badRowsIndexes[i]);
            console.log('debug', 'Data.Manager.filterUserInput(): tableDataArray[i] = ' + tableDataArray[i]);
          } else {
            filteredTable.push(tableDataArray[i]);
          }
        }
        return filteredTable;
      }
    }

    /**
     *  Returns 1d array of X coordinates from 2d array of points
     */
    var extractXCoordinates = function(pointsArray) {
      xArray = [];
      for(var i=0; i<pointsArray.length; i++) {
        xArray.push(pointsArray[i][0]); 
      }
      return xArray;
    }

    /**
     *  Returns 1d array of X coordinates from 2d array of points
     */
    var extractYCoordinates = function(pointsArray) {
      yArray = [];
      for(var i=0; i<pointsArray.length; i++) {
        yArray.push(pointsArray[i][1]); 
      }
      return yArray;
    }

    /**
     *  Creates minima [[wavelength1, T_min1,], [wavelength2, T_min2], ...] array
     *  from [[wavelength1, T_min1, T_max1,], [wavelength2, T_min2, T_max2]] array
     */
    this.extractMinima = function(extremaArray) {
      var minima = [];
      for(var i=0; i<extremaArray.length; i++) {
        minima.push([ parseFloat(extremaArray[i][0]), parseFloat(extremaArray[i][1]) ]); 
      }
      return minima;
    }

    /**
     *  Creates maxima [[wavelength1, T_max2,], [wavelength2, T_max2], ...] array
     *  from [[wavelength1, T_min1, T_max1,], [wavelength2, T_min2, T_max2]] array
     */
    this.extractMaxima = function(extremaArray) {
      var maxima= [];
      for(var i=0; i<extremaArray.length; i++) {
        var wavelength = parseFloat(extremaArray[i][0]);
        var T = parseFloat(extremaArray[i][2]);
        maxima.push([ wavelength, T ]); 
      }
      return maxima;
    }
    /**
     *  Creates [[wavelegnth1, n1], [wavelength2, n2], ...] array from
     *  calculationResultsArray
     */
    this.extractRefractiveIndex = function(calculationResultsArray) {
      var refractiveIndex = [];
      for(var i=0; i<calculationResultsArray.length; i++) {
        var wavelength = parseFloat(calculationResultsArray[i][0]);
        var n = parseFloat(calculationResultsArray[i][self.N_2_COLUMN]);
        refractiveIndex.push([ wavelength, n ]); 
      }
      return refractiveIndex;
    }

    this.extractColumnFromTable = function(tableArray, columnNumber) {
      var column = [];
      for(var i=0; i<tableArray.length; i++) {
        var val = tableArray[i][columnNumber];
        if(
          val !== '-'
          && val !== null
          && val !== ''
        ) {
          column.push(val);
        }
      }
      return column;
    }

    this.convertToCsv = function(data) {
      if(self.csvFormat.name === 'commaSemicolon') {
        console.log('debug', 'Converting to CSV, File format is commaSemicolon :)');
      }
      var csv = '';
      for(var i=0; i<data.length; i++) {
        for(var j=0; j<data[i].length; j++) {
          var numberString = data[i][j].toString();
          if(self.csvFormat.name === 'commaSemicolon') {
            // convert numbers: 45.82 -> 45,82
            numberString = numberString.replace('.', ',');
          }
          csv += numberString;
          if(j<data[i].length - 1) {
            csv += self.csvFormat.numbersDelimeter;
          }
        }
        csv += '\n'
      }
      return csv;
    }

    /** getLastUploadedFilmSpectrum
     *  Gets last uploaded file from server,
     *  parses it to double-array,
     *  and returns via promise object.
     *
     *  @return Promise object with 2d array experimental data in result.data
     */
    this.getLastUploadedFilmSpectrum = function() {
      console.log('debug', 'getLastUploadedFileContents called');
      var deferred = $q.defer();
      deferred.resolve(
        FileManager.getFileContents('filmSpectrum/lastUploaded.csv').then(function(response) {
           //console.log('debug', 'ExperimentalDataManager::getLastUploadedFileContents: success, response.data: ' + response.data);
           console.log('debug', 'ExperimentalDataManager::getLastUploadedFileContents: success');
           var fileContents = response.data;
           var filmSpectrum = self.parseCsvString(fileContents);
           //var filmSpectrum = convertFilmSpectrum(filmSpectrum);
           return {data: filmSpectrum};
        })
      );
      return deferred.promise;
    };

    /**
     *  Converts film spectrum wavelength to nanometer,
     *  and normalizes Transmission.
     */
    var convertFilmSpectrum = function(filmSpectrum) {
      if (self.dataInputSettings) {
        if (self.dataInputSettings.convertToNanometers) {
          filmSpectrum = self.convertToNanometers(filmSpectrum);
        }
        if (self.dataInputSettings.convertFromPercents) {
          filmSpectrum = self.convertTransmissionFromPercents(filmSpectrum);
        }
      }
      return filmSpectrum;
    }

    /**
     *  Converts from 1/cm to Nanometers
     */
    this.convertToNanometers = function(filmSpectrum) {
      for(var i=0; i<filmSpectrum.length; i++) {
        filmSpectrum[i][0] = 10000000 / filmSpectrum[i][0];
      }
      return filmSpectrum;
    }
    this.undoConvertToNanometers = function(filmSpectrum) {
      for(var i=0; i<filmSpectrum.length; i++) {
        filmSpectrum[i][0] = 10000000 / filmSpectrum[i][0] ;
      }
      return filmSpectrum;
    }

    /**
     *  Divides Transmission by 100, making it in [0, 1] range.
     */
    this.convertTransmissionFromPercents = function(filmSpectrum) {
      var normalizedFilmSpectrum = [];
      for(var i=0; i<filmSpectrum.length; i++) {
        var wavelength = filmSpectrum[i][0];
        var T = filmSpectrum[i][1];
        var TNormalized = T/100;
        normalizedFilmSpectrum.push([wavelength, TNormalized]);
      }
      return normalizedFilmSpectrum;
    }
    this.undoConvertTransmissionFromPercents = function(filmSpectrum) {
      var normalizedFilmSpectrum = [];
      for(var i=0; i<filmSpectrum.length; i++) {
        var wavelength = filmSpectrum[i][0];
        var T = filmSpectrum[i][1];
        var TNormalized = T * 100;
        normalizedFilmSpectrum.push([wavelength, TNormalized]);
      }
      return normalizedFilmSpectrum;
    }

    /**
     *  Gets last uploaded file from server,
     *  parses it to double-array,
     *  and returns via promise object.
     *
     *  @return Promise object with 2d array experimental data in result.data
     */
    this.getLastUploadedExtrema = function() {
      console.log('debug', 'getLastUploadedExtrema called');
      var deferred = $q.defer();
      deferred.resolve(
        FileManager.getFileContents('extrema/lastUploaded.csv').then(function(response) {
           //console.log('debug', 'ExperimentalDataManager::getLastUploadedFileContents: success, response.data: ' + response.data);
           console.log('debug', 'ExperimentalDataManager::getLastUsedExtrema: success');
           var fileContents = response.data;
           var extrema = self.parseCsvString(fileContents);
           return {data: extrema};
        })
      );
      return deferred.promise;
    };

    /** loadFilmSpectrumFromFile
     *
     *  @return Promise object with response.data = filmSpectrum in 2d array format
     */
    this.loadFilmSpectrumFromFile = function(filename) {
      filename = 'filmSpectrum/' + filename;
      var deferred = $q.defer();
      deferred.resolve(
        FileManager.getFileContents(filename).then(function(result) {
          var fileContents = result.data;
          var filmSpectrum = self.parseCsvString(fileContents);
          //console.log('film spectrum :');
          //console.log(filmSpectrum);
          //var filmSpectrum = convertFilmSpectrum(filmSpectrum);
          //console.log('film spectrum after convert:');
          //console.log(filmSpectrum);
          return {data: filmSpectrum};
        })
     ); 
     return deferred.promise;
    }

    /** extractDataFromFile 
     *
     *  @return Promise object with response.data = 2d array of parsed csv file
     */
    this.extractDataFromFile = function(filepath) {
      var deferred = $q.defer();
      deferred.resolve(
        FileManager.getFileContents(filepath).then(function(result) {
          var fileContents = result.data;
          var dataArray = self.parseCsvString(fileContents);
          return {data: dataArray};
        })
     ); 
     return deferred.promise;
    }

    /** saveFileFromArray
     *
     *  Saves array to .csv file.
     *
     *  @return Promise object with response.link = link to uploaded file
     */
    this.saveFileFromArray = function(dataArray, filename, directory) {
      var fileContents = this.convertToCsv(dataArray);

      var deferred = $q.defer();
      deferred.resolve(
        FileManager.saveFile(filename, fileContents, directory).then(function(result) {
          console.log('debug', 'DataManager.saveFileFromArray(): success, result = ' + result.data);

          var link = directory ? 
            '/uploadedFiles/' + directory + '/' + filename :
            '/uploadedFiles/savedFiles/' + filename;
          return {'link': link};
        })
     ); 
     return deferred.promise;
    }


    /**
     *  Joins 1d array with 2d table array.
     *  Column array and table array must be same length.
     *  @param table 2d table with data, e.g.
     *  [[a1,b1, ...], [a2,b2, ...], ...]]
     *
     *  @param column 1d array [a1, a2, ...]
     *
     *  @return 2d array table with joined column
     */
    this.joinColumnToTable = function(table, column) {
      if(table.length != column.length) {
        throw new Error('DataManager: trying to join table and column with different length');  
      } else {
        for(var i=0; i<table.length; i++) {
          table[i].push(column[i]);
        }
      }
      return table;
    }

    /**
     *  Returns index of point in 2d array of points.
     *  @param pointsArray array of points to look in.
     *  @param point array [x,y]
     *  @return index of point or -1 if nothing was found.
     */
    this.indexOfPoint = function(pointsArray, point) {
      var index = -1;
      for (var i=0; i<pointsArray.length; i++) {
        if (pointsArray[i][0] == point[0] && pointsArray[i][1] == point[1]) {
          index = i;
          break;
        }
      }
      return index;
    }

    /**
     *  Returns index of a point in pointsArray, close enough required point.
     *  SpreadX and spreadY are defined inside the method.
     *  @param pointsArray array of points to look in.
     *  @param point array [x,y], a point to search points near.
     *  @return index of nearest point or -1 if nothing was found.
     */
    this.indexOfPointNear = function(pointsArray, point) {
      var spreadX = 5;
      var spreadY = 0.007;
      var nearbyPoints = [];
      //console.log("DataManager.indexOfPointNear(): looking for points near ("+point[0]+","+point[1]+")");
      
      for (var i=0; i<pointsArray.length; i++) {
        if (
              ( pointsArray[i][0] > (point[0] - spreadX) )
           && ( pointsArray[i][0] < (point[0] + spreadX) )
           && ( pointsArray[i][1] > (point[1] - spreadY) )
           && ( pointsArray[i][1] < (point[1] + spreadY) )
        ) { 
          // point is close enough
          //console.log("DataManager.indexOfPointNear(): found a close point: ("+pointsArray[i][0]+","+pointsArray[i][1]+")");
          var Xdistance = pointsArray[i][0] - point[0];
          var Ydistance = pointsArray[i][1] - point[1];
          var distance = Math.sqrt(Xdistance^2 + Ydistance^2);
          nearbyPoints.push({'index': i, 'distance': distance});
        }
      }
      
      if (nearbyPoints.length > 0) {
        // sort nearbyPoints by distance
        nearbyPoints.sort(function(a, b) {
          return a.distance - b.distance; 
        });

        return nearbyPoints[0].index;
      } else {
        return -1;
      }
    }

    /**
     *  Replace column (1d array) in table (2d array).
     *  @param table 2d array of rows [[a1, b1, ...], [a2, b2, ...], ...].
     *  @param column array [c1, c2, ...].
     *  @param columnIndex index of column which should be replaced.
     *
     *  @return table with replaced column.
     */
    this.replaceColumnInTable = function(table, column, columnIndex) {
      if(table.length != column.length) {
        throw new Error('DataManager: trying to join table and column with different length');  
      } else {
        for(var i=0; i<table.length; i++) {
          table[i][columnIndex] = column[i];
        }
      }
      return table;
    }

  }); // end DataManager service
})(); // end closure

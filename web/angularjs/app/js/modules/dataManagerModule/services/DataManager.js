(function() {
  'use strict';

  var app = angular.module('dataManagerModule');

  /** DataManager service
   *  Responsible for managing files.
   */
  app.service('DataManager', function($q, FileManager) {
    var self = this;

    this.data = {
      /**
       *  Extrema for applying formulas in format
       *  [wavelength, T_min, T_max]
       *  Is updated when extrema calculations are saved 
       */
      extrema: null
    };

    /**
     *  Parses csv string to double array.
     *  
     *  @return double array of points.
     *  E.g. [ [1,2], [2, 4], ... ]
     */
    this.parseCsvString = function(csvString) {
        var parsedData = $.csv.toArrays(csvString);

        console.log('debug', 'parseCsvString(): parsing ok'); 
        return parsedData;
    }

    this.convertToCsv = function(data) {
      var csv = '';
      for(var i=0; i<data.length; i++) {
        for(var j=0; j<data[i].length; j++) {
          csv += data[i][j];
          if(j<data[i].length - 1) {
            csv += ',';
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
        FileManager.getFileContents('lastUploaded.csv').then(function(response) {
           //console.log('debug', 'ExperimentalDataManager::getLastUploadedFileContents: success, response.data: ' + response.data);
           console.log('debug', 'ExperimentalDataManager::getLastUploadedFileContents: success');
           var fileContents = response.data;
           var filmSpectrum = self.parseCsvString(fileContents);
           var filmSpectrum = self.convertToNanometer(filmSpectrum);
           return {data: filmSpectrum};
        })
      );
      return deferred.promise;
    };

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
      var deferred = $q.defer();
      deferred.resolve(
        FileManager.getFileContents(filename).then(function(result) {
          var fileContents = result.data;
          var filmSpectrum = self.parseCsvString(fileContents);
          var filmSpectrum = self.convertToNanometer(filmSpectrum);
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
     *  @return Promise object with response.link = link to uploaded file
     */
    this.saveFileFromArray = function(dataArray, filename, directory) {
      var fileContents = this.convertToCsv(dataArray);

      var deferred = $q.defer();
      deferred.resolve(
        FileManager.saveFile(filename, fileContents, directory).then(function(result) {
          console.log('debug', 'DataManager.saveFileFromArray(): success, result = ' + result.data);

          var link = directory ? 
            '/upload/' + directory + '/' + filename :
            '/upload/savedFiles/' + filename;
          return {'link': link};
        })
     ); 
     return deferred.promise;
    }

    this.convertToNanometer = function(filmSpectrum) {
      for(var i=0; i<filmSpectrum.length; i++) {
        filmSpectrum[i][0] = 10000000 / filmSpectrum[i][0];
      }
      return filmSpectrum;
    }

  }); // end DataManager service
})(); // end closure

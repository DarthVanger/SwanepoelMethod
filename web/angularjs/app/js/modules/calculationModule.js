/** calculation module
 *
 *  Provides calculation controller and calculation services (calculus, formulas).
 */
(function() {
  var app = angular.module('calculationModule', ['fileManagerModule', 'plotterModule']);
  //app.service('CalculationEngine', CalculationEngine);
  app.service('Calculus', Calculus);
  app.service('Formulas', Formulas);

  /** CalculationController
   *
   *  Controls the calculation flow (process),
   *  responds to user actions.
   *
   */
   app.controller('CalculationController', function($scope, ExperimentalDataManager, Calculus, Formulas, Plotter) {
      var self = this;

      /**
       *  Experimental data in double array format.
       *  E.g. [ [1,2], [3,4], ... ]
       */
      $scope.filmSpectrum= 'not loaded yet';

      /**
       *  Calculation progress stages, which show/hide corresponding divs,
       *  when toggled true/false.
       */
      $scope.calculationProgress = {
        filmSpectrumFileUploaded: false,
        filmSpectrumDataLoaded: false
      }

      this.extrema = 'not calculated yet';

      // load some initial data to show not blank page
      angular.element(document).ready(function () {
        loadInitialExperimentalData(); 
      });

      // listen for file upload, to update the experimental data
      $scope.$on('NewFilmSpectrumFileUploaded', function(event, filename) {
        console.log('debug', 'CalculationController: Catched \'NewFilmSpectrumFileUploaded\' event');
        // reset calculation progress, because new data was loaded
        resetCalculationProgress();
        $scope.calculationProgress.filmSpectrumFileUploaded = true;
        // load new data from file
        ExperimentalDataManager.loadFilmSpectrumFromFile(filename).then(function(result) {
          $scope.calculationProgress.filmSpectrumDataLoaded = true;
          // update the data
          $scope.filmSpectrum = result.data;
          // begin with first step again
          showRawFilmSpectrum();
        });
      });

      // TBD: Next step is to add 'start calculations button'
      // and launch extrema calculation on its click,
      // showing 'calculating' animated icon, then
      // showing extrema coordinates and plot.
      // Then implement extrema bounds and sensivity.
      // Also implement $broadcasting calculation error on exception catch.
      // Implement 'back' button also.

      /** loadInitialExperimentalData
       *  Loads last uploaded file data as initial data to show instead of blank page.
       */
      var loadInitialExperimentalData = function() {
        ExperimentalDataManager.getLastUploadedFilmSpectrum().then(function(result) {
          //console.log('debug', 'CalculationController: getting last experimental data, data = ' + result.data);
          $scope.calculationProgress.filmSpectrumFileUploaded = true;
          $scope.calculationProgress.filmSpectrumDataLoaded = true;
          $scope.filmSpectrum = result.data; 
          showRawFilmSpectrum();
        }); 
      }

      /** showRawFilmSpectrum
       *  Shows raw experimental data with the plot.
       */
      var showRawFilmSpectrum = function() {
        $scope.calculationProgress.filmSpectrumLoaded = true;
        var plotData = [
          { data: $scope.filmSpectrum, label: "film spectrum"}
        ];
        Plotter.plot('experimental-data', plotData);
      }

      /** resetCalculationProgress
       *  Sets all progress flags of $scope.calculationProgress to false.
       *  This will automatically hide everything from screen, except file upload button.
       *
       *  @return void
       */
       var resetCalculationProgress = function() {
         for(var progressFlag in $scope.calculationProgress) {
           progressFlag = false; 
         }
       }
    });

      //$scope.ExperimentalDataManager = ExperimentalDataManager;
      //$scope.$watch('ExperimentalDataManager.filmSpectrum.isLoaded', function(filmSpectrum) {
      //  console.log('debug', 'CalculationController: ExperimentalDataManager.filmSpectrum has changed');
      //  if (filmSpectrum) {
      //    console.log('launching calculations');
      //    this.applySwanepoelMethod(filmSpectrum.points); 
      //  }
      //});

   //   this.applySwanepoelMethod = function(filmSpectrum) {

   //     //self.filmSpectrum = ExperimentalDataManager.parseExperimentalDataFile(filename);
   //     self.filmSpectrum = filmSpectrum;
   //     self.filmSpectrumIsLoaded = true;

   //     self.extrema = Calculus.findExtrema(self.filmSpectrum);

   //     var plotData = [
   //       { data: self.filmSpectrum, label: "experiment"},
   //       { data: self.extrema.minima, label: "minima"},
   //       { data: self.extrema.maxima, label: "maxima"}
   //     ];

   //    Plotter.spawnPlot('experimental-data', plotData);

   //   }
  
   //});


  /** CalculationEngine service
   *  Provides general methods like 'applySwanepoelMethod'.
   */
   //function CalculationEngine(ExperimentalDataManager, Calculus, Formulas, Plotter) {
   //   var self = this;

   //   /**
   //    *  Experimental data in double array format.
   //    *  E.g. [ [1,2], [3,4], ... ]
   //    */
   //   this.filmSpectrum = 'not loaded yet';

   //   this.extrema = 'not calculated yet';
   //   
   //   /** applySwanepoelMethod
   //    *  Applies Swanepoel method to .csv file named @param filename.
   //    *  This is the main method that does all the calculation,
   //    *  calling all the other secondary methods.
   //    */
   //   this.applySwanepoelMethod = function(filmSpectrum) {

   //     //self.filmSpectrum = ExperimentalDataManager.parseExperimentalDataFile(filename);
   //     self.filmSpectrum = filmSpectrum;

   //     self.extrema = Calculus.findExtrema(self.filmSpectrum);

   //     var plotData = [
   //       { data: self.filmSpectrum, label: "experiment"},
   //       { data: self.extrema.minima, label: "minima"},
   //       { data: self.extrema.maxima, label: "maxima"}
   //     ];

   //    Plotter.spawnPlot('experimental-data', plotData);

   //   }
   //}

  /** Calculus service
   *  Provides methods for finding extrema, building splines.
   */
  function Calculus() {
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
  }

  /** Formulas service
   *  Provides methods to calculate the stuff, using Swanepoel formulas.
   */
   function Formulas() {

   }

})();

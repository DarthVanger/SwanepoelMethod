/** calculation module
 *
 *  Provides calculation controller and calculation services (calculus, formulas).
 */
(function() {
  var app = angular.module('calculationEngineModule', ['fileManagerModule', 'plotterModule']);
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
      $scope.experimentalData = 'not loaded yet';

      /**
       *  Calculation progress stages, which show/hide corresponding divs,
       *  when toggled true/false.
       */
      $scope.calculationProgress = {
        rawExperimentalDataLoaded: false
      }

      this.extrema = 'not calculated yet';

      // load some initial data to show not blank page
      angular.element(document).ready(function () {
        loadInitialExperimentalData(); 
      });

      // listen for file upload, to update the experimental data
      $scope.$on('ExperimentalDataLoaded', function(event, experimentalData) {
        console.log('debug', 'CalculationController: Catched \'ExperimentalDataLoaded\' event');
        // reset calculation progress, because new data is loaded
        resetCalculationProgress();
        // update the data
        $scope.experimentalData = experimentalData;
        // begin with first step again
        showRawExperimentalData();
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
        ExperimentalDataManager.getLastUploadedExperimentalData().then(function(result) {
          //console.log('debug', 'CalculationController: getting last experimental data, data = ' + result.data);
          $scope.experimentalData = result.data; 
          showRawExperimentalData();
        }); 
      }

      /** showRawExperimentalData
       *  Shows raw experimental data with the plot.
       */
      var showRawExperimentalData = function() {
        $scope.calculationProgress.rawExperimentalDataLoaded = true;
        var plotData = [
          { data: $scope.experimentalData, label: "experiment"}
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
      //$scope.$watch('ExperimentalDataManager.experimentalData.isLoaded', function(experimentalData) {
      //  console.log('debug', 'CalculationController: ExperimentalDataManager.experimentalData has changed');
      //  if (experimentalData) {
      //    console.log('launching calculations');
      //    this.applySwanepoelMethod(experimentalData.points); 
      //  }
      //});

   //   this.applySwanepoelMethod = function(experimentalData) {

   //     //self.experimentalData = ExperimentalDataManager.parseExperimentalDataFile(filename);
   //     self.experimentalData = experimentalData;
   //     self.experimentalDataIsLoaded = true;

   //     self.extrema = Calculus.findExtrema(self.experimentalData);

   //     var plotData = [
   //       { data: self.experimentalData, label: "experiment"},
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
   //   this.experimentalData = 'not loaded yet';

   //   this.extrema = 'not calculated yet';
   //   
   //   /** applySwanepoelMethod
   //    *  Applies Swanepoel method to .csv file named @param filename.
   //    *  This is the main method that does all the calculation,
   //    *  calling all the other secondary methods.
   //    */
   //   this.applySwanepoelMethod = function(experimentalData) {

   //     //self.experimentalData = ExperimentalDataManager.parseExperimentalDataFile(filename);
   //     self.experimentalData = experimentalData;

   //     self.extrema = Calculus.findExtrema(self.experimentalData);

   //     var plotData = [
   //       { data: self.experimentalData, label: "experiment"},
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

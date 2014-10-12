(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step1AdjustUploadedDataCtrl', function($rootScope, $state, $scope, $http, $compile, DataManager, Calculus, Formulas, Plotter) {
    var self = this;

    console.log("Step1 init");
    showData();

    $scope.wavelengthConvertedToNanometers = false;
    $scope.transmissionConvertedTo01 = false;

    $scope.convertWavelengthToNanometers = function() {
      Plotter.setPlotToLoadingState();
      console.log("Step1Ctrl: converting wavelength to nanometers");
      DataManager.data.filmSpectrum = DataManager.convertToNanometers(DataManager.data.filmSpectrum);
      $scope.wavelengthConvertedToNanometers = true;
      showData();
    }

    $scope.undoConvertWavelengthToNanometers = function() {
      Plotter.setPlotToLoadingState();
      console.log("Step1Ctrl: undo converting wavelength to nanometers");
      DataManager.data.filmSpectrum = DataManager.undoConvertToNanometers(DataManager.data.filmSpectrum);
      $scope.wavelengthConvertedToNanometers = false;
      showData();
    }

    $scope.convertTransmissionTo01 = function() {
      Plotter.setPlotToLoadingState();
      console.log("Step1Ctrl: converting transmission to 0..1");
      DataManager.data.filmSpectrum = DataManager.convertTransmissionFromPercents(DataManager.data.filmSpectrum);
      $scope.transmissionConvertedTo01 = true;
      showData();
    }

    $scope.undoConvertTransmissionTo01 = function() {
      Plotter.setPlotToLoadingState();
      console.log("Step1Ctrl: undo converting transmission to 0..1");
      DataManager.data.filmSpectrum = DataManager.undoConvertTransmissionFromPercents(DataManager.data.filmSpectrum);
      $scope.transmissionConvertedTo01 = false;
      showData();
    }

  /** showRawFilmSpectrum
   *  Shows raw experimental data with the plot.
   */
  function showData() {
    console.log('debug', 'showRawFilmSpectrum() called');

    Plotter.data[0] = { data: DataManager.data.filmSpectrum, label: "film spectrum"};
    Plotter.plot();
    //$scope.handsontableOptions.data = DataManager.data.filmSpectrum;
    //$('#data-table').handsontable($scope.handsontableOptions);
    $('#loading').hide();
  };

  }); // end controller
})(); // end closure

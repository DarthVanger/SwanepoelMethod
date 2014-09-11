(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step1AdjustRawExperimentalDataCtrl', function($scope, $http, $compile, DataManager, Calculus, Formulas, Plotter) {
    var self = this;

    console.log("Step1 init");

    $scope.wavelengthConvertedToNanometers = false;
    $scope.transmissionConvertedTo01 = false;

    $scope.convertWavelengthToNanometers = function() {
      console.log("Step1Ctrl: converting wavelength to nanometers");
      $scope.wavelengthConvertedToNanometers = true;
    }

    $scope.undoConvertWavelengthToNanometers = function() {
      console.log("Step1Ctrl: undo converting wavelength to nanometers");
      $scope.wavelengthConvertedToNanometers = false;
    }

    $scope.convertTransmissionTo01 = function() {
      console.log("Step1Ctrl: converting transmission to 0..1");
      $scope.transmissionConvertedTo01 = true;
    }

    $scope.undoConvertTransmissionTo01 = function() {
      console.log("Step1Ctrl: undo converting transmission to 0..1");
      $scope.transmissionConvertedTo01 = false;
    }

  /** showRawFilmSpectrum
   *  Shows raw experimental data with the plot.
   */
  var showRawFilmSpectrum = function() {
    console.log('debug', 'showRawFilmSpectrum() called');
    $scope.calculationProgress.filmSpectrumFileUploaded = true;
    $scope.calculationProgress.filmSpectrumDataLoaded = true;

    $scope.plotData[0] = { data: $scope.filmSpectrum, label: "film spectrum"};
    // setting up substrate refracting index horizontal line
    //plotOptions.grid.markings = [
    //  {
    //    color: '#5d5',
    //    lineWidth: 2,
    //    yaxis: { from: $scope.substrateRefractiveIndex, to: $scope.substrateRefractiveIndex }
    //  }
    //];

    //$http.get('/angularjs/app/partials/calculationModule/step-1-adjust-raw-experimental-data.html').then(function(result) {
    //  $('#step-directives').html($compile(result.data)($scope));
    //});

    Plotter.plot('data-plot', $scope.plotData, $scope.plotOptions);
    //handsontableOptions.data = $scope.filmSpectrum;
    //$('#data-table').handsontable(handsontableOptions);
  };

  }); // end controller
})(); // end closure

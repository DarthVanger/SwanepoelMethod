
    $scope.$watch('dataInputSettings.convertToNanometers', function(newVal, oldVal) {
      console.log('debug', 'convertToNanometers changed, newVal = ' + newVal + ', oldVal = ' + oldVal);
      if(newVal) {
        console.log('debug', 'converting to nanometers');
        $scope.filmSpectrum = DataManager.convertToNanometers($scope.filmSpectrum);
      } else {
        console.log('debug', 'undo converting to nanometers');
        $scope.filmSpectrum = DataManager.undoConvertToNanometers($scope.filmSpectrum);
      }
      showRawFilmSpectrum();
    });

  $scope.$watch('dataInputSettings.convertFromPercents', function(newVal, oldVal) {
    console.log('debug', 'convertFromPercents changed, newVal = ' + newVal + ', oldVal = ' + oldVal);
    if(newVal) {
      $scope.filmSpectrum = DataManager.convertTransmissionFromPercents($scope.filmSpectrum);
    } else {
      $scope.filmSpectrum = DataManager.undoConvertTransmissionFromPercents($scope.filmSpectrum);
    }
    showRawFilmSpectrum();
  });

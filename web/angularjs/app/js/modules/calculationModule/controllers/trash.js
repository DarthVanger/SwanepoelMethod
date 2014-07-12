
        /**
         *  Extrema boundary change watchers. They Redraw plot on change!
         */ 
        $scope.$watch('extremaLeftBoundary', function(newValue, oldValue) {
          console.log('debug', 'extremaLeftBoundary changed. newValue = ' + newValue + ', oldValue = ' + oldValue);
          if(newValue) {
            plotOptions.grid.markings[1] = 
              { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaLeftBoundary, to: $scope.extremaLeftBoundary} };
            Plotter.plot('extrema-plot', plotData, plotOptions);
          }
        });
        $scope.$watch('extremaRightBoundary', function(newValue, oldValue) {
          if(newValue) {
            plotOptions.grid.markings[1] = 
              { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaLeftBoundary, to: $scope.extremaLeftBoundary} };
            plotOptions.grid.markings[2] = 
              { color: '#000', lineWidth: 1, xaxis: { from: $scope.extremaRightBoundary, to: $scope.extremaRightBoundary} };
            Plotter.plot('extrema-plot', plotData, plotOptions);
          }
        });

angular.module('schemaForm').directive('sfUploader', [
  function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      controller: ['$scope', function($scope) {
        $scope.multiple = true;

        $scope.$watch('files', function(newVal) {
          if (newVal) {
            console.debug('files updated', $scope.files);
          }
        });

        $scope.callbacks = {
          onUploadComplete: function(files) {
            if (typeof $scope.files == 'undefined' ||
              $scope.files === null) {
              $scope.files = [];
            }
            for (var i = 0; i < files.length; i++) {
              var f = files[i];
              $scope.files.push({
                hash: f.hash,
                title: f.name
              });
            }
          }
        };
      }]
    }
  }
]);

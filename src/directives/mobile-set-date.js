angular.module('schemaForm').directive('sfDatepickerMobileSetDate', [function() {

  return {
    restrict: 'A',

    controller: ['$scope', function($scope) {
      $scope.mobileSetDate = function() {
        $scope.$emit('mobile-set-date', $scope.dt.d, $scope.dt.t);
      }
    }],

    link: function(scope, element, attrs) {
      var dateTimeField;

      eval('dateTimeField = scope.' + attrs.dateModel);

      if (dateTimeField) {
        scope.dt.d = scope.dt.t = new Date(dateTimeField.valueOf());
        scope.dt.t.setSeconds(0);
        scope.dt.t.setMilliseconds(0);
      }

      scope.$on('mobile-set-date', function(evt, d, t) {
        var dt = d;
        if (t) {
          dt.setHours(t.getHours());
          dt.setMinutes(t.getMinutes());
        }
        eval('scope.' + attrs.dateModel + ' = dt');
      });
    }
  };

}]);

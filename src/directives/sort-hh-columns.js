angular.module('schemaForm').directive('sfSortHealthHistoryColumns', [function() {

  return {
    restrict: 'A',
    controller: ['$scope', function($scope) {
      // TODO: make this order array configurable from formbuidler
      var t = [
        $scope.form.schema.properties.problem.title,
        $scope.form.schema.properties.treated.title,
        $scope.form.schema.properties.limited.title
      ];

      var getPropName = function(v, properties) {
        for (p in properties) {
          if (v == properties[p].title) return p;
        }
      }

      $scope.sortedForm = t.map(function(v) {
        var item;

        for (var i = 0; i < $scope.form.items.length; i++) {
          if ($scope.form.items[i].title == v) {
            item = $scope.form.items[i];
            break;
          }
        }

        return {
          prop: getPropName(v, $scope.form.schema.properties),
          form: item
        };

      });
    }]
  };

}]);

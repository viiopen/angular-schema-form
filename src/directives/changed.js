/**
 * A version of ng-changed that only listens if
 * there is actually a onChange defined on the form
 *
 * Takes the form definition as argument.
 * If the form definition has a "onChange" defined as either a function or
 */
angular.module('schemaForm').directive('sfChanged', ['$timeout', function($timeout) {
  return {
    require: 'ngModel',
    restrict: 'AC',
    scope: false,
    link: function(scope, element, attrs, ctrl) {
      var form = scope.$eval(attrs.sfChanged);
      //"form" is really guaranteed to be here since the decorator directive
      //waits for it. But best be sure.
      if (form) {
        var clearValue = form.clearValue || (form.schema && form.schema.clearValue ? form.schema.clearValue : undefined);

        if (form.onChange) {
          ctrl.$viewChangeListeners.push(function() {
            if (angular.isFunction(form.onChange)) {
              form.onChange(ctrl.$modelValue, form);
            } else {
              scope.evalExpr(form.onChange, {'modelValue': ctrl.$modelValue, form: form});
            }
          });
        } else if (angular.isDefined(clearValue)) {  // because clearValue can = 0
          ctrl.$viewChangeListeners.push(function() {
            $timeout(function() {
              var ptr = scope.model;

              for (k in form.key) {
                ptr = ptr[form.key[k]]
              }

              if (ptr.indexOf(0) > -1) {
                var key = "['" + form.key.join("']['") + "']";
                eval("scope.model" + key + " = [0]");
              }
            });
          });
        }
      }
    }
  };
}]);

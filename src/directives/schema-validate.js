angular.module('schemaForm').directive('schemaValidate', ['sfValidator', '$parse', 'sfSelect',
  function(sfValidator, $parse, sfSelect) {

    return {
      restrict: 'A',
      scope: false,
      // We want the link function to be *after* the input directives link function so we get access
      // the parsed value, ex. a number instead of a string
      priority: 500,
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        // We need the ngModelController on several places,
        // most notably for errors.
        // So we emit it up to the decorator directive so it can put it on scope.
        scope.$emit('schemaFormPropagateNgModelController', ngModel);

        var error = null;
        var form = scope.$eval(attrs.schemaValidate);

        if (form.copyValueTo) {
          ngModel.$viewChangeListeners.push(function() {
            var paths = form.copyValueTo;
            angular.forEach(paths, function(path) {
              sfSelect(path, scope.model, ngModel.$modelValue);
            });
          });
        };


        // Validate against the schema.

        var validate = function(viewValue, triggeredByBroadcast) {
          error = null; // viiopen

          //console.log('validate called', viewValue)
          //Still might be undefined
          if (!form) {
            return viewValue;
          }

          // viiopen - if the value is empty but not required, stop
          if (!form.required && !viewValue) {
            return viewValue;
          }

          // Omit TV4 validation
          if (scope.options && scope.options.tv4Validation === false) {
            return viewValue;
          }

          // don't re-set dirtiness / view value / etc when field replacement
          // is being used, see validator.js
          if (angular.isString(ngModel.$modelValue) && ngModel.$modelValue.match && ngModel.$modelValue.match(/^@field/)) {
            // since schema fields validate onBlur, remove any errors from clicking the replacement button
            scope.$emit('vii-remove-asf-error');
            ngModel.$setValidity('tv4-302', true);
            ngModel.$setValidity('schemaForm', true);
            return true;
            //return viewValue
          }

          var _form = form;

          // viiopen - if this is a problem/treated/limited response from the Health History schema,
          // the form passed to sfValidator.validate() needs to be an integer property. Since
          // problem/treated/limited are all of type integer, any one will do.

          if (typeof viewValue != 'undefined' && form.type == 'aos-health-history' && form.schema.type == 'object') {
            _form = form.schema.properties.problem;  // could have used treated or limited
          }

          var result =  sfValidator.validate(_form, viewValue);
          //console.log('result is', result)
          // Since we might have different tv4 errors we must clear all
          // errors that start with tv4-
          Object.keys(ngModel.$error)
              .filter(function(k) { return k.indexOf('tv4-') === 0; })
              .forEach(function(k) { ngModel.$setValidity(k, true); });


          // viiopen
          if (form.required && angular.isUndefinedOrNull(viewValue)) {
            error = 'Required';
          }

          // viiopen send message back if necessary
          if (triggeredByBroadcast) {
            if (result.error) {
              if (error != 'Required') error = result.error.message;
              //form.showingError = true;
              scope.$emit('vii-asf-error', error);
            }
          }

          // viiopen if there was no error but the field still looks invalid, clean it
          //if (!result.error && form.showingError) {
          if (!result.error) {
            //form.showingError = false;
            scope.$emit('vii-remove-asf-error');
          }

          if (!result.valid) {
            // it is invalid, return undefined (no model update)
            /* viiopen
            ngModel.$setValidity('tv4-' + result.error.code, false);
            error = result.error;
            */
            // viiopen
            var code = result.error.code;
            if (error == 'Required') {
              code = '302';
            } else {
              error = result.error;
            }
            ngModel.$setValidity('tv4-' + code, false);
            //form.showingError = true;
            scope.$emit('vii-asf-error', error);

            // In Angular 1.3+ return the viewValue, otherwise we inadvertenly
            // will trigger a 'parse' error.
            // we will stop the model value from updating with our own $validator
            // later.
            if (ngModel.$validators) {
              return viewValue;
            }
            // Angular 1.2 on the other hand lacks $validators and don't add a 'parse' error.
            return undefined;
          }
          return viewValue;
        };

        // Custom validators, parsers, formatters etc
        if (typeof form.ngModel === 'function') {
          form.ngModel(ngModel);
        }

        ['$parsers', '$viewChangeListeners', '$formatters'].forEach(function(attr) {
          if (form[attr] && ngModel[attr]) {
            form[attr].forEach(function(fn) {
              ngModel[attr].push(fn);
            });
          }
        });

        ['$validators', '$asyncValidators'].forEach(function(attr) {
          // Check if our version of angular has validators, i.e. 1.3+
          if (form[attr] && ngModel[attr]) {
            angular.forEach(form[attr], function(fn, name) {
              ngModel[attr][name] = fn;
            });
          }
        });

        // Get in last of the parses so the parsed value has the correct type.
        // We don't use $validators since we like to set different errors depending tv4 error codes
        ngModel.$parsers.push(validate);

        // But we do use one custom validator in the case of Angular 1.3 to stop the model from
        // updating if we've found an error.
        if (ngModel.$validators) {
          ngModel.$validators.schemaForm = function() {
            //console.log('validators called.')
            // Any error and we're out of here!
            return !Object.keys(ngModel.$error).some(function(e) { return e !== 'schemaForm';});
          };
        }

        var schema = form.schema;

        // A bit ugly but useful.
        scope.validateField = function(inDigest) {
          /* viiopen

          It's really odd that this (scope.validateField()) is called when 'schemaFormValidate'
          is $broadcast()ed, but scope.validate() is called on blur.

          Just use scope.validate(). If it's good enough for blur, it's good enough for broadcast.

          // don't re-set dirtiness / view value / etc when field replacement
          // is being used, see validator.js

          if (angular.isString(ngModel.$modelValue) && ngModel.$modelValue.match && ngModel.$modelValue.match(/^@field/)) {
            ngModel.$setValidity('tv4-302', true);
            ngModel.$setValidity('schemaForm', true);
            return true;
          }
          */

          // BB - This is so we can support not-validation-validation of custom fields 09/18/15
          ///// viiopen - skip for now
          /////var simpleValidation = _.has(attrs, 'sfSimpleValidation');
          /////if (simpleValidation) {
          if (false) {
            var value = !form.required;

            if (ngModel.$modelValue) {
              value = true;
            }
            ngModel.$setValidity('tv4-302', value);
            ngModel.$setValidity('schemaForm', value);
            if (value) {
              ngModel.$setPristine();
              element.removeClass('ng-invalid');
              element.removeClass('ng-dirty');
              element.removeClass('ng-invalid-tv4-302');
              element.removeClass('ng-invalid-schemaForm');
            } else {
              element.addClass('ng-invalid');
              element.addClass('ng-dirty');
              element.addClass('ng-invalid-tv4-302');
              element.addClass('ng-invalid-schemaForm');
              ngModel.$setDirty();
            }

          } else {
            // Special case: arrays
            // TODO: Can this be generalized in a way that works consistently?
            // Just setting the viewValue isn't enough to trigger validation
            // since it's the same value. This will be better when we drop
            // 1.2 support.
            /////////if (schema && schema.type.indexOf('array') !== -1) {
            // viiopen - Just call it.
            return validate(ngModel.$modelValue, inDigest);
            /////////}

            // We set the viewValue to trigger parsers,
            // since modelValue might be empty and validating just that
            // might change an existing error to a "required" error message.
            if (ngModel.$setDirty) {

              // Angular 1.3+

              ngModel.$setDirty();
              ngModel.$setViewValue(ngModel.$viewValue);
              ngModel.$commitViewValue();

              // In Angular 1.3 setting undefined as a viewValue does not trigger parsers
              // so we need to do a special required check. Fortunately we have $isEmpty
              if (form.required && ngModel.$isEmpty(ngModel.$modelValue)) {
                ngModel.$setValidity('tv4-302', false);
              }
            } else {
              // Angular 1.2
              // In angular 1.2 setting a viewValue of undefined will trigger the parser.
              // hence required works.
              ngModel.$setViewValue(ngModel.$viewValue);
            }
          }
        };

        ngModel.$formatters.push(function(val) {
          // When a form first loads this will be called for each field.
          // we usually don't want that.
          if (ngModel.$pristine  && scope.firstDigest &&
              (!scope.options || scope.options.validateOnRender !== true))  {
            return val;
          }
	        validate(ngModel.$modelValue);
          return val;
        });
        // Listen to an event so we can validate the input on request
        //////scope.$on('schemaFormValidate', scope.validateField);
        // viiopen - if the message was $broadcast()ed with a flag, pass it to validateField()
        scope.$on('schemaFormValidate', function(event, showErrors) {
          scope.validateField(showErrors);
        });

        scope.schemaError = function() {
          return error;
        };
      }
    }
  }]);

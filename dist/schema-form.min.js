(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular', 'objectpath', 'tv4'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('angular'), require('objectpath'), require('tv4'));
  } else {
    root.schemaForm = factory(root.angular, root.objectpath, root.tv4);
  }
}(this, function(angular, objectpath, tv4) {
// Deps is sort of a problem for us, maybe in the future we will ask the user to depend
// on modules for add-ons

var deps = [];
try {
  //This throws an expection if module does not exist.
  angular.module('ngSanitize');
  deps.push('ngSanitize');
} catch (e) {}

try {
  //This throws an expection if module does not exist.
  angular.module('ui.sortable');
  deps.push('ui.sortable');
} catch (e) {}

try {
  //This throws an expection if module does not exist.
  angular.module('angularSpectrumColorpicker');
  deps.push('angularSpectrumColorpicker');
} catch (e) {}

try {
  //This throws an expection if module does not exist.
  deps.push('vii.filters');
} catch (e) {}

var schemaForm = angular.module('schemaForm', deps);

// SLJ - custom validations are getting hard to manage in one file,
// so declare here and define in as many files as you want.
var customValidators = {};

// SLJ - adding a useful function for checking empty values
var _isEmpty = function(v) { return !angular.isDefined(v) || v === null || v === '' }

angular.module('schemaForm').provider('sfPath',
[function() {

  // When building with browserify ObjectPath is available as `objectpath` but othwerwise
  // it's called `ObjectPath`.
  var ObjectPath = window.ObjectPath || objectpath;

  var sfPath = {parse: ObjectPath.parse};

  // if we're on Angular 1.2.x, we need to continue using dot notation
  if (angular.version.major === 1 && angular.version.minor < 3) {
    sfPath.stringify = function(arr) {
      return Array.isArray(arr) ? arr.join('.') : arr.toString();
    };
  } else {
    sfPath.stringify = ObjectPath.stringify;
  }

  // We want this to use whichever stringify method is defined above,
  // so we have to copy the code here.
  sfPath.normalize = function(data, quote) {
    return sfPath.stringify(Array.isArray(data) ? data : sfPath.parse(data), quote);
  };

  // expose the methods in sfPathProvider
  this.parse = sfPath.parse;
  this.stringify = sfPath.stringify;
  this.normalize = sfPath.normalize;

  this.$get = function() {
    return sfPath;
  };
}]);

/**
 * @ngdoc service
 * @name sfSelect
 * @kind function
 *
 */
angular.module('schemaForm').factory('sfSelect', ['sfPath', function(sfPath) {
  var numRe = /^\d+$/;

  /**
    * @description
    * Utility method to access deep properties without
    * throwing errors when things are not defined.
    * Can also set a value in a deep structure, creating objects when missing
    * ex.
    * var foo = Select('address.contact.name',obj)
    * Select('address.contact.name',obj,'Leeroy')
    *
    * @param {string} projection A dot path to the property you want to get/set
    * @param {object} obj   (optional) The object to project on, defaults to 'this'
    * @param {Any}    valueToSet (opional)  The value to set, if parts of the path of
    *                 the projection is missing empty objects will be created.
    * @returns {Any|undefined} returns the value at the end of the projection path
    *                          or undefined if there is none.
    */
  return function(projection, obj, valueToSet) {
    if (!obj) {
      obj = this;
    }
    //Support [] array syntax
    var parts = typeof projection === 'string' ? sfPath.parse(projection) : projection;

    if (typeof valueToSet !== 'undefined' && parts.length === 1) {
      //special case, just setting one variable
      obj[parts[0]] = valueToSet;
      return obj;
    }

    if (typeof valueToSet !== 'undefined' &&
        typeof obj[parts[0]] === 'undefined') {
       // We need to look ahead to check if array is appropriate
      obj[parts[0]] = parts.length > 2 && numRe.test(parts[1]) ? [] : {};
    }

    var value = obj[parts[0]];
    for (var i = 1; i < parts.length; i++) {
      // Special case: We allow JSON Form syntax for arrays using empty brackets
      // These will of course not work here so we exit if they are found.
      if (parts[i] === '') {
        return undefined;
      }
      if (typeof valueToSet !== 'undefined') {
        if (i === parts.length - 1) {
          //last step. Let's set the value
          value[parts[i]] = valueToSet;
          return valueToSet;
        } else {
          // Make sure to create new objects on the way if they are not there.
          // We need to look ahead to check if array is appropriate
          var tmp = value[parts[i]];
          if (typeof tmp === 'undefined' || tmp === null) {
            tmp = numRe.test(parts[i + 1]) ? [] : {};
            value[parts[i]] = tmp;
          }
          value = tmp;
        }
      } else if (value) {
        //Just get nex value.
        value = value[parts[i]];
      }
    }
    return value;
  };
}]);


// FIXME: type template (using custom builder)
angular.module('schemaForm').provider('sfBuilder', ['sfPathProvider', function(sfPathProvider) {

  var SNAKE_CASE_REGEXP = /[A-Z]/g;
  var snakeCase = function(name, separator) {
    separator = separator || '_';
    return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  };
  var formId = 0;

  var builders = {
    sfField: function(args) {
      args.fieldFrag.firstChild.setAttribute('sf-field', formId);

      // We use a lookup table for easy access to our form.
      args.lookup['f' + formId] = args.form;
      formId++;
    },
    ngModel: function(args) {
      if (!args.form.key) {
        return;
      }
      var key  = args.form.key;

      // Redact part of the key, used in arrays
      // KISS keyRedaction is a number.
      if (args.state.keyRedaction) {
        key = key.slice(args.state.keyRedaction);
      }

      // Stringify key.
      var modelValue;
      if (!args.state.modelValue) {
        var strKey = sfPathProvider.stringify(key).replace(/"/g, '&quot;');
        modelValue = (args.state.modelName || 'model');

        if (strKey) { // Sometimes, like with arrays directly in arrays strKey is nothing.
          modelValue += (strKey[0] !== '[' ? '.' : '') + strKey;
        }
      } else {
        // Another builder, i.e. array has overriden the modelValue
        modelValue = args.state.modelValue;
      }

      // Find all sf-field-value attributes.
      // No value means a add a ng-model.
      // sf-field-value="replaceAll", loop over attributes and replace $$value$$ in each.
      // sf-field-value="attrName", replace or set value of that attribute.
      var nodes = args.fieldFrag.querySelectorAll('[sf-field-model]');
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var conf = n.getAttribute('sf-field-model');
        if (!conf || conf === '') {
          n.setAttribute('ng-model', modelValue);
        } else if (conf === 'replaceAll') {
          var attributes = n.attributes;
          for (var j = 0; j < attributes.length; j++) {
            if (attributes[j].value && attributes[j].value.indexOf('$$value') !== -1) {
              attributes[j].value = attributes[j].value.replace(/\$\$value\$\$/g, modelValue);
            }
          }
        } else {
          var  val = n.getAttribute(conf);
          if (val && val.indexOf('$$value$$')) {
            n.setAttribute(conf, val.replace(/\$\$value\$\$/g, modelValue));
          } else {
            n.setAttribute(conf, modelValue);
          }
        }
      }
    },
    simpleTransclusion: function(args) {
      var children = args.build(args.form.items, args.path + '.items', args.state);
      args.fieldFrag.firstChild.appendChild(children);
    },

    // Patch on ngModelOptions, since it doesn't like waiting for its value.
    ngModelOptions: function(args) {
      if (args.form.ngModelOptions && Object.keys(args.form.ngModelOptions).length > 0) {
        args.fieldFrag.firstChild.setAttribute('ng-model-options', JSON.stringify(args.form.ngModelOptions));
      }
    },
    transclusion: function(args) {
      var transclusions = args.fieldFrag.querySelectorAll('[sf-field-transclude]');

      if (transclusions.length) {
        for (var i = 0; i < transclusions.length; i++) {
          var n = transclusions[i];

          // The sf-transclude attribute is not a directive, but has the name of what we're supposed to
          // traverse.
          var sub = args.form[n.getAttribute('sf-field-transclude')];
          if (sub) {
            sub = Array.isArray(sub) ? sub : [sub];
            var childFrag = args.build(sub, args.path + '.' + sub, args.state);
            n.appendChild(childFrag);
          }
        }
      }
    },
    condition: function(args) {
      // Do we have a condition? Then we slap on an ng-if on all children,
      // but be nice to existing ng-if.
      if (args.form.condition) {
        var evalExpr = 'evalExpr(' + args.path +
                       '.contidion, { model: model, "arrayIndex": $index})';
        if (args.form.key) {
          var strKey = sfPathProvider.stringify(args.form.key);
          evalExpr = 'evalExpr(' + args.path + '.condition,{ model: model, "arrayIndex": $index, ' +
                     '"modelValue": model' + (strKey[0] === '[' ? '' : '.') + strKey + '})';
        }

        var children = args.fieldFrag.children || args.fieldFrag.childNodes;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var ngIf = child.getAttribute('ng-if');
          child.setAttribute(
            'ng-if',
            ngIf ?
            '(' + ngIf +
            ') || (' + evalExpr + ')'
            : evalExpr
          );
        }
      }
    },
    array: function(args) {
      var items = args.fieldFrag.querySelector('[schema-form-array-items]');
      if (items) {
        state = angular.copy(args.state);
        state.keyRedaction = state.keyRedaction || 0;
        state.keyRedaction += args.form.key.length + 1;

        // Special case, an array with just one item in it that is not an object.
        // So then we just override the modelValue
        if (args.form.schema && args.form.schema.items &&
            args.form.schema.items.type &&
            args.form.schema.items.type.indexOf('object') === -1 &&
            args.form.schema.items.type.indexOf('array') === -1) {
          var strKey = sfPathProvider.stringify(args.form.key).replace(/"/g, '&quot;') + '[$index]';
          state.modelValue = 'modelArray[$index]';
        } else {
          state.modelName = 'item';
        }

        // Flag to the builder that where in an array.
        // This is needed for compatabiliy if a "old" add-on is used that
        // hasn't been transitioned to the new builder.
        state.arrayCompatFlag = true;

        var childFrag = args.build(args.form.items, args.path + '.items', state);
        items.appendChild(childFrag);
      }
    }
  };
  this.builders = builders;
  var stdBuilders = [
    builders.sfField,
    builders.ngModel,
    builders.ngModelOptions,
    builders.condition
  ];
  this.stdBuilders = stdBuilders;

  this.$get = ['$templateCache', 'schemaFormDecorators', 'sfPath', function($templateCache, schemaFormDecorators, sfPath) {


    var checkForSlot = function(form, slots) {
      // Finally append this field to the frag.
      // Check for slots
      if (form.key) {
        var slot = slots[sfPath.stringify(form.key)];
        if (slot) {
          while (slot.firstChild) {
            slot.removeChild(slot.firstChild);
          }
          return slot;
        }
      }
    };

    var build = function(items, decorator, templateFn, slots, path, state, lookup) {
      state = state || {};
      lookup = lookup || Object.create(null);
      path = path || 'schemaForm.form';
      var container = document.createDocumentFragment();
      items.reduce(function(frag, f, index) {

        // Sanity check.
        if (!f.type) {
          return frag;
        }

        var field = decorator[f.type] || decorator['default'];
        if (!field.replace) {
          // Backwards compatability build
          var n = document.createElement(snakeCase(decorator.__name, '-'));
          if (state.arrayCompatFlag) {
            n.setAttribute('form','copyWithIndex($index)');
          } else {
            n.setAttribute('form', path + '[' + index + ']');
          }

          (checkForSlot(f, slots) || frag).appendChild(n);

        } else {
          var tmpl;

          // Reset arrayCompatFlag, it's only valid for direct children of the array.
          state.arrayCompatFlag = false;

          // TODO: Create a couple fo testcases, small and large and
          //       measure optmization. A good start is probably a cache of DOM nodes for a particular
          //       template that can be cloned instead of using innerHTML
          var div = document.createElement('div');
          var template = templateFn(f, field) || templateFn(f, decorator['default']);
          div.innerHTML = template;

          // Move node to a document fragment, we don't want the div.
          tmpl = document.createDocumentFragment();
          while (div.childNodes.length > 0) {
            tmpl.appendChild(div.childNodes[0]);
          }

          // Possible builder, often a noop
          var args = {
            fieldFrag: tmpl,
            form: f,
            lookup: lookup,
            state: state,
            path: path + '[' + index + ']',

            // Recursive build fn
            build: function(items, path, state) {
              return build(items, decorator, templateFn, slots, path, state, lookup);
            },

          };

          // Let the form definiton override builders if it wants to.
          var builderFn = f.builder || field.builder;

          // Builders are either a function or a list of functions.
          if (typeof builderFn === 'function') {
            builderFn(args);
          } else {
            builderFn.forEach(function(fn) { fn(args); });
          }

          // Append
          (checkForSlot(f, slots) || frag).appendChild(tmpl);
        }
        return frag;
      }, container);

      return container;
    };

    return {
      /**
       * Builds a form from a canonical form definition
       */
      build: function(form, decorator, slots, lookup) {
        return build(form, decorator, function(form, field) {
          if (form.type === 'template') {
            return form.template;
          }
          return $templateCache.get(field.template);
        }, slots, undefined, undefined, lookup);

      },
      builder: builders,
      stdBuilders: stdBuilders,
      internalBuild: build
    };
  }];

}]);

angular.module('schemaForm').directive('sfUploader', [
  function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      controller: ['$scope', function($scope) {
        $scope.multiple = true;

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

angular.module('schemaForm').provider('schemaFormDecorators',
['$compileProvider', 'sfPathProvider', function($compileProvider, sfPathProvider) {
  var defaultDecorator = '';
  var decorators = {};

  // Map template after decorator and type.
  var templateUrl = function(name, form) {
    //schemaDecorator is alias for whatever is set as default
    if (name === 'sfDecorator') {
      name = defaultDecorator;
    }

    var decorator = decorators[name];
    if (decorator[form.type]) {
      return decorator[form.type].template;
    }

    //try default
    return decorator['default'].template;
  };

  /**************************************************
   * DEPRECATED                                     *
   * The new builder and sf-field is preferred, but *
   * we keep this in during a transitional period   *
   * so that add-ons that don't use the new builder *
   * works.                                         *
   **************************************************/
   //TODO: Move to a compatability extra script.
   var createDirective = function(name) {
     $compileProvider.directive(name,
      ['$parse', '$compile', '$http', '$templateCache', '$interpolate', '$q', 'sfErrorMessage',
       'sfPath','sfSelect',
      function($parse,  $compile,  $http,  $templateCache, $interpolate, $q, sfErrorMessage,
               sfPath, sfSelect) {

        return {
          restrict: 'AE',
          replace: false,
          transclude: false,
          scope: true,
          require: '?^sfSchema',
          link: function(scope, element, attrs, sfSchema) {
            // BB - Save the scope's ID so we can re-use it 10/02/15
            scope.fieldId = scope.$id;

            //The ngModelController is used in some templates and
            //is needed for error messages,
            scope.$on('schemaFormPropagateNgModelController', function(event, ngModel) {
              event.stopPropagation();
              event.preventDefault();
              scope.ngModel = ngModel;
            });

            //Keep error prone logic from the template
            scope.showTitle = function() {
              return scope.form && scope.form.notitle !== true && scope.form.title && scope.form.title.trim().length > 0;
            };

            scope.listToCheckboxValues = function(list) {
              var values = {};
              angular.forEach(list, function(v) {
                values[v] = true;
              });
              return values;
            };

            scope.checkboxValuesToList = function(values) {
              var lst = [];
              angular.forEach(values, function(v, k) {
                if (v) {
                  lst.push(k);
                }
              });
              return lst;
            };

            scope.buttonClick = function($event, form) {
              if (angular.isFunction(form.onClick)) {
                form.onClick($event, form);
              } else if (angular.isString(form.onClick)) {
                if (sfSchema) {
                  //evaluating in scope outside of sfSchemas isolated scope
                  sfSchema.evalInParentScope(form.onClick, {'$event': $event, form: form});
                } else {
                  scope.$eval(form.onClick, {'$event': $event, form: form});
                }
              }
            };

            /**
             * Evaluate an expression, i.e. scope.$eval
             * but do it in sfSchemas parent scope sf-schema directive is used
             * @param {string} expression
             * @param {Object} locals (optional)
             * @return {Any} the result of the expression
             */
            scope.evalExpr = function(expression, locals) {
              if (sfSchema) {
                //evaluating in scope outside of sfSchemas isolated scope
                return sfSchema.evalInParentScope(expression, locals);
              }

              return scope.$eval(expression, locals);
            };

            /**
             * Evaluate an expression, i.e. scope.$eval
             * in this decorators scope
             * @param {string} expression
             * @param {Object} locals (optional)
             * @return {Any} the result of the expression
             */
            scope.evalInScope = function(expression, locals) {
              if (expression) {
                return scope.$eval(expression, locals);
              }
            };

            /**
             * Interpolate the expression.
             * Similar to `evalExpr()` and `evalInScope()`
             * but will not fail if the expression is
             * text that contains spaces.
             *
             * Use the Angular `{{ interpolation }}`
             * braces to access properties on `locals`.
             *
             * @param  {string} content The string to interpolate.
             * @param  {Object} locals (optional) Properties that may be accessed in the
             *                         `expression` string.
             * @return {Any} The result of the expression or `undefined`.
             */
            scope.interp = function(expression, locals) {
              return (expression && $interpolate(expression)(locals));
            };

            //This works since we ot the ngModel from the array or the schema-validate directive.
            scope.hasSuccess = function() {
              if (!scope.ngModel) {
                return false;
              }
              return scope.ngModel.$valid &&
                  (!scope.ngModel.$pristine || !scope.ngModel.$isEmpty(scope.ngModel.$modelValue));
            };

            scope.hasError = function() {
              if (!scope.ngModel) {
                return false;
              }
              return scope.ngModel.$invalid && !scope.ngModel.$pristine;
            };

            /**
             * DEPRECATED: use sf-messages instead.
             * Error message handler
             * An error can either be a schema validation message or a angular js validtion
             * error (i.e. required)
             */
            scope.errorMessage = function(schemaError) {
              return sfErrorMessage.interpolate(
                (schemaError && schemaError.code + '') || 'default',
                (scope.ngModel && scope.ngModel.$modelValue) || '',
                (scope.ngModel && scope.ngModel.$viewValue) || '',
                scope.form,
                scope.options && scope.options.validationMessage
              );
            };

            // Rebind our part of the form to the scope.
            var once = scope.$watch(attrs.form, function(form) {
              if (form) {
                // Workaround for 'updateOn' error from ngModelOptions
                // see https://github.com/Textalk/angular-schema-form/issues/255
                // and https://github.com/Textalk/angular-schema-form/issues/206
                form.ngModelOptions = form.ngModelOptions || {};
                scope.form  = form;

                //ok let's replace that template!
                //We do this manually since we need to bind ng-model properly and also
                //for fieldsets to recurse properly.
                var templatePromise;

                // type: "template" is a special case. It can contain a template inline or an url.
                // otherwise we find out the url to the template and load them.
                if (form.type === 'template' && form.template) {
                  templatePromise = $q.when(form.template);
                } else {
                  var url = form.type === 'template' ? form.templateUrl : templateUrl(name, form);
                  templatePromise = $http.get(url, {cache: $templateCache}).then(function(res) {
                                      return res.data;
                                    });
                }

                templatePromise.then(function(template) {
                  if (form.key) {
                    var key = form.key ?
                              sfPathProvider.stringify(form.key).replace(/"/g, '&quot;') : '';
                    template = template.replace(
                      /\$\$value\$\$/g,
                      'model' + (key[0] !== '[' ? '.' : '') + key
                    );

                    // set the unique ID
                    var fid = scope.field.id ? scope.field.id : scope.field.elid;
                    var uid = (key + fid).replace(/\W+/g, '-').replace(/^-+/, '');
                    template = template.replace(/\$\$uid\$\$/g, uid);
                    //template = template.replace(/\$\$uid\$\$/g, (key + scope.field.id).replace(/\W+/g, '-'));

                    /*
                    Hydrate the model from the root to ensure deep paths like
                    model['prop']['prop2']['prop3'] actually work.  Also insert
                    an attr for the model's parent i.e. model['prop']['prop1']['prop2']
                    */
                    var modelPtr = scope.model;
                    var prpty;
                    var parent = 'model' + (key[0] !== '[' ? '.' : '');

                    for (var i = 0; i < scope.form.key.length; i++) {
                      prpty = scope.form.key[i];
                      if (i < scope.form.key.length - 1) parent += "['" + prpty + "']";

                      if ( !angular.isDefined(modelPtr[prpty]) ) {
                        modelPtr[prpty] = (i == scope.form.key.length - 1) ? null : {};
                      }
                      modelPtr = modelPtr[prpty];
                    }

                    template = template.replace(/ng-model=('|")/g, 'ng-model-parent="'+parent+'" ng-model='+"$1");

                    // for replacement fields, we need the model path to the attribute, and the attribute
                    template = template.replace(/\$\$rplModel\$\$/g, parent);
                    template = template.replace(/\$\$rplAttr\$\$/g, prpty);
                  }
                  element.html(template);

                  // Do we have a condition? Then we slap on an ng-if on all children,
                  // but be nice to existing ng-if.
                  if (form.condition) {

                    var evalExpr = 'evalExpr(form.condition,{ model: model, "arrayIndex": arrayIndex})';
                    if (form.key) {
                      evalExpr = 'evalExpr(form.condition,{ model: model, "arrayIndex": arrayIndex, "modelValue": model' + sfPath.stringify(form.key) + '})';
                    }

                    angular.forEach(element.children(), function(child) {
                      var ngIf = child.getAttribute('ng-if');
                      child.setAttribute(
                        'ng-if',
                        ngIf ?
                        '(' + ngIf +
                        ') || (' + evalExpr +')'
                        : evalExpr
                      );
                    });
                  }
                  $compile(element.contents())(scope);
                });

                // Where there is a key there is probably a ngModel
                if (form.key) {
                  // It looks better with dot notation.
                  scope.$on(
                    'schemaForm.error.' + form.key.join('.'),
                    function(event, error, validationMessage, validity) {
                      if (validationMessage === true || validationMessage === false) {
                        validity = validationMessage;
                        validationMessage = undefined;
                      }

                      if (scope.ngModel && error) {
                        if (scope.ngModel.$setDirty) {
                          scope.ngModel.$setDirty();
                        } else {
                          // FIXME: Check that this actually works on 1.2
                          scope.ngModel.$dirty = true;
                          scope.ngModel.$pristine = false;
                        }

                        // Set the new validation message if one is supplied
                        // Does not work when validationMessage is just a string.
                        if (validationMessage) {
                          if (!form.validationMessage) {
                            form.validationMessage = {};
                          }
                          form.validationMessage[error] = validationMessage;
                        }

                        scope.ngModel.$setValidity(error, validity === true);

                        if (validity === true) {
                          // Setting or removing a validity can change the field to believe its valid
                          // but its not. So lets trigger its validation as well.
                          scope.$broadcast('schemaFormValidate');
                        }
                      }
                  });

                  // Clean up the model when the corresponding form field is $destroy-ed.
                  // Default behavior can be supplied as a globalOption, and behavior can be overridden in the form definition.
                  scope.$on('$destroy', function() {
                    // If the entire schema form is destroyed we don't touch the model
                    if (!scope.externalDestructionInProgress) {
                      var destroyStrategy = form.destroyStrategy ||
                                            (scope.options && scope.options.destroyStrategy) || 'remove';
                      // No key no model, and we might have strategy 'retain'
                      if (form.key && destroyStrategy !== 'retain') {

                        // Get the object that has the property we wan't to clear.
                        var obj = scope.model;
                        if (form.key.length > 1) {
                          obj = sfSelect(form.key.slice(0, form.key.length - 1), obj);
                        }

                        // We can get undefined here if the form hasn't been filled out entirely
                        if (obj === undefined) {
                          return;
                        }

                        // Type can also be a list in JSON Schema
                        var type = (form.schema && form.schema.type) || '';

                        // Empty means '',{} and [] for appropriate types and undefined for the rest
                        if (destroyStrategy === 'empty' && type.indexOf('string') !== -1) {
                          obj[form.key.slice(-1)] = '';
                        } else if (destroyStrategy === 'empty' && type.indexOf('object') !== -1) {
                          obj[form.key.slice(-1)] = {};
                        } else if (destroyStrategy === 'empty' && type.indexOf('array') !== -1) {
                          obj[form.key.slice(-1)] = [];
                        } else if (destroyStrategy === 'null') {
                          obj[form.key.slice(-1)] = null;
                        } else {
                          delete obj[form.key.slice(-1)];
                        }
                      }
                    }
                  });
                }

                once();
              }
            });
          },
          controller: ['$scope', 'Modernizr', function($scope, Modernizr) {
            $scope.inputtypes = Modernizr.inputtypes;
          }]
        };
      }
    ]);
  };

  var createManualDirective = function(type, templateUrl, transclude) {
    transclude = angular.isDefined(transclude) ? transclude : false;
    $compileProvider.directive('sf' + angular.uppercase(type[0]) + type.substr(1), function() {
      return {
        restrict: 'EAC',
        scope: true,
        replace: true,
        transclude: transclude,
        template: '<sf-decorator form="form"></sf-decorator>',
        link: function(scope, element, attrs) {
          var watchThis = {
            'items': 'c',
            'titleMap': 'c',
            'schema': 'c'
          };
          var form = {type: type};
          var once = true;
          angular.forEach(attrs, function(value, name) {
            if (name[0] !== '$' && name.indexOf('ng') !== 0 && name !== 'sfField') {

              var updateForm = function(val) {
                if (angular.isDefined(val) && val !== form[name]) {
                  form[name] = val;

                  //when we have type, and if specified key we apply it on scope.
                  if (once && form.type && (form.key || angular.isUndefined(attrs.key))) {
                    scope.form = form;
                    once = false;
                  }
                }
              };

              if (name === 'model') {
                //"model" is bound to scope under the name "model" since this is what the decorators
                //know and love.
                scope.$watch(value, function(val) {
                  if (val && scope.model !== val) {
                    scope.model = val;
                  }
                });
              } else if (watchThis[name] === 'c') {
                //watch collection
                scope.$watchCollection(value, updateForm);
              } else {
                //$observe
                attrs.$observe(name, updateForm);
              }
            }
          });
        }
      };
    });
  };

  /**
   * DEPRECATED: use defineDecorator instead.
   * Create a decorator directive and its sibling "manual" use decorators.
   * The directive can be used to create form fields or other form entities.
   * It can be used in conjunction with <schema-form> directive in which case the decorator is
   * given it's configuration via a the "form" attribute.
   *
   * ex. Basic usage
   *   <sf-decorator form="myform"></sf-decorator>
   **
   * @param {string} name directive name (CamelCased)
   * @param {Object} templates, an object that maps "type" => "templateUrl"
   */
  this.createDecorator = function(name, templates) {
    //console.warn('schemaFormDecorators.createDecorator is DEPRECATED, use defineDecorator instead.');
    decorators[name] = {'__name': name};

    angular.forEach(templates, function(url, type) {
      decorators[name][type] = {template: url, replace: false, builder: []};
    });

    if (!decorators[defaultDecorator]) {
      defaultDecorator = name;
    }
    createDirective(name);
  };


  /**
   * Define a decorator. A decorator is a set of form types with templates and builder functions
   * that help set up the form.
   *
   * @param {string} name directive name (CamelCased)
   * @param {Object} fields, an object that maps "type" => `{ template, builder, replace}`.
                     attributes `builder` and `replace` are optional, and replace defaults to true.

                     `template` should be the key of the template to load and it should be pre-loaded
                     in `$templateCache`.

                     `builder` can be a function or an array of functions. They will be called in
                     the order they are supplied.

                     `replace` (DEPRECATED) is for backwards compatability. If false the builder
                     will use the "old" way of building that form field using a <sf-decorator>
                     directive.
   */
  this.defineDecorator = function(name, fields) {
    decorators[name] = {'__name': name}; // TODO: this feels like a hack, come up with a better way.

    angular.forEach(fields, function(field, type) {
      field.builder = field.builder || [];
      field.replace = angular.isDefined(field.replace) ? field.replace : true;
      decorators[name][type] = field;
    });

    if (!decorators[defaultDecorator]) {
      defaultDecorator = name;
    }
    createDirective(name);
  };

  /**
   * DEPRECATED
   * Creates a directive of a decorator
   * Usable when you want to use the decorators without using <schema-form> directive.
   * Specifically when you need to reuse styling.
   *
   * ex. createDirective('text','...')
   *  <sf-text title="foobar" model="person" key="name" schema="schema"></sf-text>
   *
   * @param {string}  type The type of the directive, resulting directive will have sf- prefixed
   * @param {string}  templateUrl
   * @param {boolean} transclude (optional) sets transclude option of directive, defaults to false.
   */
  this.createDirective = createManualDirective;

  /**
   * DEPRECATED
   * Same as createDirective, but takes an object where key is 'type' and value is 'templateUrl'
   * Useful for batching.
   * @param {Object} templates
   */
  this.createDirectives = function(templates) {
    angular.forEach(templates, function(url, type) {
      createManualDirective(type, url);
    });
  };

  /**
   * Getter for decorator settings
   * @param {string} name (optional) defaults to defaultDecorator
   * @return {Object} rules and templates { rules: [],templates: {}}
   */
  this.decorator = function(name) {
    name = name || defaultDecorator;
    return decorators[name];
  };


  /**
   * DEPRECATED use defineAddOn() instead.
   * Adds a mapping to an existing decorator.
   * @param {String} name Decorator name
   * @param {String} type Form type for the mapping
   * @param {String} url  The template url
   * @param {Function} builder (optional) builder function
   * @param {boolean} replace (optional) defaults to false. Replace decorator directive with template.
   */
  this.addMapping = function(name, type, url, builder, replace) {
    if (decorators[name]) {
      decorators[name][type] = {
        template: url,
        builder: builder,
        replace: !!replace
      };
    }
  };

  /**
   * Adds an add-on to an existing decorator.
   * @param {String} name Decorator name
   * @param {String} type Form type for the mapping
   * @param {String} url  The template url
   * @param {Function|Array} builder (optional) builder function(s),
   */
  this.defineAddOn = function(name, type, url, builder) {
    if (decorators[name]) {
      decorators[name][type] = {
        template: url,
        builder: builder,
        replace: true
      };
    }
  };



  //Service is just a getter for directive templates and rules
  this.$get = function() {
    return {
      decorator: function(name) {
        return decorators[name] || decorators[defaultDecorator];
      },
      defaultDecorator: defaultDecorator
    };
  };

  //Create a default directive
  createDirective('sfDecorator');

}]);

angular.module('schemaForm').provider('sfErrorMessage', function() {

  // The codes are tv4 error codes.
  // Not all of these can actually happen in a field, but for
  // we never know when one might pop up so it's best to cover them all.

  // TODO: Humanize these.
  var defaultMessages = {
    'default': 'Field does not validate',
    0: 'Invalid type, expected {{schema.type}}',
    1: 'No enum match for: {{viewValue}}',
    10: 'Data does not match any schemas from "anyOf"',
    11: 'Data does not match any schemas from "oneOf"',
    12: 'Data is valid against more than one schema from "oneOf"',
    13: 'Data matches schema from "not"',
    // Numeric errors
    100: 'Value is not a multiple of {{schema.multipleOf}}',
    101: '{{viewValue}} is less than the allowed minimum of {{schema.minimum}}',
    102: '{{viewValue}} is equal to the exclusive minimum {{schema.minimum}}',
    103: '{{viewValue}} is greater than the allowed maximum of {{schema.maximum}}',
    104: '{{viewValue}} is equal to the exclusive maximum {{schema.maximum}}',
    105: 'Value is not a valid number',
    // String errors
    200: 'String is too short ({{viewValue.length}} chars), minimum {{schema.minLength}}',
    201: 'String is too long ({{viewValue.length}} chars), maximum {{schema.maxLength}}',
    202: 'String does not match pattern: {{schema.pattern}}',
    // Object errors
    300: 'Too few properties defined, minimum {{schema.minProperties}}',
    301: 'Too many properties defined, maximum {{schema.maxProperties}}',
    302: 'Required',
    303: 'Additional properties not allowed',
    304: 'Dependency failed - key must exist',
    // Array errors
    400: 'Array is too short ({{value.length}}), minimum {{schema.minItems}}',
    401: 'Array is too long ({{value.length}}), maximum {{schema.maxItems}}',
    402: 'Array items are not unique',
    403: 'Additional items not allowed',
    // Format errors
    500: 'Format validation failed',
    501: 'Keyword failed: "{{title}}"',
    // Schema structure
    600: 'Circular $refs',
    // Non-standard validation options
    1000: 'Unknown property (not in schema)'
  };

  // In some cases we get hit with an angular validation error
  defaultMessages.number    = defaultMessages[105];
  defaultMessages.required  = defaultMessages[302];
  defaultMessages.min       = defaultMessages[101];
  defaultMessages.max       = defaultMessages[103];
  defaultMessages.maxlength = defaultMessages[201];
  defaultMessages.minlength = defaultMessages[200];
  defaultMessages.pattern   = defaultMessages[202];

  this.setDefaultMessages = function(messages) {
    defaultMessages = messages;
  };

  this.getDefaultMessages = function() {
    return defaultMessages;
  };

  this.setDefaultMessage = function(error, msg) {
    defaultMessages[error] = msg;
  };

  this.$get = ['$interpolate', function($interpolate) {

    var service = {};
    service.defaultMessages = defaultMessages;

    /**
     * Interpolate and return proper error for an eror code.
     * Validation message on form trumps global error messages.
     * and if the message is a function instead of a string that function will be called instead.
     * @param {string} error the error code, i.e. tv4-xxx for tv4 errors, otherwise it's whats on
     *                       ngModel.$error for custom errors.
     * @param {Any} value the actual model value.
     * @param {Any} viewValue the viewValue
     * @param {Object} form a form definition object for this field
     * @param  {Object} global the global validation messages object (even though its called global
     *                         its actually just shared in one instance of sf-schema)
     * @return {string} The error message.
     */
    service.interpolate = function(error, value, viewValue, form, global) {
      global = global || {};
      var validationMessage = form.validationMessage || {};

      // Drop tv4 prefix so only the code is left.
      if (error.indexOf('tv4-') === 0) {
        error = error.substring(4);
      }

      // First find apropriate message or function
      var message = validationMessage['default'] || global['default'] || '';

      [validationMessage, global, defaultMessages].some(function(val) {
        if (angular.isString(val) || angular.isFunction(val)) {
          message = val;
          return true;
        }
        if (val && val[error]) {
          message = val[error];
          return true;
        }
      });

      var context = {
        error: error,
        value: value,
        viewValue: viewValue,
        form: form,
        schema: form.schema,
        title: form.title || (form.schema && form.schema.title)
      };
      if (angular.isFunction(message)) {
        return message(context);
      } else {
        return $interpolate(message)(context);
      }
    };

    return service;
  }];

});

/**
 * Schema form service.
 * This service is not that useful outside of schema form directive
 * but makes the code more testable.
 */

var module, angular;

(function(angular){

  angular.module('schemaForm').provider('schemaForm',
  ['sfPathProvider', function(sfPathProvider) {

  //Creates an default titleMap list from an enum, i.e. a list of strings.
  var enumToTitleMap = function(enm, opts) {
    var titleMap = []; //canonical titleMap format is a list.
    if (opts && opts.titles) {
      for (var i in opts.titles) {
        titleMap.push({name: opts.titles[i], value: enm[i]});
      }
    } else {
      enm.forEach(function(name) {
        titleMap.push({name: name, value: name});
      });
    }
    return titleMap;
  };

  // Takes an options array and generates a titleMap
  var optionsToTitleMap = function(titleMap, originalEnum) {
    var canonical = [];
    angular.forEach(originalEnum, function(value, index) {
      if (angular.isDefined(titleMap[index])) { // viiopen
        canonical.push({name: titleMap[index], value: value});
      }
    });
    return canonical;
  };

  var defaultFormDefinition = function(name, schema, options) {
    var rules = defaults[stripNullType(schema.type)];
    if (rules) {
      var def;
      for (var i = 0; i < rules.length; i++) {
        def = rules[i](name, schema, options);

        //first handler in list that actually returns something is our handler!
        if (def) {

          // Do we have form defaults in the schema under the x-schema-form-attribute?
          if (def.schema['x-schema-form'] && angular.isObject(def.schema['x-schema-form'])) {
            def = angular.extend(def, def.schema['x-schema-form']);
          }

          return def;
        }
      }
    }
  };

  var markdown = function(name, schema, options) {
    if (stripNullType(schema.type) === 'string' && stripNullType(schema.format) === 'markdown') {
      var f = stdFormObj(name, schema, options);
      f.key = options.path;
      f.type = 'markdown';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var text = function(name, schema, options) {
    if (stripNullType(schema.type) === 'string' && !schema['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'text';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  //default in json form for number and integer is a text field
  //input type="number" would be more suitable don't ya think?
  var number = function(name, schema, options) {
    if (stripNullType(schema.type) === 'number' && schema['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'select';
      if (!f.titleMap && schema['options'] && schema['options']['titles']) {
        f.titleMap = optionsToTitleMap(schema.options.titles, schema.enum);
      } else if (!f.titleMap) {
        f.titleMap = enumToTitleMap(schema['enum']);
      }
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    } else  if (stripNullType(schema.type) === 'number') {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'number';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var integer = function(name, schema, options) {
    if (stripNullType(schema.type) === 'integer' && schema['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'select';
      if (!f.titleMap && schema['options'] && schema['options']['titles']) {
        f.titleMap = optionsToTitleMap(schema.options.titles, schema.enum);
      } else if (!f.titleMap) {
        f.titleMap = enumToTitleMap(schema['enum']);
      }
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    } else if (stripNullType(schema.type) === 'integer') {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'number';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var checkbox = function(name, schema, options) {
    if (stripNullType(schema.type) === 'boolean') {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'checkbox';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var select = function(name, schema, options) {
    if (stripNullType(schema.type) === 'string' && schema['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'select';
      if (!f.titleMap && schema['options'] && schema['options']['titles']) {
        f.titleMap = optionsToTitleMap(schema.options.titles, schema.enum);
      } else if (!f.titleMap) {
        f.titleMap = enumToTitleMap(schema['enum']);
      }
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var checkboxes = function(name, schema, options) {
    if (stripNullType(schema.type) === 'array' && schema.items && schema.items['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'checkboxes';
      if (!f.titleMap && schema['options'] && schema['options']['titles']) {
        f.titleMap = optionsToTitleMap(schema.options.titles, schema.enum);
      } else if (!f.titleMap) {
        f.titleMap = enumToTitleMap(schema.items['enum'], schema.items['options']);
      }
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var fieldset = function(name, schema, options) {
    if (stripNullType(schema.type) === 'object') {
      var f   = stdFormObj(name, schema, options);
      f.type  = 'fieldset';
      f.items = [];
      options.lookup[sfPathProvider.stringify(options.path)] = f;

      //recurse down into properties
      angular.forEach(schema.properties, function(v, k) {
        var path = options.path.slice();
        path.push(k);
        if (options.ignore[sfPathProvider.stringify(path)] !== true) {
          var required = schema.required && schema.required.indexOf(k) !== -1;

          var def = defaultFormDefinition(k, v, {
            path: path,
            required: required || false,
            lookup: options.lookup,
            ignore: options.ignore,
            global: options.global
          });
          if (def) {
            f.items.push(def);
          }
        }
      });

      return f;
    }

  };

  var array = function(name, schema, options) {

    if (stripNullType(schema.type) === 'array') {
      var f   = stdFormObj(name, schema, options);
      f.type  = 'array';
      f.key   = options.path;
      options.lookup[sfPathProvider.stringify(options.path)] = f;

      var required = schema.required &&
                     schema.required.indexOf(options.path[options.path.length - 1]) !== -1;

      // The default is to always just create one child. This works since if the
      // schemas items declaration is of type: "object" then we get a fieldset.
      // We also follow json form notatation, adding empty brackets "[]" to
      // signify arrays.

      var arrPath = options.path.slice();
      arrPath.push('');

      f.items = [defaultFormDefinition(name, schema.items, {
        path: arrPath,
        required: required || false,
        lookup: options.lookup,
        ignore: options.ignore,
        global: options.global
      })];

      return f;
    }

  };

  //First sorted by schema type then a list.
  //Order has importance. First handler returning an form snippet will be used.
  var defaults = {
    string:  [
      select,
      markdown,
      category.bind(null, sfPathProvider),
      text
      ],
    object:  [fieldset],
    number:  [
      category.bind(null, sfPathProvider),
      number],
    integer: [integer],
    boolean: [checkbox],
    array:   [
      checkboxes,
      media.bind(null, sfPathProvider),
      array
      ]
  };

  var postProcessFn = function(form) { return form; };

  /**
   * Provider API
   */
  this.defaults              = defaults;
  this.stdFormObj            = stdFormObj;
  this.defaultFormDefinition = defaultFormDefinition;

  /**
   * Register a post process function.
   * This function is called with the fully merged
   * form definition (i.e. after merging with schema)
   * and whatever it returns is used as form.
   */
  this.postProcess = function(fn) {
    postProcessFn = fn;
  };

  /**
   * Append default form rule
   * @param {string}   type json schema type
   * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
   *                        definition or undefined
   */
  this.appendRule = function(type, rule) {
    if (!defaults[type]) {
      defaults[type] = [];
    }
    defaults[type].push(rule);
  };

  /**
   * Prepend default form rule
   * @param {string}   type json schema type
   * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
   *                        definition or undefined
   */
  this.prependRule = function(type, rule) {
    if (!defaults[type]) {
      defaults[type] = [];
    }
    defaults[type].unshift(rule);
  };

  /**
   * Utility function to create a standard form object.
   * This does *not* set the type of the form but rather all shared attributes.
   * You probably want to start your rule with creating the form with this method
   * then setting type and any other values you need.
   * @param {Object} schema
   * @param {Object} options
   * @return {Object} a form field defintion
   */
  this.createStandardForm = stdFormObj;
  /* End Provider API */

  this.$get = function() {

    var service = {};

    service.merge = function(schema, form, ignore, options, readonly, asyncTemplates) {
      form  = form || ['*'];
      options = options || {};

      // Get readonly from root object
      readonly = readonly || schema.readonly || schema.readOnly;

      var stdForm = service.defaults(schema, ignore, options);

      //simple case, we have a "*", just put the stdForm there
      var idx = form.indexOf('*');
      if (idx !== -1) {
        form  = form.slice(0, idx)
                    .concat(stdForm.form)
                    .concat(form.slice(idx + 1));
      }

      //ok let's merge!
      //We look at the supplied form and extend it with schema standards
      var lookup = stdForm.lookup;

      return postProcessFn(form.map(function(obj) {

        //handle the shortcut with just a name
        if (typeof obj === 'string') {
          obj = {key: obj};
        }

        if (obj.key) {
          if (typeof obj.key === 'string') {
            obj.key = sfPathProvider.parse(obj.key);
          }
        }

        //If it has a titleMap make sure it's a list
        if (obj.titleMap) {
          obj.titleMap = canonicalTitleMap(obj.titleMap);
        }

        //
        if (obj.itemForm) {
          obj.items = [];
          var str = sfPathProvider.stringify(obj.key);
          var stdForm = lookup[str];
          angular.forEach(stdForm.items, function(item) {
            var o = angular.copy(obj.itemForm);
            o.key = item.key;
            obj.items.push(o);
          });
        }

        //extend with std form from schema.
        if (obj.key) {
          var strid = sfPathProvider.stringify(obj.key);
          if (lookup[strid]) {
            var schemaDefaults = lookup[strid];
            angular.forEach(schemaDefaults, function(value, attr) {
              if (obj[attr] === undefined) {
                obj[attr] = schemaDefaults[attr];
              }
            });
          }
        }

        // Are we inheriting readonly?
        if (readonly === true) { // Inheriting false is not cool.
          obj.readonly = true;
        }

        //if it's a type with items, merge 'em!
        if (obj.items) {
          obj.items = service.merge(schema, obj.items, ignore, options, obj.readonly, asyncTemplates);
        }

        //if its has tabs, merge them also!
        if (obj.tabs) {
          angular.forEach(obj.tabs, function(tab) {
            tab.items = service.merge(schema, tab.items, ignore, options, obj.readonly, asyncTemplates);
          });
        }

        // Special case: checkbox
        // Since have to ternary state we need a default
        if (obj.type === 'checkbox' && angular.isUndefined(obj.schema['default'])) {
          obj.schema['default'] = false;
        }

        // Special case: template type with tempplateUrl that's needs to be loaded before rendering
        // TODO: this is not a clean solution. Maybe something cleaner can be made when $ref support
        // is introduced since we need to go async then anyway
        if (asyncTemplates && obj.type === 'template' && !obj.template && obj.templateUrl) {
          asyncTemplates.push(obj);
        }

        return obj;
      }));
    };

    /**
     * Create form defaults from schema
     */
    service.defaults = function(schema, ignore, globalOptions) {
      var form   = [];
      var lookup = {}; //Map path => form obj for fast lookup in merging
      ignore = ignore || {};
      globalOptions = globalOptions || {};

      if (stripNullType(schema.type) === 'object') {
        angular.forEach(schema.properties, function(v, k) {
          if (ignore[k] !== true) {
            var required = schema.required && schema.required.indexOf(k) !== -1;
            var def = defaultFormDefinition(k, v, {
              path: [k],         // Path to this property in bracket notation.
              lookup: lookup,    // Extra map to register with. Optimization for merger.
              ignore: ignore,    // The ignore list of paths (sans root level name)
              required: required, // Is it required? (v4 json schema style)
              global: globalOptions // Global options, including form defaults
            });
            if (def) {
              form.push(def);
            }
          }
        });

      } else {
        throw new Error('Not implemented. Only type "object" allowed at root level of schema.');
      }
      return {form: form, lookup: lookup};
    };

    //Utility functions
    /**
     * Traverse a schema, applying a function(schema,path) on every sub schema
     * i.e. every property of an object.
     */
    service.traverseSchema = function(schema, fn, path, ignoreArrays) {
      ignoreArrays = angular.isDefined(ignoreArrays) ? ignoreArrays : true;

      path = path || [];

      var traverse = function(schema, fn, path) {
        fn(schema, path);
        angular.forEach(schema.properties, function(prop, name) {
          var currentPath = path.slice();
          currentPath.push(name);
          traverse(prop, fn, currentPath);
        });

        //Only support type "array" which have a schema as "items".
        if (!ignoreArrays && schema.items) {
          var arrPath = path.slice(); arrPath.push('');
          traverse(schema.items, fn, arrPath);
        }
      };

      traverse(schema, fn, path || []);
    };

    service.traverseForm = function(form, fn) {
      fn(form);
      angular.forEach(form.items, function(f) {
        service.traverseForm(f, fn);
      });

      if (form.tabs) {
        angular.forEach(form.tabs, function(tab) {
          angular.forEach(tab.items, function(f) {
            service.traverseForm(f, fn);
          });
        });
      }
    };

    return service;
  };

  }]);


  // Takes a titleMap in either object or list format and returns one in
  // in the list format.
  function canonicalTitleMap(titleMap, originalEnum) {
    // angular
    if (!angular.isArray(titleMap)) {
      var canonical = [];
      if (originalEnum) {
        angular.forEach(originalEnum, function(value, index) {
          canonical.push({name: titleMap[value], value: value});
        });
      } else {
        angular.forEach(titleMap, function(name, value) {
          canonical.push({name: name, value: value});
        });
      }
      return canonical;
    }
    return titleMap;
  }

  function stdFormObj(name, schema, options) {
    // angular
    options = options || {};
    var f = options.global && options.global.formDefaults ?
            angular.copy(options.global.formDefaults) : {};
    if (options.global && options.global.supressPropertyTitles === true) {
      f.title = schema.title;
    } else {
      f.title = schema.title || name;
    }

    if (schema.description) { f.description = schema.description; }
    if (options.required === true || schema.required === true) { f.required = true; }
    if (schema.maxLength) { f.maxlength = schema.maxLength; }
    if (schema.minLength) { f.minlength = schema.minLength; }
    if (schema.readOnly || schema.readonly) { f.readonly  = true; }
    if (schema.minimum) { f.minimum = schema.minimum + (schema.exclusiveMinimum ? 1 : 0); }
    if (schema.maximum) { f.maximum = schema.maximum - (schema.exclusiveMaximum ? 1 : 0); }

    // Non standard attributes (DONT USE DEPRECATED)
    // If you must set stuff like this in the schema use the x-schema-form attribute
    if (schema.validationMessage) { f.validationMessage = schema.validationMessage; }
    if (schema.enumNames) { f.titleMap = canonicalTitleMap(schema.enumNames, schema['enum']); }
    f.schema = schema;

    // Ng model options doesn't play nice with undefined, might be defined
    // globally though
    f.ngModelOptions = f.ngModelOptions || {};

    return f;
  }

  function stripNullType(type) {
    if (Array.isArray(type) && type.length == 2) {
      if (type[0] === 'null')
        return type[1];
      if (type[1] === 'null')
        return type[0];
    }
    return type;
  }

  function category(sfPathProvider, name, schema, options) {

    var f,
      type    = stripNullType(schema.type),
      format  = stripNullType(schema.format),
      key,
      path;

    if (['string', 'number'].indexOf(type) !== -1 && format === 'category') {

      f       = stdFormObj(name, schema, options);
      key     = options.path;
      f.key   = key;
      f.type  = format;
      path    = sfPathProvider.stringify(key);
      options.lookup[path] = f;

      return f;

    }

  }

  function media(sfPathProvider, name, schema, options) {
    var f,
      type    = stripNullType(schema.type),
      format  = stripNullType(schema.format),
      key,
      path;

    if (type === 'array' && format === 'media') {

      f       = stdFormObj(name, schema, options);
      key     = options.path;
      f.key   = key;
      f.type  = format;
      path    = sfPathProvider.stringify(key);
      options.lookup[path] = f;

      return f;

    }

  }

}).call(module || this, angular);

/*  Common code for validating a value against its form and schema definition */
/* global tv4 */
angular.module('schemaForm').factory('sfValidator', [function() {

  var validator = {};

  /**
   * Validate a value against its form definition and schema.
   * The value should either be of proper type or a string, some type
   * coercion is applied.
   *
   * @param {Object} form A merged form definition, i.e. one with a schema.
   * @param {Any} value the value to validate.
   * @return a tv4js result object.
   */
  validator.validate = function(form, value) {
    if (!form) {
      return {valid: true};
    }
    var schema = form.schema;

    if (!schema) {
      return {valid: true};
    }

    // Input of type text and textareas will give us a viewValue of ''
    // when empty, this is a valid value in a schema and does not count as something
    // that breaks validation of 'required'. But for our own sanity an empty field should
    // not validate if it's required.
    if (value === '') {
      value = undefined;
    }

    // Numbers fields will give a null value, which also means empty field
    if (form.type === 'number' && value === null) {
      value = undefined;
    }

    // viiopen validation value
    //console.info('value: ', value);

    // Skip validation if this is a replacement value
    if (value && value.match && value.match(/^@field/)) {
      return {value: true};
    }

    // Version 4 of JSON Schema has the required property not on the
    // property itself but on the wrapping object. Since we like to test
    // only this property we wrap it in a fake object.
    var wrap = {type: 'object', 'properties': {}};
    var propName = form.key[form.key.length - 1];
    wrap.properties[propName] = schema;

    if (form.required) {
      wrap.required = [propName];
    }
    var valueWrap = {};
    if (angular.isDefined(value)) {
      valueWrap[propName] = value;
    }
    return tv4.validateResult(valueWrap, wrap);

  };

  return validator;
}]);

if (!customValidators) {

  console.log("Cannot define validator validateCAT()", new Date());

} else {

  customValidators.validateCAT = function(viewValue, form) {
    var fieldId = form.fieldId;

    if (!viewValue) {
      console.log("validateCAT(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Response(s) missing
    //
    var errors = [];

    if (viewValue.cough == null) errors.push('field' + fieldId + "-cough");
    if (viewValue.phlegm == null) errors.push('field' + fieldId + "-phlegm");
    if (viewValue.chest == null) errors.push('field' + fieldId + "-chest");
    if (viewValue.up == null) errors.push('field' + fieldId + "-up");
    if (viewValue.limited == null) errors.push('field' + fieldId + "-limited");
    if (viewValue.outside == null) errors.push('field' + fieldId + "-outside");
    if (viewValue.sleep == null) errors.push('field' + fieldId + "-sleep");
    if (viewValue.energy == null) errors.push('field' + fieldId + "-energy");

    if (errors.length > 0) {
      errors.unshift('field' + fieldId + "-cat"); // insert at front
      return {
        custom: true,
        valid: false,
        error: {
          code: 5000,
          element_id: errors
        }
      }
    }

    return {valid:true};
  }

}

if (!customValidators) {

  console.log("Cannot define validator validateCnsaComplications()", new Date());

} else {

  customValidators.validateCnsaComplications = function(viewValue, form, model) {
    var fieldId = form.fieldId;
    var element_ids = [];
    var noMsg = {};
    var id;

    // make sure the model is current
    model[form.key[0]] = viewValue

    var reasons = [
      "toggle_complication_reason_dvt",
      "toggle_complication_reason_pe",
      "toggle_complication_reason_mi",
      "toggle_complication_reason_uti",
      "toggle_complication_reason_neuro",
      "toggle_complication_reason_ssi",
      "toggle_complication_reason_hematoma",
      "toggle_complication_reason_cva",
      "toggle_complication_reason_pneum",
      "toggle_complication_reason_seroma",
      "toggle_complication_reason_instFail",
      "toggle_complication_reason_other"
    ];

    var noneSelected = true;

    for (var i=0; i < reasons.length; i++) {
      /* uncomment this to highlight all the checkboxes if none are selected */

      id = 'field-' + reasons[i] + '-' + fieldId;
      element_ids.push(id);

      // this element doesn't need a specific error message, so...
      noMsg[id] = true;

      // check if reason exists
      noneSelected = noneSelected && !model[reasons[i]];
    }

    if (noneSelected) {
      // in the form, the help decorator looks like a field label, so...
      element_ids.push('help-reasons-for-complication-' + fieldId);

      // in order for the error message to appear in the validator element...
      element_ids.push('val-reasons-for-complication-' + fieldId);

      return {
        custom: true,
        valid: false,
        error: { code: 0, element_ids: element_ids, noMsg: noMsg },
        rootScopeBroadCast: true
      }

    } else if (model['toggle_complication_reason_other'] && _isEmpty(model['complication_reason_other_specify'])) {

      // basically the same as the above block, sans comments
      element_ids = [];
      id = 'field-complication_reason_other_specify-' + fieldId;
      element_ids.push(id);
      noMsg[id] = true;
      element_ids.push('help-reasons-for-complication-' + fieldId);
      element_ids.push('val-reasons-for-complication-' + fieldId);

      return {
        custom: true,
        valid: false,
        error: { code: 0, element_ids: element_ids, noMsg: noMsg },
        rootScopeBroadCast: true
      }

    } else {

      // send the help decorator's ID back so schema-validate
      // can remove the error class

      element_ids.push('help-reasons-for-complication-' + fieldId);
      return { valid:true, clear: element_ids }

    }

  }

}

if (!customValidators) {

} else {
  customValidators.validateCnsaDiagnosis = function(viewValue, form, model) {

    var fieldId = form.fieldId;
    var element_ids;

    if(model.toggle_compression == null) {
      var returnVal = {
        custom: true,
        valid: false,
        error: {
          code: 0,
          element_ids: [
            'field-toggle_compression-' + fieldId
          ]
        },
        rootScopeBroadCast: true
      };

      if (!model.toggle_clinical_manifestation) {
        returnVal.error.element_ids.push('field-toggle_clinical_manifestation-' + fieldId);
      }

      return returnVal;
    }

    if (model.toggle_compression) {
        if (!(
          model.toggle_sn_t4 ||
          model.toggle_sn_t5 ||
          model.toggle_sn_t6 ||
          model.toggle_sn_t7 ||
          model.toggle_sn_t8 ||
          model.toggle_sn_t9 ||
          model.toggle_sn_t10 ||
          model.toggle_sn_t11 ||
          model.toggle_sn_t12 ||
          model.toggle_sn_l1 ||
          model.toggle_sn_l2 ||
          model.toggle_sn_l3 ||
          model.toggle_sn_l4 ||
          model.toggle_sn_l5 ||
          model.toggle_sn_s1
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'sn_level',
              element_ids: [
                'field-toggle_compression-' + fieldId
              ]
            },
            rootScopeBroadCast: true
          }
        }

      var levels = [
        't4',
        't5',
        't6',
        't7',
        't8',
        't9',
        't10',
        't11',
        't12',
        'l1',
        'l2',
        'l3',
        'l4',
        'l5',
        's1'
      ];

      element_ids = [];

      for (var i in levels) {
        if (model['toggle_sn_' + levels[i]]) {
          if (model['sn_' + levels[i] + '_side'] == null) {
            element_ids.push('field-sn_' + levels[i] + '_side-' + fieldId);
          }
          if (model['sn_' + levels[i] + '_type'] == null) {
            element_ids.push('field-sn_' + levels[i] + '_type-' + fieldId);
          }
        }
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }

    if (model.toggle_structural_spine) {
      if (!(
        model.toggle_ss_t4t5 ||
        model.toggle_ss_t5t6 ||
        model.toggle_ss_t6t7 ||
        model.toggle_ss_t7t8 ||
        model.toggle_ss_t8t9 ||
        model.toggle_ss_t9t10 ||
        model.toggle_ss_t10t11 ||
        model.toggle_ss_t11t12 ||
        model.toggle_ss_t12l1 ||
        model.toggle_ss_l1l2 ||
        model.toggle_ss_l2l3 ||
        model.toggle_ss_l3l4 ||
        model.toggle_ss_l4l5 ||
        model.toggle_ss_l5s1 ||
        model.toggle_ss_s1p
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'ss_seg',
            element_ids: [
              'field-toggle_structural_spine-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        }
      }

      levels = [
        't4t5',
        't5t6',
        't6t7',
        't7t8',
        't8t9',
        't9t10',
        't10t11',
        't11t12',
        't12l1',
        'l1l2',
        'l2l3',
        'l3l4',
        'l4l5',
        'l5s1',
        's1p'
      ];

      element_ids = [];

      for (var i in levels) {
        if (model['toggle_ss_' + levels[i]]) {

          if (model['toggle_ss_' + levels[i] + '_listhesis']) {
            if (model['ss_' + levels[i] + '_listh_stable_dynamic'] == null) {
              element_ids.push('field-ss_' + levels[i] + '_listh_stable_dynamic-' + fieldId);
            }
            if (model['ss_' + levels[i] + '_listh_isthmic_degen'] == null) {
              element_ids.push('field-ss_' + levels[i] + '_listh_isthmic_degen-' + fieldId);
            }
            if (model['ss_' + levels[i] + '_listh_MaxGrade'] == null) {
              element_ids.push('field-ss_' + levels[i] + '_listh_MaxGrade-' + fieldId);
            }
          }

          if (model['ss_' + levels[i] + '_mecDiscColl'] == null) {
            element_ids.push('field-ss_' + levels[i] + '_mecDiscColl-' + fieldId);
          }

        }
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }

    // field is required
    if (model.toggle_clinical_manifestation == null) {
      return {
        custom: true,
        valid: false,
        error: {
          code: '0',
          element_ids: [ 'field-toggle_clinical_manifestation-' + fieldId ]
        },
        rootScopeBroadCast: true
      }
    } else if (model.toggle_clinical_manifestation) {
      if (!(
        model.toggle_cm_radiculopathy ||
        model.toggle_cm_neuroClaud ||
        model.toggle_cm_myelopathy ||
        model.toggle_cm_neuroBowelBladd ||
        model.toggle_cm_lowestMotor ||
        model.toggle_cm_backPain
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'cm',
            element_ids: [ 'field-toggle_clinical_manifestation-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      if (model.toggle_cm_lowestMotor) {
        if (model.cm_lowestMotor == null) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 0,
              element_ids: [ 'field-cm_lowestMotor-' + fieldId ]
            },
            rootScopeBroadCast: true
          }
        }
      }

      element_ids = [];

      if (model.toggle_cm_backPain) {
        if (model.cm_backPain_mechanical == null) {
          element_ids.push('field-cm_backPain_mechanical-' + fieldId);
        }
        if (model.cm_back_pain_generator == null || model.cm_back_pain_generator.length < 1) {
          element_ids.push('field-cm_back_pain_generator-' + fieldId);
        }
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }


    if (model.toggle_deformity) {
      if (model.def_ll != null && model.def_pi == null) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [ 'field-def_pi-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      } else if (model.def_ll == null && model.def_pi != null) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [ 'field-def_ll-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }
    }


    if (model.toggle_revision) {
      if (!(
        model.toggle_revision_reason_deg ||
        model.toggle_revision_reason_sameLevelStenosis ||
        model.toggle_revision_reason_pseudoarthrosis ||
        model.toggle_revision_reason_pjk ||
        model.toggle_revision_reason_djk ||
        model.toggle_revision_reason_instFail ||
        model.toggle_revision_reason_recurrHNP
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'reasons',
            element_ids: [ 'field-toggle_revision-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      element_ids = [];

      if (model.toggle_revision_reason_instFail && model.rev_instFail_months == null) {
        element_ids.push('field-rev_instFail_months-' + fieldId);
      }
      if (model.toggle_revision_reason_slrhnp && model.rev_recurrentHNP == null) {
        element_ids.push('field-rev_recurrentHNP-' + fieldId);
      }

      if (element_ids.length > 0) {
        return {
          custom: true,
          valid: false,
          error: { code: 0, element_ids: element_ids },
          rootScopeBroadCast: true
        }
      }
    }

    return {
      valid: true
    };

  }

}

if (!customValidators) {

  console.log("Cannot define validator validateCnsaReadmissionReasons()", new Date());

} else {

  customValidators.validateCnsaReadmissionReasons = function(viewValue, form, model) {
    var fieldId = form.fieldId;
    var element_ids = [];
    var noMsg = {};
    var unchecked = function(v) { return v === null || v === false }

    // make sure the model is current
    model[form.key[0]] = viewValue;

    if (
      unchecked(model.toggle_readmit_reason_1) &&
      unchecked(model.toggle_readmit_reason_2) &&
      unchecked(model.toggle_readmit_reason_3) &&
      unchecked(model.toggle_readmit_reason_4) &&
      unchecked(model.toggle_readmit_reason_5) &&
      unchecked(model.toggle_readmit_reason_6) &&
      unchecked(model.toggle_readmit_reason_7) &&
      unchecked(model.toggle_readmit_reason_8) &&
      unchecked(model.toggle_readmit_reason_11) &&
      unchecked(model.toggle_readmit_reason_12) &&
      unchecked(model.toggle_readmit_reason_10)
    ) {

      for (var i=1; i < 13; i++) {
        if (i != 9) {
          id = 'field-toggle_readmit_reason_' + i + '-' + fieldId;

          element_ids.push(id);

          // only the last reason needs a message so...
          if (i != 10) noMsg[id] = true;
        }
      }

      // in the form, the help decorator looks like a field label, so...
      element_ids.push('help-reasons-for-complication-' + fieldId);
    }

    if (element_ids.length > 0) {
      return {
        custom: true,
        valid: false,
        error: { code: 0, element_ids: element_ids, noMsg: noMsg },
        rootScopeBroadCast: true
      }
    } else {
      // send the help decorator's ID back so schema-validate
      // can remove the error class
      element_ids.push('help-reasons-for-complication-' + fieldId);
      return { valid:true, clear: element_ids }
    }

  }

}

if (!customValidators) {

  console.log("Cannot define validator validateCnsaReturnORReasons()", new Date());

} else {

  customValidators.validateCnsaReturnORReasons = function(viewValue, form, model) {
    var fieldId = form.fieldId;
    var element_ids = [];
    var noMsg = {};
    //var unchecked = function(v) { return v === null || v === false }

    // make sure the model is current
    model[form.key[0]] = viewValue;

    if (
      !model.toggle_return_or_reason_1 &&
      !model.toggle_return_or_reason_2 &&
      !model.toggle_return_or_reason_3 &&
      !model.toggle_return_or_reason_4 &&
      !model.toggle_return_or_reason_5 &&
      !model.toggle_return_or_reason_6 &&
      !model.toggle_return_or_reason_7 &&
      !model.toggle_return_or_reason_8 &&
      !model.toggle_return_or_reason_11 &&
      !model.toggle_return_or_reason_12 &&
      !model.toggle_return_or_reason_10
    ) {

      for (var i=1; i < 13; i++) {
        if (i != 9) {
          id = 'field-toggle_return_or_reason_' + i + '-' + fieldId;

          element_ids.push(id);

          // only the last reason needs a message so...
          if (i != 10) noMsg[id] = true;
        }
      }

      // in the form, the help decorator looks like a field label, so...
      element_ids.push('help-reasons-for-return-' + fieldId);
    }

    if (element_ids.length > 0) {
      return {
        custom: true,
        valid: false,
        error: { code: 0, element_ids: element_ids, noMsg: noMsg },
        rootScopeBroadCast: true
      }
    } else {
      // send the help decorator's ID back so schema-validate
      // can remove the error class
      element_ids.push('help-reasons-for-return-' + fieldId);
      return { valid:true, clear: element_ids }
    }

  }

}

if (!customValidators) {
  console.error('Cannot define validator validateCnsaToggles()', new Date());
} else {
  customValidators.validateCnsaToggles = function(viewValue, form, model) {
    var fieldId = form.fieldId,
        elementIds = [],
        noMsg = {},
        id,
        noneSelected = true;

    model[form.key[0]] = viewValue;

    // var toggles = [
    //   "toggle_periop_complic_dvt",
    //   "toggle_periop_complic_pe",
    //   "toggle_periop_complic_neural",
    //   "toggle_periop_complic_mi",
    //   "toggle_periop_complic_uti",
    //   "toggle_periop_complic_cva",
    //   "toggle_periop_complic_pneum",
    //   "toggle_periop_complic_coaguopathy",
    //   "toggle_periop_complic_durotomy",
    //   "toggle_periop_complic_seroma",
    //   "toggle_periop_complic_wound_dehisc",
    //   "toggle_periop_complic_cfs_leak",
    //   "toggle_periop_complic_ssi",
    //   "toggle_periop_complic_hematoma",
    //   "toggle_periop_complic_pain",
    //   "toggle_periop_complic_other",

    //   "toggle_complications_dvt",
    //   "toggle_complications_pe",
    //   "toggle_complications_neuro",
    //   "toggle_complications_mi",
    //   "toggle_complications_uti",
    //   "toggle_complications_cva",
    //   "toggle_complications_pneum",
    //   "toggle_complications_ssi",
    //   "toggle_complications_hematoma",

    //   "toggle_maj_surg_cervical",
    //   "toggle_maj_surg_thoracolumbar",
    //   "toggle_maj_surg_hip",
    //   "toggle_maj_surg_knee"
    // ];

    // Set value of backend toggle
    var backendKey = form.key[0].replace(/^toggle_/i, '');

    // BWB if the model has the same key -{toggle_}
    // and this validator is on the toggle, then just do this
    // don't whitelist anymore...
    if (_.has(model, backendKey)) {
      if (model[backendKey] != null) {
        model[backendKey] = viewValue ? 1 : 0;
      } else {
        model[backendKey] = viewValue ? 1 : null;
      }
    }

    // Handle the special case for thoraco lumbar treatment
    var toggleGroups = {
      nd_discectomy: {
        dependsOn: 'toggle_neural_decomp',
        satisfiedBy: [
          ["toggle_neural_decomp", "toggle_nd_t4", "toggle_nd_t4_discect"],
          ["toggle_neural_decomp", "toggle_nd_t5", "toggle_nd_t5_discect"],
          ["toggle_neural_decomp", "toggle_nd_t6", "toggle_nd_t6_discect"],
          ["toggle_neural_decomp", "toggle_nd_t7", "toggle_nd_t7_discect"],
          ["toggle_neural_decomp", "toggle_nd_t8", "toggle_nd_t8_discect"],
          ["toggle_neural_decomp", "toggle_nd_t9", "toggle_nd_t9_discect"],
          ["toggle_neural_decomp", "toggle_nd_t10", "toggle_nd_t10_discect"],
          ["toggle_neural_decomp", "toggle_nd_t11", "toggle_nd_t11_discect"],
          ["toggle_neural_decomp", "toggle_nd_t12", "toggle_nd_t12_discect"],
          ["toggle_neural_decomp", "toggle_nd_l1", "toggle_nd_l1_discect"],
          ["toggle_neural_decomp", "toggle_nd_l2", "toggle_nd_l2_discect"],
          ["toggle_neural_decomp", "toggle_nd_l3", "toggle_nd_l3_discect"],
          ["toggle_neural_decomp", "toggle_nd_l4", "toggle_nd_l4_discect"],
          ["toggle_neural_decomp", "toggle_nd_l5", "toggle_nd_l5_discect"],
          ["toggle_neural_decomp", "toggle_nd_s1", "toggle_nd_s1_discect"]
        ]
      },
      nd_osteotomy: {
        dependsOn: 'toggle_neural_decomp',
        satisfiedBy: [
          ["toggle_neural_decomp", "toggle_nd_t4", "toggle_nd_t4_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t5", "toggle_nd_t5_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t6", "toggle_nd_t6_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t7", "toggle_nd_t7_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t8", "toggle_nd_t8_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t9", "toggle_nd_t9_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t10", "toggle_nd_t10_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t11", "toggle_nd_t11_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t12", "toggle_nd_t12_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l1", "toggle_nd_l1_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l2", "toggle_nd_l2_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l3", "toggle_nd_l3_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l4", "toggle_nd_l4_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l5", "toggle_nd_l5_osteot"],
          ["toggle_neural_decomp", "toggle_nd_s1", "toggle_nd_s1_osteot"]
        ]
      },
      nd_facetectomy: {
        dependsOn: 'toggle_neural_decomp',
        satisfiedBy: [
          ["toggle_neural_decomp", "toggle_nd_t4", "toggle_nd_t4_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t5", "toggle_nd_t5_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t6", "toggle_nd_t6_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t7", "toggle_nd_t7_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t8", "toggle_nd_t8_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t9", "toggle_nd_t9_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t10", "toggle_nd_t10_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t11", "toggle_nd_t11_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t12", "toggle_nd_t12_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l1", "toggle_nd_l1_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l2", "toggle_nd_l2_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l3", "toggle_nd_l3_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l4", "toggle_nd_l4_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l5", "toggle_nd_l5_facetect"],
          ["toggle_neural_decomp", "toggle_nd_s1", "toggle_nd_s1_facetect"]
        ]
      },
      pa_spacer: {
        dependsOn: 'toggle_arthrodesis',
        satisfiedBy: [
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t4t5", "toggle_pa_t4t5_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t5t6", "toggle_pa_t5t6_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t6t7", "toggle_pa_t6t7_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t7t8", "toggle_pa_t7t8_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t8t9", "toggle_pa_t8t9_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t9t10", "toggle_pa_t9t10_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t10t11", "toggle_pa_t10t11_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t11t12", "toggle_pa_t11t12_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t12l1", "toggle_pa_t12l1_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l1l2", "toggle_pa_l1l2_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l2l3", "toggle_pa_l2l3_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l3l4", "toggle_pa_l3l4_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l4l5", "toggle_pa_l4l5_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l5s1", "toggle_pa_l5s1_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_s1p", "toggle_pa_s1p_spacer"]
        ]
      }
    };

    // For all grouped toggles
    for (var property in toggleGroups) {
      var grouping = toggleGroups[property];

      // If we at least have the first
      if (model[grouping.dependsOn]) {
        // Check model value for each toggle in grouping
        for (var i = 0; i < grouping.satisfiedBy.length; i++) {
          var satisfyingGroup = grouping.satisfiedBy[i],
              satisfied = true;

          for (var k = 0; k < satisfyingGroup.length; k++) {
            if (!model[satisfyingGroup[k]]) {
              satisfied = false;
              break;
            }
          }

          if (satisfied) {
            model[property] = 1;
            break;
          }
        }
      }
    }

    return {
      valid: true
    }

  }
}

if (!customValidators) {

  console.log("Cannot define validator validateCnsaTreatment()", new Date());

} else {

  customValidators.validateCnsaTreatment = function(viewValue, form, model) {
    var fieldId = form.fieldId;
    var element_ids;

    if (model.toggle_neural_decomp === null) {
      return {
        custom: true,
        valid: false,
        error: {
          code: 'nd',
          element_ids: [ 'field-toggle_neural_decomp-' + fieldId ]
        },
        rootScopeBroadCast: true
      }
    }

    if (model.toggle_neural_decomp === 0 && !model.toggle_arthrodesis) {
      return {
        custom: true,
        valid: false,
        error: {
          code: 'arthrodesis',
          element_ids: [ 'field-toggle_arthrodesis-' + fieldId ]
        },
        rootScopeBroadCast: true
      }
    }

    if (model.toggle_neural_decomp) {
      if (model.nd_open === null) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [ 'field-nd_open-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      if (!(
        model.toggle_nd_t4 ||
        model.toggle_nd_t5 ||
        model.toggle_nd_t6 ||
        model.toggle_nd_t7 ||
        model.toggle_nd_t8 ||
        model.toggle_nd_t9 ||
        model.toggle_nd_t10 ||
        model.toggle_nd_t11 ||
        model.toggle_nd_t12 ||
        model.toggle_nd_l1 ||
        model.toggle_nd_l2 ||
        model.toggle_nd_l3 ||
        model.toggle_nd_l4 ||
        model.toggle_nd_l5 ||
        model.toggle_nd_s1
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'nd_levels',
            element_ids: [ 'field-toggle_neural_decomp-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      var levels = [
        't4',
        't5',
        't6',
        't7',
        't8',
        't9',
        't10',
        't11',
        't12',
        'l1',
        'l2',
        'l3',
        'l4',
        'l5',
        's1'
      ];

      for (var i in levels) {
        if (model['toggle_nd_' + levels[i]]) {
          if (model['nd_' + levels[i] + '_side'] == null) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [ 'field-nd_' + levels[i] + '_side-' + fieldId ]
              },
              rootScopeBroadCast: true
            }
          }
          if (model['toggle_nd_' + levels[i] + '_osteot'] && !model['nd_' + levels[i] + '_osteot_columns']) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [ 'field-nd_' + levels[i] + '_osteot_columns-' + fieldId ]
              },
              rootScopeBroadCast: true
            }
          }
        }
      }
    }

    if (model.arthrodesis) {
      if (!(model.toggle_post_arthrod || model.toggle_ant_arthrod)) {
        return {
          custom: true,
          valid: false,
          error:{
            code: 'arth_post_ant',
            element_ids: [
              'field-toggle_post_arthrod-' + fieldId,
              'field-toggle_ant_arthrod-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        }
      }

      if (model.toggle_post_arthrod) {

        element_ids = [];

        if (model.pa_open == null) {
          element_ids.push('field-pa_open-' + fieldId);
        }

        if (model.pa_fixationSystem != null) {
          if (
            model.pa_fixationSystem == 'Other' &&
            (model.pa_fixationSystem_other == null || !/\S/.test(model.pa_fixationSystem_other))
          ) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [
                  'field-pa_fixationSystem_other-' + fieldId
                ]
              },
              rootScopeBroadCast: true
            }
          }

        } else {
          element_ids.push('field-pa_fixationSystem-' + fieldId);
        }

        if (model.pa_fixationSystem_desc == null || !/\S/.test(model.pa_fixationSystem_desc)) {
          element_ids.push('field-pa_fixationSystem_desc-' + fieldId);
        }

        if (model.pa_interbodyGraft != null) {
          if (
            model.pa_interbodyGraft == 'Other' &&
            (model.pa_interbodyGraft_other == null || !/\S/.test(model.pa_interbodyGraft_other))
          ) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [
                  'field-pa_interbodyGraft_other-' + fieldId
                ]
              },
              rootScopeBroadCast: true
            }
          }

        } else {
          element_ids.push('field-pa_interbodyGraft-' + fieldId);
        }

        if (model.pa_interbodyGraft_desc == null || !/\S/.test(model.pa_interbodyGraft_desc)) {
          element_ids.push('field-pa_interbodyGraft_desc-' + fieldId);
        }

        if (element_ids.length > 0) {
          return {
            custom: true,
            valid: false,
            error: { code: 0, element_ids: element_ids },
            rootScopeBroadCast: true
          }
        }

        if (!(
          model.toggle_pa_t4t5 ||
          model.toggle_pa_t5t6 ||
          model.toggle_pa_t6t7 ||
          model.toggle_pa_t7t8 ||
          model.toggle_pa_t8t9 ||
          model.toggle_pa_t9t10 ||
          model.toggle_pa_t10t11 ||
          model.toggle_pa_t11t12 ||
          model.toggle_pa_t12l1 ||
          model.toggle_pa_l1l2 ||
          model.toggle_pa_l2l3 ||
          model.toggle_pa_l3l4 ||
          model.toggle_pa_l4l5 ||
          model.toggle_pa_l5s1 ||
          model.toggle_pa_s1p
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'pa',
              element_ids: [
                'field-toggle_pa_t4t5-' + fieldId
              ]
            },
            rootScopeBroadCast: true
          }
        }

        levels = [
          't4t5',
          't5t6',
          't6t7',
          't7t8',
          't8t9',
          't9t10',
          't10t11',
          't11t12',
          't12l1',
          'l1l2',
          'l2l3',
          'l3l4',
          'l4l5',
          'l5s1',
          's1p'
        ];

        element_ids = [];

        for (var i in levels) {
          if (model['toggle_pa_' + levels[i]]) {
            if (model['toggle_posa_' + levels[i] + '_spacer']) {
              if (model['pa_' + levels[i] + '_spacer'] == null) {
                element_ids.push('field-pa_' + levels[i] + '_spacer-' + fieldId);
              }
              if (model['pa_' + levels[i] + '_spacer_staticExpand'] == null) {
                element_ids.push('field-pa_' + levels[i] + '_spacer_staticExpand-' + fieldId);
              }
            }
          }
        }

        if (element_ids.length > 0) {
          return {
            custom: true,
            valid: false,
            error: { code: 0, element_ids: element_ids },
            rootScopeBroadCast: true
          }
        }
      }

      if (model.toggle_ant_arthrod) {
        if (!(
          model.toggle_aa_t4t5 ||
          model.toggle_aa_t5t6 ||
          model.toggle_aa_t6t7 ||
          model.toggle_aa_t7t8 ||
          model.toggle_aa_t8t9 ||
          model.toggle_aa_t9t10 ||
          model.toggle_aa_t10t11 ||
          model.toggle_aa_t11t12 ||
          model.toggle_aa_t12l1 ||
          model.toggle_aa_l1l2 ||
          model.toggle_aa_l2l3 ||
          model.toggle_aa_l3l4 ||
          model.toggle_aa_l4l5 ||
          model.toggle_aa_l5s1 ||
          model.toggle_aa_s1p
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'aa',
              element_ids: [ 'field-toggle_aa_t4t5-' + fieldId ]
            },
            rootScopeBroadCast: true
          }
        }

        levels = [
          't4t5',
          't5t6',
          't6t7',
          't7t8',
          't8t9',
          't9t10',
          't10t11',
          't11t12',
          't12l1',
          'l1l2',
          'l2l3',
          'l3l4',
          'l4l5',
          'l5s1',
          's1p'
        ];

        element_ids = [];

        for (var i in levels) {
          if (model['toggle_aa_' + levels[i]]) {
            if (model['aa_' + levels[i] + '_approach'] == null) {
              element_ids.push('field-aa_' + levels[i] + '_approach-' + fieldId);
            }
            if (model['aa_' + levels[i] + '_open'] == null) {
              element_ids.push('field-aa_' + levels[i] + '_open-' + fieldId);
            }
          }
        }

        if (model.aa_interbodyGraft != null) {
          if (
            model.aa_interbodyGraft == 'Other' &&
            (model.aa_interbodyGraft_other == null || !/\S/.test(model.aa_interbodyGraft_other))
          ) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [
                  'field-aa_interbodyGraft_other-' + fieldId
                ]
              },
              rootScopeBroadCast: true
            }
          }
        } else {
          element_ids.push('field-aa_interbodyGraft-' + fieldId);
        }

        if (model.aa_interbodyGraft_desc == null || !/\S/.test(model.aa_interbodyGraft_desc)) {
          element_ids.push('field-aa_interbodyGraft_desc-' + fieldId);
        }

        if (element_ids.length > 0) {
          return {
            custom: true,
            valid: false,
            error: { code: 0, element_ids: element_ids },
            rootScopeBroadCast: true
          }
        }
      }
    }

    return {valid:true}
  }

}

angular.module('schemaForm').service('customValidators', [
  function() {
    var functions = {}


    functions.validateDecideTactics = customValidators.validateDecideTactics;

    functions.validateDecideGoalsList = customValidators.validateDecideGoalsList;

    functions.validateDecideFtrReason = customValidators.validateDecideFtrReason;

    functions.validateDecidePrioritiesAndStyles = customValidators.validateDecidePrioritiesAndStyles;

    functions.validateCAT = customValidators.validateCAT;

    functions.validateCnsaDiagnosis = customValidators.validateCnsaDiagnosis;

    functions.validateCnsaTreatment = customValidators.validateCnsaTreatment;

    functions.validateCnsaComplications = customValidators.validateCnsaComplications;

    functions.validateCnsaReadmissionReasons = customValidators.validateCnsaReadmissionReasons;

    functions.validateCnsaReturnORReasons = customValidators.validateCnsaReturnORReasons;

    functions.validateCnsaToggles = customValidators.validateCnsaToggles;

    functions.validateHealthHistory = customValidators.validateHealthHistory;


    return functions;
  }
]);

if (!customValidators) {

  console.log("Cannot define validator validateDecideFtrReason()", new Date());

} else {

  customValidators.validateDecideFtrReason = function(viewValue, form) {
    if (!viewValue) {
      console.log("validateDecideFtrReason(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Minimum number of options missing
    //   5001: Option is null or blank
    //
    if (viewValue.length < 1) {
      return {
        custom: true, valid: false, error: { code: 5000 }
      }
    }

    var all_null = true;
    var good_value = false;

    for (var i in viewValue) {
      if (viewValue[i] != null) {
        all_null = false;
        if (viewValue[i] != "" && /\S/.test(viewValue[i])) {
          good_value = true;
        }
      }
    }

    if (all_null) {
      return {
        custom: true, valid: false, error: { code: 5000 }
      }
    }

    if (!good_value) {
      return {
        custom: true, valid: false, error: { code: 5001 }
      }
    }

    return {valid:true};
  }

}

if (!customValidators) {

  console.log("Cannot define validator validateDecideGoalsList()", new Date());

} else {

  customValidators.validateDecideGoalsList = function(viewValue, form) {
    if (!viewValue) {
      console.log("validateDecideGoalsList(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Minimum number of options missing
    //   5001: Option is null or blank
    //
    for (var i = 0; i < viewValue.length; i++) {

      if (viewValue[i].goal.things_to_do.length < form.initialListLength) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 5000
          }
        }
      }

      // if the number of non-blank/null options is less than required, return error
      var option_count = 0;

      for (var ii = 0; ii < viewValue[i].goal.things_to_do.length; ii++ ) {
        if (viewValue[i].goal.things_to_do[ii] != null) {
          var o = viewValue[i].goal.things_to_do[ii].option;
          if (o.option != null && /\S/.test(o.option)) option_count++;
        }
      }

      if (option_count < form.initialListLength) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 5001
          }
        }
      }

    }

    return {valid:true};
  }

}

if (!customValidators) {

  console.log("Cannot define validator validateDecidePrioritiesAndStyles()", new Date());

} else {

  customValidators.validateDecidePrioritiesAndStyles = function(viewValue, form) {
    if (!viewValue) {
      console.log("validateDecidePrioritiesAndStyles(): no value provided");
      return;
    }

    var fieldId = form.fieldId;
    var element_ids = [];

    for (var i in viewValue) {
      if (_isEmpty(viewValue[i].what_i_did)) {
        element_ids.push('field' + fieldId + '-' + i + '-what_i_did');
      }
      if (_isEmpty(viewValue[i].priority)) {
        element_ids.push('field' + fieldId + '-' + i + '-priority');
      } else {
        if (viewValue[i].priority == 3 && _isEmpty(viewValue[i].other_priority)) {
          element_ids.push('field' + fieldId + '-' + i + '-other_priority');
        }
      }
      if (_isEmpty(viewValue[i].style)) {
        element_ids.push('field' + fieldId + '-' + i + '-style');
      }
    }

    if (element_ids.length > 0) {
      return {
        custom: true,
        valid: false,
        error: { code: 0, element_ids: element_ids }
      }
    }

    return {valid:true};
  }

}

if (!customValidators) {

  console.log("Cannot define validator validateDecideTactics()", new Date());

} else {

  customValidators.validateDecideTactics = function(viewValue) {
    if (!viewValue) {
      console.log("validateDecideTactics(): no value provided");
      return;
    }

    //
    // Error Codes:
    //   5000: Each goal requires at least 1 option
    //   5000: Missing effects (me/others/short/long/will it work/can I do it)
    //

    for (var i = 0; i < viewValue.length; i++) {
      for (var ii = 0; ii < viewValue[i].goal.things_to_do.length; ii++ ) {

        if (viewValue[i].goal.things_to_do.join('').length == 0) {
          // missing options
          return {
            custom: true,
            valid: false,
            error: {
              code: 5000
            }
          };
        }

        if (viewValue[i].goal.things_to_do[ii] != null) {
          var o = viewValue[i].goal.things_to_do[ii].option;

          if (o.option == null || o.option.length == 0 || !/\S/.test(o.option)) {
            // options are blank
            return {
              custom: true,
              valid: false,
              error: {
                code: 5001
              }
            };
          }

          if (!(
            typeof o.can_i_do_it != "undefined" &&
            typeof o.effect_on_me != "undefined" &&
            typeof o.effect_on_others != "undefined" &&
            typeof o.long_term_effect != "undefined" &&
            typeof o.short_term_effect != "undefined" &&
            typeof o.will_it_work != "undefined"
          )) {
            // missing effects
            return {
              custom: true,
              valid: false,
              error: {
                code: 5000
              }
            };
          }
        }

      }
    }

    return {valid:true};
  }

}

if (!customValidators) {

  console.log("Cannot define validator validateHealthHistory()", new Date());

} else {

  customValidators.validateHealthHistory = function(viewValue, form, model, elid) {
    var fieldId = form.fieldId;
    var element_ids = [];
    var noMsg = {};
    var id = 'field-' + form.key[0] + '-' + fieldId;
    var obj, props = ['problem', 'treated', 'limited'];

    var selected = function(o, prop) { return o && (o[prop] === 0 || o[prop] === 1) }

    // NOTE: viewValue never matters here because the schema-validate directive
    // is on a parent container, not on the problem/treated/limited input fields.
    // On a positive note, the model never needs to be made current before checking.

    for (var i in props) {
      obj = model[form.key[0]];
      if (!selected(obj, props[i])) {
        element_ids.push(id + '-' + props[i]);
      }
    }

    if (element_ids.length > 0) {

      element_ids.push('label-' + form.key[0] + '-' + fieldId);

      return {
        custom: true,
        valid: false,
        error: { code: 0, element_ids: element_ids },
        rootScopeBroadCast: true
      }

    } else {

      // send the help decorator's ID back so schema-validate
      // can remove the error class

      element_ids.push('label-' + form.key[0] + '-' + fieldId);
      return { valid:true, clear: element_ids }

    }

  }

}

/**
 * Directive that handles the model arrays
 * DEPRECATED with the new builder use the sfNewArray instead.
 */
angular.module('schemaForm').directive('sfArray', ['sfSelect', 'schemaForm', 'sfValidator', 'sfPath',
  function(sfSelect, schemaForm, sfValidator, sfPath) {

    var setIndex = function(index) {
      return function(form) {
        if (form.key) {
          form.key[form.key.indexOf('')] = index;
        }
      };
    };

    return {
      restrict: 'A',
      scope: true,
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        var formDefCache = {};

        scope.validateArray = angular.noop;

        if (ngModel) {
          // We need the ngModelController on several places,
          // most notably for errors.
          // So we emit it up to the decorator directive so it can put it on scope.
          scope.$emit('schemaFormPropagateNgModelController', ngModel);
        }


        // Watch for the form definition and then rewrite it.
        // It's the (first) array part of the key, '[]' that needs a number
        // corresponding to an index of the form.
        var once = scope.$watch(attrs.sfArray, function(form) {
          if (!form) {
            return;
          }


          // An array model always needs a key so we know what part of the model
          // to look at. This makes us a bit incompatible with JSON Form, on the
          // other hand it enables two way binding.
          var list = sfSelect(form.key, scope.model);

          // We only modify the same array instance but someone might change the array from
          // the outside so let's watch for that. We use an ordinary watch since the only case
          // we're really interested in is if its a new instance.
          var key = sfPath.normalize(form.key);
          scope.$watch('model' + (key[0] !== '[' ? '.' : '') + key, function(value) {
            list = scope.modelArray = value;
          });

          // Since ng-model happily creates objects in a deep path when setting a
          // a value but not arrays we need to create the array.
          if (!list) {
            list = [];
            sfSelect(form.key, scope.model, list);
          }
          scope.modelArray = list;

          // Arrays with titleMaps, i.e. checkboxes doesn't have items.
          if (form.items) {

            // To be more compatible with JSON Form we support an array of items
            // in the form definition of "array" (the schema just a value).
            // for the subforms code to work this means we wrap everything in a
            // section. Unless there is just one.
            var subForm = form.items[0];
            if (form.items.length > 1) {
              subForm = {
                type: 'section',
                items: form.items.map(function(item) {
                  item.ngModelOptions = form.ngModelOptions;
                  if (angular.isUndefined(item.readonly)) {
                    item.readonly = form.readonly;
                  }
                  return item;
                })
              };
            }

          }

          // We ceate copies of the form on demand, caching them for
          // later requests
          scope.copyWithIndex = function(index) {
            if (!formDefCache[index]) {
              if (subForm) {
                var copy = angular.copy(subForm);
                copy.arrayIndex = index;
                schemaForm.traverseForm(copy, setIndex(index));
                formDefCache[index] = copy;
              }
            }
            return formDefCache[index];
          };

          scope.appendToArray = function() {
            var len = list.length;
            var copy = scope.copyWithIndex(len);
            schemaForm.traverseForm(copy, function(part) {

              if (part.key) {
                var def;
                if (angular.isDefined(part['default'])) {
                  def = part['default'];
                }
                if (angular.isDefined(part.schema) &&
                    angular.isDefined(part.schema['default'])) {
                  def = part.schema['default'];
                }

                if (angular.isDefined(def)) {
                  sfSelect(part.key, scope.model, def);
                }
              }
            });

            // If there are no defaults nothing is added so we need to initialize
            // the array. undefined for basic values, {} or [] for the others.
            if (len === list.length) {
              var type = sfSelect('schema.items.type', form);
              var dflt;
              if (type === 'object') {
                dflt = {};
              } else if (type === 'array') {
                dflt = [];
              }
              list.push(dflt);
            }

            // Trigger validation.
            scope.validateArray();
            return list;
          };

          scope.deleteFromArray = function(index) {
            list.splice(index, 1);

            // Trigger validation.
            scope.validateArray();

            // Angular 1.2 lacks setDirty
            if (ngModel && ngModel.$setDirty) {
              ngModel.$setDirty();
            }
            return list;
          };

          // Always start with one empty form unless configured otherwise.
          // Special case: don't do it if form has a titleMap
          if (!form.titleMap && form.startEmpty !== true && list.length === 0) {
            scope.appendToArray();
          }

          // Title Map handling
          // If form has a titleMap configured we'd like to enable looping over
          // titleMap instead of modelArray, this is used for intance in
          // checkboxes. So instead of variable number of things we like to create
          // a array value from a subset of values in the titleMap.
          // The problem here is that ng-model on a checkbox doesn't really map to
          // a list of values. This is here to fix that.
          if (form.titleMap && form.titleMap.length > 0) {
            scope.titleMapValues = [];

            // We watch the model for changes and the titleMapValues to reflect
            // the modelArray
            var updateTitleMapValues = function(arr) {
              scope.titleMapValues = [];
              arr = arr || [];

              form.titleMap.forEach(function(item) {
                scope.titleMapValues.push(arr.indexOf(item.value) !== -1);
              });
            };
            //Catch default values
            updateTitleMapValues(scope.modelArray);
            scope.$watchCollection('modelArray', updateTitleMapValues);

            //To get two way binding we also watch our titleMapValues
            scope.$watchCollection('titleMapValues', function(vals, old) {
              if (vals && vals !== old) {
                var arr = scope.modelArray;

                // Apparently the fastest way to clear an array, readable too.
                // http://jsperf.com/array-destroy/32
                while (arr.length > 0) {
                  arr.pop();
                }
                form.titleMap.forEach(function(item, index) {
                  if (vals[index]) {
                    arr.push(item.value);
                  }
                });

                // Time to validate the rebuilt array.
                scope.validateArray();
              }
            });
          }

          // If there is a ngModel present we need to validate when asked.
          if (ngModel) {
            var error;

            scope.validateArray = function() {
              // The actual content of the array is validated by each field
              // so we settle for checking validations specific to arrays

              // Since we prefill with empty arrays we can get the funny situation
              // where the array is required but empty in the gui but still validates.
              // Thats why we check the length.
              var result = sfValidator.validate(
                form,
                scope.modelArray.length > 0 ? scope.modelArray : undefined
              );

              // TODO: DRY this up, it has a lot of similarities with schema-validate
              // Since we might have different tv4 errors we must clear all
              // errors that start with tv4-
              Object.keys(ngModel.$error)
                    .filter(function(k) { return k.indexOf('tv4-') === 0; })
                    .forEach(function(k) { ngModel.$setValidity(k, true); });

              if (result.valid === false &&
                  result.error &&
                  (result.error.dataPath === '' ||
                  result.error.dataPath === '/' + form.key[form.key.length - 1])) {

                // Set viewValue to trigger $dirty on field. If someone knows a
                // a better way to do it please tell.
                ngModel.$setViewValue(scope.modelArray);
                error = result.error;
                ngModel.$setValidity('tv4-' + result.error.code, false);
                scope.$emit('vii-asf-error', error.code == 302 ? 'Required' : error.code.message);
              } else {
                scope.$emit('vii-remove-asf-error');
              }
            };

            scope.$on('schemaFormValidate', scope.validateArray);

            scope.hasSuccess = function() {
              if (scope.options && scope.options.pristine &&
                  scope.options.pristine.success === false) {
                return ngModel.$valid &&
                    !ngModel.$pristine && !ngModel.$isEmpty(ngModel.$modelValue);
              } else {
                return ngModel.$valid &&
                  (!ngModel.$pristine || !ngModel.$isEmpty(ngModel.$modelValue));
              }
            };

            scope.hasError = function() {
              if (!scope.options || !scope.options.pristine || scope.options.pristine.errors !== false) {
                // Show errors in pristine forms. The default.
                // Note that "validateOnRender" option defaults to *not* validate initial form.
                // so as a default there won't be any error anyway, but if the model is modified
                // from the outside the error will show even if the field is pristine.
                return ngModel.$invalid;
              } else {
                // Don't show errors in pristine forms.
                return ngModel.$invalid && !ngModel.$pristine;
              }
            };

            scope.schemaError = function() {
              return error;
            };

          }

          once();
        });
      }
    };
  }
]);

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

angular.module('schemaForm').directive('sfField',
    ['$parse', '$compile', '$http', '$templateCache', '$interpolate', '$q', 'sfErrorMessage',
     'sfPath','sfSelect',
    function($parse,  $compile,  $http,  $templateCache, $interpolate, $q, sfErrorMessage,
             sfPath, sfSelect) {

      return {
        restrict: 'AE',
        replace: false,
        transclude: false,
        scope: true,
        require: '^sfSchema',
        link: {
          pre: function(scope, element, attrs, sfSchema) {
            //The ngModelController is used in some templates and
            //is needed for error messages,
            scope.$on('schemaFormPropagateNgModelController', function(event, ngModel) {
              event.stopPropagation();
              event.preventDefault();
              scope.ngModel = ngModel;
            });

            // Fetch our form.
            scope.form = sfSchema.lookup['f' + attrs.sfField];
          },
          post: function(scope, element, attrs, sfSchema) {
            //Keep error prone logic from the template
            scope.showTitle = function() {
              return scope.form && scope.form.notitle !== true && scope.form.title && scope.form.title.trim().length > 0;
            };

            scope.castValue = function(option) {
              if (!_.has(option, 'value')) {
                return option;
              }

              var type = typeof option.value;

              if (type == 'string') {
                return option.value;
              } else {
                return type + ':' + option.value;
              }
            }

            scope.listToCheckboxValues = function(list) {
              var values = {};
              angular.forEach(list, function(v) {
                values[v] = true;
              });
              return values;
            };

            scope.checkboxValuesToList = function(values) {
              var lst = [];
              angular.forEach(values, function(v, k) {
                if (v) {
                  lst.push(k);
                }
              });
              return lst;
            };

            scope.buttonClick = function($event, form) {
              if (angular.isFunction(form.onClick)) {
                form.onClick($event, form);
              } else if (angular.isString(form.onClick)) {
                if (sfSchema) {
                  //evaluating in scope outside of sfSchemas isolated scope
                  sfSchema.evalInParentScope(form.onClick, {'$event': $event, form: form});
                } else {
                  scope.$eval(form.onClick, {'$event': $event, form: form});
                }
              }
            };

            /**
             * Evaluate an expression, i.e. scope.$eval
             * but do it in sfSchemas parent scope sf-schema directive is used
             * @param {string} expression
             * @param {Object} locals (optional)
             * @return {Any} the result of the expression
             */
            scope.evalExpr = function(expression, locals) {
              if (sfSchema) {
                //evaluating in scope outside of sfSchemas isolated scope
                return sfSchema.evalInParentScope(expression, locals);
              }

              return scope.$eval(expression, locals);
            };

            /**
             * Evaluate an expression, i.e. scope.$eval
             * in this decorators scope
             * @param {string} expression
             * @param {Object} locals (optional)
             * @return {Any} the result of the expression
             */
            scope.evalInScope = function(expression, locals) {
              if (expression) {
                return scope.$eval(expression, locals);
              }
            };

            /**
             * Interpolate the expression.
             * Similar to `evalExpr()` and `evalInScope()`
             * but will not fail if the expression is
             * text that contains spaces.
             *
             * Use the Angular `{{ interpolation }}`
             * braces to access properties on `locals`.
             *
             * @param  {string} content The string to interpolate.
             * @param  {Object} locals (optional) Properties that may be accessed in the
             *                         `expression` string.
             * @return {Any} The result of the expression or `undefined`.
             */
            scope.interp = function(expression, locals) {
              return (expression && $interpolate(expression)(locals));
            };

            //This works since we get the ngModel from the array or the schema-validate directive.
            scope.hasSuccess = function() {
              if (!scope.ngModel) {
                return false;
              }
              if (scope.options && scope.options.pristine &&
                  scope.options.pristine.success === false) {
                return scope.ngModel.$valid &&
                    !scope.ngModel.$pristine && !scope.ngModel.$isEmpty(scope.ngModel.$modelValue);
              } else {
                return scope.ngModel.$valid &&
                  (!scope.ngModel.$pristine || !scope.ngModel.$isEmpty(scope.ngModel.$modelValue));
              }
            };

            scope.hasError = function() {
              if (!scope.ngModel) {
                return false;
              }
              if (!scope.options || !scope.options.pristine || scope.options.pristine.errors !== false) {
                // Show errors in pristine forms. The default.
                // Note that "validateOnRender" option defaults to *not* validate initial form.
                // so as a default there won't be any error anyway, but if the model is modified
                // from the outside the error will show even if the field is pristine.
                return scope.ngModel.$invalid;
              } else {
                // Don't show errors in pristine forms.
                return scope.ngModel.$invalid && !scope.ngModel.$pristine;
              }
            };

            /**
             * DEPRECATED: use sf-messages instead.
             * Error message handler
             * An error can either be a schema validation message or a angular js validtion
             * error (i.e. required)
             */
            scope.errorMessage = function(schemaError) {
              return sfErrorMessage.interpolate(
                (schemaError && schemaError.code + '') || 'default',
                (scope.ngModel && scope.ngModel.$modelValue) || '',
                (scope.ngModel && scope.ngModel.$viewValue) || '',
                scope.form,
                scope.options && scope.options.validationMessage
              );
            };

            var form = scope.form;

            // Where there is a key there is probably a ngModel
            if (form.key) {
              // It looks better with dot notation.
              scope.$on(
                'schemaForm.error.' + form.key.join('.'),
                function(event, error, validationMessage, validity) {
                  if (validationMessage === true || validationMessage === false) {
                    validity = validationMessage;
                    validationMessage = undefined;
                  }

                  if (scope.ngModel && error) {
                    if (scope.ngModel.$setDirty) {
                      scope.ngModel.$setDirty();
                    } else {
                      // FIXME: Check that this actually works on 1.2
                      scope.ngModel.$dirty = true;
                      scope.ngModel.$pristine = false;
                    }

                    // Set the new validation message if one is supplied
                    // Does not work when validationMessage is just a string.
                    if (validationMessage) {
                      if (!form.validationMessage) {
                        form.validationMessage = {};
                      }
                      form.validationMessage[error] = validationMessage;
                    }

                    scope.ngModel.$setValidity(error, validity === true);

                    if (validity === true) {
                      // Setting or removing a validity can change the field to believe its valid
                      // but its not. So lets trigger its validation as well.
                      scope.$broadcast('schemaFormValidate');
                    }
                  }
              });

              // Clean up the model when the corresponding form field is $destroy-ed.
              // Default behavior can be supplied as a globalOption, and behavior can be overridden
              // in the form definition.
              scope.$on('$destroy', function() {
                // If the entire schema form is destroyed we don't touch the model
                if (!scope.externalDestructionInProgress) {
                  var destroyStrategy = form.destroyStrategy ||
                                        (scope.options && scope.options.destroyStrategy) || 'remove';
                  // No key no model, and we might have strategy 'retain'
                  if (form.key && destroyStrategy !== 'retain') {

                    // Get the object that has the property we wan't to clear.
                    var obj = scope.model;
                    if (form.key.length > 1) {
                      obj = sfSelect(form.key.slice(0, form.key.length - 1), obj);
                    }

                    // We can get undefined here if the form hasn't been filled out entirely
                    if (obj === undefined) {
                      return;
                    }

                    // Type can also be a list in JSON Schema
                    var type = (form.schema && form.schema.type) || '';

                    // Empty means '',{} and [] for appropriate types and undefined for the rest
                    //console.log('destroy', destroyStrategy, form.key, type, obj);
                    if (destroyStrategy === 'empty' && type.indexOf('string') !== -1) {
                      obj[form.key.slice(-1)] = '';
                    } else if (destroyStrategy === 'empty' && type.indexOf('object') !== -1) {
                      obj[form.key.slice(-1)] = {};
                    } else if (destroyStrategy === 'empty' && type.indexOf('array') !== -1) {
                      obj[form.key.slice(-1)] = [];
                    } else if (destroyStrategy === 'null') {
                      obj[form.key.slice(-1)] = null;
                    } else {
                      delete obj[form.key.slice(-1)];
                    }
                  }
                }
              });
            }
          }
        }
      };
    }
  ]);

angular.module('schemaForm')

.directive('hideParent', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // viiopen - Add a class to the parent to hide it, KISS since we build w/jquery
      $(element).parent().addClass('hide');
    }
  };

}])

;

angular.module('schemaForm').directive('sfMessage',
['$injector', 'sfErrorMessage', function($injector, sfErrorMessage) {

  //Inject sanitizer if it exists
  var $sanitize = $injector.has('$sanitize') ?
                  $injector.get('$sanitize') : function(html) { return html; };

  return {
    scope: false,
    restrict: 'EA',
    link: function(scope, element, attrs) {

      var message = '';
      if (attrs.sfMessage) {
        scope.$watch(attrs.sfMessage, function(msg) {
          if (msg) {
            message = $sanitize(msg);
            update(!!scope.ngModel);
          }
        });
      }

      var currentMessage;
      // Only call html() if needed.
      var setMessage = function(msg) {
        if (msg !== currentMessage) {
          element.html(msg);
          currentMessage = msg;
        }
      };

      var update = function(checkForErrors) {
        if (checkForErrors) {
          if (!scope.hasError()) {
            setMessage(message);
          } else {
            var errors = [];
            angular.forEach(scope.ngModel && scope.ngModel.$error, function(status, code) {
              if (status) {
                // if true then there is an error
                // Angular 1.3 removes properties, so we will always just have errors.
                // Angular 1.2 sets them to false.
                errors.push(code);
              }
            });

            // In Angular 1.3 we use one $validator to stop the model value from getting updated.
            // this means that we always end up with a 'schemaForm' error.
            errors = errors.filter(function(e) { return e !== 'schemaForm'; });

            // We only show one error.
            // TODO: Make that optional
            var error = errors[0];

            if (error) {
              setMessage(sfErrorMessage.interpolate(
                error,
                scope.ngModel.$modelValue,
                scope.ngModel.$viewValue,
                scope.form,
                scope.options && scope.options.validationMessage
              ));
            } else {
              setMessage(message);
            }
          }
        } else {
          setMessage(message);
        }
      };

      // Update once.
      update();

      var once = scope.$watch('ngModel',function(ngModel) {
        if (ngModel) {
          // We also listen to changes of the model via parsers and formatters.
          // This is since both the error message can change and given a pristine
          // option to not show errors the ngModel.$error might not have changed
          // but we're not pristine any more so we should change!
          ngModel.$parsers.push(function(val) { update(true); return val; });
          ngModel.$formatters.push(function(val) { update(true); return val; });
          once();
        }
      });

      // We watch for changes in $error
      scope.$watchCollection('ngModel.$error', function() {
        update(!!scope.ngModel);
      });

    }
  };
}]);

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

/**
 * Directive that handles the model arrays
 */
angular.module('schemaForm').directive('sfNewArray', ['sfSelect', 'sfPath', 'schemaForm',
function(sel, sfPath, schemaForm) {
  return {
    scope: false,
    link: function(scope, element, attrs) {
      scope.min = 0;

      scope.modelArray = scope.$eval(attrs.sfNewArray);

      // We need to have a ngModel to hook into validation. It doesn't really play well with
      // arrays though so we both need to trigger validation and onChange.
      // So we watch the value as well. But watching an array can be tricky. We wan't to know
      // when it changes so we can validate,
      var watchFn =  function() {
        //scope.modelArray = modelArray;
        scope.modelArray = scope.$eval(attrs.sfNewArray);
        // validateField method is exported by schema-validate
        if (scope.ngModel && scope.ngModel.$pristine && scope.firstDigest &&
            (!scope.options || scope.options.validateOnRender !== true)) {
          return;
        } else if (scope.validateField) {
          scope.validateField();
        }
      };

      var onChangeFn =  function() {
        if (scope.form && scope.form.onChange) {
          if (angular.isFunction(scope.form.onChange)) {
            scope.form.onChange(scope.modelArray, scope.form);
          } else {
            scope.evalExpr(scope.form.onChange, {'modelValue': scope.modelArray, form: scope.form});
          }
        }
      };

      // If model is undefined make sure it gets set.
      var getOrCreateModel = function() {
        var model = scope.modelArray;
        if (!model) {
          var selection = sfPath.parse(attrs.sfNewArray);
          model = [];
          sel(selection, scope, model);
          scope.modelArray = model;
        }
        return model;
      };

      // We need the form definition to make a decision on how we should listen.
      var once = scope.$watch('form', function(form) {
        if (!form) {
          return;
        }

        // Always start with one empty form unless configured otherwise.
        // Special case: don't do it if form has a titleMap
        if (!form.titleMap && form.startEmpty !== true && (!scope.modelArray || scope.modelArray.length === 0)) {
          scope.appendToArray();
        }

        // If we have "uniqueItems" set to true, we must deep watch for changes.
        if (scope.form && scope.form.schema && scope.form.schema.uniqueItems === true) {
          scope.$watch(attrs.sfNewArray, watchFn, true);

          // We still need to trigger onChange though.
          scope.$watch([attrs.sfNewArray, attrs.sfNewArray + '.length'], onChangeFn);

        } else {
          // Otherwise we like to check if the instance of the array has changed, or if something
          // has been added/removed.
          if (scope.$watchGroup) {
            scope.$watchGroup([attrs.sfNewArray, attrs.sfNewArray + '.length'], function() {
              watchFn();
              onChangeFn();
            });
          } else {
            // Angular 1.2 support
            scope.$watch(attrs.sfNewArray, function() {
              watchFn();
              onChangeFn();
            });
            scope.$watch(attrs.sfNewArray + '.length', function() {
              watchFn();
              onChangeFn();
            });
          }
        }

        // Title Map handling
        // If form has a titleMap configured we'd like to enable looping over
        // titleMap instead of modelArray, this is used for intance in
        // checkboxes. So instead of variable number of things we like to create
        // a array value from a subset of values in the titleMap.
        // The problem here is that ng-model on a checkbox doesn't really map to
        // a list of values. This is here to fix that.
        if (form.titleMap && form.titleMap.length > 0) {
          scope.titleMapValues = [];

          // We watch the model for changes and the titleMapValues to reflect
          // the modelArray
          var updateTitleMapValues = function(arr) {
            scope.titleMapValues = [];
            arr = arr || [];

            form.titleMap.forEach(function(item) {
              scope.titleMapValues.push(arr.indexOf(item.value) !== -1);
            });
          };
          //Catch default values
          updateTitleMapValues(scope.modelArray);

          // TODO: Refactor and see if we can get rid of this watch by piggy backing on the
          // validation watch.
          scope.$watchCollection('modelArray', updateTitleMapValues);

          //To get two way binding we also watch our titleMapValues
          scope.$watchCollection('titleMapValues', function(vals, old) {
            if (vals && vals !== old) {
              var arr = getOrCreateModel();

              // Apparently the fastest way to clear an array, readable too.
              // http://jsperf.com/array-destroy/32
              while (arr.length > 0) {
                arr.pop();
              }
              form.titleMap.forEach(function(item, index) {
                if (vals[index]) {
                  arr.push(item.value);
                }
              });

              // Time to validate the rebuilt array.
              // validateField method is exported by schema-validate
              if (scope.validateField) {
                scope.validateField();
              }
            }
          });
        }

        once();
      });

      scope.appendToArray = function() {
        var empty;

        // Create and set an array if needed.
        var model = getOrCreateModel();

        // Same old add empty things to the array hack :(
        if (scope.form && scope.form.schema && scope.form.schema.items) {

          var items = scope.form.schema.items;
          if (items.type && items.type.indexOf('object') !== -1) {
            empty = {};

            // Check for possible defaults
            if (!scope.options || scope.options.setSchemaDefaults !== false) {
              empty = angular.isDefined(items['default']) ? items['default'] : empty;

              // Check for defaults further down in the schema.
              // If the default instance sets the new array item to something falsy, i.e. null
              // then there is no need to go further down.
              if (empty) {
                schemaForm.traverseSchema(items, function(prop, path) {
                  if (angular.isDefined(prop['default'])) {
                    sel(path, empty, prop['default']);
                  }
                });
              }
            }

          } else if (items.type && items.type.indexOf('array') !== -1) {
            empty = [];
            if (!scope.options || scope.options.setSchemaDefaults !== false) {
              empty = items['default'] || empty;
            }
          } else {
            // No type? could still have defaults.
            if (!scope.options || scope.options.setSchemaDefaults !== false) {
              empty = items['default'] || empty;
            }
          }
        }
        model.push(empty);

        return model;
      };

      scope.deleteFromArray = function(index) {
        var model = scope.modelArray;
        if (model) {
          model.splice(index, 1);
        }
        return model;
      };

      // For backwards compatability, i.e. when a bootstrap-decorator tag is used
      // as child to the array.
      var setIndex = function(index) {
        return function(form) {
          if (form.key) {
            form.key[form.key.indexOf('')] = index;
          }
        };
      };
      var formDefCache = {};
      scope.copyWithIndex = function(index) {
        var form = scope.form;
        if (!formDefCache[index]) {

          // To be more compatible with JSON Form we support an array of items
          // in the form definition of "array" (the schema just a value).
          // for the subforms code to work this means we wrap everything in a
          // section. Unless there is just one.
          var subForm = form.items[0];
          if (form.items.length > 1) {
            subForm = {
              type: 'section',
              items: form.items.map(function(item) {
                item.ngModelOptions = form.ngModelOptions;
                if (angular.isUndefined(item.readonly)) {
                  item.readonly = form.readonly;
                }
                return item;
              })
            };
          }

          if (subForm) {
            var copy = angular.copy(subForm);
            copy.arrayIndex = index;
            schemaForm.traverseForm(copy, setIndex(index));
            formDefCache[index] = copy;
          }
        }
        return formDefCache[index];
      };

    }
  };
}]);

/*
FIXME: real documentation
<form sf-form="form"  sf-schema="schema" sf-decorator="foobar"></form>
*/

angular.module('schemaForm')
       .directive('sfSchema',
['$compile', '$http', '$templateCache', '$q','schemaForm', 'schemaFormDecorators', 'sfSelect', 'sfPath', 'sfBuilder',
  function($compile, $http, $templateCache, $q, schemaForm,  schemaFormDecorators, sfSelect, sfPath, sfBuilder) {

    return {
      scope: {
        schema: '=sfSchema',
        initialForm: '=sfForm',
        model: '=sfModel',
        options: '=sfOptions',
        field: '=',
        controls: '=',
        files: '=',
        isMobile: '='
      },
      controller: ['$scope', function($scope) {
        this.evalInParentScope = function(expr, locals) {
          return $scope.$parent.$eval(expr, locals);
        };

        // Set up form lookup map
        var that  = this;
        $scope.lookup = function(lookup) {
          if (lookup) {
            that.lookup = lookup;
          }
          return that.lookup;
        };

        if (!$scope.field.settings.replacing) $scope.field.settings.replacing = {};

        $scope.getTitle = function(form) {
          return form.schema.html_title || form.html_title || form.title;
        }

        $scope.uncheckClearOption = function(id) {
          // viiopen - since we use jquery in our build, keep it simple...
          $('#' + id).attr('checked', false);
        }

        $scope.scope = $scope;
      }],
      replace: false,
      restrict: 'A',
      transclude: true,
      require: '?form',
      link: function(scope, element, attrs, formCtrl, transclude) {

        //expose form controller on scope so that we don't force authors to use name on form
        scope.formCtrl = formCtrl;

        //We'd like to handle existing markup,
        //besides using it in our template we also
        //check for ng-model and add that to an ignore list
        //i.e. even if form has a definition for it or form is ["*"]
        //we don't generate it.
        var ignore = {};
        transclude(scope, function(clone) {
          clone.addClass('schema-form-ignore');
          element.prepend(clone);

          if (element[0].querySelectorAll) {
            var models = element[0].querySelectorAll('[ng-model]');
            if (models) {
              for (var i = 0; i < models.length; i++) {
                var key = models[i].getAttribute('ng-model');
                //skip first part before .
                ignore[key.substring(key.indexOf('.') + 1)] = true;
              }
            }
          }
        });

        var lastDigest = {};
        var childScope;

        // Common renderer function, can either be triggered by a watch or by an event.
        var render = function(schema, form) {

          var asyncTemplates = [];
          var merged = schemaForm.merge(schema, form, ignore, scope.options, undefined, asyncTemplates);

          if (asyncTemplates.length > 0) {
            // Pre load all async templates and put them on the form for the builder to use.
            $q.all(asyncTemplates.map(function(form) {
              return $http.get(form.templateUrl, {cache: $templateCache}).then(function(res) {
                form.template = res.data;
              });
            })).then(function() {
              internalRender(schema, form, merged);
            });

          } else {
            internalRender(schema, form, merged);
          }


        };

        var internalRender = function(schema, form, merged) {
          // Create a new form and destroy the old one.
          // Not doing keeps old form elements hanging around after
          // they have been removed from the DOM
          // https://github.com/Textalk/angular-schema-form/issues/200
          if (childScope) {
            // Destroy strategy should not be acted upon
            scope.externalDestructionInProgress = true;
            childScope.$destroy();
            scope.externalDestructionInProgress = false;
          }
          childScope = scope.$new();

          //make the form available to decorators
          childScope.schemaForm  = {form:  merged, schema: schema};

          //clean all but pre existing html.
          element.children(':not(.schema-form-ignore)').remove();

          // Find all slots.
          var slots = {};
          var slotsFound = element[0].querySelectorAll('*[sf-insert-field]');

          for (var i = 0; i < slotsFound.length; i++) {
            slots[slotsFound[i].getAttribute('sf-insert-field')] = slotsFound[i];
          }

          // if sfUseDecorator is undefined the default decorator is used.
          var decorator = schemaFormDecorators.decorator(attrs.sfUseDecorator);
          // Use the builder to build it and append the result
          var lookup = Object.create(null);
          scope.lookup(lookup); // give the new lookup to the controller.
          element[0].appendChild(sfBuilder.build(merged, decorator, slots, lookup));

          // We need to know if we're in the first digest looping
          // I.e. just rendered the form so we know not to validate
          // empty fields.
          childScope.firstDigest = true;
          // We use a ordinary timeout since we don't need a digest after this.
          setTimeout(function() {
            childScope.firstDigest = false;
          }, 0);

          //compile only children
          $compile(element.children())(childScope);

          //ok, now that that is done let's set any defaults
          if (!scope.options || scope.options.setSchemaDefaults !== false) {
            schemaForm.traverseSchema(schema, function(prop, path) {
              var formDefault = null;
              for (var x = 0; x < form.length; x++) {
                if (angular.equals(form[x].schema, prop)) {
                  if (form[x].$defaultIsToday) {
                    var now = new Date();
                    if (form[x].schema.type.toLowerCase() == 'number') {
                      formDefault = now.getTime() / 1000;
                    } else {
                      formDefault = now;
                    }
                  } else {
                    formDefault = form[x].defaultValue;
                  }
                  break;
                }
              }
              if (angular.isDefined(prop['default']) || formDefault) {
                var val = sfSelect(path, scope.model);
                if (angular.isUndefined(val)) {
                  sfSelect(path, scope.model, prop['default'] || formDefault);
                }
              }
            });
          }

          scope.$emit('sf-render-finished', element);

          scope.$on('vii-asf-field-replace', function(event, target) {
            // When true, the replacement input field is added to the DOM
            // while the schema-conforming input field is omitted.
            scope.field.settings.replacing[target] = true;
          });

          scope.$on('vii-asf-field-unreplace', function(event, target) {
            // When false, the schema-confirming input field is added to the DOM
            // while the replacement  input field is omitted.
            scope.field.settings.replacing[target] = false;
          });
        };

        var defaultForm = ['*'];

        //Since we are dependant on up to three
        //attributes we'll do a common watch
        scope.$watch(function() {

          var schema = scope.schema;
          var form   = scope.initialForm || defaultForm;

          //The check for schema.type is to ensure that schema is not {}
          if (form && schema && schema.type &&
              (lastDigest.form !== form || lastDigest.schema !== schema) &&
              Object.keys(schema.properties).length > 0) {
            lastDigest.schema = schema;
            lastDigest.form = form;

            render(schema, form);
          }
        });

        // We also listen to the event schemaFormRedraw so you can manually trigger a change if
        // part of the form or schema is chnaged without it being a new instance.
        scope.$on('schemaFormRedraw', function() {
          var schema = scope.schema;
          var form   = scope.initialForm || ['*'];
          if (schema) {
            render(schema, form);
          }
        });

        scope.$on('$destroy', function() {
          // Each field listens to the $destroy event so that it can remove any value
          // from the model if that field is removed from the form. This is the default
          // destroy strategy. But if the entire form (or at least the part we're on)
          // gets removed, like when routing away to another page, then we definetly want to
          // keep the model intact. So therefore we set a flag to tell the others it's time to just
          // let it be.
          scope.externalDestructionInProgress = true;
        });

        /**
         * Evaluate an expression, i.e. scope.$eval
         * but do it in parent scope
         *
         * @param {String} expression
         * @param {Object} locals (optional)
         * @return {Any} the result of the expression
         */
        scope.evalExpr = function(expression, locals) {
          return scope.$parent.$eval(expression, locals);
        };
      }
    };
  }
]);

angular.module('schemaForm').directive('schemaValidate', [

  'sfValidator',
  '$parse',
  'sfSelect',
  'customValidators',
  '$rootScope',

  function(

    sfValidator,
    $parse,
    sfSelect,
    customValidators,
    $rootScope

  ) {

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


        var getElementId = function(path) {
          var paths = path.split('/');
          var element_id = paths.pop();
          if (!isNaN(parseInt(paths.last()))) {
            element_id = paths.pop() + '-' + element_id;
          }
          return element_id;
        }

        // viiopen - this could come in handy
        scope.element = element;

        // Validate against the schema.

        var validate = function(viewValue, triggeredByBroadcast) {
          scope.$broadcast('vii-remove-asf-error');

          error = null; // viiopen

          if (!form) {
            return viewValue;
          }

          if (form.initial && !triggeredByBroadcast && !form.validationFunction) {
            return viewValue;
          }

          form.initial = false;

          // viiopen - if the value is empty but not required (and has no custom validation), stop
          if (_isEmpty(viewValue) && !form.required && !form.validationFunction) {
            return viewValue;
          }

          // viiopen - some validation should only occur on viiform submission
          if (form.schema && form.schema.validateOnSubmit && !triggeredByBroadcast) {
            scope.$emit('vii-remove-asf-error'); // JIC
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

/*
          var _form = form;

          // viiopen - if this is a problem/treated/limited response from the Health History schema,
          // the form passed to sfValidator.validate() needs to be an integer property. Since
          // problem/treated/limited are all of type integer, any one will do.

          if (_isEmpty(viewValue) && form.type == 'aos-health-history' && form.schema.type == 'object') {
            _form = form.schema.properties.problem;  // could have used treated or limited
          }
*/

          // viiopen - perform custom validation, otherwise validate as usual
          var result;

          if (form.validationFunction) {
            result = customValidators[ form.validationFunction ](
              viewValue,
              form,
              scope.model,
              $(scope.element)[0].id
            );
          } else {
            result = sfValidator.validate(form, viewValue);
          }

          // Since we might have different tv4 errors we must clear all
          // errors that start with tv4-
          Object.keys(ngModel.$error)
              .filter(function(k) { return k.indexOf('tv4-') === 0; })
              .forEach(function(k) { ngModel.$setValidity(k, true); });

          // viiopen
          if (form.required && _isEmpty(viewValue)) {
            error = 'Required';
          } else if (
            form.required &&
            form.schema.type == "array" &&
            (viewValue == null || (angular.isArray(viewValue) && viewValue.length == 0))
          ) {
            // viiopen - messy but for now this will make the UI behave for checkboxes
            error = 'Required';
            ngModel.$setValidity('tv4-' + code, false);
            scope.$broadcast('vii-asf-error', error);
            scope.$emit('vii-asf-error', error);
            return;
          }

          // viiopen send message back if necessary
          if (triggeredByBroadcast) {
            if (!result.custom && result.error) {
              if (error != 'Required') error = result.error.message;
              scope.$emit('vii-asf-error', error);
            }
          }

          // viiopen if there was no error but the field still looks invalid, clean it
          if (!result.error) {
            scope.$broadcast('vii-remove-asf-error');
            scope.$emit('vii-remove-asf-error');
          }

          var requiredProperty = function(err, schema) {
            var required = (schema.items && schema.items.required) || schema.required;

            if (!required) {
              return false;
            }

            //var prop = err.dataPath.split('/').last();
            return required.indexOf(err.dataPath.split('/').last()) > -1;
          }

          if (!result.valid) {

            /*
            viiopen - an error code of 0 is a typical issue right now because certain
            properties are defaulted to null; none of our schemas use oneOf or anyOf
            to allow nulls because ASF doesn't know how to render such schemas. So,
            ignore an invalid result if the property is null but NOT required.

            The same check earlier only works when form.required exists and is true.
            ASF processes Some formdefs (like /schemas/decide/priorities_styles.json)
            in a way that form.required is missing, so get the requirement here.

            UPDATE: ignore UNLESS there's a custom validation result.
            */

            if (!result.custom) {
              if (angular.isUndefined(form.required)) {
                if (viewValue == null && !requiredProperty(result.error, form.schema)) {
                  return viewValue;
                }
              }
            }

            /*
            viiopen - display custom validation messages if they're available.
            */
            var code = result.error.code;
            var element_id;
            var params = {};

            if (result.custom) {
              error = form.validationMessage ? form.validationMessage[code] : 'Error';

              ngModel.$setValidity('tv4-' + code, false);
/*
              if (angular.isArray(result.element_id)) {
                scope.$broadcast('vii-asf-error', {error: error, element_id: result.element_id});
                scope.$emit('vii-asf-error', {error: error, element_id: result.element_id});
              } else {
                error = form.validationMessage[code];
                scope.$broadcast('vii-asf-error', error);
                scope.$emit('vii-asf-error', error);
              }
*/
              params.error = error;
              params.element_ids = result.error.element_ids;
              params.noMsg = result.error.noMsg;

              if (result.rootScopeBroadCast) {
                $rootScope.$broadcast('vii-asf-error', params);
              } else {
                scope.$broadcast('vii-asf-error', params);
                scope.$emit('vii-asf-error', params);
              }


            } else {
              if (error == 'Required') {
                code = '302';
              } else {
                if (form.validationMessage) {
                  if (form.validationMessage[code]) {
                    if (angular.isObject(form.validationMessage[code])) {
                      for (var p in form.validationMessage[code]) {
                        if (result.error.dataPath.indexOf(p) > -1) {
                          element_id = 'field' + form.fieldId + '-' + getElementId(result.error.dataPath);
                          error = {
                            error: form.validationMessage[code][p],
                            element_id: element_id
                          }
                          break;
                        }
                      }
                    } else {
                      error = form.validationMessage[code];
                    }
                  }
                } else {
                  error = result.error;
                }
              }
              ngModel.$setValidity('tv4-' + code, false);
              scope.$broadcast('vii-asf-error', error);
              scope.$emit('vii-asf-error', error);
            }

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

          if (result.clear) {
            for (var i in result.clear) {
              $('#' + result.clear[i]).removeClass('error');
            }
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

angular.module('schemaForm')

.directive('sfShowErrors', [function() {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var child;

      scope.$on('vii-asf-error', function(event, err) {
        var error = err;
        var showMsg = true;

        if (angular.isObject(err)) {
          error = err.error;
          // if there's a list of element ids, exit the function if this element's id
          // is not in that list
          if (err.element_ids && err.element_ids.length > 0) {
            if (err.element_ids.indexOf(element.attr("id")) < 0) {
              return;
            }
          }

          if ( err.noMsg && err.noMsg[element.attr("id")] ) showMsg = false;
        }

        element.addClass('error');

        if (showMsg) {
          $(element).find('> .error_msg').addClass('error').html(error);
        }
      });

      scope.$on('vii-remove-asf-error', function() {
        element.removeClass('error');
        $(element).children('.error').html('').removeClass('error');
      });

    }
  };

}])

;

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

angular.module('vii.filters', [])

.filter('trustAsHtml', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  }
})

.filter('trimmed', function() {
  return function(val) {
    if (val) {
      return val.replace(/\s+/g, ' ').trim();
    } else {
      return "";
    }
  }
})

; // end of filters

return schemaForm;
}));

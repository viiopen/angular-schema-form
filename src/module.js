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

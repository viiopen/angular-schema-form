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

    functions.validateHealthHistory = customValidators.validateHealthHistory;


    return functions;
  }
]);

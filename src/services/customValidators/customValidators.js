angular.module('schemaForm').service('customValidators', [
  function() {
    var functions = {}

    functions.validateCnsaBaseline = customValidators.validateCnsaBaseline;

    functions.validateDecideTactics = customValidators.validateDecideTactics;

    functions.validateDecideGoalsList = customValidators.validateDecideGoalsList;

    functions.validateDecideFtrReason = customValidators.validateDecideFtrReason;

    functions.validateDecidePrioritiesAndStyles = customValidators.validateDecidePrioritiesAndStyles;

    functions.validateCAT = customValidators.validateCAT;

    functions.validateCnsaCervicalDiagnosis = customValidators.validateCnsaCervicalDiagnosis;

    functions.validateCnsaCervicalTreatment = customValidators.validateCnsaCervicalTreatment;

    functions.validateCnsaDiagnosis = customValidators.validateCnsaDiagnosis;

    functions.validateCnsaTreatment = customValidators.validateCnsaTreatment;

    functions.validateCnsaCervicalComplications = customValidators.validateCnsaCervicalComplications;

    functions.validateCnsaComplications = customValidators.validateCnsaComplications;

    functions.validateCnsaReadmissionReasons = customValidators.validateCnsaReadmissionReasons;

    functions.validateCnsaReturnORReasons = customValidators.validateCnsaReturnORReasons;

    functions.validateCnsaToggles = customValidators.validateCnsaToggles;

    functions.validateHealthHistory = customValidators.validateHealthHistory;


    return functions;
  }
]);

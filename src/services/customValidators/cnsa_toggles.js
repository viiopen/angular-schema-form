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

    var toggles = [
      "toggle_periop_complic_dvt",
      "toggle_periop_complic_pe",
      "toggle_periop_complic_neural",
      "toggle_periop_complic_mi",
      "toggle_periop_complic_uti",
      "toggle_periop_complic_cva",
      "toggle_periop_complic_pneum",
      "toggle_periop_complic_coaguopathy",
      "toggle_periop_complic_durotomy",
      "toggle_periop_complic_seroma",
      "toggle_periop_complic_wound_dehisc",
      "toggle_periop_complic_cfs_leak",
      "toggle_periop_complic_ssi",
      "toggle_periop_complic_hematoma",
      "toggle_periop_complic_pain",
      "toggle_periop_complic_other"
    ];

    if (toggles.indexOf(form.key[0]) > -1) {
      // Set value of backend toggle
      var backendKey = form.key[0].replace(/^toggle_/i, '');

      model[backendKey] = viewValue ? 1 : 0;
      debugger;
    }

  }
}

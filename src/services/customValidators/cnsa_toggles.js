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

    // if (toggles.indexOf(form.key[0]) > -1) {
      // Set value of backend toggle
      var backendKey = form.key[0].replace(/^toggle_/i, '');

      // BWB if the model has the same key -{toggle_}
      // and this validator is on the toggle, then just do this
      // don't whitelist anymore...
      if (_.has(model, backendKey)) {
        model[backendKey] = viewValue ? 1 : 0;
      }
    // }

    return {
      valid: true
    }

  }
}

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
      /* uncomment this to highlight all the checkboxes if none are selected

      id = 'field-' + reasons[i] + '-' + fieldId;
      element_ids.push(id);

      // this element doesn't need a specific error message, so...
      noMsg[id] = true;

      */
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

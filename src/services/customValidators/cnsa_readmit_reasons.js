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

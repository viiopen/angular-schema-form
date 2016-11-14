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

    if (
      !model.toggle_complication_reason_1 &&
      !model.toggle_complication_reason_2 &&
      !model.toggle_complication_reason_3
    ) {

      for (var i=1; i < 4; i++) {
        id = 'field-toggle_complication_reason_' + i + '-' + fieldId;

        element_ids.push(id);

        // this element doesn't need a specific error message, so...
        noMsg[id] = true;
      }

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

    } else {

      // send the help decorator's ID back so schema-validate
      // can remove the error class

      element_ids.push('help-reasons-for-complication-' + fieldId);
      return { valid:true, clear: element_ids }

    }

  }

}

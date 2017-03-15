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

    if (model.readmit_verify == null) {
      return {
        custom: true,
        valid: false,
        error: {
          code: 0
        }
      }
    } else if (model.readmit_verify) {
      if (
        !(
          model.toggle_return_or_reason_1 ||
          model.toggle_return_or_reason_2 ||
          model.toggle_return_or_reason_3 ||
          model.toggle_return_or_reason_4 ||
          model.toggle_return_or_reason_5 ||
          model.toggle_return_or_reason_6 ||
          model.toggle_return_or_reason_7 ||
          model.toggle_return_or_reason_8 ||
          model.toggle_return_or_reason_11 ||
          model.toggle_return_or_reason_12 ||
          model.toggle_return_or_reason_10
        )
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

      return {
        custom: true,
        valid: false,
        error: { code: 'reasons', element_ids: element_ids, noMsg: noMsg }
      }
    }

    if (element_ids.length == 0) {
      // send the help decorator's ID back so schema-validate
      // can remove the error class
      element_ids.push('help-reasons-for-return-' + fieldId);
      return { valid:true, clear: element_ids }
    }

  }

}

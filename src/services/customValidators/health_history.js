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

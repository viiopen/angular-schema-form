if (!customValidators) {
  console.error('Cannot define validator validateCnsaToggles()', new Date());
} else {
  customValidators.validateCnsaToggles = function(viewValue, form, model) {
    var fieldId = form.fieldId,
        elementIds = [],
        noMsg = {},
        id,
        noneSelected = true;

    console.log('form', form);
    console.log('initial model', model);

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

    // Set value of backend toggle
    var backendKey = form.key[0].replace(/^toggle_/i, '');

    console.log('model2', model);
    console.log('backendKey', backendKey);

    // BWB if the model has the same key -{toggle_}
    // and this validator is on the toggle, then just do this
    // don't whitelist anymore...
    if (_.has(model, backendKey)) {
      if (model[backendKey] != null) {
        console.log('!= null');
        model[backendKey] = viewValue ? 1 : 0;
      } else {
        console.log('== null');
        model[backendKey] = viewValue ? 1 : null;
      }
    }

    console.log('final model', model);

    // Handle the special case for thoraco lumbar treatment
    var toggleGroups = {
      nd_discectomy: {
        dependsOn: 'toggle_neural_decomp',
        satisfiedBy: [
          ["toggle_neural_decomp", "toggle_nd_t4", "toggle_nd_t4_discect"],
          ["toggle_neural_decomp", "toggle_nd_t5", "toggle_nd_t5_discect"],
          ["toggle_neural_decomp", "toggle_nd_t6", "toggle_nd_t6_discect"],
          ["toggle_neural_decomp", "toggle_nd_t7", "toggle_nd_t7_discect"],
          ["toggle_neural_decomp", "toggle_nd_t8", "toggle_nd_t8_discect"],
          ["toggle_neural_decomp", "toggle_nd_t9", "toggle_nd_t9_discect"],
          ["toggle_neural_decomp", "toggle_nd_t10", "toggle_nd_t10_discect"],
          ["toggle_neural_decomp", "toggle_nd_t11", "toggle_nd_t11_discect"],
          ["toggle_neural_decomp", "toggle_nd_t12", "toggle_nd_t12_discect"],
          ["toggle_neural_decomp", "toggle_nd_l1", "toggle_nd_l1_discect"],
          ["toggle_neural_decomp", "toggle_nd_l2", "toggle_nd_l2_discect"],
          ["toggle_neural_decomp", "toggle_nd_l3", "toggle_nd_l3_discect"],
          ["toggle_neural_decomp", "toggle_nd_l4", "toggle_nd_l4_discect"],
          ["toggle_neural_decomp", "toggle_nd_l5", "toggle_nd_l5_discect"],
          ["toggle_neural_decomp", "toggle_nd_s1", "toggle_nd_s1_discect"]
        ]
      },
      nd_osteotomy: {
        dependsOn: 'toggle_neural_decomp',
        satisfiedBy: [
          ["toggle_neural_decomp", "toggle_nd_t4", "toggle_nd_t4_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t5", "toggle_nd_t5_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t6", "toggle_nd_t6_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t7", "toggle_nd_t7_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t8", "toggle_nd_t8_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t9", "toggle_nd_t9_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t10", "toggle_nd_t10_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t11", "toggle_nd_t11_osteot"],
          ["toggle_neural_decomp", "toggle_nd_t12", "toggle_nd_t12_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l1", "toggle_nd_l1_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l2", "toggle_nd_l2_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l3", "toggle_nd_l3_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l4", "toggle_nd_l4_osteot"],
          ["toggle_neural_decomp", "toggle_nd_l5", "toggle_nd_l5_osteot"],
          ["toggle_neural_decomp", "toggle_nd_s1", "toggle_nd_s1_osteot"]
        ]
      },
      nd_facetectomy: {
        dependsOn: 'toggle_neural_decomp',
        satisfiedBy: [
          ["toggle_neural_decomp", "toggle_nd_t4", "toggle_nd_t4_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t5", "toggle_nd_t5_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t6", "toggle_nd_t6_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t7", "toggle_nd_t7_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t8", "toggle_nd_t8_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t9", "toggle_nd_t9_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t10", "toggle_nd_t10_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t11", "toggle_nd_t11_facetect"],
          ["toggle_neural_decomp", "toggle_nd_t12", "toggle_nd_t12_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l1", "toggle_nd_l1_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l2", "toggle_nd_l2_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l3", "toggle_nd_l3_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l4", "toggle_nd_l4_facetect"],
          ["toggle_neural_decomp", "toggle_nd_l5", "toggle_nd_l5_facetect"],
          ["toggle_neural_decomp", "toggle_nd_s1", "toggle_nd_s1_facetect"]
        ]
      },
      pa_spacer: {
        dependsOn: 'toggle_arthrodesis',
        satisfiedBy: [
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t4t5", "toggle_pa_t4t5_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t5t6", "toggle_pa_t5t6_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t6t7", "toggle_pa_t6t7_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t7t8", "toggle_pa_t7t8_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t8t9", "toggle_pa_t8t9_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t9t10", "toggle_pa_t9t10_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t10t11", "toggle_pa_t10t11_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t11t12", "toggle_pa_t11t12_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_t12l1", "toggle_pa_t12l1_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l1l2", "toggle_pa_l1l2_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l2l3", "toggle_pa_l2l3_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l3l4", "toggle_pa_l3l4_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l4l5", "toggle_pa_l4l5_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_l5s1", "toggle_pa_l5s1_spacer"],
          ["toggle_arthrodesis", "toggle_post_arthrod", "toggle_pa_s1p", "toggle_pa_s1p_spacer"]
        ]
      }
    };

    // For all grouped toggles
    for (var property in toggleGroups) {
      var grouping = toggleGroups[property];

      // If we at least have the first
      if (model[grouping.dependsOn]) {
        // Check model value for each toggle in grouping
        for (var i = 0; i < grouping.satisfiedBy.length; i++) {
          var satisfyingGroup = grouping.satisfiedBy[i],
              satisfied = true;

          for (var k = 0; k < satisfyingGroup.length; k++) {
            if (!model[satisfyingGroup[k]]) {
              satisfied = false;
              break;
            }
          }

          if (satisfied) {
            model[property] = 1;
            break;
          }
        }
      }
    }

    return {
      valid: true
    }

  }
}

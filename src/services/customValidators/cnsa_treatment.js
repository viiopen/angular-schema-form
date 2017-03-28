if (!customValidators) {

  console.log("Cannot define validator validateCnsaTreatment()", new Date());

} else {

  customValidators.validateCnsaTreatment = function(viewValue, form, model) {
    var fieldId = form.fieldId;
    var element_ids;

    if (!model.toggle_neural_decomp) {
      debugger;
      return {
        custom: true,
        valid: false,
        error: {
          code: 0,
          element_ids: [ 'field-toggle_neural_decomp-' + fieldId ]
        }
      }
    }

    if (model.toggle_neural_decomp === 0 && model.toggle_arthrodesis === null) {
      return {
        custom: true,
        valid: false,
        error: {
          code: 'arthrodesis',
          element_ids: [ 'field-toggle_arthrodesis-' + fieldId ]
        }
      }
    }

    if (model.toggle_neural_decomp) {
      if (model.nd_open === null) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 0,
            element_ids: [ 'field-nd_open-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      if (!(
        model.toggle_nd_t4 ||
        model.toggle_nd_t5 ||
        model.toggle_nd_t6 ||
        model.toggle_nd_t7 ||
        model.toggle_nd_t8 ||
        model.toggle_nd_t9 ||
        model.toggle_nd_t10 ||
        model.toggle_nd_t11 ||
        model.toggle_nd_t12 ||
        model.toggle_nd_l1 ||
        model.toggle_nd_l2 ||
        model.toggle_nd_l3 ||
        model.toggle_nd_l4 ||
        model.toggle_nd_l5 ||
        model.toggle_nd_s1
      )) {
        return {
          custom: true,
          valid: false,
          error: {
            code: 'nd_levels',
            element_ids: [ 'field-toggle_neural_decomp-' + fieldId ]
          },
          rootScopeBroadCast: true
        }
      }

      var levels = [
        't4',
        't5',
        't6',
        't7',
        't8',
        't9',
        't10',
        't11',
        't12',
        'l1',
        'l2',
        'l3',
        'l4',
        'l5',
        's1'
      ];

      for (var i in levels) {
        if (model['toggle_nd_' + levels[i]]) {
          if (model['nd_' + levels[i] + '_side'] == null) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [ 'field-nd_' + levels[i] + '_side-' + fieldId ]
              },
              rootScopeBroadCast: true
            }
          }
          if (model['toggle_nd_' + levels[i] + '_osteot-' + fieldId] != null && !model['nd_' + levels[i] + '_osteot_columns-' + fieldId + '-0'] && !model['nd_' + levels[i] + '_osteot_columns-' + fieldId + '-1']) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [ 'field-nd_' + levels[i] + '_osteot_columns-' + fieldId ]
              },
              rootScopeBroadCast: true
            }
          }
        }
      }
    }

    if (model.arthrodesis) {
      if (!(model.toggle_post_arthrod || model.toggle_ant_arthrod)) {
        return {
          custom: true,
          valid: false,
          error:{
            code: 'arth_post_ant',
            element_ids: [
              'field-toggle_post_arthrod-' + fieldId,
              'field-toggle_ant_arthrod-' + fieldId
            ]
          },
          rootScopeBroadCast: true
        }
      }

      if (model.toggle_post_arthrod) {

        element_ids = [];

        if (model.pa_open == null) {
          element_ids.push('field-pa_open-' + fieldId);
        }

        if (model.pa_fixationSystem != null) {
          if (
            model.pa_fixationSystem == 'Other' &&
            (model.pa_fixationSystem_other == null || !/\S/.test(model.pa_fixationSystem_other))
          ) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [
                  'field-pa_fixationSystem_other-' + fieldId
                ]
              },
              rootScopeBroadCast: true
            }
          }

        } else {
          element_ids.push('field-pa_fixationSystem-' + fieldId);
        }

        if (model.pa_fixationSystem_desc == null || !/\S/.test(model.pa_fixationSystem_desc)) {
          element_ids.push('field-pa_fixationSystem_desc-' + fieldId);
        }

        if (model.pa_interbodyGraft != null) {
          if (
            model.pa_interbodyGraft == 'Other' &&
            (model.pa_interbodyGraft_other == null || !/\S/.test(model.pa_interbodyGraft_other))
          ) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [
                  'field-pa_interbodyGraft_other-' + fieldId
                ]
              },
              rootScopeBroadCast: true
            }
          }

        } else {
          element_ids.push('field-pa_interbodyGraft-' + fieldId);
        }

        if (model.pa_interbodyGraft_desc == null || !/\S/.test(model.pa_interbodyGraft_desc)) {
          element_ids.push('field-pa_interbodyGraft_desc-' + fieldId);
        }

        if (element_ids.length > 0) {
          return {
            custom: true,
            valid: false,
            error: { code: 0, element_ids: element_ids },
            rootScopeBroadCast: true
          }
        }

        if (!(
          model.toggle_pa_t4t5 ||
          model.toggle_pa_t5t6 ||
          model.toggle_pa_t6t7 ||
          model.toggle_pa_t7t8 ||
          model.toggle_pa_t8t9 ||
          model.toggle_pa_t9t10 ||
          model.toggle_pa_t10t11 ||
          model.toggle_pa_t11t12 ||
          model.toggle_pa_t12l1 ||
          model.toggle_pa_l1l2 ||
          model.toggle_pa_l2l3 ||
          model.toggle_pa_l3l4 ||
          model.toggle_pa_l4l5 ||
          model.toggle_pa_l5s1 ||
          model.toggle_pa_s1p
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'pa',
              element_ids: [
                'field-toggle_pa_t4t5-' + fieldId
              ]
            },
            rootScopeBroadCast: true
          }
        }

        levels = [
          't4t5',
          't5t6',
          't6t7',
          't7t8',
          't8t9',
          't9t10',
          't10t11',
          't11t12',
          't12l1',
          'l1l2',
          'l2l3',
          'l3l4',
          'l4l5',
          'l5s1',
          's1p'
        ];

        element_ids = [];

        for (var i in levels) {
          if (model['toggle_pa_' + levels[i]]) {
            if (model['toggle_posa_' + levels[i] + '_spacer']) {
              if (model['pa_' + levels[i] + '_spacer'] == null) {
                element_ids.push('field-pa_' + levels[i] + '_spacer-' + fieldId);
              }
              if (model['pa_' + levels[i] + '_spacer_staticExpand'] == null) {
                element_ids.push('field-pa_' + levels[i] + '_spacer_staticExpand-' + fieldId);
              }
            }
          }
        }

        if (element_ids.length > 0) {
          return {
            custom: true,
            valid: false,
            error: { code: 0, element_ids: element_ids },
            rootScopeBroadCast: true
          }
        }
      }

      if (model.toggle_ant_arthrod) {
        if (!(
          model.toggle_aa_t4t5 ||
          model.toggle_aa_t5t6 ||
          model.toggle_aa_t6t7 ||
          model.toggle_aa_t7t8 ||
          model.toggle_aa_t8t9 ||
          model.toggle_aa_t9t10 ||
          model.toggle_aa_t10t11 ||
          model.toggle_aa_t11t12 ||
          model.toggle_aa_t12l1 ||
          model.toggle_aa_l1l2 ||
          model.toggle_aa_l2l3 ||
          model.toggle_aa_l3l4 ||
          model.toggle_aa_l4l5 ||
          model.toggle_aa_l5s1 ||
          model.toggle_aa_s1p
        )) {
          return {
            custom: true,
            valid: false,
            error: {
              code: 'aa',
              element_ids: [ 'field-toggle_aa_t4t5-' + fieldId ]
            },
            rootScopeBroadCast: true
          }
        }

        levels = [
          't4t5',
          't5t6',
          't6t7',
          't7t8',
          't8t9',
          't9t10',
          't10t11',
          't11t12',
          't12l1',
          'l1l2',
          'l2l3',
          'l3l4',
          'l4l5',
          'l5s1',
          's1p'
        ];

        element_ids = [];

        for (var i in levels) {
          if (model['toggle_aa_' + levels[i]]) {
            if (model['aa_' + levels[i] + '_approach'] == null) {
              element_ids.push('field-aa_' + levels[i] + '_approach-' + fieldId);
            }
            if (model['aa_' + levels[i] + '_open'] == null) {
              element_ids.push('field-aa_' + levels[i] + '_open-' + fieldId);
            }
          }
        }

        if (model.aa_interbodyGraft != null) {
          if (
            model.aa_interbodyGraft == 'Other' &&
            (model.aa_interbodyGraft_other == null || !/\S/.test(model.aa_interbodyGraft_other))
          ) {
            return {
              custom: true,
              valid: false,
              error: {
                code: 0,
                element_ids: [
                  'field-aa_interbodyGraft_other-' + fieldId
                ]
              },
              rootScopeBroadCast: true
            }
          }
        } else {
          element_ids.push('field-aa_interbodyGraft-' + fieldId);
        }

        if (model.aa_interbodyGraft_desc == null || !/\S/.test(model.aa_interbodyGraft_desc)) {
          element_ids.push('field-aa_interbodyGraft_desc-' + fieldId);
        }

        if (element_ids.length > 0) {
          return {
            custom: true,
            valid: false,
            error: { code: 0, element_ids: element_ids },
            rootScopeBroadCast: true
          }
        }
      }
    }

    return {valid:true}
  }

}

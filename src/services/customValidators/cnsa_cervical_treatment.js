if (!customValidators) {

    console.log("Cannot define validator validateCnsaTreatment()", new Date());

} else {
    customValidators.validateCnsaCervicalTreatment = function(viewValue, form, model) {

        var fieldId = form.fieldId;
        var element_ids;

        if (model.toggle_neural_decomp === null) {
            return {
                custom: true,
                valid: false,
                error: {
                    code: 'nd',
                    element_ids: [ 'field-toggle_neural_decomp-' + fieldId ]
                },
                rootScopeBroadCast: true
            };
        }

        if (model.toggle_neural_decomp) {
            if (!(
                model.toggle_nd_c2 ||
                model.toggle_nd_c3 ||
                model.toggle_nd_c4 ||
                model.toggle_nd_c5 ||
                model.toggle_nd_c6 ||
                model.toggle_nd_c7 ||
                model.toggle_nd_t1 ||
                model.toggle_nd_t2 ||
                model.toggle_nd_t3
            )) {
                return {
                    custom: true,
                    valid: false,
                    error: {
                        code: 'nd_levels',
                        element_ids: [ 'field-toggle_neural_decomp-' + fieldId ]
                    },
                    rootScopeBroadCast: true
                };
            }

            element_ids = [];

            if (model.nd_open === null) {
                element_ids.push('field-nd_open-' + fieldId);
            }
            if (model.nd_laminoplasty === null) {
                element_ids.push('field-nd_laminoplasty-' + fieldId);
            }

            var levels = [
                'c2',
                'c3',
                'c4',
                'c5',
                'c6',
                'c7',
                't1',
                't2',
                't3'
            ];

            for (var i in levels) {
                if (model['toggle_nd_' + levels[i]]) {
                    if (model['nd_' + levels[i] + '_side'] === null) {
                        element_ids.push('field-nd_' + levels[i] + '_side-' + fieldId);
                    }
                }
            }

            if (element_ids.length > 0) {
                return {
                    custom: true,
                    valid: false,
                    error: {
                        code: 0,
                        element_ids: element_ids
                    },
                    rootScopeBroadCast: true
                };
            }
        }

        if (model.toggle_arthrodesis) {
            if (!(
                model.toggle_pa_c1c2 ||
                model.toggle_pa_c2c3 ||
                model.toggle_pa_c3c4 ||
                model.toggle_pa_c4c5 ||
                model.toggle_pa_c5c6 ||
                model.toggle_pa_c6c7 ||
                model.toggle_pa_c7t1 ||
                model.toggle_pa_t1t2 ||
                model.toggle_pa_t2t3 ||
                model.toggle_pa_t3t4
            )) {
                return {
                    custom: true,
                    valid: false,
                    error: {
                        code: 'pa',
                        element_ids: [ 'field-toggle_arthrodesis-' + fieldId ]
                    },
                    rootScopeBroadCast: true
                };
            }

            element_ids = [];

            if (model.pa_fixation_co_name === null) {
                element_ids.push('field-pa_fixation_co_name-' + fieldId);
            }
            if (model.pa_fixation_trade_name === null) {
                element_ids.push('field-pa_fixation_trade_name-' + fieldId);
            }

            if (element_ids.length > 0) {
                return {
                    custom: true,
                    valid: false,
                    error: {
                        code: 0,
                        element_ids: element_ids
                    },
                    rootScopeBroadCast: true
                };
            }
        }

        if (model.toggle_anterior_approach) {
            if (!(
                model.toggle_aa_c2 ||
                model.toggle_aa_c3 ||
                model.toggle_aa_c4 ||
                model.toggle_aa_c5 ||
                model.toggle_aa_c6 ||
                model.toggle_aa_c7 ||
                model.toggle_aa_t1 ||
                model.toggle_aa_t2 ||
                model.toggle_aa_t3
            )) {
                return {
                    custom: true,
                    valid: false,
                    error: {
                        code: 'anterior_approach',
                        element_ids: [ 'field-toggle_anterior_approach-' + fieldId ]
                    },
                    rootScopeBroadCast: true
                };
            }

            element_ids = [];

            if (model.aa_interbody_tradeName === null) {
                element_ids.push('field-aa_interbody_tradeName-' + fieldId);
            }
            if (model.aa_system_tradeName === null) {
                element_ids.push('field-aa_system_tradeName-' + fieldId);
            }

            levels = [
                'c2',
                'c3',
                'c4',
                'c5',
                'c6',
                'c7',
                't1',
                't2',
                't3'
            ];

            for (var i in levels) {
                if (model['toggle_aa_' + levels[i]]) {
                    if (model['aa_' + levels[i] + '_discSpace'] === null) {
                        element_ids.push('field-aa_' + levels[i] + '_discSpace-' + fieldId);
                    }
                    if (model['aa_' + levels[i] + '_material'] === null) {
                        element_ids.push('field-aa_' + levels[i] + '_material-' + fieldId);
                    }
                }
            }

            if (element_ids.length > 0) {
                return {
                    custom: true,
                    valid: false,
                    error: {
                        code: 0,
                        element_ids: element_ids
                    },
                    rootScopeBroadCast: true
                };
            }
        }

        return {
            valid: true
        };
    };
}

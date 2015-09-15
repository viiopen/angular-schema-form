(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['schemaForm'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('schemaForm'));
  } else {
    root.bootstrapDecorator = factory(root.schemaForm);
  }
}(this, function(schemaForm) {
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/foundation/actions-trcl.html","<div class=\"button-group schema-form-actions {{form.htmlClass}}\" ng-transclude=\"\"></div>");
$templateCache.put("directives/decorators/foundation/actions.html","<div class=\"button-group schema-form-actions {{form.htmlClass}}\"><input ng-repeat-start=\"item in form.items\" type=\"submit\" class=\"button {{ item.style }} {{form.fieldHtmlClass}}\" value=\"{{item.title}}\" ng-if=\"item.type === \'submit\'\"> <button ng-repeat-end=\"\" class=\"button {{ item.style }} {{form.fieldHtmlClass}}\" type=\"button\" ng-disabled=\"form.readonly\" ng-if=\"item.type !== \'submit\'\" ng-click=\"buttonClick($event,item)\"><span ng-if=\"item.icon\" class=\"fa fa-lg {{item.icon}}\"></span>{{item.title}}</button></div>");
$templateCache.put("directives/decorators/foundation/array.html","<div sf-array=\"form\" class=\"schema-form-array {{form.htmlClass}}\" ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\"><label class=\"\" ng-show=\"showTitle()\">{{ form.title }}</label><ol class=\"\" ng-model=\"modelArray\" ui-sortable=\"\"><li class=\"{{form.fieldHtmlClass}}\" ng-repeat=\"item in modelArray track by $index\" style=\"clear: right\"><button ng-hide=\"form.readonly || form.remove === null\" ng-click=\"deleteFromArray($index)\" style=\"position: relative; z-index: 20; float: right\" type=\"button\" class=\"button small\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\" style=\"display: none\">Close</span></button><sf-decorator ng-init=\"arrayIndex = $index\" form=\"copyWithIndex($index)\"></sf-decorator></li></ol><div class=\"clearfix\" style=\"padding: 15px;\"><button ng-hide=\"form.readonly || form.add === null\" ng-click=\"appendToArray()\" type=\"button\" class=\"button {{ form.style.add }} small\"><i class=\"fa fa-lg plus\"></i> {{ form.add || \'Add\'}}</button></div><p ng-if=\"form.description\"><small><span class=\"help-block\" ng-bind-html=\"form.description\"></span></small></p><div class=\"\" ng-class=\"{\'error\': hasError()}\" ng-show=\"(hasError() && errorMessage(schemaError())) || form.description\" ng-bind-html=\"(hasError() && errorMessage(schemaError())) || form.description\"></div><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error></div>");
$templateCache.put("directives/decorators/foundation/category.html","<div class=\"schema-form-{{form.type}} {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true &amp;&amp; hasError()}\"><label ng-show=\"showTitle()\" class=\"{{form.labelHtmlClass}}\" ng-class=\"{\'sr-only\': !showTitle()}\" for=\"{{form.key.slice(-1)[0]}}\">{{form.title}}</label><schema-editor-category ng-show=\"form.key\" sf-changed=\"form\" placeholder=\"{{form.placeholder}}\" class=\"{{form.fieldHtmlClass}}\" id=\"{{form.key.slice(-1)[0]}}\" ng-model-options=\"form.ngModelOptions\" ng-model=\"$$value$$\" ng-disabled=\"form.readonly\" schema-validate=\"form\" name=\"{{form.key.slice(-1)[0]}}\" ng-attr-title=\"{{form.description}}\" aria-describedby=\"{{form.key.slice(-1)[0] + \'Status\'}}\"><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><span ng-show=\"form.feedback !== false\" class=\"form-control-feedback\" ng-class=\"evalInScope(form.feedback) || {\'fa\': true, \'fa-lg\': true, \'check-circle\': hasSuccess(), \'success-color\': hasSuccess(), \'exclamation-circle\': hasError(), \'alert-color\': hasError() }\" aria-hidden=\"true\"></span><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p></schema-editor-category></div>");
$templateCache.put("directives/decorators/foundation/checkbox.html","<label ng-show=\"showTitle()\" ng-class=\"{{form.labelHtmlClass}}\">{{form.title}}</label><div class=\"switch small schema-form-checkbox {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><input type=\"checkbox\" sf-changed=\"form\" ng-disabled=\"form.readonly\" ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\" schema-validate=\"form\" class=\"{{form.fieldHtmlClass}}\" ng-attr-id=\"{{\'asf-field-\' + $id}}\" name=\"{{form.key.slice(-1)[0]}}\"><label ng-attr-for=\"{{\'asf-field-\' + $id}}\" style=\"margin: 0\"></label><p ng-if=\"form.description\"><small><span class=\"help-block\" ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/checkboxes.html","<div sf-array=\"form\" ng-model=\"$$value$$\" class=\"schema-form-checkboxes {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label><div class=\"switch small\" ng-repeat=\"val in titleMapValues track by $index\"><input type=\"checkbox\" ng-disabled=\"form.readonly\" sf-changed=\"form\" class=\"{{form.fieldHtmlClass}}\" ng-model=\"titleMapValues[$index]\" ng-attr-id=\"{{\'asf-field-\' + $id}}\" name=\"{{form.key.slice(-1)[0]}}\"> <label ng-attr-for=\"{{\'asf-field-\' + $id}}\" style=\"margin: 0\"></label> <span ng-bind-html=\"form.titleMap[$index].name\"></span></div><p ng-if=\"form.description\"><small><span class=\"help-block\" ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/default.html","<div class=\"schema-form-{{form.type}} {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label ng-show=\"showTitle()\" class=\"{{form.labelHtmlClass}}\" ng-class=\"{\'sr-only\': !showTitle()}\" for=\"{{form.key.slice(-1)[0]}}\">{{form.title}} {{form.$id}} {{form.id}} {{form.$$id}}</label> <input ng-if=\"!form.fieldAddonLeft && !form.fieldAddonRight\" ng-show=\"form.key\" type=\"{{form.type}}\" step=\"any\" sf-changed=\"form\" placeholder=\"{{form.placeholder}}\" class=\"{{form.fieldHtmlClass}}\" id=\"{{form.key.slice(-1)[0]}}\" ng-model-options=\"form.ngModelOptions\" ng-model=\"$$value$$\" ng-disabled=\"form.readonly\" schema-validate=\"form\" name=\"{{form.key.slice(-1)[0]}}\" ng-attr-title=\"{{form.description}}\" aria-describedby=\"{{form.key.slice(-1)[0] + \'Status\'}}\"><div ng-if=\"form.fieldAddonLeft || form.fieldAddonRight\" class=\"collapse\"><span ng-if=\"form.fieldAddonLeft\" style=\"padding: 0\" class=\"prefix small-3 column\" ng-bind-html=\"form.fieldAddonLeft\"></span> <span class=\"small-9 column\" style=\"padding: 0\"><input ng-show=\"form.key\" type=\"{{form.type}}\" step=\"any\" sf-changed=\"form\" placeholder=\"{{form.placeholder}}\" class=\"{{form.fieldHtmlClass}}\" id=\"{{form.key.slice(-1)[0]}}\" ng-model-options=\"form.ngModelOptions\" ng-model=\"$$value$$\" ng-disabled=\"form.readonly\" schema-validate=\"form\" name=\"{{form.key.slice(-1)[0]}}\" aria-describedby=\"{{form.key.slice(-1)[0] + \'Status\'}}\"></span> <span ng-if=\"form.fieldAddonRight\" class=\"postfix small-3 column\" style=\"padding: 0\" ng-bind-html=\"form.fieldAddonRight\"></span></div><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><span ng-show=\"form.feedback !== false\" class=\"form-control-feedback\" ng-class=\"evalInScope(form.feedback) || {\'fa\': true, \'fa-lg\': true, \'check-circle\': hasSuccess(), \'success-color\': hasSuccess(), \'exclamation-circle\': hasError(), \'alert-color\': hasError() }\" aria-hidden=\"true\"></span><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/detailed-range.html","<div class=\"schema-form-{{form.type}} {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label ng-show=\"showTitle()\" class=\"{{form.labelHtmlClass}}\" ng-class=\"{\'sr-only\': !showTitle()}\" for=\"{{form.key.slice(-1)[0]}}\">{{form.title}}</label><vii-detailed-range model=\"$$value$$\" field=\"form\"></vii-detailed-range><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><span ng-show=\"form.feedback !== false\" class=\"form-control-feedback\" ng-class=\"evalInScope(form.feedback) || {\'fa\': true, \'fa-lg\': true, \'check-circle\': hasSuccess(), \'success-color\': hasSuccess(), \'exclamation-circle\': hasError(), \'alert-color\': hasError() }\" aria-hidden=\"true\"></span><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/fieldset-trcl.html","<fieldset ng-disabled=\"form.readonly\" class=\"schema-form-fieldset {{form.htmlClass}}\"><legend ng-class=\"{\'show-for-sr\': !showTitle() }\">{{ form.title }}</legend><div class=\"\" ng-show=\"form.description\" ng-bind-html=\"form.description\"></div><div ng-transclude=\"\"></div></fieldset>");
$templateCache.put("directives/decorators/foundation/fieldset.html","<fieldset ng-disabled=\"form.readonly\" class=\"schema-form-fieldset {{form.htmlClass}}\"><legend ng-class=\"{\'show-for-sr\': !showTitle() }\">{{ form.title }}</legend><div class=\"\" ng-show=\"form.description\" ng-bind-html=\"form.description\"></div><sf-decorator ng-repeat=\"item in form.items\" form=\"item\"></sf-decorator></fieldset>");
$templateCache.put("directives/decorators/foundation/height.html","<div><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label><vii-height asf-model=\"$$value$$\" form=\"form\" field=\"field\"></vii-height><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p></div>");
$templateCache.put("directives/decorators/foundation/help.html","<div class=\"schema-form-helpvalue {{form.htmlClass}}\" ng-bind-html=\"form.helpvalue\"></div>");
$templateCache.put("directives/decorators/foundation/hidden.html","<input type=\"hidden\" sf-changed=\"form\" ng-disabled=\"form.readonly\" ng-init=\"$$value$$ = $$value$$ || form.defaultValue || form.options.default\" ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\" schema-validate=\"form\" ng-attr-id=\"{{\'asf-field-\' + $id}}\" name=\"{{form.key.slice(-1)[0]}}\">");
$templateCache.put("directives/decorators/foundation/markdown.html","<div class=\"schema-form-{{form.type}} {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label ng-show=\"showTitle()\" class=\"{{form.labelHtmlClass}}\" ng-class=\"{\'sr-only\': !showTitle()}\" for=\"{{form.key.slice(-1)[0]}}\">{{form.title}}</label><vii-markdown-editor ng-show=\"form.key\" sf-changed=\"form\" placeholder=\"{{form.placeholder}}\" class=\"{{form.fieldHtmlClass}}\" id=\"{{form.key.slice(-1)[0]}}\" ng-model-options=\"form.ngModelOptions\" ng-model=\"$$value$$\" ng-disabled=\"form.readonly\" schema-validate=\"form\" name=\"{{form.key.slice(-1)[0]}}\" ng-attr-title=\"{{form.description}}\" aria-describedby=\"{{form.key.slice(-1)[0] + \'Status\'}}\"><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><span ng-show=\"form.feedback !== false\" class=\"form-control-feedback\" ng-class=\"evalInScope(form.feedback) || {\'fa\': true, \'fa-lg\': true, \'check-circle\': hasSuccess(), \'success-color\': hasSuccess(), \'exclamation-circle\': hasError(), \'alert-color\': hasError() }\" aria-hidden=\"true\"></span><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></vii-markdown-editor></div>");
$templateCache.put("directives/decorators/foundation/media.html","<div class=\"schema-form-{{form.type}} {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label ng-show=\"showTitle()\" class=\"{{form.labelHtmlClass}}\" ng-class=\"{\'sr-only\': !showTitle()}\" for=\"{{form.key.slice(-1)[0]}}\">{{form.title}}</label><vii-file-uploader sf-uploader=\"\" multiple=\"multiple\" callbacks=\"callbacks\"></vii-file-uploader><vii-file-pen files=\"files\" model=\"$$value$$\"></vii-file-pen><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><span ng-show=\"form.feedback !== false\" class=\"form-control-feedback\" ng-class=\"evalInScope(form.feedback) || {\'fa\': true, \'fa-lg\': true, \'check-circle\': hasSuccess(), \'success-color\': hasSuccess(), \'exclamation-circle\': hasError(), \'alert-color\': hasError() }\" aria-hidden=\"true\"></span></div>");
$templateCache.put("directives/decorators/foundation/medications.html","<div><vii-medications model=\"$$value$$\" field=\"form\"></vii-medications><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p></div>");
$templateCache.put("directives/decorators/foundation/odl-widget.html","<vii-odl-widget model=\"$$value$$\" field=\"form\"></vii-odl-widget>");
$templateCache.put("directives/decorators/foundation/radio-buttons.html","<div class=\"schema-form-radiobuttons {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><div><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label></div><div class=\"btn-group\"><label class=\"btn {{ (item.value === $$value$$) ? form.style.selected || \'\' : form.style.unselected || \'\'; }}\" ng-class=\"{ active: item.value === $$value$$ }\" ng-repeat=\"item in form.titleMap\"><input type=\"radio\" class=\"{{form.fieldHtmlClass}}\" sf-changed=\"form\" style=\"display: none;\" ng-disabled=\"form.readonly\" ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\" schema-validate=\"form\" ng-value=\"item.value\" name=\"{{form.key.join(\'.\')}}\"> <span ng-bind-html=\"item.name\"></span></label></div><p ng-if=\"form.description\"><small><span class=\"help-block\" ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/radios-inline.html","<div class=\"schema-form-radios-inline {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label><div><label class=\"radio-inline\" ng-repeat=\"item in form.titleMap\"><input type=\"radio\" class=\"{{form.fieldHtmlClass}}\" sf-changed=\"form\" ng-disabled=\"form.readonly\" ng-model=\"$$value$$\" schema-validate=\"form\" ng-value=\"item.value\" name=\"{{form.key.join(\'.\')}}\"> <span ng-bind-html=\"item.name\"></span></label></div><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/radios.html","<div class=\"schema-form-radios {{form.htmlClass}}\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label><div class=\"radio\" ng-repeat=\"item in form.titleMap\"><label><input type=\"radio\" class=\"{{form.fieldHtmlClass}}\" sf-changed=\"form\" ng-disabled=\"form.readonly\" ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\" schema-validate=\"form\" ng-value=\"item.value\" name=\"{{form.key.join(\'.\')}}\"> <span ng-bind-html=\"item.name\"></span></label></div><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/section.html","<div class=\"{{form.htmlClass}}\"><sf-decorator ng-repeat=\"item in form.items\" form=\"item\"></sf-decorator></div>");
$templateCache.put("directives/decorators/foundation/select.html","<div class=\"{{form.htmlClass}} schema-form-select\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label><select ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\" ng-disabled=\"form.readonly\" sf-changed=\"form\" class=\"{{form.fieldHtmlClass}}\" schema-validate=\"form\" ng-options=\"item.value as item.name group by item.group for item in form.titleMap\" name=\"{{form.key.slice(-1)[0]}}\"></select><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/slider.html","<div><vii-section-title ng-if=\"form.schema.sectionTitle\" field=\"form\"></vii-section-title><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label><vii-slider model=\"$$value$$\" field=\"form\" on-na=\"deleteProperty(path)\"></vii-slider><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/submit.html","<div class=\"schema-form-submit {{form.htmlClass}}\"><input type=\"submit\" class=\"button success {{ form.style }} {{form.fieldHtmlClass}}\" value=\"{{form.title}}\" ng-disabled=\"form.readonly\" ng-if=\"form.type === \'submit\'\"> <button class=\"button {{ form.style }}\" type=\"button\" ng-click=\"buttonClick($event,form)\" ng-disabled=\"form.readonly\" ng-if=\"form.type !== \'submit\'\"><span ng-if=\"form.icon\" class=\"fa fa-lg {{form.icon}}\"></span> {{form.title}}</button></div>");
$templateCache.put("directives/decorators/foundation/tabarray.html","<div sf-array=\"form\" ng-init=\"selected = { tab: 0 }\" class=\"clearfix schema-form-tabarray schema-form-tabarray-{{form.tabType || \'left\'}} {{form.htmlClass}}\"><div ng-if=\"!form.tabType || form.tabType !== \'right\'\" ng-class=\"{\'col-xs-3\': !form.tabType || form.tabType === \'left\'}\"><ul class=\"tabs vertical\" data-tab=\"\"><li ng-repeat=\"item in modelArray track by $index\" class=\"tab-title\" ng-click=\"$event.preventDefault() || (selected.tab = $index)\" ng-class=\"{active: selected.tab === $index}\"><a href=\"#\">{{interp(form.title,{\'$index\':$index, value: item}) || $index}}</a></li><li ng-hide=\"form.readonly\" ng-click=\"$event.preventDefault() || (selected.tab = appendToArray().length - 1)\"><a href=\"#\"><i class=\"fa fa-lg plus\"></i> {{ form.add || \'Add\'}}</a></li></ul></div><div ng-class=\"{\'col-xs-9\': !form.tabType || form.tabType === \'left\' || form.tabType === \'right\'}\"><div class=\"tabs-content {{form.fieldHtmlClass}}\"><div class=\"tab-pane clearfix\" ng-repeat=\"item in modelArray track by $index\" ng-show=\"selected.tab === $index\" ng-class=\"{active: selected.tab === $index}\"><sf-decorator ng-init=\"arrayIndex = $index\" form=\"copyWithIndex($index)\"></sf-decorator><button ng-hide=\"form.readonly\" ng-click=\"selected.tab = deleteFromArray($index).length - 1\" type=\"button\" class=\"btn {{ form.style.remove || \'btn-default\' }} pull-right\"><i class=\"glyphicon glyphicon-trash\"></i> {{ form.remove || \'Remove\'}}</button></div></div></div><div ng-if=\"form.tabType === \'right\'\" class=\"col-xs-3\"><ul class=\"tabs vertical\" data-tab=\"\"><li ng-repeat=\"item in modelArray track by $index\" class=\"tab-title\" ng-click=\"$event.preventDefault() || (selected.tab = $index)\" ng-class=\"{active: selected.tab === $index}\"><a href=\"#\">{{interp(form.title,{\'$index\':$index, value: item}) || $index}}</a></li><li ng-hide=\"form.readonly\" ng-click=\"$event.preventDefault() || (selected.tab = appendToArray().length - 1)\"><a href=\"#\"><i class=\"fa fa-lg plus\"></i> {{ form.add || \'Add\'}}</a></li></ul></div></div>");
$templateCache.put("directives/decorators/foundation/tabs.html","<div ng-init=\"selected = { tab: 0 }\" class=\"schema-form-tabs {{form.htmlClass}}\"><ul class=\"tabs\"><li ng-repeat=\"tab in form.tabs\" class=\"tab-title\" ng-disabled=\"form.readonly\" ng-click=\"$event.preventDefault() || (selected.tab = $index)\" ng-class=\"{active: selected.tab === $index}\"><a href=\"#\">{{ tab.title }}</a></li></ul><div class=\"tabs-content {{form.fieldHtmlClass}}\"><div class=\"tab-pane\" ng-disabled=\"form.readonly\" ng-repeat=\"tab in form.tabs\" ng-show=\"selected.tab === $index\" ng-class=\"{active: selected.tab === $index}\"><bootstrap-decorator ng-repeat=\"item in tab.items\" form=\"item\"></bootstrap-decorator></div></div></div>");
$templateCache.put("directives/decorators/foundation/textarea.html","<div class=\"{{form.htmlClass}} schema-form-textarea\" ng-class=\"{\'error\': form.disableErrorState !== true && hasError()}\"><label ng-show=\"showTitle()\" class=\"{{form.labelHtmlClass}}\" ng-class=\"{\'sr-only\': !showTitle()}\" for=\"{{form.key.slice(-1)[0]}}\">{{form.title}}</label> <textarea ng-if=\"!form.fieldAddonLeft && !form.fieldAddonRight\" class=\"{{form.fieldHtmlClass}}\" id=\"{{form.key.slice(-1)[0]}}\" sf-changed=\"form\" placeholder=\"{{form.placeholder}}\" ng-disabled=\"form.readonly\" ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\" schema-validate=\"form\" name=\"{{form.key.slice(-1)[0]}}\"></textarea><div ng-if=\"form.fieldAddonLeft || form.fieldAddonRight\"><span ng-if=\"form.fieldAddonLeft\" class=\"prefix\" ng-bind-html=\"form.fieldAddonLeft\"></span> <textarea class=\"{{form.fieldHtmlClass}}\" id=\"{{form.key.slice(-1)[0]}}\" sf-changed=\"form\" placeholder=\"{{form.placeholder}}\" ng-disabled=\"form.readonly\" ng-model=\"$$value$$\" ng-model-options=\"form.ngModelOptions\" schema-validate=\"form\" name=\"{{form.key.slice(-1)[0]}}\"></textarea> <span ng-if=\"form.fieldAddonRight\" class=\"postfix\" ng-bind-html=\"form.fieldAddonRight\"></span></div><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div></div>");
$templateCache.put("directives/decorators/foundation/weight.html","<div><label class=\"{{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label><vii-weight asf-model=\"$$value$$\" form=\"form\" field=\"field\"></vii-weight><div ng-if=\"controls\"><fb-replace-with-field target=\"#{{ field.form.type == \'boolean\' ? \'boolean-field-\' + ngModel.$name : ngModel.$name }}\" controls=\"controls\" enabled=\"true\" field-elid=\"{{ field.elid }}\" model=\"model\" attr=\"ngModel.$name\" name=\"{{ ngModel.$name }}\" lookup-fields=\"field.lookupFields\"></fb-replace-with-field></div><fb-validation-error error=\"field.errorModel[field.errorAttr]\"></fb-validation-error><p ng-if=\"form.description\"><small><span ng-bind-html=\"form.description\"></span></small></p></div>");}]);
angular.module('schemaForm').config(['schemaFormDecoratorsProvider', function(decoratorsProvider) {
  var base = 'directives/decorators/foundation/';

  decoratorsProvider.defineDecorator('foundationDecorator', {
    textarea: {template: base + 'textarea.html', replace: false},
    fieldset: {template: base + 'fieldset.html', replace: false},
    /*fieldset: {template: base + 'fieldset.html', replace: true, builder: function(args) {
      var children = args.build(args.form.items, args.path + '.items');
      console.log('fieldset children frag', children.childNodes)
      args.fieldFrag.childNode.appendChild(children);
    }},*/
    array: {template: base + 'array.html', replace: false},
    tabarray: {template: base + 'tabarray.html', replace: false},
    tabs: {template: base + 'tabs.html', replace: false},
    section: {template: base + 'section.html', replace: false},
    conditional: {template: base + 'section.html', replace: false},
    actions: {template: base + 'actions.html', replace: false},
    select: {template: base + 'select.html', replace: false},
    checkbox: {template: base + 'checkbox.html', replace: false},
    checkboxes: {template: base + 'checkboxes.html', replace: false},
    number: {template: base + 'default.html', replace: false},
    password: {template: base + 'default.html', replace: false},
    submit: {template: base + 'submit.html', replace: false},
    button: {template: base + 'submit.html', replace: false},
    radios: {template: base + 'radios.html', replace: false},
    slider: {template: base + 'slider.html', replace: false},
    'detailed-range': { template: base + 'detailed-range.html', replace: false },
    'odl-widget': {template: base + 'odl-widget.html', replace: false },
    markdown: {template: base + 'markdown.html', replace: false},
    media: {template: base + 'media.html', replace: false},
    category: {template: base + 'category.html', replace: false},
    'radios-inline': {template: base + 'radios-inline.html', replace: false},
    medications: {template: base + 'medications.html', replace: false},
    height: {template: base + 'height.html', replace: false},
    weight: {template: base + 'weight.html', replace: false},
    /*radiobuttons: {template: base + 'radio-buttons.html', replace: false},*/
    help: {template: base + 'help.html', replace: false},
    hidden: {template: base + 'hidden.html', replace: false},
    'default': {template: base + 'default.html', replace: false}
  }, [
    function(form) {
      console.debug(form, 'www');
    }
  ]);

  //manual use directives
  decoratorsProvider.createDirectives({
    textarea: base + 'textarea.html',
    select: base + 'select.html',
    checkbox: base + 'checkbox.html',
    checkboxes: base + 'checkboxes.html',
    number: base + 'default.html',
    submit: base + 'submit.html',
    button: base + 'submit.html',
    text: base + 'default.html',
    date: base + 'default.html',
    password: base + 'default.html',
    datepicker: base + 'datepicker.html',
    input: base + 'default.html',
    radios: base + 'radios.html',
    slider: base + 'slider.html',
    'detailed-range': base + 'detailed-range.html',
    'odl-widget': base + 'odl-widget.html',
    medications: {template: base + 'medications.html', replace: false},
    height: {template: base + 'height.html', replace: false},
    weight: {template: base + 'weight.html', replace: false},
    markdown: base + 'markdown.html',
    media: base + 'media.html',
    category: base + 'category.html',
    'radios-inline': base + 'radios-inline.html',
    /*radiobuttons: base + 'radio-buttons.html',*/
  });

}]).directive('sfFieldset', function() {
  return {
    transclude: true,
    scope: true,
    templateUrl: 'directives/decorators/foundation/fieldset-trcl.html',
    link: function(scope, element, attrs) {
      scope.title = scope.$eval(attrs.title);
    }
  };
});

return schemaForm;
}));

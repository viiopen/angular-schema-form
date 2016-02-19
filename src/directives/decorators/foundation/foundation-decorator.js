angular.module('schemaForm').config(['schemaFormDecoratorsProvider', function(decoratorsProvider) {
  var base = 'directives/decorators/foundation/';

  decoratorsProvider.defineDecorator('foundationDecorator', {
    'actions': {template: base + 'actions.html', replace: false},
    'aos-health-history': {template: base + 'aos-health-history.html', replace: false},
    'aos-pain-locator': {template: base + 'aos-pain-locator.html', replace: false},
    'array': {template: base + 'array.html', replace: false},
    'button': {template: base + 'submit.html', replace: false},
    'category': {template: base + 'category.html', replace: false},
    'checkbox': {template: base + 'checkbox.html', replace: false},
    'checkboxes': {template: base + 'checkboxes.html', replace: false},
    'conditional': {template: base + 'section.html', replace: false},
    'date': {template: base + 'date-time.html', replace: false},
    'date-time': {template: base + 'date-time.html', replace: false},
    'default': {template: base + 'default.html', replace: false},
    'decide-stopper-problems': {template: base + 'decide-stopper-problems.html', replace: false},
    'detailed-range': { template: base + 'detailed-range.html', replace: false },
    'fieldset': {template: base + 'fieldset.html', replace: false},
    'height': {template: base + 'height.html', replace: false},
    'help': {template: base + 'help.html', replace: false},
    'hidden': {template: base + 'hidden.html', replace: false},
    'label': {template: base + 'label.html', replace: false},
    'markdown': {template: base + 'markdown.html', replace: false},
    'media': {template: base + 'media.html', replace: false},
    'medications': {template: base + 'medications.html', replace: false},
    'number': {template: base + 'default.html', replace: false},
    'odl-widget': {template: base + 'odl-widget.html', replace: false },
    'password': {template: base + 'default.html', replace: false},
    'radios': {template: base + 'radios.html', replace: false},
    'radios-inline': {template: base + 'radios-inline.html', replace: false},
    'save': {template: base + 'save.html', replace: false},
    'section': {template: base + 'section.html', replace: false},
    'select': {template: base + 'select.html', replace: false},
    'slider': {template: base + 'slider.html', replace: false},
    'submit': {template: base + 'submit.html', replace: false},
    'tabarray': {template: base + 'tabarray.html', replace: false},
    'tabs': {template: base + 'tabs.html', replace: false},
    'textarea': {template: base + 'textarea.html', replace: false},
    'weight': {template: base + 'weight.html', replace: false}
    /*
    'fieldset': {template: base + 'fieldset.html', replace: true, builder: function(args) {
      var children = args.build(args.form.items, args.path + '.items');
      console.log('fieldset children frag', children.childNodes)
      args.fieldFrag.childNode.appendChild(children);
    }},
    'radiobuttons': {template: base + 'radio-buttons.html', replace: false},
    */
  }, [
    function(form) {
      console.debug(form, 'www');
    }
  ]);

  //manual use directives
  decoratorsProvider.createDirectives({
    'aos-health-history': base + 'aos-health-history.html',
    'aos-pain-locator': base + 'aos-pain-locator.html',
    'button': base + 'submit.html',
    'category': base + 'category.html',
    'checkbox': base + 'checkbox.html',
    'checkboxes': base + 'checkboxes.html',
    'date': base + 'date-time.html',
    'date-time': base + 'date-time.html',
    'datepicker': base + 'datepicker.html',
    'decide-stopper-problems': base + 'decide-stopper-problems.html',
    'detailed-range': base + 'detailed-range.html',
    'height': {template: base + 'height.html', replace: false},
    'input': base + 'default.html',
    'label': {template: base + 'label.html', replace: false},
    'markdown': base + 'markdown.html',
    'media': base + 'media.html',
    'medications': {template: base + 'medications.html', replace: false},
    'number': base + 'default.html',
    'odl-widget': base + 'odl-widget.html',
    'password': base + 'default.html',
    'radios': base + 'radios.html',
    'radios-inline': base + 'radios-inline.html',
    'save': base + 'save.html',
    'select': base + 'select.html',
    'slider': base + 'slider.html',
    'submit': base + 'submit.html',
    'text': base + 'default.html',
    'textarea': base + 'textarea.html',
    'weight': {template: base + 'weight.html', replace: false}
    /*
    'radiobuttons': base + 'radio-buttons.html',
    */
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

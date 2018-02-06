(function () {
    angular
        .module('default').directive('disallowSpaces', function() {
        return {
            restrict: 'A',

            link: function($scope, $element) {
                $element.bind('input', function() {
                    $(this).val($(this).val().replace(/ /g, ''));
                });
            }
        };
    });
})();

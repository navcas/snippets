(function () {
    angular
        .module('default').directive('scrollBlock', ['$timeout',function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.antValueP = '';
                element.on('click', function () {
                    if (scope.antValueP === '') {

                        var $html = $("<html>");
                        $html.css("overflow-y", "hidden");
                        var html = $("<HTML>");
                        html.css("overflow-y", "hidden");

                        var $modal = $(".modal");
                        scope.antValueP = $modal.css("overflow-y");
                        $modal.css("overflow-y", "hidden");

                        document.querySelector('HTML').style.overflowY = 'hidden';
                        document.getElementsByTagName('HTML')[0].style.overflowY = 'hidden';
                        element.find('md-option').on('click', function () {
                            $modal.css("overflow-y", scope.antValueP);
                            scope.antValueP = '';
                        });


                        $timeout(function () {
                            var $selectBackDrop = $('.md-select-backdrop');
                            $selectBackDrop.css('z-index','1199');
                            console.log("set index");

                            $selectBackDrop.on('click', function () {
                                $modal.css("overflow-y", scope.antValueP);
                                scope.antValueP = '';
                            });
                        }, 500);
                    }
                });


                scope.$watch(attrs.ngModel, function () {
                    var $modal = $(".modal");
                    $modal.css("overflow-y", scope.antValueP);
                    scope.antValueP = '';

                });
            }
        };
    }]);
})();

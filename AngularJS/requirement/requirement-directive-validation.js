(function () {
    'use strict';

    angular
        .module('adqApp')
        .directive('validFolioOriginal', ValidFolioOriginal)
        .directive('maxPercentage', ValidMaxPercentage);

    ValidFolioOriginal.$inject =['Requirement', 'AgreementTypeUtils','$q'];

    function ValidFolioOriginal(Requirement, AgreementTypeUtils, $q){
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel){
                ngModel.$asyncValidators.invalidFolio = function(modelValue, viewValue) {
                    var folio = viewValue;
                    var deferred = $q.defer();
                    if(angular.isDefined(folio) && folio !== null && folio.trim().length > 0) {
                        Requirement.findFolio({folio: folio, agreementType: AgreementTypeUtils.ORIGINAL},
                            function (result, header) {
                                var totalItems = parseInt(header('X-Total-Count'));
                                if (totalItems > 0) {
                                    deferred.resolve();
                                } else {
                                    deferred.reject();
                                }
                            }, function (result) {
                                deferred.reject();
                            });
                    }else{
                        deferred.reject();
                    }
                    return deferred.promise;
                }
            }
        };
    }

    ValidMaxPercentage.$invalid = [];

    function ValidMaxPercentage(){
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel){
                var percentageMax = parseInt(attr.maxPercentage);
                ngModel.$validators.maxPercentage = function(modelValue, viewValue){
                    var percentage = 0;
                    if(angular.isDefined(viewValue) && viewValue !== null){
                        percentage = parseInt(viewValue);
                        if(percentage <= percentageMax){
                            return true;
                        }else{
                            return false;
                        }
                    }else{
                        return false;
                    }
                }
            }
        };
    }
})();
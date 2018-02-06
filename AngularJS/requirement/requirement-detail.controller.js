(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementDetailController', RequirementDetailController);

    RequirementDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Requirement', 'Comments', 'AgreementType', 'Department', 'Status', 'Process', 'RequisitionDocuments', 'ApplicableArticle', 'RequirementDt', 'RequirementDe', 'AgreModiType'];

    function RequirementDetailController($scope, $rootScope, $stateParams, previousState, entity, Requirement, Comments, AgreementType, Department, Status, Process, RequisitionDocuments, ApplicableArticle, RequirementDt, RequirementDe, AgreModiType) {
        var vm = this;

        vm.requirement = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('adqApp:requirementUpdate', function(event, result) {
            vm.requirement = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();

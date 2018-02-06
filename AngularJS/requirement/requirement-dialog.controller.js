(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementDialogController', RequirementDialogController);

    RequirementDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'Requirement', 'Comments', 'AgreementType', 'Department', 'Status', 'Process', 'RequisitionDocuments', 'ApplicableArticle', 'RequirementDt', 'RequirementDe', 'AgreModiType'];

    function RequirementDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, Requirement, Comments, AgreementType, Department, Status, Process, RequisitionDocuments, ApplicableArticle, RequirementDt, RequirementDe, AgreModiType) {
        var vm = this;

        vm.requirement = entity;
        vm.clear = clear;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;
        vm.comments = Comments.query();
        vm.agreementtypes = AgreementType.query();
        vm.departments = Department.query();
        vm.statuses = Status.query();
        vm.processes = Process.query();
        vm.requisitiondocuments = RequisitionDocuments.query();
        vm.applicablearticles = ApplicableArticle.query();
        vm.requirementdts = RequirementDt.query();
        vm.requirementdes = RequirementDe.query();
        vm.agremoditypes = AgreModiType.query();

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.requirement.id !== null) {
                Requirement.update(vm.requirement, onSaveSuccess, onSaveError);
            } else {
                Requirement.save(vm.requirement, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('adqApp:requirementUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }

        vm.datePickerOpenStatus.dateElaboration = false;
        vm.datePickerOpenStatus.dateRequired = false;
        vm.datePickerOpenStatus.lastModified = false;

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('ConfirmSentRequirementToController',ConfirmSentRequirementToController);

    ConfirmSentRequirementToController.$inject = ['$uibModalInstance', '$timeout', 'positionType', 'entity', 'PositionUtils'];

    function ConfirmSentRequirementToController($uibModalInstance, $timeout, positionType, entity, PositionUtils) {

        var vm = this;
        vm.isUserApplicant = positionType.code === PositionUtils.APPLICANT.code;
        vm.isUserAdmin = positionType.code === PositionUtils.ADMIN.code;
        vm.isUserHeadDepartment = positionType.code === PositionUtils.HEAD_DEPARTMENT.code;
        vm.clear = clear;
        vm.confirmSentTo = confirmSentTo;
        vm.fullName = "";

        $timeout(function(){
            vm.fullName = entity.firstName + ' ' + entity.lastName + (entity.mothersSurname != null ? ' ' + entity.mothersSurname : '');
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmSentTo () {
            $uibModalInstance.close(true);
        }
    }
})();

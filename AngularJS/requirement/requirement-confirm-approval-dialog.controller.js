(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('ConfirmApprovalRequirementController',ConfirmApprovalRequirementController);

    ConfirmApprovalRequirementController.$inject = ['$uibModalInstance', 'Requirement', 'entity', 'comment'];

    function ConfirmApprovalRequirementController($uibModalInstance, Requirement, entity, comment) {

        var vm = this;
        vm.clear = clear;
        vm.requirement = entity;
        vm.newComment = comment;
        vm.confirmApproval = confirmApproval;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmApproval () {
            if(vm.newComment !== null && vm.newComment.user !== null && vm.newComment.user.id !== null) {
                var history = {
                    user: vm.newComment.user,
                    requirement: vm.requirement
                };
                Requirement.approve(history, onApproveSuccess, onApproveError);
            }
        }

        function onApproveSuccess (result, header) {
            if(result !== null) {
                vm.newComment.requirement = result;
                Comments.save(vm.newComment,
                    function (result, header) {
                        $uibModalInstance.close(true);
                    }, function (err) {
                        console.log("ocurrio un error al guardar el comentario " + err);
                    });
            }
        }

        function onApproveError(data){
            console.log(data);
        }
    }
})();

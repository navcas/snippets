(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementCancelController',RequirementCancelController);

    RequirementCancelController.$inject = ['$uibModalInstance', 'entity', 'Requirement', 'newComment', 'Comments'];

    function RequirementCancelController($uibModalInstance, entity, Requirement, newComment, Comments) {
        var vm = this;

        vm.requirement = entity;
        vm.newComment = newComment;
        vm.clear = clear;
        vm.confirmCancel = confirmCancel;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmCancel () {
            Requirement.cancel({id: vm.requirement.id},
                function () {
                    vm.newComment.requirement = vm.requirement;
                    Comments.save(vm.newComment,
                        function(result, header){
                            $uibModalInstance.close(true);
                        }, function(err){
                            console.log("ocurrio un error al guardar el comentario " + err);
                    });
                });
        }

    }
})();

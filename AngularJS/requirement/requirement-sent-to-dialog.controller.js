(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementSentToController',RequirementSentToController);

    RequirementSentToController.$inject = ['$uibModal', '$uibModalInstance', 'entity', '$timeout', 'Position', 'PositionUtils',
        'Requirement', 'newComment', 'Comments', 'User'];

    function RequirementSentToController($uibModal, $uibModalInstance, entity, $timeout, Position, PositionUtils,
         Requirement, newComment, Comments, User ) {

        var vm = this;

        vm.requirement = entity;
        vm.newComment = newComment;
        vm.clear = clear;
        vm.confirmSentTo = confirmSentTo;
        vm.users = [];
        vm.userSelected = null;
        vm.isUserAdmin = vm.newComment.user.position.code === PositionUtils.ADMIN.code;
        vm.isUserHeadDepartment = vm.newComment.user.position.code === PositionUtils.HEAD_DEPARTMENT.code;

        $timeout(function(){
            if(vm.isUserAdmin) {
                Position.query({'code.equals': PositionUtils.HEAD_DEPARTMENT.code}, onSuccessLoadPosition, onErrorLoadPosition);
            }else if(vm.isUserHeadDepartment){
                Position.query({'code.equals': PositionUtils.REVIEWER.code}, onSuccessLoadPosition, onErrorLoadPosition);
            }else{
                alert('el usuario' + vm.newComment.user.username + ' No tiene los privilegios para ejecutar esta acción');
            }
        });

        function onSuccessLoadPosition(result, header){
            var items = parseInt(header('X-Total-Count'));
            if(items > 0) {
                User.getByPosition({id: result[0].id}, onSuccessLoadUsers, onErrorLoadUsers);
            }else{
                alert('No se encontro la posición ');
            }
        }

        function onErrorLoadPosition(result){
            console.log('no se encontro la posición');
        }

        function onSuccessLoadUsers(result, header){
            var totalItems = parseInt(header('X-Total-Count'));
            if (totalItems > 0) {
                vm.users=[];
                angular.forEach(result, function(r, i){
                    var newUser = angular.copy(r);
                    newUser.fullName = newUser.firstName + ' ' + newUser.lastName + (newUser.mothersSurname !== null ? ' ' + newUser.mothersSurname: '');
                    vm.users.push(newUser);
                });
            }
        }

        function onErrorLoadUsers(result){

        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmSentTo () {
            if (vm.newComment.user.position.code === PositionUtils.ADMIN.code ||
                vm.newComment.user.position.code === PositionUtils.HEAD_DEPARTMENT.code) {

                if (vm.userSelected !== null) {
                    var modalConfirm = getModalConfirmSentTo();
                    modalConfirm.result.then(onSuccessConfirmSentTo, onCancelConfirmSentTo);
                }else{
                    console.log('Se requiere tener un usuario seleccionado');
                }
            }else{
                console.log('Algo va mal con el usuario');
            }
        }

        function getModalConfirmSentTo(){
            return $uibModal.open({
                templateUrl: 'app/requirement/requirement-confirm-sent-to-dialog.html',
                controller: 'ConfirmSentRequirementToController',
                controllerAs: 'vm',
                size: 'md',
                resolve:{
                    positionType: [function(){
                        return vm.isUserAdmin ? PositionUtils.ADMIN : PositionUtils.HEAD_DEPARTMENT;
                    }],
                    entity: [function() {
                        return vm.userSelected;
                    }]
                }
            });
        }

        function onSuccessConfirmSentTo(result) {
            if(angular.isDefined(result) && result !== null) {
                var history = {
                    user: vm.userSelected
                };
                var requirement = {
                    requirement: vm.requirement,
                    history: history
                };
                Requirement.sendTo(requirement, onSaveSuccess, onError);
            }
        }

        function onCancelConfirmSentTo(){

        }

        function onSaveSuccess (result, header) {
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

        function onError(data){
            console.log(data);
        }
    }
})();

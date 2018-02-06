(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementGiveBackController', RequirementGiveBackController);

    RequirementGiveBackController.$inject = ['$uibModalInstance', 'entity', 'newComment', '$timeout', 'Position',
        'PositionUtils', 'Requirement',  'Comments', 'RequirementStatusHistory'];

    function RequirementGiveBackController($uibModalInstance, entity, newComment, $timeout, Position,
         PositionUtils, Requirement, Comments, RequirementStatusHistory) {

        var vm = this;
        vm.requirement = entity;
        vm.newComment = newComment;
        vm.clear = clear;
        vm.confirmGiveBack = confirmGiveBack;
        vm.isUserAdmin = vm.newComment.user.position.code === PositionUtils.ADMIN.code;
        vm.isUserHeadDepartment = vm.newComment.user.position.code === PositionUtils.HEAD_DEPARTMENT.code;
        vm.isUserReviewer = vm.newComment.user.position.code === PositionUtils.REVIEWER.code;
        vm.previousPosition = null;
        vm.user = null;

        $timeout(function(){
            if(vm.isUserAdmin) {
                Position.query({'code.equals': PositionUtils.APPLICANT.code}, onSuccessLoadPosition, onErrorLoadPosition);
            }else if(vm.isUserHeadDepartment){
                Position.query({'code.equals': PositionUtils.ADMIN.code}, onSuccessLoadPosition, onErrorLoadPosition);
            }else if(vm.isUserReviewer){
                Position.query({'code.equals': PositionUtils.HEAD_DEPARTMENT.code}, onSuccessLoadPosition, onErrorLoadPosition)
            }else{
                alert('el usuario' + vm.newComment.user.username + ' No tiene los privilegios para ejecutar esta acción');
            }
        });

        function onSuccessLoadPosition(result, header){
            var items = parseInt(header('X-Total-Count'));
            if(items > 0) {
                vm.previousPosition = result[0];
                var filter = {
                    user:{
                        position: vm.previousPosition
                    },
                    requirement: vm.requirement,
                    priorityNumber: vm.requirement.priorityNumber
                };
                RequirementStatusHistory.getPrevious(filter, onSuccessLoadPreviousStatusHistory, onErrorLoadPreviousStatusHistory);
            }else{
                alert('No se encontro la posición ');
            }
        }

        function onErrorLoadPosition(result){
            console.log('no se encontro la posición');
        }

        function onSuccessLoadPreviousStatusHistory(result, header){
            if (result !== null) {
                var r = angular.copy(result.user);
                r.fullName = r.firstName + ' ' + r.lastName + (r.mothersSurname !== null ? ' ' + r.mothersSurname : '');
                vm.user = r;
            }
        }

        function onErrorLoadPreviousStatusHistory(result){

        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmGiveBack () {
            if (vm.isUserReviewer || vm.isUserHeadDepartment || vm.isUserAdmin) {
                var history= {
                    user: vm.user
                };
                var requirement = {
                    requirement: vm.requirement,
                    history : history
                };
                Requirement.giveBack(requirement, onSaveSuccess, onError);
            }else{
                console.log('Algo va mal con el usuario');
            }
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

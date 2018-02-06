(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementMessageController', RequirementMessageController);

    RequirementMessageController.$inject = ['$uibModalInstance', 'type', 'params'];

    function RequirementMessageController($uibModalInstance, type, params) {

        var vm = this;
        vm.header = type + '.header';
        vm.message = type + '.message';
        vm.params = params;
        vm.clear = clear;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();

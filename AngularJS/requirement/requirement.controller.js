(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementController', RequirementController);

    RequirementController.$inject = ['$state', 'Requirement', 'ParseLinks', 'AlertService', 'paginationConstants', 'pagingParams',
                                    'AgreementType','Process','$filter', 'Permission', 'PermissionUtils', 'Principal', 'PositionUtils',
                                    '$timeout'];

    function RequirementController($state, Requirement, ParseLinks, AlertService, paginationConstants, pagingParams,
                                   AgreementType, Process, $filter, Permission, PermissionUtils, Principal, PositionUtils,
                                   $timeout) {

        var vm = this;
        var userLogged = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.hasPermissionSaveRequirement = false;

        //Filter
        vm.alerts = [];

        vm.isInvalidDate = false;
        vm.datePickerOpenStatus = {};
        vm.datePickerOpenStatus.dateInitialElaboration = false;
        vm.datePickerOpenStatus.dateFinalElaboration = false;
            //Functions
        vm.openCalendar = openCalendar;
        vm.search = search;

        $timeout(function() {
            Process.query({}, onSuccessLoadProcedure, onErrorLoadProcedure);
            AgreementType.query({}, onSuccessLoadAgreementType, onErrorLoadAgreementType);
            Principal.identity().then(function (account) {
                if (account !== null) {
                    userLogged = account;
                    Permission.getByRol({id: account.userRol.id}, onSuccessLoadPermission, onErrorLoadPermission);
                }
            });
        });

        $timeout(function (){
            if(angular.isDefined(pagingParams.filter) && pagingParams.filter !== null) {
                vm.procedure = pagingParams.filter.procedure;
                vm.agreementType = pagingParams.filter.agreementType;
                vm.folio = pagingParams.filter.folio;
                vm.dateInitialElaboration = pagingParams.filter.dateInitialElaboration;
                vm.dateFinalElaboration = pagingParams.filter.dateFinalElaboration;
            }else{
                vm.folio = null;
                vm.dateInitialElaboration = null;
                vm.dateFinalElaboration = null;
            }

            if (angular.isUndefined(pagingParams.search) || pagingParams.search === null) {
                loadAll();
            } else {
                search();
            }
        });

        function onSuccessLoadPermission(result, headers){
            if(result !== null){
                if(userLogged.position.code === PositionUtils.APPLICANT.code) {
                    vm.hasPermissionSaveRequirement = $filter('findPermission')(result, PermissionUtils.GENERATE_REQUIREMENT);
                }
            }
        }

        function onErrorLoadPermission(data){

        }

        function loadAll () {
            vm.currentSearch=null;
            Requirement.getAllByUserLogged({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
            function sort() {
                var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
                if (vm.predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
            function onSuccess(data, headers) {
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
                vm.requirements = data;
                vm.page = pagingParams.page;
            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        }

        //Filter
        function onSuccessLoadProcedure(data, header){
            var all = {
                name: $filter('translate')('entity.filter.all'),
                code: 'all',
                id: 0
            };
            vm.procedures = [];
            vm.procedures.push(all);
            if(angular.isDefined(pagingParams.filter) && pagingParams.filter !== null){
                vm.procedure = pagingParams.filter.procedure;
            } else {
                vm.procedure = all;
            }
            angular.forEach(data, function(item, index){
                vm.procedures.push(item);
            });
        }

        function onErrorLoadProcedure(data){
            console.log(data);
        }

        function onSuccessLoadAgreementType(data, header){
            var all = {
                name: $filter('translate')('entity.filter.all'),
                code: 'all',
                id: 0
            };
            vm.agreementTypes = [];
            vm.agreementTypes.push(all);
            if(angular.isDefined(pagingParams.filter) && pagingParams.filter !== null){
                vm.agreementType = pagingParams.filter.agreementType;
            }else {
                vm.agreementType = all;
            }
            angular.forEach(data, function(item, index){
                vm.agreementTypes.push(item);
            });
        }

        function onErrorLoadAgreementType(data){
            console.log(data);
        }

        function search(){
            if(!isResertFilter()) {
                if (!isValidDates()) {
                    return;
                }
                vm.currentSearch = 'filter';
                Requirement.masterFilter({
                    folio: vm.folio,
                    agreementType: vm.agreementType,
                    procedure: vm.procedure,
                    dateInitialElaboration: vm.dateInitialElaboration,
                    dateFinalElaboration: vm.dateFinalElaboration,
                    page: pagingParams.page - 1,
                    size: vm.itemsPerPage,
                    sort: sort()
                }, onSuccessFilter, onErrorFilter);
            }else{
                loadAll();
            }
        }

        function sort(){
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function isResertFilter(){
            var isReset = true;
            if(vm.folio !== null && vm.folio.trim().length > 0){
                isReset = false;
            }
            if(vm.agreementType !== null && vm.agreementType.id > 0){
                isReset = false;
            }
            if(vm.procedure !== null && vm.procedure.id > 0){
                isReset = false;
            }
            if(vm.dateInitialElaboration !== null){
                isReset = false;
            }
            if(vm.dateFinalElaboration !== null){
                isReset = false;
            }
            return isReset;
        }

        function onSuccessFilter(data, headers){
            vm.links = ParseLinks.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count');
            vm.queryCount = vm.totalItems;
            vm.requirements = data;
            vm.page = pagingParams.page;
        }

        function onErrorFilter(data){
            AlertService.error(data.message);
        }

        function isValidDates(){
            var isValid = true;
            if(vm.dateInitialElaboration !== null && vm.dateFinalElaboration !== null){
                if(vm.dateFinalElaboration < vm.dateInitialElaboration){
                    isValid = false;
                    vm.isInvalidDate = true;
                    createAlertError(null,'adqApp.requirement.filter.validation.finalDateBeforeInitial');
                }
            }
            if(isValid){
                vm.isInvalidDate = false;
                vm.alerts = [];
            }
            return isValid;
        }

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function createAlertError(params, msg){
            vm.alerts.push(AlertService.add({
                    type: "danger",
                    params: params,
                    msg: msg,
                    toast: AlertService.isToast(),
                    scoped: true,
                    timeout: 15000
                }, vm.alerts
            ));
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch,
                filter: {
                    folio: vm.folio,
                    agreementType: vm.agreementType,
                    procedure: vm.procedure,
                    dateInitialElaboration: vm.dateInitialElaboration,
                    dateFinalElaboration: vm.dateFinalElaboration
                }
            });
        }
    }
})();

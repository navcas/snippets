(function() {
    'use strict';
    angular
        .module('adqApp')
        .factory('Requirement', Requirement);

    Requirement.$inject = ['$resource', 'DateUtils', '$filter'];

    function Requirement ($resource, DateUtils, $filter) {
        var resourceUrl =  'api/requirements/:id';

        return $resource(resourceUrl, {}, {
            'query': {
                method: 'GET',
                isArray: true
            },
            'getAllByUserLogged': {
                method: 'GET',
                url: 'api/requirement/byUserLogged',
                isArray: true,
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        angular.forEach(data, function(item, index){
                            item.dateElaboration = DateUtils.convertLocalDateFromServer(item.dateElaboration);
                            item.dateRequired = DateUtils.convertLocalDateFromServer(item.dateRequired);
                            item.lastModified = DateUtils.convertDateTimeFromServer(item.lastModified);
                            item.requirementDetail.finalDate = DateUtils.convertLocalDateFromServer(item.requirementDetail.finalDate);
                            item.requirementDetail.initialDate = DateUtils.convertLocalDateFromServer(item.requirementDetail.initialDate);
                        });
                    }
                    return data;
                }
            },
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        data.dateElaboration = DateUtils.convertLocalDateFromServer(data.dateElaboration);
                        data.dateRequired = DateUtils.convertLocalDateFromServer(data.dateRequired);
                        data.lastModified = DateUtils.convertDateTimeFromServer(data.lastModified);
                        angular.forEach(data.requirementDetail.formalizations, function (item, index) {
                            item.dateFormalizeOrder = DateUtils.convertLocalDateFromServer(item.dateFormalizeOrder);
                        });
                        data.requirementDetail.initialDate = DateUtils.convertLocalDateFromServer(data.requirementDetail.initialDate);
                        data.requirementDetail.finalDate = DateUtils.convertLocalDateFromServer(data.requirementDetail.finalDate);
                    }
                    return data;
                }
            },
            'update': {
                method: 'PUT',
                transformRequest: function (data) {
                    var copy = angular.copy(data);
                    copy.dateElaboration = DateUtils.convertTimezoneToLocal(copy.dateElaboration);
                    copy.dateRequired = DateUtils.convertLocalDateToServer(copy.dateRequired);
                    copy.requirementDetail.initialDate = DateUtils.convertLocalDateToServer(copy.requirementDetail.initialDate);
                    copy.requirementDetail.finalDate = DateUtils.convertLocalDateToServer(copy.requirementDetail.finalDate);
                    return angular.toJson(copy);
                }
            },
            'updateMaster': {
                method: 'PUT',
                url: 'api/requirement/updateMaster',
                transformRequest: function (data) {
                    var copy = angular.copy(data);
                    copy.dateElaboration = DateUtils.convertLocalDateToServer(copy.dateElaboration);
                    copy.dateRequired = DateUtils.convertLocalDateToServer(copy.dateRequired);
                    copy.requirement.requirementDetail.initialDate = DateUtils.convertLocalDateToServer(copy.requirement.requirementDetail.initialDate);
                    copy.requirement.requirementDetail.finalDate = DateUtils.convertLocalDateToServer(copy.requirement.requirementDetail.finalDate);
                    var s = angular.toJson(copy);
                    return s;
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {
                    var copy = angular.copy(data);
                    copy.dateElaboration = DateUtils.convertLocalDateToServer(copy.dateElaboration);
                    copy.dateRequired = DateUtils.convertLocalDateToServer(copy.dateRequired);
                    copy.requirementDetail.initialDate = DateUtils.convertLocalDateToServer(copy.requirementDetail.initialDate);
                    copy.requirementDetail.finalDate = DateUtils.convertLocalDateToServer(copy.requirementDetail.finalDate);
                    return angular.toJson(copy);
                }
            },
            'saveMaster':{
                method: 'POST',
                url: 'api/requirements/createMaster',
                transformRequest: function(data){
                    var copy = angular.copy(data);
                    copy.dateElaboration = DateUtils.convertLocalDateToServer(copy.dateElaboration);
                    copy.dateRequired = DateUtils.convertLocalDateToServer(copy.dateRequired);
                    copy.requirement.requirementDetail.initialDate = DateUtils.convertLocalDateToServer(copy.requirement.requirementDetail.initialDate);
                    copy.requirement.requirementDetail.finalDate = DateUtils.convertLocalDateToServer(copy.requirement.requirementDetail.finalDate);
                    return angular.toJson(copy);
                }
            },
            'cancel': {
                method: 'PUT',
                url: 'api/requirement/cancel/:id',
                params:{id : '@id'},
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        data.dateElaboration = DateUtils.convertLocalDateFromServer(data.dateElaboration);
                        data.dateRequired = DateUtils.convertLocalDateFromServer(data.dateRequired);
                        data.lastModified = DateUtils.convertDateTimeFromServer(data.lastModified);
                        data.requirementDetail.initialDate = DateUtils.convertLocalDateFromServer(data.requirementDetail.initialDate);
                        data.requirementDetail.finalDate = DateUtils.convertLocalDateFromServer(data.requirementDetail.finalDate);
                    }
                    return data;
                }
            },
            'sendToAdmin': {
                method: 'PUT',
                url: 'api/requirement/sendToAdmin',
                transformRequest: function (data) {
                    var copy = angular.copy(data);
                    console.log(copy);
                    copy.requirement.dateElaboration = DateUtils.convertLocalDateToServer(copy.requirement.dateElaboration);
                    copy.requirement.dateRequired = DateUtils.convertLocalDateToServer(copy.requirement.dateRequired);
                    copy.requirement.requirementDetail.initialDate = DateUtils.convertLocalDateToServer(copy.requirement.requirementDetail.initialDate);
                    copy.requirement.requirementDetail.finalDate = DateUtils.convertLocalDateToServer(copy.requirement.requirementDetail.finalDate);
                    var s = angular.toJson(copy);
                    return s;
                }
            },
            'sendTo':{
                method: 'PUT',
                url: 'api/requirement/sendTo',
                transformRequest: function (data) {
                    var copy = angular.copy(data);
                    copy.dateElaboration = DateUtils.convertLocalDateToServer(copy.dateElaboration);
                    copy.dateRequired = DateUtils.convertLocalDateToServer(copy.dateRequired);
                    var s = angular.toJson(copy);
                    return s;
                }
            },
            'giveBack':{
                method: 'PUT',
                url: 'api/requirement/giveBack',
                transformRequest: function (data) {
                    var copy = angular.copy(data);
                    copy.dateElaboration = DateUtils.convertLocalDateToServer(copy.dateElaboration);
                    copy.dateRequired = DateUtils.convertLocalDateToServer(copy.dateRequired);
                    var s = angular.toJson(copy);
                    return s;
                }
            },
            'approve': {
                method: 'PUT',
                url: 'api/requirement/approve',
                transformRequest: function (data) {
                    var copy = angular.copy(data);
                    copy.requirement.dateElaboration = DateUtils.convertLocalDateToServer(copy.requirement.dateElaboration);
                    copy.requirement.dateRequired = DateUtils.convertLocalDateToServer(copy.requirement.dateRequired);
                    var s = angular.toJson(copy);
                    return s;
                }
            },
            'findFolio':{
                method: 'POST',
                url: 'api/requirements/findFolio',
                isArray: true,
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        angular.forEach(data, function(item, index){
                            item.dateElaboration = DateUtils.convertLocalDateFromServer(item.dateElaboration);
                            item.dateRequired = DateUtils.convertLocalDateFromServer(item.dateRequired);
                            item.lastModified = DateUtils.convertDateTimeFromServer(item.lastModified);
                        });
                    }
                    return data;
                }
            },
            'masterFilter': {
                method: 'POST',
                url: 'api/requirements/masterFilter',
                isArray: true,
                transformRequest: function(data){
                    var copy = angular.copy(data);
                    copy.dateInitialElaboration = DateUtils.convertLocalDateToServer(copy.dateInitialElaboration);
                    copy.dateFinalElaboration = DateUtils.convertLocalDateToServer(copy.dateFinalElaboration);
                    return angular.toJson(copy);
                },
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        angular.forEach(data, function(item, index) {
                            item.dateElaboration = DateUtils.convertLocalDateFromServer(item.dateElaboration);
                            item.dateRequired = DateUtils.convertLocalDateFromServer(item.dateRequired);
                            item.lastModified = DateUtils.convertDateTimeFromServer(item.lastModified);
                            item.requirementDetail.finalDate = DateUtils.convertLocalDateFromServer(item.requirementDetail.finalDate);
                            item.requirementDetail.initialDate = DateUtils.convertLocalDateFromServer(item.requirementDetail.initialDate);
                        });
                    }
                    return data;
                }
            }
        });
    }
})();

(function () {
    'use strict';

    angular
        .module('adqApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('requirement', {
            parent: 'app',
            url: '/requirement?page&sort&search',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'adqApp.requirement.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/requirement/requirements.html',
                    controller: 'RequirementController',
                    controllerAs: 'vm'
                }
            },
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                sort: {
                    value: 'id,asc',
                    squash: true
                },
                search: null,
            filter: null},
            resolve: {
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                    return {
                        page: PaginationUtil.parsePage($stateParams.page),
                        sort: $stateParams.sort,
                        predicate: PaginationUtil.parsePredicate($stateParams.sort),
                        ascending: PaginationUtil.parseAscending($stateParams.sort),
                        search: $stateParams.search,
                        filter: $stateParams.filter
                    };
                }],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('requirement');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('requirement-detail', {
            parent: 'requirement',
            url: '/requirement/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'adqApp.requirement.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/requirement/requirement-detail.html',
                    controller: 'RequirementDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('requirement');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Requirement', function($stateParams, Requirement) {
                    return Requirement.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'requirement',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('requirement-detail.edit', {
            parent: 'requirement-detail',
            url: 'detail/edit',
            data:{
                authorities: ['ROLE_USER'],
                pageTitle: 'adq.App.requirement.detail.title'
            },
            views:{
                'content@':{
                    templateUrl: 'app/requirement/requirement-master.html',
                    controller: 'RequirementMasterController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('requirement');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Requirement', function($stateParams, Requirement) {
                    return Requirement.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: '^',
                        params: {},
                        url: {reload: false}
                    };
                    return currentStateData;
                }]
            }
        })
        .state('requirement.new', {
            parent: 'requirement',
            url: '/new',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'adq.App.requirement.detail.title'
            },
            views:{
                'content@':{
                    templateUrl: 'app/requirement/requirement-master.html',
                    controller: 'RequirementMasterController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('requirement');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Requirement', function($stateParams, Requirement) {
                    return {
                        user: null,
                        unitBusiness: null,
                        folio: 'NEXT',
                        dateElaboration: new Date(),
                        idRequest: null,
                        dateRequired: null,
                        folioReference: null,
                        descriptionService: null,
                        procedureNumberCompranet: null,
                        originalNumberFolio: null,
                        priorityNumber: 0,
                        authorized: false,
                        justification: null,
                        dateFormalizeOrder: null,
                        requirementData : {
                            advance: false,
                            healthRegistration: false,
                            training: false,
                            budgetAuthorization: false,
                            storageExisting: false,
                            conventionalPenalties: false,
                            percentageConventionalPenalty: 0,
                            testMethod: null,
                            multiyear: false,
                            months: null,
                            comments: null,
                            deliveryConditions: null,
                            deliveryPlace: null,
                            paymentConditions: null,
                            requesterName: null,
                            requesterPosition: null,
                            requesterDepartment: null,
                            approverName: null,
                            aproverPosition: null,
                            firmsPosition: null,
                            guaranteeTypeDetails:[],
                            multiyearDetails:[],
                            contractType: null,
                            id: null
                        },
                        requirementDetail: {
                            formalizeOrder: false,
                            maxTotalAmount: 0.0,
                            minTotalAmount: 0.0,
                            totalAmount: 0.0,
                            document: null,
                            numberPayments: null,
                            initialDate: null,
                            finalDate: null,
                            reasonChange: null,
                            budgets: [],
                            formalizations:[],
                            specifications:[],
                            id: null
                        },
                        id: null
                    };
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: 'requirement',
                        params: null,
                        url: {reload : 'requirement'}
                    };
                    return currentStateData;
                }]
            }
        })
        .state('requirement.edit', {
            parent: 'requirement',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'adq.App.requirement.detail.title'
            },
            views:{
                'content@':{
                    templateUrl: 'app/requirement/requirement-master.html',
                    controller: 'RequirementMasterController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('requirement');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Requirement', function($stateParams, Requirement) {
                    return Requirement.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: 'requirement',
                        params: null,
                        url: {reload : 'requirement'}
                    };
                    return currentStateData;
                }]
            }
        })
        .state('requirement.delete', {
            parent: 'requirement',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/requirement/requirement-delete-dialog.html',
                    controller: 'RequirementDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Requirement', function(Requirement) {
                            return Requirement.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('requirement', null, { reload: 'requirement' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('requirement.cancel', {
            parent: 'requirement.edit',
            url: '/cancel',
            params: {id: null, comment: null, user: null},
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/requirement/requirement-cancel-dialog.html',
                    controller: 'RequirementCancelController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Requirement', function(Requirement) {
                            return Requirement.get({id : $stateParams.id}).$promise;
                        }],
                        newComment: ['Comments', function(Comments){
                            return {
                                user: $stateParams.user,
                                requirement: null,
                                dateHour: new Date(),
                                text: $stateParams.comment
                            };
                        }]
                    }
                }).result.then(function() {
                    $state.go('requirement', null, { reload: 'requirement' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('requirement.sentTo', {
            parent: 'requirement.edit',
            url: '/sentTo',
            params: {requirement: null, comment: null, user: null},
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/requirement/requirement-sent-to-dialog.html',
                    controller: 'RequirementSentToController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: [function() {
                            return $stateParams.requirement;
                        }],
                        newComment: [function(){
                            return {
                                user: $stateParams.user,
                                requirement: null,
                                dateHour: new Date(),
                                text: $stateParams.comment
                            };
                        }]
                    }
                }).result.then(function() {
                    $state.go('requirement', null, { reload: 'requirement' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('requirement.giveBack', {
            parent: 'requirement.edit',
            url: '/giveBack',
            params: {requirement: null, comment: null, user: null},
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/requirement/requirement-give-back-dialog.html',
                    controller: 'RequirementGiveBackController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Requirement', function() {
                            return $stateParams.requirement;
                        }],
                        newComment: ['Comments', function(){
                            return {
                                user: $stateParams.user,
                                requirement: null,
                                dateHour: new Date(),
                                text: $stateParams.comment
                            };
                        }]
                    }
                }).result.then(function() {
                    $state.go('requirement', null, { reload: 'requirement' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('requirement.approve', {
            parent: 'requirement.edit',
            url: '/approve',
            params: {requirement: null, comment: null, user: null},
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/requirement/requirement-confirm-approval-dialog.html',
                    controller: 'ConfirmApprovalRequirementController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: [function() {
                            return $stateParams.requirement;
                        }],
                        comment: [function(){
                            return {
                                user: $stateParams.user,
                                requirement: null,
                                dateHour: new Date(),
                                text: $stateParams.comment
                            };
                        }]
                    }
                }).result.then(function() {
                    $state.go('requirement', null, { reload: 'requirement' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('requirement.message',{
            parent: 'requirement.edit',
            url: '/message',
            params: {
                type: null,
                params: null
            },
            data: {
                authorities: ['ROLE_USER', 'ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal){
                $uibModal.open({
                    templateUrl: 'app/requirement/requirement-message-dialog.html',
                    controller: 'RequirementMessageController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        type: [function(){
                            return $stateParams.type;
                        }],
                        params: [function(){
                            return $stateParams.params;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^');
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();

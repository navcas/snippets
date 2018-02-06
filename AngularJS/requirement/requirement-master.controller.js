(function() {
    'use strict';

    angular
        .module('adqApp')
        .controller('RequirementMasterController', RequirementMasterController);

    RequirementMasterController.$inject = ['$timeout', '$scope','$rootScope', '$state',
                                            '$stateParams', 'previousState', 'entity',
                                            'Requirement', 'Comments', 'AgreementType',
                                            'Department', 'Status', 'Process',
                                            'RequisitionDocuments', 'Upload', 'ApplicableArtDocType',
                                            'ApplicableArticle', 'DataUtils',
                                            'ContractType', 'GuaranteeType', 'GuaranteeDet', 'MultiyearDtl',
                                            'AlertService','$uibModal', '$filter', 'BrowserUtils',
                                            'Specification', 'Formalization', 'Budget', 'Supplier',
                                            'PaymentCondition', 'DocumentTypeRequirementDetail',
                                            'AgreementModificationType', 'Principal', 'StatusUtils',
                                            'AgreementModificationTypeUtils', 'AgreementTypeUtils', 'ContractTypeUtils',
                                            'DocumentTypeRequirementDetailUtils', 'PaymentConditionUtils', 'PermissionUtils',
                                            'PositionUtils', 'FormRequirementMasterUtils','Permission', 'RequirementStatusHistory',
                                            'Position', 'User'];

    function RequirementMasterController ($timeout, $scope, $rootScope, $state,
                                          $stateParams, previousState, entity,
                                          Requirement, Comments, AgreementType,
                                          Department, Status, Process,
                                          RequisitionDocuments, Upload, ApplicableArtDocType,
                                          ApplicableArticle, DataUtils,
                                          ContractType, GuaranteeType, GuaranteeDet, MultiyearDtl,
                                          AlertService, $uibModal, $filter, BrowserUtils,
                                          Specification, Formalization, Budget, Supplier,
                                          PaymentCondition, DocumentTypeRequirementDetail,
                                          AgreementModificationType, Principal, StatusUtils, AgreementModificationTypeUtils,
                                          AgreementTypeUtils, ContractTypeUtils, DocumentTypeRequirementDetailUtils,
                                          PaymentConditionUtils, PermissionUtils, PositionUtils,
                                          FormRequirementMasterUtils, Permission, RequirementStatusHistory, Position, User) {

        var vm = this;
        vm.requirement = entity;
        //Requirement
        vm.isFullBlock = false;
        vm.isAdjudication = false;
        var loadRecordsDeleted = false;
        var tabFilter = 'requirementDetail';
        var tabIndexRequirementDetail = $filter('findTabConstant')('requirement', tabFilter);
        tabFilter = 'requirementData';
        var tabIndexRequirementData = $filter('findTabConstant')('requirement', tabFilter);

        vm.isAgreementModification = false;
        vm.isAgreementAdendum = false;
        vm.isNewRequirementFolio = false;
        vm.selectAgreementType = selectAgreementType;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;
        vm.previousState = previousState;
        vm.back = back;
        vm.isSentToAdmin = false;
        vm.isSentTo = false;
        vm.sendToAdmin = sendToAdmin;
        vm.sendTo = sendTo;
        vm.giveBack = giveBack;
        vm.reviewed = reviewed;
        vm.approve = approve;
        vm.formalize = formalize;
        vm.adjudication = adjudication;
        vm.print = print;
        vm.agreementtypes = AgreementType.query();
        vm.departments = Department.query({'deleted.equals': loadRecordsDeleted});
        //vm.statuses = Status.query();
        vm.processes = Process.query();
        vm.agreementModificationTypes = AgreementModificationType.query();

        //Comments
        vm.comments = [];
        vm.comment = null;
        vm.loadComplete = false;
        var user = null;
        vm.fullNameUserApplicant = null;
        var permission = [];

        vm.isNew = vm.requirement.id === null;
        vm.isCancellable = false;
        //Cancel
        vm.cancel = cancel;
        vm.isBlock = false;
        vm.isFormalized = false;
        vm.isCommentRequired = false;
        vm.isUserAdmin = false;
        vm.isUserHeadDepartment = false;
        vm.isUserApplicant = false;
        vm.isUserReviewer = false;
        vm.hasPermissionSaveRequirement = false;
        vm.hasPermissionCancelRequirement = false;
        vm.hasPermissionAssing = false;
        vm.hasPermissionGiveBack = false;
        vm.hasPermissionSentToAdmin = false;
        vm.hasPermissionReviewed = false;
        vm.hasPermissionApprove = false;
        vm.hasPermissionAdjudication = false;
        vm.hasPermissionPrint = false;
        //Aplicable Article
        vm.DocumentsToUpload = [];


        //Requirement data
        vm.isNewRequirementData = vm.requirement.requirementData.id === null;

        //guaranteeTypesDetail
        vm.multiyearDetailsDeleted = [];
        vm.guaranteeSelected = null;
        vm.guaranteeTypeDetailsDeleted = [];
        vm.multiyearDetailsUpdated = [];

        //Functions guaranteeTypesDetail
        vm.contractTypes = ContractType.query();
        vm.guaranteeTypes = GuaranteeType.query({'deleted.equals': loadRecordsDeleted});
        vm.addGuaranteeTypeDetail = addGuaranteeTypeDetail;
        vm.removeGuaranteeTypeDetail = removeGuaranteeTypeDetail;

        //Functions multiyearDetail
        vm.checkMultiyear = checkMultiyear;
        vm.selectContractType = selectContractType;
        vm.addMultiyearDetail = addMultiyearDetail;
        vm.removeMultiyearDetail = removeMultiyearDetail;
        vm.editMultiyearDetail = editMultiyearDetail;
        vm.cancelUpdateMultiyearDetail = cancelUpdateMultiyearDetail;
        //multiyearDetails
        vm.isMaxAmountLessthanMinAmount = false;
        vm.totalAmount = parseFloat(0.0);
        vm.totalMinAmount = parseFloat(0.0);
        vm.totalMaxAmount = parseFloat(0.0);
        vm.temporalMultiyearDetail = null;
        vm.isUpdatedMultiyearDetail = false;

        //Requirement Detail
        vm.isNewRequirementDetail = vm.requirement.requirementDetail.id === null;
        vm.isRequirementAproved = false;
        vm.isAgreementModified = false;
        vm.paymentConditions = [];
        vm.documentsTypeReqDet = [];
        vm.alertsStaticContractTypeTotals = [];
        vm.alertsContractTypeTotals = [];
        vm.isInitialDateRequired = false;
        vm.isFinalDateRequired = false;
            //Functions
        vm.validateDates = validateDates;

        //Budgets
        vm.totalBudgetReqDet = [];
        vm.budgetsUpdate = [];
        vm.budgetsDelete = [];
        vm.currentBudgetOrder = 0;
        vm.isUpdatedBudgetReqDet = false;
        vm.temporalBudgetReqDet = null;
        var footerSubtotal = null, footerIva= null, footerOtherCharges=null, footerTotal=null;
        var subtotal = 0, iva = 1, otherCharges = 2, total = 3;
            //Functions
        vm.addBudgetReqDet = addBudgetReqDet;
        vm.updateBudgetReqDet = updateBudgetReqDet;
        vm.cancelUpdateBudgetReqDet = cancelUpdateBudgetReqDet;
        vm.deleteBudgetReqDet = deleteBudgetReqDet;
        vm.calculateTotal = calculateTotal;

        //Formalizations
        vm.formalizationsUpdated = [];
        vm.formalizationsDeleted = [];
        vm.isUpdateFormalizationReqDet = false;
        vm.formalizationReqDetTemporal = null;
        vm.formalizationReqDet = null;
        vm.suppliers = [];
            //Functions
        vm.addFormalizationReqDet = addFormalizationReqDet;
        vm.updateFormalizationReqDet = updateFormalizationReqDet;
        vm.cancelUpdateFormalizationReqDet = cancelUpdateFormalizationReqDet;
        vm.deleteFormalizationReqDet = deleteFormalizationReqDet;

        //Specifications
        vm.specificationsUpdated =[];
        vm.specificationsDeleted = [];
        vm.specificationReqDet = null;
        vm.specificationReqDetTemporal = null;
        vm.isUpdateSpecificationReqDet = false;
            //Functions
        vm.addSpecificationReqDet = addSpecificationReqDet;
        vm.updateSpecificationReqDet = updateSpecificationReqDet;
        vm.cancelUpdateSpecificationReqDet = cancelUpdateSpecificationReqDet;
        vm.deleteSpecificationReqDet = deleteSpecificationReqDet;

        //Alerts
        vm.alertsMultiyearDetail = [];
        vm.alertsGuaranteeTypeDetail = [];
        vm.alertsGeneral = [];
        vm.alertsBudgets = [];
        vm.alertsFormalizations = [];
        vm.alertsSpecifications = [];
        vm.alertsRequirementDetail= [];

        vm.loadAll = function(){
            vm.comments = Comments.query({
                'requirementId.equals': vm.requirement.id,
                sort: ['id,desc']
            });
        };

        $timeout(function () {
            angular.element('#field_agreement').focus();
            vm.isNewRequirementFolio = vm.requirement.folio.toLowerCase() === 'next' || vm.requirement.folio === null;
            Principal.identity().then(function (account) {
                if (account !== null) {
                    if (vm.isNew) {
                        vm.requirement.user = account;
                        vm.requirement.department = account.department;
                        vm.requirement.unitBusiness = account.unitBusiness;
                    }
                    user = account;
                    loadPositionUserLogged();
                    Permission.getByRol({id: user.userRol.id}, onSuccessLoadPermission, onErrorLoadPermission);
                }
            });

            initRequirementData();
            cleanMultiyearDetail();
            cleanBudgetReqDet();
            cleanFormalizationReqDet();
            cleanSpecificationReqDet();
            initRequirementDetail();
        });

        $timeout(function (){
            vm.fullNameUserApplicant = vm.requirement.user.firstName + ' ' + vm.requirement.user.lastName + (vm.requirement.user.mothersSurname !== null ?  ' ' + vm.requirement.user.mothersSurname : '');
            if(!vm.isNew) {
                selectAgreementType();
                Comments.loadInitial({"id": vm.requirement.id},
                    function success(result, header){
                        vm.comments = result;
                    },
                    function error(err){
                        console.log('Un error fue generado al intentar recuperar la lista de comentarios: ' + err) ;
                    }
                );
                if(vm.requirement.applicableArticle){
                    vm.applicableArticleSelected();
                }
                RequisitionDocuments.getByRequirementId({id: vm.requirement.id}, function (requisitionDocuments) {
                    vm.requisitionDocuments = requisitionDocuments;
                });
            } else {
                loadInitialStatus();
            }
        });

        function loadPositionUserLogged(){
            vm.isUserAdmin = user.position.code === PositionUtils.ADMIN.code;
            vm.isUserHeadDepartment = user.position.code === PositionUtils.HEAD_DEPARTMENT.code;
            vm.isUserApplicant = user.position.code === PositionUtils.APPLICANT.code;
            vm.isUserReviewer = user.position.code === PositionUtils.REVIEWER.code;
        }

        function onSuccessLoadPermission(result, header){
            permission = result;
            if(permission.length > 0) {
                if(!vm.isNew) {
                    var filter = {
                        priorityNumber: vm.requirement.priorityNumber,
                        requirement: {
                            id: vm.requirement.id
                        }
                    };
                    RequirementStatusHistory.getCurrent(filter, onSuccessLoadCurrentStatusHistory, onErrorLoadCurrentStatusHistory);
                }else{
                    loadPermission();
                }
            }
        }

        function onErrorLoadPermission(data){
            console.log(data);
        }

        vm.alertsStaticGeneral = [];

        function blockFields(){
            var blockFields= [];
            switch(vm.requirement.status.code){
                case StatusUtils.CANCELED.code:
                    vm.isBlock = true;
                    vm.isSentToAdmin = true;
                    blockFields = getFormBlockFull();
                    break;
                case StatusUtils.SAVED.code:
                case StatusUtils.PENDING.code:
                    vm.isSentToAdmin = true;
                    vm.isCancellable = true;
                    if(vm.isFullBlock){
                        blockFields = getFormBlockFull();
                    } else {
                        blockFields.push(FormRequirementMasterUtils.requirementDataFormalize);
                    }
                    break;
                case StatusUtils.ASSIGNED_ADMIN.code:
                case StatusUtils.ASSIGNED_HEAD_DEPARTMENT.code:
                case StatusUtils.RETURNED_ADMIN.code:
                case StatusUtils.RETURNED_HEAD_DEPARTMENT.code:
                    vm.isSentTo = true;
                    vm.isBlock = true;
                    if(vm.isFullBlock) {
                        blockFields= getFormBlockFull();
                    } else {
                        blockFields= getFormBlockBasic();
                    }
                    break;
                case StatusUtils.ASSIGNED_REVIEWER.code:
                    vm.isSentTo = true;
                    vm.isBlock = true;
                    if(vm.isFullBlock) {
                        blockFields= getFormBlockFull();
                    } else {
                        blockFields= getFormBlockMedium();
                    }
                    break;
            }

            angular.forEach(blockFields, function(form, index) {
                angular.forEach(form, function(element, i){
                    var r = document.querySelector('#'+ element);
                    if(angular.isElement(r)){
                        if(!r.hasAttribute('disabled')){
                            r.setAttribute('disabled', '');
                        }
                        if(!r.hasAttribute('readonly')){
                            r.setAttribute('readonly', '');
                        }
                        if(!r.hasAttribute('ng-disabled')){
                            r.setAttribute('ng-disabled','true');
                        }
                        if(!r.hasAttribute('ng-readonly')){
                            r.setAttribute('ng-readonly','true');
                        }
                    }
                });
            });
        }

        function onSuccessLoadCurrentStatusHistory(result, headers){
            if(result !== null){
                if(result.user.login === user.login){
                    vm.isFullBlock = false;
                    loadPermission();
                }else{
                    vm.isFullBlock = true;
                }
                blockFields();
            }
        }

        function onErrorLoadCurrentStatusHistory(data){

        }

        function loadPermission(){
            vm.hasPermissionSaveRequirement = $filter('findPermission')(permission, PermissionUtils.GENERATE_REQUIREMENT);
            vm.hasPermissionCancelRequirement = $filter('findPermission')(permission, PermissionUtils.CANCEL_REQUIREMENT);
            if(vm.isUserAdmin || vm.isUserHeadDepartment ){
                vm.hasPermissionAssing = $filter('findPermission')(permission, PermissionUtils.ASSIGN_REQUIREMENT);
            }else if(vm.isUserApplicant){
                vm.hasPermissionSentToAdmin = $filter('findPermission')(permission, PermissionUtils.ASSIGN_REQUIREMENT);
            }
            vm.hasPermissionGiveBack = $filter('findPermission')(permission, PermissionUtils.ACCEPT_OR_GIVE_BACK_REQUIREMENT);
            vm.hasPermissionReviewed = $filter('findPermission')(permission, PermissionUtils.REVIEW_REQUIREMENT);
            vm.hasPermissionApprove = $filter('findPermission')(permission, PermissionUtils.AUTHORIZE_REQUIREMENT);
            vm.hasPermissionAdjudication = $filter('findPermission')(permission, PermissionUtils.ADJUDICATION_REQUIREMENT);
            vm.hasPermissionPrint = $filter('findPermission')(permission, PermissionUtils.PRINT_FORMAT_REQUIREMENT);
        }

        function getFormBlockFull() {
            var blockFields = getFormBlockMedium();
            blockFields.push(FormRequirementMasterUtils.comments);
            return blockFields;
        }

        function getFormBlockMedium(){
            var blockFields = getFormBlockBasic();
            blockFields.push(FormRequirementMasterUtils.requirementDetailFormalize);
            blockFields.push(FormRequirementMasterUtils.requirementDataFormalize);
            return blockFields;
        }

        function getFormBlockBasic(){
            var blockFields = [];
            blockFields.push(FormRequirementMasterUtils.requirement);
            blockFields.push(FormRequirementMasterUtils.requirementData);
            blockFields.push(FormRequirementMasterUtils.requirementDataApplicant);
            blockFields.push(FormRequirementMasterUtils.documents);
            blockFields.push(FormRequirementMasterUtils.requirementDetail);
            return blockFields;
        }

        function selectAgreementType(){
            vm.isAgreementModification = false;
            vm.isAgreementAdendum = false;
            if(angular.isDefined(vm.requirement.agreement) && vm.requirement.agreement !== null){
                if(vm.requirement.agreement.code === AgreementTypeUtils.MODIFIED_AGREEMENT.code){
                    vm.isAgreementModification = true;
                }else if(vm.requirement.agreement.code === AgreementTypeUtils.ADENDUM.code) {
                    vm.isAgreementAdendum = true;
                }
            }
        }

        function back(){
            $state.go(vm.previousState.name, vm.previousState.params, vm.previousState.url);
        }
        var isContractBase64= false;

        function processContrat(file, cb) {
            if(!isContractBase64){
                cb(file);
            }else{
                DataUtils.toBase64(file, function (base64) {
                    isContractBase64 = true;
                    cb(base64);
                });
            }
        }
        function save () {
            if(isValidGuaranteeDetailForm()) {
                if(isValidRequirementDetailForm()) {
                    var file = vm.requirement.requirementDetail.document;

                    processContrat(file, function (base64) {
                        vm.requirement.requirementDetail.document = base64;
                        var requirement = getRequirementMaster();
                        vm.requirement.status = StatusUtils.SAVED;
                        resetEmptyFieldsRequirement();
                        vm.requirement.lastModified = new Date();
                        if (!vm.isNew) {
                            Requirement.updateMaster(requirement, onSaveSuccess, onSaveError);
                        } else {
                            Requirement.saveMaster(requirement, onSaveSuccess, onSaveError);
                        }
                    });
                }
            }
        }

        function getRequirementMaster(){
            return {
                requirement: vm.requirement,
                multiyearDetails: vm.requirement.requirementData.multiyearDetails,
                guaranteeDetails: vm.requirement.requirementData.guaranteeTypeDetails,
                budgets: vm.requirement.requirementDetail.budgets,
                formalizationsDTO: convertToListFormalizationDTO(vm.requirement.requirementDetail.formalizations),
                specifications: vm.requirement.requirementDetail.specifications,
                guaranteeTypeDetailsDeleted: vm.guaranteeTypeDetailsDeleted,
                multiyearDetailsUpdated: vm.multiyearDetailsUpdated,
                multiyearDetailsDeleted: vm.multiyearDetailsDeleted,
                budgetsDeleted: vm.budgetsDelete,
                budgetsUpdated: vm.budgetsUpdate,
                formalizationsDTOUpdated: convertToListFormalizationDTO(vm.formalizationsUpdated),
                formalizationsDTODeleted: convertToListFormalizationDTO(vm.formalizationsDeleted),
                specificationsUpdated: vm.specificationsUpdated,
                specificationsDeleted: vm.specificationsDeleted
            };
        }

        function convertToListFormalizationDTO(formalizations){
            var listDTO = [];
            angular.forEach(formalizations, function(formalization, index){
                var dto = {
                    formalization: formalization,
                    budgets: formalization.budgets
                };
                listDTO.push(dto);
            });
            return listDTO;
        }

        function resetEmptyFieldsRequirement(){
            if(!vm.requirement.idRequest){ vm.requirement.idRequest = null; }
            if(!vm.requirement.folioReference){ vm.requirement.folioReference = null; }
            if(!vm.requirement.procedureNumberCompranet){ vm.requirement.procedureNumberCompranet = null; }
            resetEmptyFieldsRequirementData();
        }

        function resetEmptyFieldsRequirementData(){
            if(!vm.requirement.requirementData.testMethod){ vm.requirement.requirementData.testMethod = null; }
            if(!vm.requirement.requirementData.comments){ vm.requirement.requirementData.comments = null; }
            if(!vm.requirement.requirementData.deliveryConditions){ vm.requirement.requirementData.deliveryConditions= null; }
            if(!vm.requirement.requirementData.paymentConditions){ vm.requirement.requirementData.paymentConditions= null; }
            if(!vm.requirement.requirementData.requesterName){ vm.requirement.requirementData.requesterName= null; }
            if(!vm.requirement.requirementData.requesterPosition){ vm.requirement.requirementData.requesterPosition= null; }
            if(!vm.requirement.requirementData.approverName){ vm.requirement.requirementData.approverName= null; }
            if(!vm.requirement.requirementData.aproverPosition){ vm.requirement.requirementData.aproverPosition= null; }
            if(!vm.requirement.requirementData.firmsPosition){ vm.requirement.requirementData.firmsPosition= null; }
        }

        var tabindex = null;
        $scope.$watch('activeForm', function(newVal){
            tabindex = newVal;
        });

        function onSaveSuccess (result, header) {

            async.waterfall([function (cb) {
                angular.forEach(vm.DocumentsToUpload, function (groupAA) {
                    angular.forEach(groupAA.files, function (file) {
                        if(!file.id){
                            DataUtils.toBase64(file.file, function (base64) {
                                RequisitionDocuments.save({mime: file.mime, size: file.size,
                                        name: file.name, file: base64, documentType:
                                        groupAA.documentType, requirement: result},
                                    function () {
                                        console.log("file sended");
                                    });
                            });

                        }

                    });
                });
                cb();
            }], function (err) {
                $scope.$emit('adqApp:requirementUpdate', result);
                vm.isSaving = false;
                back();
            });
        }

        function onSaveError () {
            vm.isSaving = false;
        }

        function sendToAdmin(){
            if(isValidGuaranteeDetailForm()) {
                if(isValidRequirementDetailForm()) {
                    if(isValidDocumentList()){
                        Position.query({'code.equals': PositionUtils.ADMIN.code},
                            function(result, headers){
                                if(result !== null && result.length > 0) {
                                    User.getByPosition({id: result[0].id},
                                        function(response, header) {
                                            if (response !== null && response.length > 0) {
                                                var modal = getModalConfirmSentToAdmin(response[0]);
                                                modal.result.then(onSuccessConfirmSendToAdmin, onCancelConfirmSendToAdmin);
                                            }
                                        }, function(err){}
                                    );
                                }
                            },
                            function(result){}
                        );
                    }else{
                        $state.go('requirement.message', {type: 'adqApp.requirement.messages.documentsRequired', params: null});
                    }
                }
            }
        }

        function getModalConfirmSentToAdmin(user){
            return $uibModal.open({
                templateUrl: 'app/requirement/requirement-confirm-sent-to-dialog.html',
                controller: 'ConfirmSentRequirementToController',
                controllerAs: 'vm',
                size: 'md',
                resolve:{
                    positionType: [function(){
                        return PositionUtils.APPLICANT
                    }],
                    entity: [function () {
                        return user;
                    }]
                }
            });
        }

        function onSuccessConfirmSendToAdmin(result){
            if(angular.isDefined(result) && result !== null) {
                var file = vm.requirement.requirementDetail.document;
                processContrat(file, function (base64) {
                    vm.requirement.requirementDetail.document = base64;
                    vm.requirement.lastModified = new Date();
                    resetEmptyFieldsRequirement();
                    Requirement.sendToAdmin(getRequirementMaster(), onSaveSuccess, onSaveError);
                });
            }
        }

        function onCancelConfirmSendToAdmin(){

        }

        function isValidDocumentList(){
            var isValid = true;
            var requisitionDocumentsTempTemp = angular.copy(vm.DocumentsToUpload);
            var documents = [];
            angular.forEach(requisitionDocumentsTempTemp, function(document, index){
                if(document.required){
                    var deleted=[];
                    var requisitionDocumentsUploadTemp = angular.copy(vm.requisitionDocuments);
                    angular.forEach(requisitionDocumentsUploadTemp, function(rDocument, rIndex){//buscamos los documentos guardados
                        if(rDocument.documentType.id === document.documentType.id){
                            deleted.push(rIndex);
                        }
                    });
                    if(deleted.length === 0 && angular.isUndefined(document.files)){
                        isValid = false;
                        var document = {name: 'liEleErrDocument' + document.documentType.id , header: document.documentType.name};
                        documents.push(document);
                    }else if(deleted.length > 0){
                        while(deleted.length > 0){
                            requisitionDocumentsUploadTemp.splice(deleted[0],1);
                            deleted.splice(0,1);
                        }
                    }
                }
            });
            var tabName = "liTabErrDocuments";
            var tabHeader = $filter('translate')('adqApp.requirement.tabs.documents.header');
            var position = $filter('findFormRequired')(vm.alertsStaticGeneral, tabName);
            if(position !== null) {
                vm.alertsStaticGeneral.splice(position, 1);
            }
            if(documents.length > 0){
                var form = {
                    name: tabName,
                    header: tabHeader,
                    documents: documents
                };
                vm.alertsStaticGeneral.push(form);
            }
            return isValid;
        }

        //Comments
        function cancel(){
            if(vm.isUserApplicant && vm.isCancellable) {
                if (vm.comment && vm.comment.trim().length > 0) {
                    $state.go('requirement.cancel', {id: vm.requirement.id, comment: vm.comment, user: user});
                } else {
                    vm.isCommentRequired = true;
                    showMessageCommentIsRequired();
                }
            }else{
                showMessageHasNotPermission();
            }
        }

        function sendTo(){
            if(vm.hasPermissionAssing){
                if (vm.comment && vm.comment.trim().length > 0) {
                    var file = vm.requirement.requirementDetail.document;
                    processContrat(file, function (base64) {
                        vm.requirement.requirementDetail.document = base64;
                        $state.go('requirement.sentTo', {
                            requirement: vm.requirement,
                            comment: vm.comment,
                            user: user
                        });
                    });
                } else {
                    vm.isCommentRequired = true;
                    showMessageCommentIsRequired();
                }
            }else{
                showMessageHasNotPermission();
            }
        }

        function giveBack(){
            if(vm.hasPermissionGiveBack){
                if (vm.comment && vm.comment.trim().length > 0) {
                    var file = vm.requirement.requirementDetail.document;
                    processContrat(file, function (base64) {
                        vm.requirement.requirementDetail.document = base64;
                        $state.go('requirement.giveBack', {
                            requirement: vm.requirement,
                            comment: vm.comment,
                            user: user
                        });
                    });
                } else {
                    vm.isCommentRequired = true;
                    showMessageCommentIsRequired();
                }
            }else{
                showMessageHasNotPermission();
            }
        }

        function reviewed(){}

        function approve(){
            if(vm.isUserAdmin && vm.hasPermissionApprove){
                //if(vm.requirement.status.code === StatusUtils.REVIEW.code) {
                    if (vm.comment && vm.comment.trim().length > 0) {
                        $state.go('requirement.approve', {
                            requirement: vm.requirement,
                            comment: vm.comment,
                            user: user
                        });
                    } else {
                        vm.isCommentRequired = true;
                        showMessageCommentIsRequired();
                    }
                //} else {
                //    $state.go('requirement.message', {type: 'adqApp.requirement.messages.notReview',params:null});
                //}
            }else{
                showMessageHasNotPermission();
            }
        }

        function formalize(){
            console.log(vm.requirement.requirementDetail);
        }

        function adjudication(){}

        function print(){}


        vm.datePickerOpenStatus.dateElaboration = false;
        vm.datePickerOpenStatus.dateRequired = false;

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

        //Status
        function loadInitialStatus(){
            vm.isSentToAdmin = true;
            vm.requirement.status = StatusUtils.PENDING;
        }

        //end Status

        //Cancel

        //end Cancel
        function isValidGuaranteeDetailForm(){
            var isValid = true;
            if(vm.requirement.requirementData.guaranteeTypeDetails.length > 0){
                var nameField = $filter('translate')('adqApp.requirement.data.guaranteeTypeDetail.percentage');
                angular.forEach(vm.requirement.requirementData.guaranteeTypeDetails, function(guaranteeDetail, index){
                    if(parseInt(guaranteeDetail.percentage) > 100){
                        if(isValid){isValid = false;}
                        if(tabindex !== tabIndexRequirementData){
                            createAlertGeneralError({field: nameField, guaranteeType: guaranteeDetail.guaranteeType.name}, 'adqApp.requirement.data.guaranteeTypeDetail.validation.percentage');
                        } else {
                            createAlertGuaranteeTypeDetail({field: nameField, guaranteeType: guaranteeDetail.guaranteeType.name}, 'percentage');
                        }
                    }
                });
            } else {
                if(!vm.requirement.requirementDetail.maxTotalAmount){
                }else{
                    vm.requirement.requirementDetail.maxTotalAmount = 0.0;
                }
                if(!vm.requirement.requirementDetail.minTotalAmount){
                }else{
                    vm.requirement.requirementDetail.minTotalAmount = 0.0;
                }
                if(!vm.requirement.requirementDetail.totalAmount){
                }else{
                    vm.requirement.requirementDetail.totalAmount = 0.0;
                }
            }
            if(vm.requirement.requirementData.percentageConventionalPenalty &&
                vm.requirement.requirementData.percentageConventionalPenalty.toString().trim().length > 0){
                var percentage = parseInt(vm.requirement.requirementData.percentageConventionalPenalty);
                if(percentage === 0 || percentage > 100){
                    createAlertGeneralError(null, 'adqApp.requirement.data.validation.percentage');
                    isValid = false;
                }
            }
            return isValid;
        }

        function cleanMultiyearDetail() {
            vm.multiyearDetail = {
                requirementData: null,
                budget: null,
                fiscalYear: null,
                totalAmount: parseFloat(0.0),
                minAmount: parseFloat(0.0),
                maxAmount: parseFloat(0.0),
                id: null
            };
        }

        function initRequirementData() {
            if (vm.isNewRequirementData) {
                vm.isCheckedMultiyear = false;
                vm.contractTypeSelected = null;
            } else {
                vm.isCheckedMultiyear = vm.requirement.requirementData.multiyear;
                vm.contractTypeSelected = vm.requirement.requirementData.contractType !== null ? vm.requirement.requirementData.contractType : null;
                if (vm.contractTypeSelected !== null) {
                    vm.isContractTypeClose = vm.contractTypeSelected.code === ContractTypeUtils.CLOSE.code;
                } else {
                    vm.isContractTypeClose = null;
                }
                MultiyearDtl.getByRequirementData({id: vm.requirement.requirementData.id}, onSuccessLoadMultiyearDetails, onErrorLoadMultiyearDetails);
                GuaranteeDet.getByRequirementData({id: vm.requirement.requirementData.id}, onSuccessLoadGuaranteeDetails, onErrorLoadGuaranteeDetails);
            }
        }

        function onSuccessLoadMultiyearDetails(result, header){
            vm.requirement.requirementData.multiyearDetails = result;
            if(vm.requirement.requirementData.multiyearDetails !== null && vm.requirement.requirementData.multiyearDetails.length > 0) {
                if (vm.isContractTypeClose) {
                    angular.forEach(vm.requirement.requirementData.multiyearDetails, function (detail, index) {
                        vm.totalAmount += detail.totalAmount;
                    });
                } else {
                    angular.forEach(vm.requirement.requirementData.multiyearDetails, function (detail, index) {
                        vm.totalMinAmount += detail.minAmount;
                        vm.totalMaxAmount += detail.maxAmount;
                    });
                }
            }else{
                vm.requirement.requirementData.multiyearDetails = [];
            }
        }

        function onErrorLoadMultiyearDetails(result){
            console("Error al cargar la lista de detalles para plurianualidad" + result);
        }

        function onSuccessLoadGuaranteeDetails(result, header){
            vm.requirement.requirementData.guaranteeTypeDetails = result;
            if(vm.requirement.requirementData.guaranteeTypeDetails && vm.requirement.requirementData.guaranteeTypeDetails.length > 0) {
                angular.forEach(vm.requirement.requirementData.guaranteeTypeDetails, function (selected, index) {
                    vm.guaranteeTypes.splice(selected, 1);
                });
            }else{
                vm.requirement.requirementData.guaranteeTypeDetails = [];
            }
        }

        function onErrorLoadGuaranteeDetails(result){
            console.log("Ocurrio un error al momento de recuperar los detalles del tipo de garantia " + result);
        }

        function addGuaranteeTypeDetail(){
            if(vm.requirement.requirementData.guaranteeTypeDetails.length < 3) {
                if(vm.guaranteeSelected !== null && vm.guaranteeSelected.id !== null) {
                    var newGuarantyDetail = {
                        guaranteeType: vm.guaranteeSelected,
                        percentage: 0,
                        requirementData: null,
                        id: null
                    };
                    vm.requirement.requirementData.guaranteeTypeDetails.push(newGuarantyDetail);
                    vm.guaranteeTypes.splice(vm.guaranteeSelected, 1);
                    vm.guaranteeSelected = null;
                }else{
                    createAlertGuaranteeTypeDetail(null, 'selectGuaranteeType');
                }
            }else{
                createAlertGuaranteeTypeDetail(null, 'selectGuaranteeType');
            }
        }

        function removeGuaranteeTypeDetail(guaranteeTypeDetail){
            var modal = getModalDeleteGuaranteeTypeDetail(guaranteeTypeDetail);
            modal.result.then(onDeleteGuaranteeTypeDetail, onCancelDeleteGuaranteeTypeDetail);
        }

        function getModalDeleteGuaranteeTypeDetail(guaranteeTypeDetail){
            return $uibModal.open({
                templateUrl: 'app/entities/guarantee-det/delete-guaranteeTypeDetail-dialog.html',
                controller: 'RemoveGuaranteeTypeDetail',
                controllerAs: 'vm',
                size: 'md',
                resolve:{
                    entity : [function(){
                        return guaranteeTypeDetail;
                    }]
                }
            });
        }

        function onDeleteGuaranteeTypeDetail(result){
            if(angular.isDefined(result) && result !== null){
                if(result.id !== null){
                    vm.guaranteeTypeDetailsDeleted.push(result);
                }
                vm.guaranteeTypes.push(result.guaranteeType);
                vm.requirement.requirementData.guaranteeTypeDetails.splice(result, 1);
            }
        }

        function onCancelDeleteGuaranteeTypeDetail(){

        }

        function checkMultiyear(){
            if(!angular.isUndefined(vm.isCheckedMultiyear)) {
                if (!vm.isCheckedMultiyear) {
                    if (vm.requirement.requirementData.multiyear) {
                        if (vm.requirement.requirementData.multiyearDetails && vm.requirement.requirementData.multiyearDetails.length > 0) {
                            vm.requirement.requirementData.multiyear = false;
                            var modal = getModalDeleteMultiyearDetail('reset', null, null);
                            modal.result.then(onResetMultiyearDetails, onCancelResetMultiyearDetails);
                        } else {
                            cleanContractTypeSelected();
                            vm.requirement.requirementData.multiyear = false;
                        }
                    }
                } else {
                    vm.requirement.requirementData.multiyear = true;
                }
            }
        }

        function onResetMultiyearDetails(){
            onCleanMultiyearDetails();
            if(vm.requirement.requirementData.contractType !== null && vm.requirement.requirementData.contractType.id !== null){
                cleanContractTypeSelected();
            }
            vm.requirement.requirementData.multiyear = false;
        }

        function onCancelResetMultiyearDetails(){
            vm.isCheckedMultiyear = true;
            vm.requirement.requirementData.multiyear = true;
        }

        function cleanContractTypeSelected(){
            vm.requirement.requirementData.contractType = null;
            vm.contractTypeSelected = null;
            vm.requirement.requirementData.months = null;
        }

        function selectContractType(){
            if(angular.isDefined(vm.contractTypeSelected) && vm.contractTypeSelected.id !== null) {
                vm.requirement.requirementDetail.totalAmount = 0.0;
                vm.requirement.requirementDetail.minTotalAmount = 0.0;
                vm.requirement.requirementDetail.maxTotalAmount = 0.0;
                if(vm.requirement.requirementData.contractType === null){
                    vm.requirement.requirementData.contractType = angular.copy(vm.contractTypeSelected);
                    if(vm.alertsStaticContractTypeTotals.length > 0){
                        vm.alertsStaticContractTypeTotals = [];
                    }
                }
                if (vm.contractTypeSelected.id !== vm.requirement.requirementData.contractType.id) {
                    if(vm.requirement.requirementData.multiyearDetails.length > 0) {
                        cleanMultiyearDetails();
                    }else{
                        cleanMultiyearDetail();
                        vm.requirement.requirementData.contractType = angular.copy(vm.contractTypeSelected);
                    }
                }

                vm.isContractTypeClose = vm.contractTypeSelected.code === ContractTypeUtils.CLOSE.code;
            }else{
                vm.requirement.requirementData.contractType = null;
                if(vm.alertsStaticContractTypeTotals.length < 1) {
                    createAlertErrorStaticContractType(null, 'contractTypeRequired');
                }
            }
        }

        function cleanMultiyearDetails(){
            var modal = getModalDeleteMultiyearDetail('all', vm.contractTypeSelected, vm.requirement.requirementData.contractType);
            modal.result.then(onCleanMultiyearDetails, onCancelCleanMultiyearDetails);
        }

        function onCleanMultiyearDetails(){
            angular.forEach(vm.requirement.requirementData.multiyearDetails, function (multiyearDetail, index) {
                if (multiyearDetail.id !== null) {
                    vm.multiyearDetailsDeleted.push(multiyearDetail);
                }
            });
            if (vm.isContractTypeClose) {
                vm.totalAmount = parseFloat(0.0);
            } else {
                vm.totalMaxAmount = parseFloat(0.0);
                vm.totalMinAmount = parseFloat(0.0);
            }
            vm.requirement.requirementData.multiyearDetails.splice();
            vm.requirement.requirementData.multiyearDetails = [];
            cleanMultiyearDetail();
            vm.requirement.requirementData.contractType = angular.copy(vm.contractTypeSelected);
        }

        function onCancelCleanMultiyearDetails(){
            vm.contractTypeSelected = angular.copy(vm.requirement.requirementData.contractType);
        }

        function getModalDeleteMultiyearDetail(typeDeleted, contract1, contract2){
            return $uibModal.open({
                templateUrl: 'app/entities/multiyear-dtl/delete-multiyearDetail-dialog.html',
                controller: 'RemoveMultiyearDetail',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    typedeleted: [function() {
                        return typeDeleted;
                    }],
                    contract1: [function(){
                        return contract1;
                    }],
                    contract2: [function(){
                        return contract2;
                    }]
                }
            });
        }

        function addMultiyearDetail(){
            if(isValidMultiyearForm()) {
                var exist = $filter('findMultiyearDetail')(vm.requirement.requirementData.multiyearDetails, vm.multiyearDetail, vm.isContractTypeClose);
                if (!exist) {
                    if (vm.isUpdatedMultiyearDetail){
                        if(vm.multiyearDetail.id !== null) {
                            vm.multiyearDetailsUpdated.push(vm.multiyearDetail);
                        }
                        vm.isUpdatedMultiyearDetail = false;
                    }
                    vm.requirement.requirementData.multiyearDetails.push(vm.multiyearDetail);
                    if (vm.isContractTypeClose) {
                        vm.totalAmount += parseFloat(vm.multiyearDetail.totalAmount);
                    } else {
                        vm.totalMinAmount += parseFloat(vm.multiyearDetail.minAmount);
                        vm.totalMaxAmount += parseFloat(vm.multiyearDetail.maxAmount);
                    }
                    cleanMultiyearDetail();
                }else{
                    createAlertMultiyearDetail(null, 'alreadyExistDetail');
                }
            }
        }

        function removeMultiyearDetail(multiyearDetail, index){
            var modal = getModalDeleteMultiyearDetail('item', null, null);
            modal.result.then(
                function() {
                    if(multiyearDetail.id !== null){
                        if(vm.multiyearDetailsUpdated.length > 0){
                            var find = $filter('findInList')(vm.multiyearDetailsUpdated, multiyearDetail);
                            if(find !== null){
                                vm.multiyearDetailsUpdated.splice(find, 1);
                            }
                        }
                        vm.multiyearDetailsDeleted.push(multiyearDetail);
                    }
                    if(vm.isContractTypeClose){
                        if(vm.totalAmount === multiyearDetail.totalAmount){
                            vm.totalAmount = parseFloat(0.0);
                        }else{
                            vm.totalAmount -= multiyearDetail.totalAmount;
                        }
                    }else{
                        if(vm.totalMinAmount === multiyearDetail.maxAmount) {
                            vm.totalMaxAmount = parseFloat(0.0);
                            vm.totalMinAmount = parseFloat(0.0);
                        } else {
                            vm.totalMaxAmount -= multiyearDetail.maxAmount;
                            vm.totalMinAmount -= multiyearDetail.minAmount;
                        }
                    }
                    vm.requirement.requirementData.multiyearDetails.splice(index,1);
                },
                function() { }
            );
        }

        function editMultiyearDetail(multiyearDetail, index) {
            if(vm.isUpdatedMultiyearDetail){
                vm.multiyearDetail = angular.copy(vm.temporalMultiyearDetail);
                addMultiyearDetail();
            }
            vm.multiyearDetail = angular.copy(multiyearDetail);
            vm.temporalMultiyearDetail = angular.copy(multiyearDetail);
            if (vm.isContractTypeClose) {
                if(vm.totalAmount !== multiyearDetail.totalAmount) {
                    vm.totalAmount -= multiyearDetail.totalAmount;
                }else{
                    vm.totalAmount = parseFloat(0.0);
                }
            }else{
                if(vm.totalMinAmount !== multiyearDetail.minAmount) {
                    vm.totalMinAmount -= multiyearDetail.minAmount;
                    vm.totalMaxAmount -= multiyearDetail.maxAmount;
                }else{
                    vm.totalMinAmount = vm.totalMaxAmount = parseFloat(0.0);
                }
            }

            vm.requirement.requirementData.multiyearDetails.splice(index, 1);
            vm.isUpdatedMultiyearDetail = true;
        }

        function cancelUpdateMultiyearDetail(){
            if(vm.temporalMultiyearDetail !== null){
                vm.multiyearDetail = angular.copy(vm.temporalMultiyearDetail);
                vm.temporalMultiyearDetail = null;
                addMultiyearDetail();
            }
        }

        function isValidMultiyearForm() {
            var isValid = true;

            if(vm.multiyearDetail.budget === null || vm.multiyearDetail.budget.trim().length === 0){
                isValid = false;
            }

            if(vm.multiyearDetail.fiscalYear === null || vm.multiyearDetail.fiscalYear.trim().length === 0) {
                isValid = false;
            }

            if(parseInt(vm.requirement.requirementData.months) === 0){
                createAlertMultiyearDetail({typeZero: '0', field: $filter('translate')('adqApp.requirement.data.multiyearDetail.months')}, 'notZero');
                isValid = false;
            }

            if(vm.isContractTypeClose) {
                if(vm.multiyearDetail.totalAmount === null){
                    isValid=false;
                }else{
                    if(parseFloat(vm.multiyearDetail.totalAmount) === 0.0){
                        createAlertMultiyearDetail({typeZero:'0.0', field: $filter('translate')('adqApp.requirement.data.multiyearDetail.totalAmount')},'notZero');
                        isValid = false;
                    }
                }
            }else{
                if (vm.multiyearDetail.maxAmount === null) {
                    isValid = false;
                }else{
                    if(parseFloat(vm.multiyearDetail.maxAmount) === 0.0){
                        createAlertMultiyearDetail({typeZero: '0.0', field: $filter('translate')('adqApp.requirement.data.multiyearDetail.maxAmount')}, 'notZero');
                        isValid = false;
                    }
                }
                if (vm.multiyearDetail.minAmount === null) {
                    isValid = false;
                }else{
                    if(parseFloat(vm.multiyearDetail.minAmount) === 0.0){
                        createAlertMultiyearDetail({typeZero: '0.0',field: $filter('translate')('adqApp.requirement.data.multiyearDetail.minAmount')},'notZero');
                        isValid = false;
                    }
                }

                if(isValid){
                    if(vm.multiyearDetail.minAmount > vm.multiyearDetail.maxAmount){
                        isValid = false;
                        createAlertMultiyearDetail(null,'maxAmountLessThanMinAmount');
                    }
                }
            }
            return isValid;
        }

        // --------------------------- Requirement Detail --------------------------

        var formRequirementDetail = null;
        var formBudgetReqDetForm = null;
        function initRequirementDetail(){
            if (vm.contractTypeSelected === null) {
                createAlertErrorStaticContractType(null, 'contractTypeRequired');
            }

            if(!vm.isNewRequirementDetail){
                //if(vm.requirement.status.code === StatusUtils.APPROVE.code) {
                    vm.isRequirementAproved = true;
                    cleanFormalizationReqDet();
                    //Formalization.getByRequirementDetail({id: vm.requirement.requirementDetail.id}, onSuccessLoadFormalization, onErrorLoadFormalization);
                    Supplier.query({'deleted.equals': loadRecordsDeleted}, onSuccessLoadSupplier, onErrorLoadSupplier);
                //}
                vm.isAgreementModified = vm.requirement.agreement.code === AgreementTypeUtils.MODIFIED_AGREEMENT.code;
                Budget.getByRequirementDetail({id: vm.requirement.requirementDetail.id}, onSuccessLoadBudget, onErrorLoadBudget);
                //Specification.getByRequirementDetail({id: vm.requirement.requirementDetail.id}, onSuccessLoadSpecification, onErrorLoadSpecification);
            }else{
                cleanFooterTotalsBudget();
            }

            PaymentCondition.query({}, onSuccessLoadPaymentCondition, onErrorLoadPaymentCondition);
            DocumentTypeRequirementDetail.query({}, onSuccessLoadDocumentTypeReqDet, onErrorLoadDocumentTypeReqDet);
            formRequirementDetail = $scope.editForm.requirementDetailForm;
        }

        function onSuccessLoadBudget(data, header){
            vm.formalizations = [];
            vm.requirement.requirementDetail.formalizations = [];
            vm.requirement.requirementDetail.budgets = data;
            vm.requirement.requirementDetail.specifications = [];
            cleanFooterTotalsBudget();
            var totalItems = parseInt(header('X-Total-Count'));
            if (totalItems > 0) {
                angular.forEach(data, function (item, index) {
                    if (item.iva) {
                        vm.totalBudgetReqDet[iva].total += parseFloat(item.ivaTotal);
                    }
                    var item_otherCharges = parseInt(item.otherCharges);
                    if (item_otherCharges > 0) {
                        vm.totalBudgetReqDet[otherCharges].total += parseFloat(item.totalOtherCharges);
                    }
                    vm.totalBudgetReqDet[subtotal].total += parseFloat(item.subtotal);
                    vm.totalBudgetReqDet[total].total += parseFloat(item.amount);
                    vm.currentBudgetOrder = vm.currentBudgetOrder > item.budgetOrder ? vm.currentBudgetOrder : item.budgetOrder;
                    if(item.characteristic !== null){
                        var newSpecification = angular.copy(item.characteristic);
                        newSpecification.budget = item;
                        vm.requirement.requirementDetail.specifications.push(angular.copy(newSpecification));
                    }
                    if(item.formalization !== null){
                        var getFormalization = $filter('findFormalization')(vm.requirement.requirementDetail.formalizations, item.formalization);
                        if(getFormalization !== null){
                            getFormalization.budgets.push(angular.copy(item));
                        }else{
                            var newFormalization = angular.copy(item.formalization);
                            newFormalization.budgets = [];
                            newFormalization.budgets.push(item);
                            vm.requirement.requirementDetail.formalizations.push(newFormalization);
                        }
                        var formalization = angular.copy(item.formalization);
                        formalization.budget = item;
                        vm.formalizations.push(formalization);
                    }
                });
            }
        }

        function onErrorLoadBudget(data){
            console.log(data);
        }

        function onSuccessLoadFormalization(data, header){
            vm.formalizations = [];
            console.log(data);
            angular.forEach(data, function(formalization, indexFormalization){
                angular.forEach(formalization.budgets, function(budget, indexBudget){
                    var newFormalization = {
                        budget: formalization.budget,
                        supplier: formalization.supplier,
                        orderNumber: formalization.orderNumber,
                        id: formalization.id
                    };
                    vm.formalizations.push(newFormalization);
                });
            });
            if(vm.formalizations.length > 0){
                vm.requirement.requirementDetail.formalizations = data;
            }else{
                vm.requirement.requirementDetail.formalizations = [];
            }
        }

        function onErrorLoadFormalization(data){
            console.log(data);
        }

        function onSuccessLoadSpecification(data, header){
            vm.requirement.requirementDetail.specifications = data;
        }

        function onErrorLoadSpecification(data){
            console.log(data);
        }

        function onSuccessLoadSupplier(result, header){
            vm.suppliers = result;
        }

        function onErrorLoadSupplier(result){
            console.log(result);
        }

        function onSuccessLoadPaymentCondition(data, header){
            vm.paymentConditions = data;
        }

        function onErrorLoadPaymentCondition(data){
            console.log(data);
        }

        function onSuccessLoadDocumentTypeReqDet(data, header){
            vm.documentsTypeReqDet = data;
        }

        function onErrorLoadDocumentTypeReqDet(data){
            console.log(data);
        }

        function validateDates(){
            if(angular.isDefined(vm.requirement.requirementDetail.initialDate) &&
                angular.isDefined(vm.requirement.requirementDetail.finalDate)){
                if(vm.requirement.requirementDetail.finalDate !== null && vm.requirement.requirementDetail.initialDate !== null){
                    setStatusInvalidDate(false, false);
                }else if(vm.requirement.requirementDetail.initialDate !== null){
                    setStatusInvalidDate(false, true);
                }else if(vm.requirement.requirementDetail.finalDate !== null){
                    setStatusInvalidDate(true, false);
                }
            }else{
                setStatusInvalidDate(false, false);
            }
        }

        function setStatusInvalidDate(initial, final){
            vm.isInitialDateRequired = initial;
            vm.isFinalDateRequired = final;
            setClassErrorField('initialDate', initial);
            setClassErrorField('finalDate', final);
        }

        function isValidRequirementDetailForm(){
            var isValid = true;
            setClassErrorField('finalDate', false);
            if(vm.requirement.requirementDetail.finalDate < vm.requirement.requirementDetail.initialDate){
                if(tabindex === tabIndexRequirementDetail){
                    createAlertErrorRequirementDetail(null, 'finalDateBeforeInitial');
                }else{
                    createAlertGeneralError(null, 'adqApp.requirement.detail.validation.finalDateBeforeInitial');
                }
                setClassErrorField('finalDate', true);
                isValid = false;
            }
            return isValid;
        }

        // -------------- Fin RequirementDetail -------------

        //--------------------------- Budget -----------------------------

        function cleanFooterTotalsBudget(){
            var title = 'adqApp.requirement.detail.budgets.';
            footerSubtotal = {totalType: title + 'subtotal', total: 0.0};
            footerIva = {totalType: title + 'ivaTotal', total: 0.0};
            footerOtherCharges = {totalType:  title + 'totalOtherCharges', total: 0.0};
            footerTotal= {totalType: title + 'amount', total: 0.0};
            vm.totalBudgetReqDet = [];
            vm.totalBudgetReqDet.push(footerSubtotal);
            vm.totalBudgetReqDet.push(footerIva);
            vm.totalBudgetReqDet.push(footerOtherCharges);
            vm.totalBudgetReqDet.push(footerTotal);
        }

        function cleanBudgetReqDet(){
            vm.budgetReqDet = {
                characteristic: null,
                budgetOrder: null,
                codeCuCop: null,
                budget: null,
                descriptionCuCop: null,
                description: null,
                unitMeasure: null,
                quantity: 0.0,
                unitPrice: 0.0,
                subtotal: 0.0,
                iva: false,
                ivaTotal: 0.0,
                otherCharges: 0,
                totalOtherCharges: 0.0,
                amount: 0.0,
                id: null
            };
        }

        function calculateTotal() {
            if(angular.isDefined(vm.budgetReqDet)) {
                var quantity = parseFloat(vm.budgetReqDet.quantity);
                var unitPrice = parseFloat(vm.budgetReqDet.unitPrice);
                if (quantity > 0.0 && unitPrice > 0.0) {
                    vm.budgetReqDet.subtotal = parseFloat(quantity * unitPrice).toFixed(2);
                    if (vm.budgetReqDet.iva) {
                        vm.budgetReqDet.ivaTotal = parseFloat(.16 * vm.budgetReqDet.subtotal).toFixed(2);
                    } else {
                        vm.budgetReqDet.ivaTotal = 0.0;
                    }
                    var otherCharges = parseInt(vm.budgetReqDet.otherCharges);
                    if (otherCharges > 0 && otherCharges <= 100) {
                        vm.budgetReqDet.totalOtherCharges = parseFloat((otherCharges / 100) * vm.budgetReqDet.subtotal).toFixed(2);
                    } else {
                        vm.budgetReqDet.totalOtherCharges = 0.0;
                    }

                    vm.budgetReqDet.amount = parseFloat(vm.budgetReqDet.subtotal) + parseFloat(vm.budgetReqDet.ivaTotal) + parseFloat(vm.budgetReqDet.totalOtherCharges);
                    vm.budgetReqDet.amount.toFixed(2);
                }
            }
        }

        function addBudgetReqDet(){
            if(!isValidBudgetForm()){
                return;
            }
            resetFieldsEmptyBudget();
            var exist = $filter('containsElement')(vm.requirement.requirementDetail.budgets, vm.budgetReqDet);
            if(!exist) {
                if (vm.isUpdatedBudgetReqDet) {
                    if (vm.budgetReqDet.id !== null) {
                        vm.budgetsUpdate.push(vm.budgetReqDet);
                    }
                    vm.isUpdatedBudgetReqDet = false;
                }
                if(vm.budgetReqDet.id === null && vm.budgetReqDet.budgetOrder === null) {
                    vm.currentBudgetOrder++;
                    vm.budgetReqDet.budgetOrder = angular.copy(vm.currentBudgetOrder);
                }
                vm.requirement.requirementDetail.budgets.push(vm.budgetReqDet);
                vm.totalBudgetReqDet[subtotal].total += parseFloat(vm.budgetReqDet.subtotal);
                vm.totalBudgetReqDet[iva].total += parseFloat(vm.budgetReqDet.ivaTotal);
                vm.totalBudgetReqDet[otherCharges].total += parseFloat(vm.budgetReqDet.totalOtherCharges);
                vm.totalBudgetReqDet[total].total += parseFloat(vm.budgetReqDet.amount);
                cleanBudgetReqDet();
            }else{
                createAlertErrorBudget(null, "exist");
            }
        }

        function isValidBudgetForm(){
            var isValid = true;
            if(fieldIsNullOrEmptyRequired(vm.budgetReqDet.codeCuCop, 'codeCuCop')){
                isValid = false;
            }

            if(fieldIsNullOrEmptyRequired(vm.budgetReqDet.description, 'description')){
                isValid = false;
            }

            if(fieldIsNullOrEmptyRequired(vm.budgetReqDet.quantity, 'quantity')){
                isValid = false;
                createAlertErrorBudget({field: $filter('translate')('adqApp.requirement.detail.budgets.quantity')}, 'notZero');
            }

            if(fieldIsNullOrEmptyRequired(vm.budgetReqDet.unitPrice, 'unitPrice')){
                isValid = false;
                createAlertErrorBudget({field: $filter('translate')('adqApp.requirement.detail.budgets.unitPrice')}, 'notZero');
            }

            return isValid;
        }

        function resetFieldsEmptyBudget(){
            if(!vm.budgetReqDet.budget){
                vm.budgetReqDet.budget = null;
            }

            if(!vm.budgetReqDet.descriptionCuCop){
                vm.budgetReqDet.descriptionCuCop = null;
            }

            if(!vm.budgetReqDet.unitMeasure){
                vm.budgetReqDet.unitMeasure = null;
            }
        }

        function updateBudgetReqDet(budgetReqDet, index){
            if(vm.isUpdatedBudgetReqDet){
                vm.budgetReqDet = angular.copy(vm.temporalBudgetReqDet);
                addBudgetReqDet();
            }
            vm.budgetReqDet = angular.copy(budgetReqDet);
            vm.temporalBudgetReqDet = angular.copy(budgetReqDet);
            removeBudgetFromList(vm.budgetReqDet, index);
            vm.isUpdatedBudgetReqDet = true;
        }

        function cancelUpdateBudgetReqDet(){
            if(vm.temporalBudgetReqDet !== null){
                vm.budgetReqDet = angular.copy(vm.temporalBudgetReqDet);
                vm.temporalBudgetReqDet = null;
                addMultiyearDetail();
            }
        }

        function deleteBudgetReqDet(budget, index){
            var modal = getModalDeleteBudgetReqDet(budget, index);
            modal.result.then(onDeleteBudgetReqDet, onCancelDeleteBudgetReqDet);
        }

        function getModalDeleteBudgetReqDet(budget, index){
            return $uibModal.open({
                templateUrl: 'app/entities/budget/budget-delete-dialog.html',
                controller: 'BudgetDeleteController',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    budget: [function() {
                        return budget;
                    }],
                    budgetIndex: [function(){
                        return index;
                    }]
                }
            });
        }

        function onDeleteBudgetReqDet(result){
            if(angular.isDefined(result) && result !== null){
                if(result.budget.id !== null){
                    if(vm.budgetsUpdate.length > 0){
                        var find = $filter('findInList')(vm.budgetsUpdate, result.budget);
                        if(find !== null){
                            vm.budgetsUpdate.splice(find, 1);
                        }
                    }
                    vm.budgetsDelete.push(result.budget);
                }
                removeBudgetFromList(result.budget, result.budgetIndex);
            }
        }

        function onCancelDeleteBudgetReqDet(result){
            console.log(result);
        }

        function removeBudgetFromList(item, index){
            vm.totalBudgetReqDet[subtotal].total -= parseFloat(item.subtotal);
            vm.totalBudgetReqDet[iva].total -= parseFloat(item.ivaTotal);
            vm.totalBudgetReqDet[otherCharges].total -= parseFloat(item.totalOtherCharges);
            vm.totalBudgetReqDet[total].total -= parseFloat(item.amount);
            vm.requirement.requirementDetail.budgets.splice(index, 1);
        }

        //-------------------------- End Budget --------------------------

        // --------------------------- Formalization ------------------------

        function cleanFormalizationReqDet(){
            vm.formalizationReqDet = {
                budget: {
                    budgetOrder: null
                },
                supplier: null,
                orderNumber: null,
                id: null
            };
        }

        vm.formalizations= [];
        function cleanBudgetFormalizationReqDet(){
            vm.formalizationReqDet.budget = {
                budgetOrder: null
            };
        }

        function addFormalizationReqDet(){
            if(!isFormalizationReqDetFormValid()){
                return;
            }
            var getBudget = $filter('existBudget')(vm.requirement.requirementDetail.budgets, vm.formalizationReqDet.budget);
            if(getBudget !== null) {
                var budgetAlreadyExist = $filter('formalizationContainsBudget')(vm.requirement.requirementDetail.formalizations, vm.formalizationReqDet);
                if (!budgetAlreadyExist) {
                    var getFormalization = $filter('findFormalization')(vm.requirement.requirementDetail.formalizations, vm.formalizationReqDet);
                    if(getFormalization !== null){
                        getFormalization.budgets.push(angular.copy(getBudget));
                    }else{
                        var newFormalization = angular.copy(vm.formalizationReqDet);
                        newFormalization.budgets = [];
                        newFormalization.budgets.push(getBudget);
                        vm.requirement.requirementDetail.formalizations.push(newFormalization);
                    }
                    if (vm.isUpdateFormalizationReqDet) {
                        if (vm.formalizationReqDet.id !== null) {
                            if(vm.formalizationReqDet.id !== getBudget.formalization.id) {
                                getBudget.formalization = null;
                                vm.budgetsUpdate.push(getBudget);
                                var positions = $filter('findPositionFormalizationBudget')(vm.requirement.requirementDetail.formalizations, vm.formalizationReqDet);
                                if(positions !== null) {
                                    vm.requirement.requirementDetail.formalizations[positions.formalization].budgets.splice(positions.budget, 1);
                                    if (vm.requirement.requirementDetail.formalizations[positions.formalization].budgets.length === 0) {
                                        vm.requirement.requirementDetail.formalizations.splice(positions.formalization, 1);
                                    }
                                }
                            }
                            //vm.formalizationsUpdated.push(angular.copy(vm.formalizationReqDet));
                        }
                        vm.isUpdateFormalizationReqDet = false;
                    }
                    vm.formalizationReqDet.budget = angular.copy(getBudget);
                    vm.formalizations.push(angular.copy(vm.formalizationReqDet));
                    cleanBudgetFormalizationReqDet();
                } else{
                    createAlertErrorFormalization(null, 'budgetAlreadyExist');
                }
            }else {
               createAlertErrorFormalization(null, "notExist");
            }
        }

        function isFormalizationReqDetFormValid(){
            var isValid = true;
            if(vm.formalizationReqDet.budget === null || vm.formalizationReqDet.budget.budgetOrder === null){
                isValid = false;
                setClassErrorField('formalizationBudget', true);
            }else{
                setClassErrorField('formalizationBudget', false);
            }
            if(vm.formalizationReqDet.supplier === null || vm.formalizationReqDet.supplier.id === null){
                isValid = false;
                setClassErrorField('supplier', true);
            }else{
                setClassErrorField('supplier', false);
            }

            if(fieldIsNullOrEmptyRequired(vm.formalizationReqDet.orderNumber, 'orderNumber')) {
                isValid = false;
            }

            return isValid;
        }

        function updateFormalizationReqDet(formalizationReqDet, index){
            if(vm.isUpdateFormalizationReqDet){
                vm.formalizationReqDet = angular.copy(vm.formalizationReqDetTemporal);
                addFormalizationReqDet();
            }
            vm.formalizationReqDet = angular.copy(formalizationReqDet);
            vm.formalizationReqDetTemporal = angular.copy(formalizationReqDet);
            ////if(positionFormalization !== null){
                //vm.requirement.requirementDetail.formalizations[positionFormalization.formalization].budgets.splice(positions.budget, 1);
            vm.formalizations.splice(index, 1);
                //if(vm.requirement.requirementDetail.formalizations[positions.formalization].budgets.length === 0){
                    //vm.requirement.requirementDetail.formalizations.splice(positions.formalization, 1);
                //}else{

                    //console.log('Size: ' + vm.requirement.requirementDetail.formalizations[positions.formalization].budgets.length);
                //}
            //}else{
            //    alert('Not found');
            //}
            vm.isUpdateFormalizationReqDet = true;
        }

        function cancelUpdateFormalizationReqDet(){
            if(vm.formalizationReqDetTemporal !== null){
                vm.formalizationReqDet = angular.copy(vm.formalizationReqDetTemporal);
                vm.formalizationReqDetTemporal = null;
                addFormalizationReqDet();
            }
        }

        function deleteFormalizationReqDet(formalization, index){
            var modal = getModalDeleteFormalizationReqDet(formalization, index);
            modal.result.then(onDeleteFormalizationReqDet, onCancelDeleteFormalizationReqDet);
        }

        function getModalDeleteFormalizationReqDet(formalization, index){
            return $uibModal.open({
                templateUrl: 'app/entities/formalization/formalization-delete-dialog.html',
                controller: 'FormalizationDeleteController',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    formalization: [function() {
                        return formalization;
                    }],
                    formalizationIndex: [function(){
                        return index;
                    }]
                }
            });
        }

        function onDeleteFormalizationReqDet(result){
            if(angular.isDefined(result) && result !== null){
                //if(result.formalization.id !== null){
                    /*if(vm.formalizationsUpdated.length > 0){
                        var find = $filter('findInList')(vm.budgetsUpdate, result.formalization.budget);
                        if(find !== null){
                            vm.budgetsDelete.splice(find, 1);
                        }
                    }*/
                    if(result.formalization.budget.formalization !== null) {
                        vm.budgetsDelete.push(result.formalization.budget);
                    }
                    //vm.formalizationsDeleted.push(result.formalization);
                //}
                var positions = $filter('findFormalization')(vm.requirement.requirementDetail.formalizations, vm.formalizationReqDet);
                if(positions !== null){
                    vm.requirement.requirementDetail.formalizations[positions.formalization].budgets.splice(positions.budget, 1);
                    vm.formalizations.splice(index, 1);
                    if(vm.requirement.requirementDetail.formalizations[positions.formalization].budgets.length === 0){
                        vm.requirement.requirementDetail.formalizations.splice(positions.formalization, 1);
                    }else{
                        vm.formalizationsDeleted.push(vm.requirement.requirement.formalizations[positions.formalization]);
                        //console.log('Size: ' + vm.requirement.requirementDetail.formalizations[positions.formalization].budgets.length);
                    }
                }else{
                    alert('Not found');
                }
                //vm.requirement.requirementDetail.formalizations.splice(result.index, 1);
            }
        }

        function onCancelDeleteFormalizationReqDet(result){
            console.log(result);
        }

        //-------------------- End formalization ---------------------------

        //---------------------- Specification -------------------------------

        function cleanSpecificationReqDet() {
            vm.specificationReqDet = {
                budget: {
                    budgetOrder: null
                },
                specification1: null,
                specification2: null,
                specification3: null,
                id: null
            };
        }

        function addSpecificationReqDet(){
            if(!isSpecificationReqDetFormValid()){
                return;
            }
            var getBudget = $filter('existBudget')(vm.requirement.requirementDetail.budgets, vm.specificationReqDet.budget);
            if(getBudget !== null) {
                if(getBudget.characteristic === null) {
                    if (vm.isUpdateSpecificationReqDet) {
                        if (vm.specificationReqDet.id !== null) {
                            vm.specificationsUpdated.push(vm.specificationReqDet);
                        }
                        vm.isUpdateSpecificationReqDet = false;
                    }
                    var find = $filter('findInList')(vm.budgetsUpdate, getBudget);
                    if(find !== null){
                        vm.budgetsUpdate.splice(find, 1);
                    }
                    getBudget.characteristic = angular.copy(vm.specificationReqDet);
                    vm.requirement.requirementDetail.specifications.push(angular.copy(vm.specificationReqDet));
                    cleanSpecificationReqDet();
                }else{
                    createAlertErrorSpecification(null, 'budgetAlreadyExist');
                }
            }else{
                createAlertErrorSpecification(null, "exist");
            }
        }

        function isSpecificationReqDetFormValid(){
            var isValid = true;

            if(!vm.specificationReqDet.specification1 && !vm.specificationReqDet.specification2 && !vm.specificationReqDet.specification3){
                isValid = false;
            } else if(angular.isDefined(vm.specificationReqDet.specification1) && vm.specificationReqDet.specification1 !== null){
                if(vm.specificationReqDet.specification1.trim().length === 0) {
                    vm.specificationReqDet.specification1=null;
                    isValid = false;
                }
                if (!vm.specificationReqDet.specification2) {
                    vm.specificationReqDet.specification2 = null;
                } else{
                    isValid = true;
                }

                if (!vm.specificationReqDet.specification3) {
                    vm.specificationReqDet.specification3 = null;
                }else{
                    isValid = true;
                }
            }else if(angular.isDefined(vm.specificationReqDet.specification2) && vm.specificationReqDet.specification2 !== null) {
                if (vm.specificationReqDet.specification2.trim().length === 0) {
                    vm.specificationReqDet.specification2 = null;
                    isValid = false;
                }

                if (!vm.specificationReqDet.specification1) {
                    vm.specificationReqDet.specification1 = null;
                }else{
                    isValid = true;
                }

                if (!vm.specificationReqDet.specification3) {
                    vm.specificationReqDet.specification3 = null;
                }else{
                    isValid = true;
                }
            } else if(angular.isDefined(vm.specificationReqDet.specification3) && vm.specificationReqDet.specification3 !== null) {
                if (vm.specificationReqDet.specification3.trim().length === 0) {
                    vm.specificationReqDet.specification3 = null;
                    isValid = false;
                }

                if (!vm.specificationReqDet.specification1) {
                    vm.specificationReqDet.specification1 = null;
                }else{
                    isValid = true;
                }

                if (!vm.specificationReqDet.specification2) {
                    vm.specificationReqDet.specification2 = null;
                }else{
                    isValid = true;
                }
            }
            setClassErrorSpecificationForm(isValid);
            if(vm.specificationReqDet.budget.budgetOrder !== null && vm.specificationReqDet.budget !== null) {
                if (parseInt(vm.specificationReqDet.budget.budgetOrder) <= 0) {
                    isValid = false;
                    createAlertErrorSpecification(null, 'notZero');
                    setClassErrorField('specificationBudget', true);
                } else {
                    setClassErrorField('specificationBudget', false);
                }
            }else{
                setClassErrorField('specificationBudget', true);
            }
            return isValid;
        }

        function setClassErrorSpecificationForm(isValid){
            setClassErrorField('specification1', !isValid);
            setClassErrorField('specification2', !isValid);
            setClassErrorField('specification3', !isValid);
            if(!isValid) {
                createAlertErrorSpecification(null, "almostOneSpecificationIsRequired");
            }
        }

        function updateSpecificationReqDet(specificationReqDet, index){
            var getBudget = $filter('existBudget')(vm.requirement.requirementDetail.budgets, specificationReqDet.budget);
            if(getBudget !== null){
                if(vm.isUpdateSpecificationReqDet){
                    vm.specificationReqDet = angular.copy(vm.specificationReqDetTemporal);
                    addSpecificationReqDet();
                }
                vm.specificationReqDet = angular.copy(specificationReqDet);
                vm.specificationReqDetTemporal = angular.copy(specificationReqDet);
                vm.requirement.requirementDetail.specifications.splice(index, 1);
                getBudget.characteristic = null;
                vm.isUpdateSpecificationReqDet = true;
            }else{
                alert('Error seleccionar esta especification');
            }
        }

        function cancelUpdateSpecificationReqDet(){
            if(vm.specificationReqDetTemporal !== null){
                vm.specificationReqDet = angular.copy(vm.specificationReqDetTemporal);
                vm.specificationReqDetTemporal = null;
                addSpecificationReqDet();
            }
        }

        function deleteSpecificationReqDet(specificationReqDet, index){
            var modal = getModalDeleteSpecificationReqDet(specificationReqDet, index);
            modal.result.then(onDeleteSpecificationReqDet, onCancelDeleteSpecificationReqDet);
        }

        function getModalDeleteSpecificationReqDet(specification, index){
            return $uibModal.open({
                templateUrl: 'app/entities/specification/specification-delete-dialog.html',
                controller: 'SpecificationDeleteController',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    specification: [function() {
                        return specification;
                    }],
                    specificationIndex: [function(){
                        return index;
                    }]
                }
            });
        }

        function onDeleteSpecificationReqDet(result){
            if(angular.isDefined(result) && result !== null){
                if(result.specification.id !== null){
                    if(vm.specificationsUpdated.length > 0){
                        var find = $filter('findInList')(vm.specificationsUpdated, result.specification);
                        if(find !== null){
                            vm.specificationsUpdated.splice(find, 1);
                        }
                    }
                    vm.specificationsDeleted.push(result.specification);
                }
                var specification = vm.requirement.requirementDetail.specifications[result.index];
                if(specification !== null) {
                    var getBudget = $filter('existBudget')(vm.requirement.requirementDetail.budgets, specification.budget);
                    if(getBudget !== null) {
                        getBudget.characteristic = null;
                        vm.budgetsUpdate.push(angular.copy(getBudget));
                        vm.requirement.requirementDetail.specifications.splice(result.index, 1);
                    }
                }
            }
        }

        function onCancelDeleteSpecificationReqDet(result){
            console.log(result);
        }

        // --------------------- End Specification ------------------------

        // ----------------- Validation--------------------
        function fieldIsNullOrEmptyRequired(value, field){
            var isValid = false;
            if(!value){
                isValid = true;
            }
            setClassErrorField(field, isValid);
            return isValid;
        }

        function setClassErrorField(field, invalid){
            var element = angular.element('#item_'+ field);
            angular.isElement(element[0]);
            if(angular.isElement(element[0])) {
                if (element[0].classList.contains('has-error')) {
                    if (!invalid) {
                        element[0].classList.remove('has-error');
                    }
                } else {
                    if (invalid) {
                        element[0].classList.add('has-error');
                    }
                }
            }

            if(field.toLowerCase().indexOf('date') !== -1){
                var btnDate = angular.element('#btnDate_' + field);
                if(angular.isElement(btnDate[0])) {
                    if (btnDate[0].classList.contains('btn-default')) {
                        if (invalid) {
                            btnDate[0].classList.remove('btn-default');
                            btnDate[0].classList.add('btn-danger');
                        }
                    } else {
                        if (!invalid) {
                            btnDate[0].classList.remove('btn-danger');
                            btnDate[0].classList.add('btn-default');
                        }
                    }
                }
            }
        }

        //------------ End Validation ---------------

        //--------------- Alerts --------------------
        function createAlertGeneralError(params, msg){
            createAlertError(params, msg, vm.alertsGeneral);
        }

        function createAlertGuaranteeTypeDetail(params, typeValidation){
            createAlertError(params, 'adqApp.requirement.data.guaranteeTypeDetail.validation.' + typeValidation, vm.alertsGuaranteeTypeDetail);
        }

        function createAlertMultiyearDetail(params, typeValidation){
            createAlertError(params, 'adqApp.requirement.data.multiyearDetail.validation.' + typeValidation, vm.alertsMultiyearDetail);
        }

        function createAlertErrorRequirementDetail(params, typeError){
            createAlertError(params, 'adqApp.requirement.detail.validation.' + typeError, vm.alertsRequirementDetail);
        }

        function createAlertErrorStaticContractType(params, typeError){
            createAlertErrorStatic(params, 'adqApp.requirement.detail.validation.' + typeError, vm.alertsStaticContractTypeTotals);
        }

        function createAlertErrorBudget(params, typeValidation){
            createAlertError(params, 'adqApp.requirement.detail.budgets.validation.' + typeValidation, vm.alertsBudgets);
        }

        function createAlertErrorFormalization(params, typeError){
            createAlertError(params, 'adqApp.requirement.detail.formalizations.validation.' + typeError, vm.alertsFormalizations);
        }

        function createAlertErrorSpecification(params, typeError){
            createAlertError(params,'adqApp.requirement.detail.specifications.validation.' + typeError, vm.alertsSpecifications);
        }

        function createAlertErrorStatic(params, msg, list){
            list.push(AlertService.add(
                {
                    type: "danger",
                    params: params,
                    msg: msg,
                    toast: AlertService.isToast(),
                    scoped: true,
                    timeout: 0
                }, list
            ));
        }

        function createAlertError(params, msg, list){
            list.push(AlertService.add(
                {
                    type: "danger",
                    params: params,
                    msg: msg,
                    toast: AlertService.isToast(),
                    scoped: true,
                    timeout: 15000
                }, list
            ));
        }

        //--------------- End Alerts ------------------

        loadApplicableArticles();

        function loadApplicableArticles() {
            ApplicableArticle.query(function(result) {
                vm.ApplicableArticles = result;
            });
        }

        vm.applicableArticleSelected = function () {
            ApplicableArtDocType.getByApplicableArticle({id: vm.requirement.applicableArticle.id},function(result) {
                vm.DocumentsToUpload = result;
            });
        };

        vm.upload = function (file, groupAA) {
            if(vm.isUserApplicant) {
                if(!vm.isBlock){
                if (file) {
                    var doc = {
                        'mime': file.type,
                        'size': file.size,
                        'name': file.name,
                        'isTemporal': true
                    };
                    DataUtils.toBase64WOonLoad(file, function (base64) {
                        doc.file = base64;
                        if (!groupAA.files) {
                            groupAA.files = [];
                            groupAA.files.push(doc);

                        } else {
                            groupAA.files.push(doc);
                        }
                    });
                }
                }else{

                }
            }else{
                showMessageHasNotPermission();
            }
        };

         vm.hasDocumentContract = !!vm.requirement.requirementDetail.document;
         vm.selectedContract = false;
         vm.uploadContract = function (file) {
            if((vm.isUserAdmin || vm.isUserHeadDepartment)) {
                if(!vm.isFormalized) {
                    if (file) {
                        vm.selectedContract = true;
                        vm.requirement.requirementDetail.mime = file.type;
                        vm.requirement.requirementDetail.size = file.size;
                        vm.requirement.requirementDetail.documentName = file.name;

                        DataUtils.toBase64WOonLoad(file, function (base64) {
                            vm.requirement.requirementDetail.document = base64;
                        });
                    }
                }
            }else{
                showMessageHasNotPermission();
            }
        };

         vm.hasFilesUploaded = function (groupAA) {


             var foundDocumentsUploaded =  [];
             if(vm.requisitionDocuments){
                 foundDocumentsUploaded =  vm.requisitionDocuments.filter(function (rd) {
                     return rd.documentType.id === groupAA.documentType.id;
                 });
             }


             return foundDocumentsUploaded.length > 0;
         };

         vm.approveFile = function (doc) {
             if(vm.isUserAdmin) {
                 approveDocumentValidation(doc);
             }else{
                 showMessageHasNotPermission();
             }

         };

        function approveDocumentValidation(doc){
            var modal = getModalApproveUploadedDocument(doc);
            modal.result.then(function () {
                RequisitionDocuments.approve({id: doc.id}, function (d) {
                    doc.approved = true;
                    doc = d;
                }, function (d) {
                    //err
                });
            }, function () {

            });
        }

        function getModalApproveUploadedDocument(document){
            return $uibModal.open({
                templateUrl: 'app/entities/requisition-documents/status/approve-requisition-document-dialog.html',
                controller: 'ApproveRequisitionDocumentModalController',
                controllerAs: 'vm',
                size: 'md',
                resolve:{
                    entity : [function(){
                        return document;
                    }]
                }
            });
        }

         vm.rejectFile = function (doc) {
             if(vm.isUserAdmin) {
                 rejectDocumentValidation(doc);
             }else{
                 showMessageHasNotPermission();
             }

         };

        function rejectDocumentValidation(doc){
            var modal = getModalRejectUploadedDocument(doc);
            modal.result.then(function () {
                RequisitionDocuments.reject({id: doc.id}, function (d) {
                    doc.approved = false;
                    doc = d;
                }, function (d) {
                    //err
                });
            }, function () {

            });
        }

        function getModalRejectUploadedDocument(document){
            return $uibModal.open({
                templateUrl: 'app/entities/requisition-documents/status/reject-requisition-document-dialog.html',
                controller: 'RejectRequisitionDocumentModalController',
                controllerAs: 'vm',
                size: 'md',
                resolve:{
                    entity : [function(){
                        return document;
                    }]
                }
            });
        }

        vm.deleteContract = function () {
            if((vm.isUserAdmin || vm.isUserHeadDepartment)) {
                if(!vm.isFormalized) {
                    vm.requirement.requirementDetail.mime = null;
                    vm.requirement.requirementDetail.size = null;
                    vm.requirement.requirementDetail.documentName = null;
                    vm.requirement.requirementDetail.document = null;
                    vm.hasDocumentContract = false;
                    vm.selectedContract = false;
                }else{
                    showMessageRequirementBlock();
                }
            }else{
                showMessageHasNotPermission();
            }
        };

        vm.openContract = function () {
            if(vm.isUserAdmin || vm.isUserHeadDepartment || vm.isUserReviewer) {
                if (!!vm.selectedContract) {
                    DataUtils.toBase64(vm.requirement.requirementDetail, function (base64) {
                        var ieVersion = BrowserUtils.detectIE();
                        if (ieVersion === false || ieVersion >= 12) {
                            DataUtils.openFile(vm.requirement.requirementDetail.mime, base64);
                        } else {
                            DataUtils.downloadFileIE(base64, vm.requirement.requirementDetail.mime, vm.requirement.requirementDetail.documentName);
                        }
                    })
                } else {
                    var ieVersion = BrowserUtils.detectIE();
                    if (ieVersion === false || ieVersion >= 12) {
                        DataUtils.openFile(vm.requirement.requirementDetail.mime, vm.requirement.requirementDetail.document);
                    } else {
                        DataUtils.downloadFileIE(vm.requirement.requirementDetail.document, vm.requirement.requirementDetail.mime, vm.requirement.requirementDetail.documentName);
                    }
                }
            }else{
                showMessageHasNotPermission();
            }
        };

        vm.deleteTemporalFile = function (index, groupAA) {
            if(vm.isUserApplicant) {
                _.pullAt(groupAA.files, [index]);
            }else{
                showMessageHasNotPermission();
            }
        };

        vm.deleteUploadedFile = function (index, groupAA) {
            if(vm.isUserApplicant) {
                if(!vm.isBlock) {
                    var cGroupAA = angular.copy(vm.requisitionDocuments);

                    var filesToDelete = _.pullAt(cGroupAA, [index]);
                    removeDocumentValidation(filesToDelete);
                }else{
                    showMessageRequirementBlock();
                }
            }else{
                showMessageHasNotPermission();
            }
        };

        vm.openFile = function (document) {
            if(vm.isUserAdmin || vm.isUserHeadDepartment || vm.isUserReviewer) {
                var ieVersion = BrowserUtils.detectIE();
                if (ieVersion === false || ieVersion >= 12) {
                    DataUtils.openFile(document.mime, document.file)

                } else {
                    DataUtils.downloadFileIE(document.file, document.mime, document.name);
                }
            } else {
                showMessageHasNotPermission();
            }
        };


        function removeDocumentValidation(filesToDelete){
            var modal = getModalDeleteUploadedDocument(filesToDelete[0]);
            modal.result.then(function () {
                angular.forEach(filesToDelete, function (file) {
                    RequisitionDocuments.delete({id: file.id}, function () {
                        _.remove(vm.requisitionDocuments,function (itm) {
                            return itm.id === file.id;
                        });
                    });
                });
            }, function () {

            });
        }

        function getModalDeleteUploadedDocument(document){
            return $uibModal.open({
                templateUrl: 'app/entities/requisition-documents/delete/delete-requisition-document-dialog.html',
                controller: 'DeleteRequisitionDocumentModalController',
                controllerAs: 'vm',
                size: 'md',
                resolve:{
                    entity : [function(){
                        return document;
                    }]
                }
            });
        }


        // -------------- Messages ---------------

        function showMessageCommentIsRequired(){
            $state.go('requirement.message', {type: 'adqApp.requirement.messages.commentIsRequired', params: null});
        }

        function showMessageHasNotPermission(){
            $state.go('requirement.message', {type: 'adqApp.requirement.messages.hasNotPermission', params: null});
        }

        function showMessageRequirementBlock(){
            $state.go('requirement.message', {type: 'adqApp.requirement.messages.requirementBlock', params: null});
        }
    }

})();

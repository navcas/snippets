(function() {
    'use strict';

    angular
        .module('adqApp')
        .filter('decimal', ConvertDecimal)
        .filter('findMultiyearDetail', FilterMultiyearDetail)
        .filter('findTabConstant', FilterTabConstant)
        .filter('containsElement', FilterContainsElement)
        .filter('findInList', FindInList)
        .filter('findElementFormRequired', FindElementFormRequired)
        .filter('findFormRequired', FindFormRequired)
        .filter('findPermission', FindPermission)
        .filter('existBudget', ExistBudget)
        .filter('containsBudget', ContainsBudget)
        .filter('findFormalization', FindFormalization)
        .filter('findPositionFormalizationBudget', FindPositionFormalizationBudget)
        .filter('formalizationContainsBudget', FormalizationContainsBudget);
        ConvertDecimal.$inject =[];

        function ConvertDecimal (){
            return function(input){
                var ret = (input) ? input.toString().trim().replace(",",".") : null;
                return ret !== null ? parseFloat(ret) : 0.0;
            }
        }

        FilterMultiyearDetail.$inject =[];

        function FilterMultiyearDetail(){
            return function (details, detail, isContractTypeClose) {
                for (var i = 0; i < details.length; i++) {
                    if (details[i].fiscalYear === detail.fiscalYear && details[i].budget === detail.budget) {
                        if (isContractTypeClose) {
                            return details[i].totalAmount === detail.totalAmount;
                        }else{
                            return details[i].maxAmount === detail.maxAmount && details[i].minAmount === detail.minAmount;
                        }
                    }
                }
                return false;
            };
        }

    FilterTabConstant.$inject = ['REQUIREMENTTABINDEX'];
    function FilterTabConstant (REQUIREMENTTABINDEX){
        return function(type, filter){
            var find = null;
            switch(type){
                case 'requirement':
                    find = REQUIREMENTTABINDEX.filter(
                        function (items) {
                            return items.tab === filter;
                        }
                    );
                break;
            }
            if(find.length === 1){
                var element= {
                    name: find[0].tab,
                    index: find[0].index
                };
                return element;
            }
            return find;
        };
    }

    FilterContainsElement.$inject = [];

    function FilterContainsElement () {
        return function(list, item){
            if(list.length > 0) {
                for (var i = 0; i < list.length; i++){
                    if(angular.equals(list[i], item)){
                        return true;
                    }
                }
            }
            return false;
        };
    }

    FindInList.$inject = [];

    function FindInList() {
        return function(listitem, findItem) {
            var position = null;
            if(listitem.length > 0){
                for(var i=0; i < listitem.length; i++){
                    if (listitem[i].id === findItem.id) {
                        return i;
                    }
                }
            }
            return null;
        };
    }

    FindElementFormRequired.$inject = [];

    function FindElementFormRequired(){
        return function(listFormRequired, elementName){
            if(listFormRequired.length > 0){
                for(var i =0; i < listFormRequired.length; i++){
                    var form = listFormRequired[i];
                    for(var j=0; j < form.inputs.length; j++){
                        var element = form.inputs[j];
                        var find = 'liEleErr' + elementName;
                        if(find === element.name){
                            return {form: i, element: j};
                        }
                    }
                }
            }
            return null;
        };
    }

    FindFormRequired.$inject = [];

    function FindFormRequired(){
        return function(listFormRequired, formName){
            if(listFormRequired.length > 0){
                for(var i =0; i < listFormRequired.length; i++){
                    var form = listFormRequired[i];
                    if(form.name === formName){
                        return i;
                    }
                }
            }
            return null;
        };
    }

    FindPermission.$inject= [];

    function FindPermission(){
        return function(permissions, permission){
            if(permissions.length > 0){
                for(var i=0; i<permissions.length; i++){
                    if(permissions[i].code === permission.code){
                        return true;
                    }
                }
            }
            return false;
        };
    }

    ExistBudget.$inject = [];

    function ExistBudget() {
        return function(list, budget) {
            if(list.length > 0){
                for(var i=0; i < list.length; i++){
                    if (list[i].budgetOrder === parseInt(budget.budgetOrder)) {
                        return list[i];
                    }
                }
            }
            return null;
        };
    }

    ContainsBudget.$inject = [];

    function ContainsBudget() {
        return function(list, budget) {
            if(list.length > 0){
                for(var i=0; i < list.length; i++){
                    if (list[i].budget.budgetOrder === budget.budgetOrder) {
                        return true;
                    }
                }
            }
            return false;
        };
    }

    FindFormalization.$inject= [];

    function FindFormalization() {
        return function(formalizations, formalization){
            if(formalizations.length > 0){
                for(var i=0; i < formalizations.length; i++){
                    if(formalizations[i].supplier.id === formalization.supplier.id) {
                        return formalizations[i];
                    }
                }
            }
            return null;
        };
    }

    FindPositionFormalizationBudget.$inject=[];

    function FindPositionFormalizationBudget() {
        return function(formalizations, formalizationReqDet) {
            if (formalizations.length > 0) {
                for (var i = 0; i < formalizations.length; i++) {
                    var formalization = formalizations[i];
                    if (formalization.budgets.length > 0) {
                        for (var j = 0; j < formalization.budgets.length; j++) {
                            var budget = formalization.budgets[j];
                            if(budget.budgetOrder === formalizationReqDet.budget.budgetOrder){
                                return {
                                    formalization : i,
                                    budget: j
                                };
                            }
                        }
                    }
                }
            }
            return null;
        };
    }

    FormalizationContainsBudget.$inject =[];

    function FormalizationContainsBudget(){
        return function(formalizations, formalizationReqDet) {
            if (formalizations.length > 0) {
                for (var i = 0; i < formalizations.length; i++) {
                    var formalization = formalizations[i];
                    if (formalization.budgets.length > 0) {
                        for (var j = 0; j < formalization.budgets.length; j++) {
                            var budget = formalization.budgets[j];
                            var budgetOrder = parseInt(formalizationReqDet.budget.budgetOrder);
                            if(budget.budgetOrder === budgetOrder){
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        };
    }
})();

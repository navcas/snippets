'use strict';

angular.module('default')

    .controllerProvider.register('PollDetailController',
    ['$scope', 'PollService', 'UserEventService', 'poll', '$timeout', 'SessionService'
        function ($scope, PollService, poll, $timeout, SessionService) {

        	//Init Chart
			$scope.chart = {
                data: chartData,
                options: {
                    chart: {
                        type: 'discreteBarChart',
                        height: 450,
                        width: 500,
                        margin : {
                            top: 20,
                            right: 30,
                            bottom: 50,
                            left: 30
                        },
                        x: function(d){return d.label;},
                        y: function(d){return d.value;},
                        showValues: true,
                        valueFormat: function(d){
                            return d3.format(',.4f')(d);
                        },
                        duration: 500,
                        xAxis: {
                            axisLabel: ''
                        },
                        yAxis: {
                            axisLabel: '',
                            axisLabelDistance: -10
                        }
                    }
                }
            }

			var getData = function () {
                                  
                    PollService.GetSurveyResult(poll.id,
                        function (surveyResult) {
                            $scope.pollQuestion = surveyResult.question;
                            $scope.pollTitle = surveyResult.title;
                            $scope.pollDescription = surveyResult.description;
                            $scope.pollTypeQuestion = surveyResult.type;
                            $scope.pollAnswers = surveyResult.questions;
                            $scope.pollSession = surveyResult.sessionID;

                            

                            $scope.pollResults = 0;
                            var values = [];
                            angular.forEach(surveyResult.results, function( result, index){
                                $scope.pollResults += result.answeredCount;
                                values.push({'label': result.question, 'value': result.answeredCount});
                            });


                            var chartData = [{
                                key: $scope.pollTitle,
                                values: values
                            }];

                            $scope.chart.data = chartData;
                            SessionService.GetSessionDetail($scope.pollSession, function (sessionDetail) {
                                $scope.pollSessionName = sessionDetail.Name;
                            }, function (error) {
                                toastr.error(error);
                            });
                            
                        }, function (error) {
                            toastr.error(error);
                    });
                    
            }

        }]);



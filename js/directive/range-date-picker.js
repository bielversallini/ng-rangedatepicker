var rangeDatePicker = angular.module('RangeDatePicker',[]);
rangeDatePicker
.run(["$templateCache", function($templateCache) { 
    
    $templateCache.put("datefield/view.html",
        '<div class="datepicker-content">' +
        '    <div id="startDate-Div" class="date">' +
        '        <label class="control-label panel-title">{{startDateLabel}}</label>' +
        '        <input autocomplete="off" class="ipt-transparent" type="datetime" ' +
        '               name="startDate" id="startDate" value="{{startDateSelected}}"' +
        '               ng-click="showCalendar(0)" />' +
        '        <span class="data-picker-day" id="startDate-day">{{_startDateSelected.getDate()}}</span>' +
        '        <span id="startDate-month">{{monthNames[_startDateSelected.getMonth()]}}</span>' +
        '        <span id="startDate-year">{{_startDateSelected.getFullYear()}}</span>' +
        '    </div>' +
        '</div>' +
        '<div class="datepicker-content">' +
        '    <div id="endDate-Div" class="date">' +
        '        <label class="control-label panel-title">{{endDateLabel}}</label>' +
        '        <input autocomplete="off" class="ipt-transparent" type="datetime"' +
        '               name="endDate" id="endDate" value="{{endDateSelected}}"' +
        '               ng-click="showCalendar(1)" />' +
        '        <span class="data-picker-day" id="endDate-day">{{_endDateSelected.getDate()}}</span>' +
        '        <span id="endDate-month">{{monthNames[_endDateSelected.getMonth()]}}</span>' +
        '        <span id="endDate-year">{{_endDateSelected.getFullYear()}}</span>' +
        '    </div>' +
        '</div>' +
        '<div class="calendar" ng-show="_showCalendar">' +
        '    <div class="calendar-table">'+
        '          <table class="detached-days" ng-show="_type == 1">' +
        '               <tr>' +
        '                   <td><input type="checkbox" ng-model="modeIndepedent" ng-checked="modeIndepedent"> <span>MARCAR OU DESMARCAR DIAS AVULSOS</span></td>' +
        '               </tr>' +
        '          </table>' +
        '          <table class="control-calendar">' +
        '               <tr>' +
        '                   <td ng-click="previous()"><</td>' +
        '                   <td><b>{{_labelMonth}}</b><br>{{_year}}</td>' +
        '                   <td ng-click="next()">></td>' +
        '              </tr>' +
        '           </table>' +
        '           <table class="datafield-table"> ' +
        '               <thead> ' +
        '                   <tr> ' +
        '                       <th ng-repeat="(cIndex, day) in dayNames"> ' +
        '                       <span>{{getCalendarHeader(day.label)}}</span>' +
        '                      </th> ' +
        '                   </tr> ' +
        '               </thead> ' +
        '               <tbody> ' +
        '                  <tr ng-repeat="(cIndex, listvalue) in calendar"> ' +
        '                      <td ng-repeat="(dIndex, date) in listvalue" ng-class="isSeleted(date) ? \'selected\' : isDisabled(date) ? \'disabled\': \'\'" ' + 
        '                          ng-right-click="deselect(date)" ng-click="select(date)"> ' +
        '                           <span>{{getCalendarValue(date)}}</span>' +
        '                       </td> ' +
        '                   </tr> ' +
        '               </tbody> ' +
        '          </table> ' +
        '    </div>' +
            '<div class="calendar-ranges" ng-if="_type == 1">' +
            '   <h4>Operante em:</h4>' +
            '   <ul>' +
            '       <li ng-repeat="day in dayNames">' +
            '           <input type="checkbox" ng-model="day.active" ng-change="changeDayOfWeek(day, true)" ng-checked="day.active"> {{day.label}} '+
            '       </li>' +
            '   </ul>' +
            '</div>' +
        '</div>' 
        
    ); 
    
}])
.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
})
.directive('rangeDatePicker', [function(){
    return {
      restrict: 'E',
      templateUrl: 'datefield/view.html',
      scope: {
        startDateSelected: '=?',
        endDateSelected: '=?',
      },
      link: function(scope, element, attrs) {
        scope.monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
                            "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                            
        scope.dayNames   = [{label: "Domingos", active: true, index: 0}, 
                            {label: "Segundas", active: true, index: 1},
                            {label: "Terças",   active: true, index: 2},
                            {label: "Quartas",  active: true, index: 3},
                            {label: "Quintas",  active: true, index: 4},
                            {label: "Sextas",   active: true, index: 5},
                            {label: "Sábados",  active: true, index: 6}];
                            
        scope.modeIndepedent = false;                     
        scope.rangeSelected  = [];
        scope.preselected    = [];
        
        scope._rangeSelected = [];
        scope._deselecteds   = [];
        scope._showCalendar  = false;
        scope._type          = 0;
        scope._year          = 0;
        scope._month         = 0;
        scope._labelMonth    = "";
        scope._minimumDate   = new Date();
        scope._monthOpened   = new Date();
        
        scope.startDateLabel    = attrs.startdatelabel;
        scope.endDateLabel      = attrs.enddatelabel;
        scope.startDateSelected = attrs.startdateselected;
        scope.endDateSelected   = attrs.enddateselected;
        scope.minimumDate       = attrs.minimumdate;
        
        scope.compare = function(date, otherDate) {
            return date.getTime() - otherDate.getTime();
        };
        
        scope.init = function() {
            if (angular.isDefined(scope.startDateSelected)) {
                scope._startDateSelected = new Date(scope.startDateSelected);
                scope._startDateSelected.setHours(0, 0, 0, 0);
            }
             
            if (angular.isDefined(scope.endDateSelected)) {
                scope._endDateSelected = new Date(scope.endDateSelected);
                scope._endDateSelected.setHours(0, 0, 0, 0);
            }
            
            if (angular.isDefined(attrs.preselected) && angular.isArray(eval(attrs.preselected))
                && eval(attrs.preselected).length > 0) {
                
                for (var i = 0; i < eval(attrs.preselected).length; i++) {
                    var tmp = new Date(eval(attrs.preselected)[i]);
                    tmp.setHours(0, 0, 0, 0)
                    
                    scope.rangeSelected.push(angular.copy(tmp));
                    scope._rangeSelected.push(angular.copy(tmp.getTime()));
                    
                    if (i == 0) {
                        scope._startDateSelected = angular.copy(tmp);
                    }
                    if (i == (eval(attrs.preselected).length - 1)) {
                        scope._endDateSelected = angular.copy(tmp);
                    }
                }
                
                var dtStart = angular.copy(scope._startDateSelected);
                var dtEnd  = angular.copy(scope._endDateSelected);
                while (scope.compare(dtStart, dtEnd) <= 0) {
                    dtStart.setHours(0, 0, 0, 0);
                    if (scope._rangeSelected.indexOf(dtStart.getTime()) < 0){
                        scope._deselecteds.push(angular.copy(dtStart.getTime()));
                        if (dtStart.getDay() === scope.dayNames[dtStart.getDay()].index) {
                            scope.dayNames[dtStart.getDay()].active = false
                        }
                    }
                    dtStart.setDate(dtStart.getDate() + 1);
                }
                
            }
        
            if (angular.isDefined(scope.minimumDate)) {
                if (angular.equals(scope.minimumDate, "today")) {
                    scope._initialDate = new Date();
                    scope._minimumDate = new Date();
                } else {
                    scope._initialDate = new Date(scope.minimumDate);
                    scope._minimumDate = new Date(scope.minimumDate);
                }
            } else {
                scope._initialDate = new Date();
            }    
            
            scope.updateRange();
        };
        
        scope.showCalendar = function(type) {
            scope._showCalendar = true;
            scope._type = type;
            if (angular.equals(type, 0)) {
                if (angular.isDefined(scope._startDateSelected)) {
                    buildMonthCalendar(scope._startDateSelected)   
                } else {
                    buildMonthCalendar(scope._initialDate);    
                }
            } else {
                if (angular.isDefined(scope._endDateSelected)) {
                    buildMonthCalendar(scope._endDateSelected)   
                } else if (angular.isDefined(scope._startDateSelected)) {
                    buildMonthCalendar(scope._startDateSelected)   
                } else {
                    buildMonthCalendar(scope._initialDate);    
                }
            }
            
        };
        
        scope.setMonthAndYearSelected = function(date) {
            scope._year        = date.getFullYear();
            scope._month       = date.getMonth();
            scope._monthOpened = angular.copy(date);
            scope._labelMonth  = scope.monthNames[scope._month];
        };
        
        var buildMonthCalendar = function(initialDate) {
            var cal = [];
            var list = [];
            
            scope.setMonthAndYearSelected(initialDate);

            var dtStart = angular.copy(initialDate);
            dtStart.setDate(1);
            dtStart.setDate(dtStart.getDate() - dtStart.getDay());

            var dtEnd = angular.copy(initialDate);
            dtEnd.setDate(1);
            dtEnd.setMonth(dtEnd.getMonth() + 1);
            if (dtEnd.getDay() !== 0)
                dtEnd.setDate(dtEnd.getDate() + (7 - dtEnd.getDay()));

            while (scope.compare(dtStart, dtEnd) < 0) {
                dtStart.setHours(0, 0, 0, 0);
                list.push(angular.copy(dtStart));
                if (dtStart.getDay() === 6) {
                    cal.push(list);
                    list = [];
                }
                dtStart.setDate(dtStart.getDate() + 1);
            }
            
            scope.calendar = angular.copy(cal);
        };
        
        scope.updateRange = function(clickDay) {
            if (angular.isDefined(scope._startDateSelected) && angular.isDefined(scope._endDateSelected)) {
                scope.rangeSelected  = [];
                scope._rangeSelected = [];
                
                if (angular.isDefined(clickDay) && clickDay){
                    for (var i = 0; i < 7; i++) {
                        var day = scope.dayNames[i];
                        if (!day.active) {
                            scope.changeDayOfWeek(day, false);    
                        }
                    }
                }
                
                var dtStart = angular.copy(scope._startDateSelected);
                var dtEnd  = angular.copy(scope._endDateSelected);
                while (scope.compare(dtStart, dtEnd) <= 0) {
                    dtStart.setHours(0, 0, 0, 0);
                    if (scope._deselecteds.indexOf(dtStart.getTime()) < 0){
                        scope.rangeSelected.push(angular.copy(dtStart));
                        scope._rangeSelected.push(angular.copy(dtStart.getTime()));
                    }
                    dtStart.setDate(dtStart.getDate() + 1);
                }
                
                buildMonthCalendar(scope._monthOpened);    
            }
        };
        
        // begin template functions
        
        scope.getCalendarHeader = function(day) {
            return day.substr(0, 1);
        };

        scope.getCalendarValue = function(date) {
            if (angular.equals(scope._month, date.getMonth())) {
                return date.getDate();
            }
            return "";
        };
        
        scope.isSeleted = function(date) {
            if (angular.equals(scope._month, date.getMonth()) 
                && scope._rangeSelected.indexOf(date.getTime()) >= 0) {
                return true;
            }
            return false;
        };
        
        scope.isDisabled = function(date) {
           if (scope.compare(date, scope._minimumDate) < 0) {
               return true;
           } 
           
           if (scope._type == 1 && angular.isDefined(scope._startDateSelected)
                && scope.compare(date, scope._startDateSelected) < 0) {
               return true;
           } 
           
           if (scope._type == 0 && angular.isDefined(scope._endDateSelected)
                && scope.compare(date, scope._endDateSelected) > 0) {
                return true;     
           }
           
           return false;
        };
        
        scope.select = function(date) {
            if (!scope.modeIndepedent) {
                if (!scope.isDisabled(date)) {
                    if (scope._type == 0) {
                        scope._startDateSelected = angular.copy(date);
                        scope._showCalendar = false;
                    } else {
                        scope._endDateSelected = angular.copy(date);
                    }
                    scope.updateRange(true);
                }
            } else {
                scope.deselect(date);
            }
        };
        
        scope.deselect = function(date) {
            if (!scope.isDisabled(date)) {
                if (scope._deselecteds.indexOf(date.getTime()) < 0  && scope.rangeSelected.length > 1) {
                    scope._deselecteds.push(date.getTime());
                } else {
                    var index = scope._deselecteds.indexOf(date.getTime());
                    delete scope._deselecteds[index];
                }
                scope.updateRange();
            }
        };
        
        scope.isPossible = function() {
            var count = 0;
            for (var i = 0; i < scope.dayNames.length; i++){
                if (scope.dayNames[i].active) {
                    count++;
                }
            }

            if (count > 0){
                return true;
            }

            return false;
        };
            
        scope.changeDayOfWeek = function(day, needUpdate) {
          if (angular.isDefined(scope._startDateSelected) && angular.isDefined(scope._endDateSelected)) {
                if (scope.isPossible()){
                    var dtStart = angular.copy(scope._startDateSelected);
                    var dtEnd   = angular.copy(scope._endDateSelected);
                    while (scope.compare(dtStart, dtEnd) <= 0) {
                        if (day.index == dtStart.getDay()){
                            dtStart.setHours(0, 0, 0, 0);
                            var index = scope._deselecteds.indexOf(dtStart.getTime());
                            if (!day.active && index < 0) {
                                scope._deselecteds.push(dtStart.getTime());
                            } else if (day.active && index >= 0) {
                                delete scope._deselecteds[index];
                            }
                        }
                        dtStart.setDate(dtStart.getDate() + 1);
                    }

                    if (needUpdate) {
                        scope.updateRange();
                    }
                } else {
                    scope.dayNames[day.index].active = true;
                }
            }
        };
        
        scope.next = function() {
            var month, year, date;
            
            if (scope._month < 11) {
                month = scope._month + 1;
                year = scope._year;
                date = new Date(year, month, 1);
            } else {
                month = 0;
                year = scope._year + 1;
                date = new Date(year, month, 1);
            }
            
            date.setHours(0, 0, 0, 0);
            
            scope._monthOpened = angular.copy(date);
            buildMonthCalendar(date);
        };
        
        scope.previous = function() {
            var month, year, date;
            
            if (scope._month > 0) {
                month = scope._month - 1;
                year = scope._year;
                date = new Date(year, month, 1);
            } else {
                month = 11;
                year = scope._year - 1;
                date = new Date(year, month, 1);
            }
            
            date.setHours(0, 0, 0, 0);
            
            scope._monthOpened = angular.copy(date);
            buildMonthCalendar(date);
        };
        
        // end template functions
        
        scope.init();
         
      }
    };
}]);
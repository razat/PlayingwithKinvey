var app = angular.module('test', ['kinvey', 'ionic', 'nvd3'])
var $injector = angular.injector(['ng', 'kinvey']);
$injector.invoke(['$kinvey', function ($kinvey) {
    $kinvey.init({
        appKey: 'kid_Zkx1oa5pw',
        appSecret: '1a62f40c27bc4a738b754ac474085dfa'
    }).then(function (activeUser) {
        angular.bootstrap(document, ['test']);
        if (activeUser) {
            if (!window.localStorage.getItem('user')) {
                window.localStorage.setItem('user', activeUser.username);
            }
        }
    }, function (error) {
        console.log(error);
    })
}]);

app.run(function ($kinvey, $rootScope, $location, $state) {
    var routesThatDontRequireAuth = ['/login', '/register'];
    $rootScope.$on('$stateChangeStart', function (event, next, current) {
        $rootScope.userName = window.localStorage.getItem('user');
        if (!$rootScope.userName && routesThatDontRequireAuth.indexOf($location.url()) == -1) {
            $location.path('/login');
        }
        else {
            return '/main';
        }
    });

})
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'loginController'
            }).state('register', {
                url: '/register',
                templateUrl: 'partials/register.html',
                controller: 'registerController'
            })
            .state('main', {
                url: '/main',
                templateUrl: 'partials/page.html',
                controller: 'pageController'
            });
        $urlRouterProvider.otherwise(function () {
            if (!window.localStorage.getItem('user')) {
                return '/login';
            }
            else {
                return '/main';
            }
        });
    })
    .controller('loginController', function ($scope, $kinvey, $location, $rootScope, $ionicPopup, $ionicLoading) {
        $scope.loginform = {};
        $scope.redirectTo = function (hash) {
            window.location.hash = hash;
        };
        $scope.login = function () {
            if (!window.navigator.onLine) {
                $ionicPopup.alert({
                    title: 'No Internet Connection',
                    template: 'Please Connect to Internet First!'
                });
            }
            else {
                $ionicLoading.show({
                    content: 'Loading...',
                    animation: 'fade-in',
                    showBackdrop: true,
                    showDelay: 0
                });
                if (!$scope.loginform.email || !$scope.loginform.password) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Please Enter Email Id and Password'
                    });
                }

                else {
                    var promise = $kinvey.User.login({
                        username: $scope.loginform.email,
                        password: $scope.loginform.password
                    });
                    promise.then(function (data) {
                        console.log(data);
                        window.localStorage.setItem('user', data.username);
                        $rootScope.userName = data.userName;
                        $ionicLoading.hide();
                        $location.path("/main");
                    }, function (err) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: err.name,
                            template: err.description
                        });
                        console.log(err);
                    })
                }
            }

        };
    })
    .controller('pageController', function ($scope, $kinvey, $ionicPopup, $rootScope, $ionicLoading) {
        $scope.student = {};
        $scope.student.minus = function (par) {
            if (par == 'feeday') {
                if (parseInt($scope.student.feeDay) > 1) {

                    $scope.student.feeDay = parseInt($scope.student.feeDay) - 1;
                }
            } else {
                if (parseInt($scope.student.feeTenure) > 1) {

                    $scope.student.feeTenure = parseInt($scope.student.feeTenure) - 1;
                }

            }
        };
        $scope.student.addIt = function (para, op) {
            if (para == 'feeday') {
                if (parseInt($scope.student.feeDay) < 30) {
                    $scope.student.feeDay = parseInt($scope.student.feeDay) + 1;
                }
            } else {
                if (parseInt($scope.member.feeTenure) < 12) {
                    $scope.student.feeTenure = parseInt($scope.student.feeTenure) + 1;
                }
            }
        };
        $scope.dayEnding = function () {
            return  $scope.student.feeDay == 1 ? 'st' : ($scope.student.feeDay == 2 ? 'nd' : ($scope.student.feeDay == 3 ? 'rd' : 'th'));
        };
        $scope.allStudents = [];
        $rootScope.userName = window.localStorage.getItem('user')
        var collectionName = $rootScope.userName.replace('@', '-').replace('.', '-') + '-students';
        $scope.data = [

        ];
        $scope.getData = function () {
                var promise = $kinvey.DataStore.get(collectionName);
                promise.then(function (data) {
                    $scope.allStudents = data;
                    var class1 = {};
                    class1.key = "Class 10th";
                    class1.y = 0;
                    var class2 = {};
                    class2.key = "Class 11th";
                    class2.y =  0;
                    var class3 = {};
                    class3.key = "Class 12th";
                    class3.y = 0;
                    for(var i=0; i< $scope.allStudents.length; i++){
                        console.log($scope.allStudents[i].fees);
                       if($scope.allStudents[i].class == 'c10'){
                           class1.y = class1.y + parseInt($scope.allStudents[i].fees);
                       }
                        else if($scope.allStudents[i].class == 'c11'){
                           class2.y = class2.y  + parseInt($scope.allStudents[i].fees);
                       }
                        else {
                           class3.y = class3.y + parseInt($scope.allStudents[i].fees);
                       }

                    }
                        console.log(class1);
                    $scope.data.push(class1);
                    $scope.data.push(class2);
                    $scope.data.push(class3);
                },
                    function (err) {
                    console.log(err);
                })
        };
        $scope.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                transitionDuration: 500,
                labelThreshold: 0.01,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };


        $scope.getStudents = function(){
            return  $scope.allStudents;
        }
        $scope.getImage = function(name) {
           return 'http://placehold.it/55/ADAD24/fffff&text='+name[0];
        }
        $scope.getData();
        $scope.addStudent = function () {
            if ($scope.student.name != "" && $scope.student.class && $scope.student.fees > 0) {
                var promise = $kinvey.DataStore.save(collectionName, {
                    name: $scope.student.name,
                    class: $scope.student.class,
                    fees: $scope.student.fees,
                    feeDay: $scope.student.feeDay
                });
                promise.then(function (data) {
                    console.log(data);
                    $scope.student = {};
                    $scope.student.feeDay =1;
                    $scope.allStudents.push(data);
                    $ionicPopup.alert({
                        title: 'Student Added',
                        template: "please add more"
                    })
                }, function (err) {
                    console.log(err);
                })
            } else {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: "Please fill correct details first"
                });
            }
        }

    })
    .controller('registerController', function ($scope, $kinvey, $ionicPopup, $ionicLoading) {
        $scope.register = {};
        $scope.register = function () {
            if ($scope.register.email && ($scope.register.password1 == $scope.register.password2)) {
                var promise = $kinvey.User.signup({
                    username: $scope.register.email,
                    password: $scope.register.password1
                });
                promise.then(function (data) {
                    console.log(data)
                }, function (err) {
                    console.log(err)
                })
            } else {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: "Please fill correct details first"
                })
            }
        }
    })
    .controller('mainController', function ($scope, $kinvey, $rootScope, $location, $ionicPopup, $ionicLoading) {
        $scope.isLoggedIn = function () {
            return $rootScope.userName ? true : false;
        }
        $scope.logout = function () {
            var promise = $kinvey.User.logout();
            promise.then(function (data) {
                console.log(data);
                window.localStorage.removeItem('user');
                $location.path('/login');
            }, function (err) {
                console.log(err);
            })

        }
    })
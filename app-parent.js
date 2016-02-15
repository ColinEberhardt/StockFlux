'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('OpenFinD3FCParent', ['openfin.parent']);

    angular.module('openfin.parent', ['openfin.store', 'openfin.window']);
    angular.module('openfin.store', []);
    angular.module('openfin.currentWindow', []);
    angular.module('openfin.window', ['openfin.store']);
})();

(function () {
    'use strict';

    function getConfig() {
        return {
            'autoShow': true,
            'minWidth': 918,
            'minHeight': 510,
            'defaultWidth': 1280,
            'defaultHeight': 720,
            'frame': false,
            'url': 'index.html'
        };
    }

    var ParentCtrl = function ParentCtrl($scope, storeService, windowCreationService) {
        _classCallCheck(this, ParentCtrl);

        windowCreationService.ready(function () {
            var previousWindows = storeService.getPreviousOpenWindowNames(),
                length = previousWindows.length,
                i,
                max;

            if (length !== 0) {
                // Restoring previously open windows
                for (i = 0; i < length; i++) {
                    var config = getConfig();
                    config.name = previousWindows[i];
                    windowCreationService.createMainWindow(config);
                }
            } else {
                // Creating new window
                windowCreationService.createMainWindow(getConfig());
            }

            $scope.$on('updateFavourites', function (event, data) {
                var e = new Event('updateFavourites');
                e.stock = data;
                var openWindows = windowCreationService.getWindows();
                for (i = 0, max = openWindows.length; i < max; i++) {
                    openWindows[i].getNativeWindow().dispatchEvent(e);
                }
            });
        });
    };

    ParentCtrl.$inject = ['$scope', 'storeService', 'windowCreationService'];

    angular.module('openfin.parent').controller('ParentCtrl', ParentCtrl);
})();

(function () {
    'use strict';

    var KEY_NAME = 'windows',
        defaultStocks = ['AAPL', 'MSFT', 'TITN', 'SNDK', 'TSLA'],
        closedCacheSize = 5;

    var StoreWrapper = function () {
        function StoreWrapper($rootScope, storage, store) {
            _classCallCheck(this, StoreWrapper);

            this.$rootScope = $rootScope;
            this.storage = storage;
            this.store = store;
        }

        _createClass(StoreWrapper, [{
            key: 'save',
            value: function save() {
                localStorage.setItem(KEY_NAME, JSON.stringify(this.storage));
            }
        }, {
            key: 'update',
            value: function update(stock) {
                this.save();
                this.$rootScope.$broadcast('updateFavourites', stock);
            }
        }, {
            key: 'get',
            value: function get() {
                return this.store.stocks;
            }

            // Move given item in an array to directly after the to-item

        }, {
            key: 'reorder',
            value: function reorder(fromItem, toItem) {
                if (fromItem === toItem) {
                    return;
                }

                var oldArray = this.store.stocks;
                var fromIndex = oldArray.indexOf(fromItem);
                var toIndex = oldArray.indexOf(toItem);
                oldArray.splice(toIndex, 0, oldArray.splice(fromIndex, 1)[0]);

                this.update();
            }
        }, {
            key: 'add',
            value: function add(stock) {
                var stockName = stock.code;

                if (this.store.stocks.indexOf(stockName) === -1) {
                    this.store.stocks.push(stockName);
                    this.update(stock);
                }
            }
        }, {
            key: 'remove',
            value: function remove(stock) {
                var stockName = stock.code;
                var index = this.store.stocks.indexOf(stockName);
                if (index > -1) {
                    this.store.stocks.splice(index, 1);
                }

                this.update(stock);
            }
        }, {
            key: 'closeWindow',
            value: function closeWindow() {
                this.store.closed = Date.now();
                this.save();

                // Trim the oldest closed store
                //
                // TODO: This doesn't really belong here -- modifying the global storage object in a wrapper for
                // a specific store doesn't seem correct
                var closedArray = this.storage.filter(function (store) {
                    return store.closed !== 0;
                });
                if (closedArray.length > closedCacheSize) {
                    closedArray.sort(function (a, b) {
                        return b.closed - a.closed;
                    });

                    for (var i = closedCacheSize, max = closedArray.length; i < max; i++) {
                        var storageIndex = this.storage.indexOf(closedArray[i]);
                        this.storage.splice(storageIndex, 1);
                    }
                }

                this.save();
            }
        }]);

        return StoreWrapper;
    }();

    var StoreService = function () {
        function StoreService($rootScope) {
            _classCallCheck(this, StoreService);

            this.$rootScope = $rootScope;

            this.storage = JSON.parse(localStorage.getItem(KEY_NAME));
        }

        _createClass(StoreService, [{
            key: 'getPreviousOpenWindowNames',
            value: function getPreviousOpenWindowNames() {
                return (this.storage || []).filter(function (store) {
                    return store.closed === 0;
                }).map(function (store) {
                    return store.id;
                });
            }
        }, {
            key: 'open',
            value: function open(windowName) {
                var windowIndex = (this.storage || []).map(function (window) {
                    return window.id;
                }).indexOf(windowName),
                    store;

                if (windowIndex > -1) {
                    store = this.storage[windowIndex];
                } else {
                    var stocks = [];
                    if (!this.storage) {
                        stocks = defaultStocks;
                        this.storage = [];
                    }

                    var newStore = {
                        id: windowName,
                        stocks: stocks,
                        closed: 0
                    };

                    this.storage.push(newStore);

                    store = newStore;
                }

                return new StoreWrapper(this.$rootScope, this.storage, store);
            }
        }]);

        return StoreService;
    }();

    StoreService.$inject = ['$rootScope'];

    angular.module('openfin.store').service('storeService', StoreService);
})();

(function (fin) {
    'use strict';

    function getName() {
        // TODO: Should probably change this...
        return 'window' + Math.floor(Math.random() * 1000) + Math.ceil(Math.random() * 999);
    }

    var AppManager = function () {
        function AppManager() {
            _classCallCheck(this, AppManager);

            this.windowsOpen = 0;
        }

        _createClass(AppManager, [{
            key: 'increment',
            value: function increment() {
                this.windowsOpen++;
            }
        }, {
            key: 'decrement',
            value: function decrement() {
                this.windowsOpen--;

                if (this.windowsOpen === 0) {
                    window.close();
                }
            }
        }, {
            key: 'count',
            value: function count() {
                return this.windowsOpen;
            }
        }]);

        return AppManager;
    }();

    var WindowCreationService = function () {
        function WindowCreationService(storeService) {
            _classCallCheck(this, WindowCreationService);

            this.storeService = storeService;
            this.openWindows = {};
            this.windowsCache = [];
            this.firstName = true;
            this.apps = new AppManager();
        }

        _createClass(WindowCreationService, [{
            key: '_createWindow',
            value: function _createWindow(config, successCb, closedCb) {
                var _this = this;

                if (!config.name) {
                    config.name = getName();
                }

                var newWindow = new fin.desktop.Window(config, function () {
                    _this.windowsCache.push(newWindow);

                    if (successCb) {
                        successCb(newWindow);
                    }
                });

                this.apps.increment();

                newWindow.addEventListener('closed', function (e) {
                    var parent = _this.openWindows[newWindow.name];
                    if (parent) {
                        for (var i = 0, max = parent.length; i < max; i++) {
                            parent[i].close();
                        }
                    }

                    var index = _this.windowsCache.indexOf(newWindow);
                    _this.windowsCache.slice(index, 1);

                    if (closedCb) {
                        closedCb();
                    }

                    _this.apps.decrement();
                });

                return newWindow;
            }
        }, {
            key: 'createMainWindow',
            value: function createMainWindow(config, successCb) {
                var _this2 = this;

                this._createWindow(config, function (newWindow) {
                    // TODO
                    // Begin super hack
                    newWindow.getNativeWindow().windowService = _this2;
                    newWindow.getNativeWindow().storeService = _this2.storeService;
                    // End super hack

                    if (successCb) {
                        successCb(newWindow);
                    }

                    newWindow.show();
                }, function () {
                    if (_this2.apps.count() !== 1) {
                        _this2.storeService.open(config.name).closeWindow();
                    }
                });
            }
        }, {
            key: 'createTearoutWindow',
            value: function createTearoutWindow(config, parentName) {
                var tearoutWindow = this._createWindow(config);

                if (!this.openWindows[parentName]) {
                    this.openWindows[parentName] = [].concat(tearoutWindow);
                } else {
                    this.openWindows[parentName].push(tearoutWindow);
                }

                return tearoutWindow;
            }
        }, {
            key: 'ready',
            value: function ready(cb) {
                fin.desktop.main(cb);
            }
        }, {
            key: 'getWindows',
            value: function getWindows() {
                return this.windowsCache;
            }
        }]);

        return WindowCreationService;
    }();

    WindowCreationService.$inject = ['storeService'];

    angular.module('openfin.window').service('windowCreationService', WindowCreationService);
})(fin);

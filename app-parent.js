'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('OpenFinD3FCParent', ['openfin.parent']);

    angular.module('openfin.parent', ['openfin.store', 'openfin.window']);
    angular.module('openfin.store', []);
    angular.module('openfin.currentWindow', []);
    angular.module('openfin.window', ['openfin.store', 'openfin.geometry', 'openfin.config']);
    angular.module('openfin.config', []);
})();

(function () {
    'use strict';

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
                    var name = previousWindows[i];
                    windowCreationService.createMainWindow(name, storeService.open(name).isCompact());
                }
            } else {
                // Creating new window
                windowCreationService.createMainWindow();
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
            key: 'toggleCompact',
            value: function toggleCompact(isCompact) {
                this.store.compact = isCompact;
                this.save();
            }
        }, {
            key: 'isCompact',
            value: function isCompact() {
                return this.store.compact;
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
                        closed: 0,
                        compact: false
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

    var poolSize = 3;

    var FreeWindowPool = function () {
        function FreeWindowPool($q, configService) {
            _classCallCheck(this, FreeWindowPool);

            this.pool = [];
            this.$q = $q;
            this.configService = configService;

            for (var i = 0; i < poolSize; i++) {
                this._fillPool();
            }
        }

        _createClass(FreeWindowPool, [{
            key: '_fillPool',
            value: function _fillPool() {
                var deferred = this.$q.defer();
                this.pool.push({ promise: deferred.promise, window: new fin.desktop.Window(this.configService.getWindowConfig(), function () {
                        deferred.resolve();
                    })
                });
            }
        }, {
            key: 'fetch',
            value: function fetch() {
                var pooledWindow = this.pool.shift();
                this._fillPool();

                return pooledWindow;
            }
        }]);

        return FreeWindowPool;
    }();

    var WindowTracker = function () {
        function WindowTracker() {
            _classCallCheck(this, WindowTracker);

            this.openWindows = {};
            this.mainWindowsCache = [];
            this.windowsOpen = 0;
        }

        _createClass(WindowTracker, [{
            key: 'add',
            value: function add(_window) {
                this.mainWindowsCache.push(_window);
                this.windowsOpen++;
            }
        }, {
            key: 'addTearout',
            value: function addTearout(name, _window) {
                if (!this.openWindows[name]) {
                    this.openWindows[name] = [].concat(_window);
                } else {
                    this.openWindows[name].push(_window);
                }
            }
        }, {
            key: 'dispose',
            value: function dispose(_window, closedCb) {
                var parent = this.openWindows[_window.name];
                if (parent) {
                    // Close all the OpenFin tearout windows associated with the closing parent.
                    parent.forEach(function (child) {
                        return child.close();
                    });
                }

                if (this.windowsOpen !== 1) {
                    closedCb();
                }

                var index = this.mainWindowsCache.indexOf(_window);
                this.mainWindowsCache.slice(index, 1);

                this.windowsOpen--;

                if (this.windowsOpen === 0) {
                    // This was the last open window; close the application.
                    window.close();
                }
            }
        }, {
            key: 'getMainWindows',
            value: function getMainWindows() {
                return this.mainWindowsCache;
            }
        }]);

        return WindowTracker;
    }();

    var DragService = function () {
        function DragService(storeService, geometryService, windowTracker, tearoutWindow, $q) {
            _classCallCheck(this, DragService);

            this.storeService = storeService;
            this.geometryService = geometryService;
            this.windowTracker = windowTracker;
            this.tearoutWindow = tearoutWindow;
            this.$q = $q;
            this.otherInstance = null;
        }

        _createClass(DragService, [{
            key: 'overAnotherInstance',
            value: function overAnotherInstance(cb) {
                var _this = this;

                var mainWindows = this.windowTracker.getMainWindows(),
                    result = false,
                    promises = [];

                mainWindows.forEach(function (mainWindow) {
                    var deferred = _this.$q.defer();
                    promises.push(deferred.promise);
                    mainWindow.getState(function (state) {
                        if (state !== 'minimized' && _this.geometryService.windowsIntersect(_this.tearoutWindow, mainWindow.getNativeWindow())) {
                            _this.otherInstance = mainWindow;
                            result = true;
                        }

                        deferred.resolve();
                    });
                });

                this.$q.all(promises).then(function () {
                    return cb(result);
                });
            }
        }, {
            key: 'moveToOtherInstance',
            value: function moveToOtherInstance(stock) {
                this.storeService.open(this.otherInstance.name).add(stock);
                this.otherInstance.bringToFront();
            }
        }]);

        return DragService;
    }();

    var WindowCreationService = function () {
        function WindowCreationService(storeService, geometryService, $q, configService) {
            var _this2 = this;

            _classCallCheck(this, WindowCreationService);

            this.storeService = storeService;
            this.geometryService = geometryService;
            this.$q = $q;
            this.configService = configService;
            this.windowTracker = new WindowTracker();
            this.firstName = true;
            this.pool = null;

            this.ready(function () {
                _this2.pool = new FreeWindowPool($q, configService);
            });
        }

        _createClass(WindowCreationService, [{
            key: 'createMainWindow',
            value: function createMainWindow(name, isCompact, successCb) {
                var _this3 = this;

                var windowCreatedCb = function windowCreatedCb(newWindow) {
                    // TODO
                    // Begin super hack
                    newWindow.getNativeWindow().windowService = _this3;
                    newWindow.getNativeWindow().storeService = _this3.storeService;
                    // End super hack

                    _this3.windowTracker.add(newWindow);

                    if (successCb) {
                        successCb(newWindow);
                    }

                    newWindow.show();
                    newWindow.bringToFront();
                };

                var mainWindow;
                if (name) {
                    mainWindow = new fin.desktop.Window(isCompact ? this.configService.getCompactConfig(name) : this.configService.getWindowConfig(name), function () {
                        windowCreatedCb(mainWindow);
                    });
                } else {
                    var poolWindow = this.pool.fetch();
                    mainWindow = poolWindow.window;
                    if (isCompact) {
                        this.updateOptions(poolWindow.window, true);
                        this.window.resizeTo(230, 500, 'top-right');
                    }

                    poolWindow.promise.then(function () {
                        windowCreatedCb(mainWindow);
                    });
                }

                mainWindow.addEventListener('closed', function (e) {
                    _this3.windowTracker.dispose(mainWindow, function () {
                        _this3.storeService.open(mainWindow.name).closeWindow();
                    });
                });
            }
        }, {
            key: 'createTearoutWindow',
            value: function createTearoutWindow(parentName) {
                var tearoutWindow = new fin.desktop.Window(this.configService.getTearoutConfig());

                this.windowTracker.addTearout(parentName, tearoutWindow);

                return tearoutWindow;
            }
        }, {
            key: 'updateOptions',
            value: function updateOptions(_window, isCompact) {
                if (isCompact) {
                    _window.updateOptions({
                        resizable: false,
                        minHeight: 500,
                        minWidth: 230,
                        maximizable: false
                    });
                } else {
                    _window.updateOptions({
                        resizable: true,
                        minHeight: 510,
                        minWidth: 918,
                        maximizable: true
                    });
                }
            }
        }, {
            key: 'updateOptions',
            value: function updateOptions(_window, isCompact) {
                if (isCompact) {
                    _window.updateOptions({
                        resizable: false,
                        minHeight: 500,
                        minWidth: 230,
                        maximizable: false
                    });
                } else {
                    _window.updateOptions({
                        resizable: true,
                        minHeight: 510,
                        minWidth: 918,
                        maximizable: true
                    });
                }
            }
        }, {
            key: 'ready',
            value: function ready(cb) {
                fin.desktop.main(cb);
            }
        }, {
            key: 'getWindows',
            value: function getWindows() {
                return this.windowTracker.getMainWindows();
            }
        }, {
            key: 'registerDrag',
            value: function registerDrag(tearoutWindow) {
                return new DragService(this.storeService, this.geometryService, this.windowTracker, tearoutWindow, this.$q);
            }
        }]);

        return WindowCreationService;
    }();

    WindowCreationService.$inject = ['storeService', 'geometryService', '$q', 'configService'];

    angular.module('openfin.window').service('windowCreationService', WindowCreationService);
})(fin);

(function () {
    'use strict';

    var Point = function Point(x, y) {
        _classCallCheck(this, Point);

        this.x = x || 0;
        this.y = y || 0;
    };

    var Rectangle = function () {
        function Rectangle(rect) {
            _classCallCheck(this, Rectangle);

            this.origin = new Point(rect.left, rect.top);
            this.extent = new Point(rect.width, rect.height);
        }

        _createClass(Rectangle, [{
            key: 'top',
            value: function top() {
                return this.origin.y;
            }
        }, {
            key: 'left',
            value: function left() {
                return this.origin.x;
            }
        }, {
            key: 'bottom',
            value: function bottom() {
                return this.top() + this.extent.y;
            }
        }, {
            key: 'right',
            value: function right() {
                return this.left() + this.extent.x;
            }
        }, {
            key: 'corner',
            value: function corner() {
                return new Point(this.right(), this.bottom());
            }
        }, {
            key: 'intersects',
            value: function intersects(otherRectangle) {
                //return true if we overlap, false otherwise

                var otherOrigin = otherRectangle.origin,
                    otherCorner = otherRectangle.corner();

                return otherCorner.x > this.origin.x && otherCorner.y > this.origin.y && otherOrigin.x < this.corner().x && otherOrigin.y < this.corner().y;
            }
        }]);

        return Rectangle;
    }();

    var GeometryService = function () {
        function GeometryService() {
            _classCallCheck(this, GeometryService);
        }

        _createClass(GeometryService, [{
            key: 'rectangle',
            value: function rectangle(arg) {
                return new Rectangle(arg);
            }

            // Helper function to retrieve the height, width, top, and left from a window object

        }, {
            key: 'getWindowPosition',
            value: function getWindowPosition(windowElement) {
                return {
                    height: windowElement.outerHeight,
                    width: windowElement.outerWidth,
                    top: windowElement.screenY,
                    left: windowElement.screenX
                };
            }

            // Calculate the screen position of an element

        }, {
            key: 'elementScreenPosition',
            value: function elementScreenPosition(windowElement, element) {
                var relativeElementPosition = element.getBoundingClientRect();

                return {
                    height: relativeElementPosition.height,
                    width: relativeElementPosition.width,
                    top: windowElement.top + relativeElementPosition.top,
                    left: windowElement.left + relativeElementPosition.left
                };
            }
        }, {
            key: 'windowsIntersect',
            value: function windowsIntersect(openFinWindow, _window) {
                var nativeWindow1 = openFinWindow.getNativeWindow(),
                    rectangle1 = this.rectangle(this.getWindowPosition(nativeWindow1)),
                    rectangle2 = this.rectangle(this.getWindowPosition(_window));

                return rectangle1.intersects(rectangle2);
            }
        }]);

        return GeometryService;
    }();

    angular.module('openfin.geometry', []).service('geometryService', GeometryService);
})();

(function () {

    var RESIZE_NO_LIMIT = 50000;

    var ConfigService = function () {
        function ConfigService() {
            _classCallCheck(this, ConfigService);
        }

        _createClass(ConfigService, [{
            key: 'createName',
            value: function createName() {
                // TODO: Should probably change this...
                return 'window' + Math.floor(Math.random() * 1000) + Math.ceil(Math.random() * 999);
            }
        }, {
            key: 'getWindowConfig',
            value: function getWindowConfig(name) {
                return {
                    name: name || this.createName(),
                    autoShow: false,
                    frame: false,
                    showTaskbarIcon: true,
                    saveWindowState: true,
                    url: 'index.html',
                    resizable: true,
                    maximizable: true,
                    minWidth: 918,
                    minHeight: 510,
                    maxWidth: RESIZE_NO_LIMIT,
                    maxHeight: RESIZE_NO_LIMIT,
                    defaultWidth: 1280,
                    defaultHeight: 720
                };
            }
        }, {
            key: 'getCompactConfig',
            value: function getCompactConfig(name) {
                return {
                    name: name || this.createName(),
                    autoShow: false,
                    frame: false,
                    showTaskbarIcon: true,
                    saveWindowState: true,
                    url: 'index.html',
                    resizable: false,
                    maximizable: false,
                    minWidth: 230,
                    minHeight: 500,
                    maxWidth: 230,
                    maxHeight: 500,
                    defaultWidth: 230,
                    defaultHeight: 500
                };
            }
        }, {
            key: 'getTearoutConfig',
            value: function getTearoutConfig(name) {
                return {
                    name: name || this.createName(),
                    autoShow: false,
                    frame: false,
                    maximizable: false,
                    resizable: false,
                    showTaskbarIcon: false,
                    saveWindowState: false,
                    maxWidth: 230,
                    maxHeight: 100,
                    url: 'tearout.html'
                };
            }
        }]);

        return ConfigService;
    }();

    ConfigService.$inject = [];

    angular.module('openfin.config').service('configService', ConfigService);
})();

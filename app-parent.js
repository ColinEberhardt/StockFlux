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

    /**
     * Responsible for starting the application, and sending events to the child windows.
     */

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

            $scope.$on('updateFavourites', function (event, stock, windowName) {
                var e = new Event('updateFavourites');
                e.stock = stock;
                var openWindow = windowCreationService.getWindow(windowName);
                openWindow.getNativeWindow().dispatchEvent(e);
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

    var storage;

    /**
     * Class for editing the contents of local storage.
     */

    var StoreWrapper = function () {
        function StoreWrapper($rootScope, store, windowName) {
            _classCallCheck(this, StoreWrapper);

            this.$rootScope = $rootScope;
            this.store = store;
            this.windowName = windowName;
        }

        _createClass(StoreWrapper, [{
            key: 'save',
            value: function save() {
                localStorage.setItem(KEY_NAME, JSON.stringify(storage));
            }
        }, {
            key: 'update',
            value: function update(stock) {
                this.save();
                this.$rootScope.$broadcast('updateFavourites', stock, this.windowName);
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
                this.store.compact = arguments.length ? isCompact : !this.store.compact;

                this.save();
            }
        }, {
            key: 'isCompact',
            value: function isCompact() {
                return this.store.compact;
            }
        }, {
            key: 'openWindow',
            value: function openWindow() {
                this.store.closed = 0;
                this.save();
            }
        }, {
            key: 'closeWindow',
            value: function closeWindow() {
                this.store.closed = Date.now();
                this.save();

                // Trim the oldest closed store
                var closedArray = storage.filter(function (store) {
                    return store.closed !== 0;
                });
                if (closedArray.length > closedCacheSize) {
                    closedArray.sort(function (a, b) {
                        return b.closed - a.closed;
                    });

                    for (var i = closedCacheSize, max = closedArray.length; i < max; i++) {
                        var storageIndex = storage.indexOf(closedArray[i]);
                        storage.splice(storageIndex, 1);
                    }
                }

                this.save();
            }
        }]);

        return StoreWrapper;
    }();

    /**
     * Class for querying and managing the local storage.
     */


    var StoreService = function () {
        function StoreService($rootScope) {
            _classCallCheck(this, StoreService);

            this.$rootScope = $rootScope;
            storage = JSON.parse(localStorage.getItem(KEY_NAME));
        }

        _createClass(StoreService, [{
            key: 'getPreviousOpenWindowNames',
            value: function getPreviousOpenWindowNames() {
                return (storage || []).filter(function (store) {
                    return store.closed === 0;
                }).map(function (store) {
                    return store.id;
                });
            }
        }, {
            key: 'getPreviousClosedWindows',
            value: function getPreviousClosedWindows() {
                return (storage || []).filter(function (store) {
                    return store.closed > 0;
                });
            }
        }, {
            key: 'open',
            value: function open(windowName) {
                var windowIndex = (storage || []).map(function (window) {
                    return window.id;
                }).indexOf(windowName),
                    store;

                if (windowIndex > -1) {
                    store = storage[windowIndex];
                } else {
                    var stocks = [];
                    if (!storage) {
                        stocks = defaultStocks;
                        storage = [];
                    }

                    var newStore = {
                        id: windowName,
                        stocks: stocks,
                        closed: 0,
                        compact: false
                    };

                    storage.push(newStore);

                    store = newStore;
                }

                return new StoreWrapper(this.$rootScope, store, windowName);
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

    /**
     * Manages a pool of OpenFin windows. The pool is used for performance improvements,
     * as there is an overhead to creating new windows.
     * When a window is taken from the pool a new one is created and added.
     */

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

    /**
     * Keeps an internal count and cache of the number of main application windows open.
     * The count is used to know when the last window has been closed, to close the application.
     */


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

    /**
     * Class to determine whether a stored tearout window is overlapping
     * a different main window, and allow moving stocks between windows.
     */


    var DragService = function () {
        function DragService(storeService, geometryService, windowTracker, tearoutWindow, $q, openFinWindow) {
            _classCallCheck(this, DragService);

            this.storeService = storeService;
            this.geometryService = geometryService;
            this.windowTracker = windowTracker;
            this.tearoutWindow = tearoutWindow;
            this.$q = $q;
            this.openFinWindow = openFinWindow;
            this.otherInstance = null;
        }

        _createClass(DragService, [{
            key: 'overAnotherInstance',
            value: function overAnotherInstance(cb) {
                var _this = this;

                var mainWindows = this.windowTracker.getMainWindows(),
                    result = false,
                    promises = [];

                var filteredWindows = mainWindows.filter(function (mw) {
                    return mw.name !== _this.openFinWindow.name;
                });
                filteredWindows.forEach(function (mainWindow) {
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

    /**
     * Class that creates and governs OpenFin windows.
     */


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
                    newWindow.getNativeWindow().windowService = _this3;
                    newWindow.getNativeWindow().storeService = _this3.storeService;

                    _this3.windowTracker.add(newWindow);

                    if (successCb) {
                        successCb(newWindow);
                    }

                    _this3.storeService.open(newWindow.name).openWindow();

                    newWindow.show();
                    newWindow.bringToFront();
                    _this3.snapToScreenBounds(newWindow);
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
                        poolWindow.window.resizeTo(230, 500, 'top-right');
                    }

                    poolWindow.promise.then(function () {
                        windowCreatedCb(mainWindow);
                    });
                }

                var closedEvent = function closedEvent(e) {
                    _this3.windowTracker.dispose(mainWindow, function () {
                        _this3.storeService.open(mainWindow.name).closeWindow();
                        mainWindow.removeEventListener('closed', closedEvent);
                    });
                };

                mainWindow.addEventListener('closed', closedEvent);
            }
        }, {
            key: 'getTargetMonitor',
            value: function getTargetMonitor(x, y, callback) {
                fin.desktop.System.getMonitorInfo(function (info) {
                    var monitors = info.nonPrimaryMonitors.concat(info.primaryMonitor);
                    var closestMonitor = monitors[0];
                    var closestDistance = Number.MAX_VALUE;

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = monitors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var monitor = _step.value;


                            var monitorRect = monitor.monitorRect;

                            // If the window's top-left is within the monitor's bounds, use that + stop
                            if (x >= monitorRect.left && x <= monitorRect.right && y >= monitorRect.top && y <= monitorRect.bottom) {

                                callback(monitor);
                                return;
                            } else {

                                // Otherwise, keep track of the closest, and if the window is not
                                // within any monitor bounds, use the closest.
                                var midX = monitorRect.left + monitorRect.right / 2;
                                var midY = monitorRect.top + monitorRect.bottom / 2;
                                var distance = Math.pow(midX - x, 2) + Math.pow(midY - y, 2);
                                if (distance < closestDistance) {
                                    closestDistance = distance;
                                    closestMonitor = monitor;
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    callback(closestMonitor);
                });
            }
        }, {
            key: 'snapToScreenBounds',
            value: function snapToScreenBounds(targetWindow) {
                var _this4 = this;

                targetWindow.getBounds(function (bounds) {
                    _this4.getTargetMonitor(bounds.left, bounds.top, function (monitor) {

                        var availableRect = monitor.availableRect;

                        if (bounds.left < availableRect.left) {
                            bounds.left = availableRect.left;
                        } else if (bounds.left + bounds.width > availableRect.right) {
                            bounds.left = availableRect.right - bounds.width;
                        }

                        if (bounds.top < availableRect.top) {
                            bounds.top = availableRect.top;
                        } else if (bounds.top + bounds.height > availableRect.bottom) {
                            bounds.top = availableRect.bottom - bounds.height;
                        }

                        targetWindow.setBounds(bounds.left, bounds.top, bounds.width, bounds.height);
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
            key: 'ready',
            value: function ready(cb) {
                fin.desktop.main(cb);
            }
        }, {
            key: 'getWindow',
            value: function getWindow(name) {
                return this.windowTracker.getMainWindows().filter(function (w) {
                    return w.name === name;
                })[0];
            }
        }, {
            key: 'registerDrag',
            value: function registerDrag(tearoutWindow, openFinWindow) {
                return new DragService(this.storeService, this.geometryService, this.windowTracker, tearoutWindow, this.$q, openFinWindow);
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

    // Helper function to retrieve the height, width, top, and left from a window object


    function getWindowPosition(windowElement) {
        return {
            height: windowElement.outerHeight,
            width: windowElement.outerWidth,
            top: windowElement.screenY,
            left: windowElement.screenX
        };
    }

    // Calculate the screen position of an element
    function elementScreenPosition(windowElement, element) {
        var relativeElementPosition = element.getBoundingClientRect();

        return {
            height: relativeElementPosition.height,
            width: relativeElementPosition.width,
            top: windowElement.top + relativeElementPosition.top,
            left: windowElement.left + relativeElementPosition.left
        };
    }

    function intersectHelper(bounds1, bounds2) {
        var rectangle1 = new Rectangle(bounds1),
            rectangle2 = new Rectangle(bounds2);

        return rectangle1.intersects(rectangle2);
    }

    var GeometryService = function () {
        function GeometryService() {
            _classCallCheck(this, GeometryService);
        }

        _createClass(GeometryService, [{
            key: 'windowsIntersect',
            value: function windowsIntersect(openFinWindow, _window) {
                var nativeWindow = openFinWindow.getNativeWindow();

                return intersectHelper(getWindowPosition(nativeWindow), getWindowPosition(_window));
            }
        }, {
            key: 'elementIntersect',
            value: function elementIntersect(openFinWindow, _window, element) {
                var nativeWindow = openFinWindow.getNativeWindow();

                return intersectHelper(getWindowPosition(nativeWindow), elementScreenPosition(getWindowPosition(_window), element));
            }
        }]);

        return GeometryService;
    }();

    angular.module('openfin.geometry', []).service('geometryService', GeometryService);
})();

(function () {

    var RESIZE_NO_LIMIT = 50000;

    /**
     * Stores common configuration for the application.
     */

    var ConfigService = function () {
        function ConfigService() {
            _classCallCheck(this, ConfigService);
        }

        _createClass(ConfigService, [{
            key: 'createName',
            value: function createName() {
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
        }, {
            key: 'getTopCardOffset',
            value: function getTopCardOffset() {
                return [268, 65];
            }
        }]);

        return ConfigService;
    }();

    ConfigService.$inject = [];

    angular.module('openfin.config').service('configService', ConfigService);
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    angular.module('OpenFinD3FC', ['ngAnimate', 'openfin.parent', 'openfin.main', 'openfin.showcase', 'openfin.toolbar', 'openfin.icon', 'openfin.search', 'openfin.favourites', 'openfin.sidebar', 'openfin.filters', 'openfin.star', 'openfin.tearout', 'openfin.minichart', 'openfin.scroll']);

    angular.module('openfin.main', ['openfin.currentWindow']);
    angular.module('openfin.showcase', ['openfin.selection', 'openfin.quandl']);
    angular.module('openfin.toolbar', ['openfin.currentWindow']);
    angular.module('openfin.icon', []);
    angular.module('openfin.search', ['openfin.quandl', 'openfin.selection', 'openfin.currentWindow']);
    angular.module('openfin.favourites', ['openfin.quandl', 'openfin.selection', 'openfin.currentWindow']);
    angular.module('openfin.sidebar', []);
    angular.module('openfin.filters', []);
    angular.module('openfin.star', ['openfin.selection']);
    angular.module('openfin.tearout', ['openfin.geometry', 'openfin.hover', 'openfin.currentWindow']);
    angular.module('openfin.minichart', ['openfin.quandl']);
    angular.module('openfin.store', []);
    angular.module('openfin.parent', ['openfin.window']);
    angular.module('openfin.currentWindow', []);
    angular.module('openfin.window', []);
    angular.module('openfin.scroll', []);
})();

(function () {
    'use strict';

    var IconCtrl = function () {
        function IconCtrl($scope) {
            _classCallCheck(this, IconCtrl);

            this.$scope = $scope;

            this.setup();
        }

        _createClass(IconCtrl, [{
            key: 'setup',
            value: function setup() {
                var name = this.$scope.name;

                var dict = {},
                    _active = '_active',
                    _hovered = '_hovered';

                dict[name + _active] = false;
                dict[name + _hovered] = false;

                function active(value) {
                    if (!arguments.length) {
                        return dict[name + _active];
                    }

                    dict[name + _active] = value;
                }

                function hovered(value) {
                    if (!arguments.length) {
                        return dict[name + _hovered];
                    }

                    dict[name + _hovered] = value;
                }

                this.urls = {
                    inactive: name,
                    hover: name + '_hover',
                    active: name + '_active'
                };

                this.icon = {
                    active: active,
                    hovered: hovered
                };
            }
        }, {
            key: 'enter',
            value: function enter() {
                this.icon.hovered(true);
            }
        }, {
            key: 'leave',
            value: function leave() {
                this.icon.hovered(false);
                this.icon.active(false);
            }
        }, {
            key: 'url',
            value: function url() {
                if (this.icon.active()) {
                    return this.urls.active;
                } else if (this.icon.hovered()) {
                    return this.urls.hover;
                } else {
                    return this.urls.inactive;
                }
            }
        }, {
            key: 'mouseDown',
            value: function mouseDown(e, name) {
                if (e.button !== 0) {
                    return;
                }

                this.icon.active(true);
            }
        }, {
            key: 'click',
            value: function click(e, name) {
                if (e.button !== 0) {
                    return;
                }

                this.icon.active(true);
                this.$scope.iconClick();
                this.icon.active(false);
                this.icon.hovered(false);
            }
        }]);

        return IconCtrl;
    }();

    IconCtrl.$inject = ['$scope'];

    angular.module('openfin.icon').controller('IconCtrl', IconCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.icon').directive('icon', [function () {
        return {
            restrict: 'E',
            templateUrl: 'icon/icon.html',
            scope: {
                name: '@',
                iconClick: '&'
            },
            controller: 'IconCtrl',
            controllerAs: 'iconCtrl'
        };
    }]);
})();

(function () {
    'use strict';

    var MainCtrl = function () {
        function MainCtrl($timeout, currentWindowService) {
            _classCallCheck(this, MainCtrl);

            this.$timeout = $timeout;
            this.currentWindowService = currentWindowService;
        }

        _createClass(MainCtrl, [{
            key: 'isCompact',
            value: function isCompact() {
                return this.currentWindowService.compact;
            }
        }]);

        return MainCtrl;
    }();

    MainCtrl.$inject = ['$timeout', 'currentWindowService'];

    angular.module('openfin.main').controller('MainCtrl', MainCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.main').directive('main', [function () {
        return {
            restrict: 'E',
            templateUrl: 'main/main.html',
            controller: 'MainCtrl',
            controllerAs: 'mainCtrl'
        };
    }]);
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

    angular.module('OpenFinD3FCParent', ['openfin.parent']);

    angular.module('openfin.parent', ['openfin.store', 'openfin.window']);
    angular.module('openfin.store', []);
    angular.module('openfin.currentWindow', []);
    angular.module('openfin.window', ['openfin.store']);
})();

(function (fin) {
    'use strict';

    angular.module('openfin.currentWindow').factory('currentWindowService', ['$rootScope', function ($rootScope) {
        function getCurrentWindow() {
            return fin.desktop.Window.getCurrent();
        }

        function ready(cb) {
            fin.desktop.main(cb);
        }

        window.addEventListener('updateFavourites', function (event) {
            $rootScope.$broadcast('updateFavourites', event.stock);
        });

        return {
            getCurrentWindow: getCurrentWindow,
            ready: ready
        };
    }]);
})(fin);

(function () {
    'use strict';

    var API_KEY = 'kM9Z9aEULVDD7svZ4A8B',
        API_KEY_VALUE = 'api_key=' + API_KEY,
        DATE_INDEX = 0,
        OPEN_INDEX = 1,
        HIGH_INDEX = 2,
        LOW_INDEX = 3,
        CLOSE_INDEX = 4,
        VOLUME_INDEX = 5,
        QUANDL_URL = 'https://www.quandl.com/api/v3/',
        QUANDL_WIKI = 'datasets/WIKI/';

    // Helper functions outside of Class scope
    function period() {
        return moment().subtract(28, 'days');
    }

    function processDataset(dataset, query, cb) {
        var code = dataset.dataset_code;
        var stock = {
            name: dataset.name,
            code: code,
            favourite: false,
            query: query
        };

        cb(stock);
    }

    function filterByDate(json) {
        var datasets = json.datasets,
            result = [];

        for (var i = 0, max = datasets.length; i < max; i++) {
            if (moment(datasets[i].newest_available_date) > period()) {
                result.push(datasets[i]);
            }
        }

        return {
            datasets: result
        };
    }

    function processResponse(json) {
        var datasetData = json.dataset,
            financialData = datasetData.data,
            results = [],
            i = 0,
            max = financialData.length;

        for (i; i < max; i++) {
            results.push(extract(financialData[i]));
        }

        json.stockData = {
            startDate: datasetData.start_date,
            endDate: datasetData.end_date,
            data: results
        };
    }

    function extract(data) {
        return {
            date: data[DATE_INDEX],
            open: data[OPEN_INDEX],
            high: data[HIGH_INDEX],
            low: data[LOW_INDEX],
            close: data[CLOSE_INDEX],
            volume: data[VOLUME_INDEX]
        };
    }

    var QuandlService = function () {
        function QuandlService($resource) {
            _classCallCheck(this, QuandlService);

            this.$resource = $resource;
        }

        _createClass(QuandlService, [{
            key: 'search',
            value: function search(query, cb, noResultsCb) {
                this.stockSearch().get({ query: query }, function (result) {
                    result.datasets.map(function (dataset) {
                        processDataset(dataset, query, cb);
                    });

                    if (result.datasets.length === 0) {
                        noResultsCb();
                    }
                });
            }
        }, {
            key: 'getMeta',
            value: function getMeta(stockCode, cb) {
                this.stockMetadata().get({ 'stock_code': stockCode }, function (result) {
                    processDataset(result.dataset, stockCode, cb);
                });
            }
        }, {
            key: 'stockData',
            value: function stockData() {
                var startDate = period().format('YYYY-MM-DD'),
                    json;

                return this.$resource(QUANDL_URL + QUANDL_WIKI + ':code.json?' + API_KEY_VALUE + '&start_date=' + startDate, {}, {
                    get: {
                        method: 'GET',
                        transformResponse: function transformResponse(data, headers) {
                            json = angular.fromJson(data);
                            processResponse(json);
                            return json;
                        },
                        cache: true
                    }
                });
            }
        }, {
            key: 'getData',
            value: function getData(stockCode, cb) {
                return this.stockData().get({ code: stockCode }, function (result) {
                    var stock = {
                        name: result.dataset.name,
                        code: stockCode,
                        data: result.stockData.data
                    };

                    cb(stock);
                });
            }

            // Queries Quandl for the specific stock code

        }, {
            key: 'stockMetadata',
            value: function stockMetadata() {
                return this.$resource(QUANDL_URL + QUANDL_WIKI + ':stock_code/metadata.json?' + API_KEY_VALUE, {}, {
                    get: { method: 'GET', cache: true }
                });
            }

            // Queries Quandl for all stocks matching the input query

        }, {
            key: 'stockSearch',
            value: function stockSearch() {
                return this.$resource(QUANDL_URL + 'datasets.json?' + API_KEY_VALUE + '&query=:query&database_code=WIKI', {}, {
                    get: {
                        method: 'GET',
                        cache: true,
                        transformResponse: function transformResponse(data, headers) {
                            var json = angular.fromJson(data);
                            return filterByDate(json);
                        }
                    }
                });
            }
        }, {
            key: 'apiKey',
            value: function apiKey() {
                return API_KEY;
            }
        }]);

        return QuandlService;
    }();

    QuandlService.$inject = ['$resource'];

    angular.module('openfin.quandl', ['ngResource']).service('quandlService', QuandlService);
})();

(function () {
    'use strict';

    var DESELECTION_OBJECT = { code: '', name: '' };

    var SelectionService = function () {
        function SelectionService() {
            _classCallCheck(this, SelectionService);

            this._stock = DESELECTION_OBJECT;
        }

        _createClass(SelectionService, [{
            key: 'select',
            value: function select(stock) {
                this._stock = stock;
            }
        }, {
            key: 'selectedStock',
            value: function selectedStock() {
                return this._stock;
            }
        }, {
            key: 'deselect',
            value: function deselect() {
                this._stock = DESELECTION_OBJECT;
            }
        }, {
            key: 'hasSelection',
            value: function hasSelection() {
                return this._stock !== DESELECTION_OBJECT;
            }
        }]);

        return SelectionService;
    }();

    SelectionService.$inject = [];

    angular.module('openfin.selection', []).service('selectionService', SelectionService);
})();

(function () {
    'use strict';

    var ShowcaseCtrl = function () {
        function ShowcaseCtrl(selectionService) {
            _classCallCheck(this, ShowcaseCtrl);

            this.selectionService = selectionService;
        }

        _createClass(ShowcaseCtrl, [{
            key: 'selectionCode',
            value: function selectionCode() {
                return this.selectionService.selectedStock().code;
            }
        }, {
            key: 'selectionName',
            value: function selectionName() {
                return this.selectionService.selectedStock().name;
            }
        }, {
            key: 'hasSelection',
            value: function hasSelection() {
                return this.selectionService.hasSelection();
            }
        }]);

        return ShowcaseCtrl;
    }();

    ShowcaseCtrl.$inject = ['selectionService'];

    // The quandl service is used in the directive.
    angular.module('openfin.showcase', ['openfin.selection', 'openfin.quandl']).controller('ShowcaseCtrl', ShowcaseCtrl);
})();

(function (sc) {
    'use strict';

    angular.module('openfin.showcase').directive('showcase', ['quandlService', function (quandlService) {
        return {
            restrict: 'E',
            templateUrl: 'showcase/showcase.html',
            scope: {
                selection: '&'
            },
            link: function link(scope, element) {
                var chart = sc.app().quandlApiKey(quandlService.apiKey()),
                    firstRun = true;

                scope.$watch('selection()', function (newSelection, previousSelection) {
                    if (newSelection !== '') {
                        if (firstRun) {
                            firstRun = false;
                            chart.run(element[0].children[0]);
                        }

                        if (newSelection !== previousSelection) {
                            chart.changeQuandlProduct(newSelection);
                        }
                    }
                });
            }
        };
    }]);
})(sc);

(function () {
    'use strict';

    var icons = {
        up: 'arrow_up',
        down: 'arrow_down'
    };

    var FavouritesCtrl = function () {
        function FavouritesCtrl(currentWindowService, quandlService, selectionService, $scope, $timeout) {
            _classCallCheck(this, FavouritesCtrl);

            this.currentWindowService = currentWindowService;
            this.quandlService = quandlService;
            this.selectionService = selectionService;
            this.$scope = $scope;
            this.$timeout = $timeout;

            this.store = null;
            this.stocks = [];
            this.update();
            this._watch();
        }

        _createClass(FavouritesCtrl, [{
            key: 'icon',
            value: function icon(stock) {
                return stock.delta < 0 ? icons.down : icons.up;
            }
        }, {
            key: 'selection',
            value: function selection() {
                return this.selectionService.selectedStock().code;
            }
        }, {
            key: 'select',
            value: function select(stock) {
                this.selectionService.select(stock);
            }
        }, {
            key: 'noFavourites',
            value: function noFavourites() {
                return this.stocks.length === 0;
            }
        }, {
            key: 'single',
            value: function single() {
                return this.stocks.length === 1 ? 'single' : '';
            }
        }, {
            key: 'update',
            value: function update(updatedStock) {
                var _this = this;

                this.currentWindowService.ready(function () {
                    if (!_this.store) {
                        _this.store = window.storeService.open(window.name);
                    }

                    _this.favourites = _this.store.get();

                    var i, max, min;

                    // Update indices
                    for (i = 0, max = _this.stocks.length; i < max; i++) {
                        var thisStock = _this.stocks[i];
                        thisStock.index = _this.stockSortFunction(thisStock);
                    }

                    // Remove the stocks no longer in the favourites
                    var removedStocksIndices = [];
                    for (i = 0, max = _this.stocks.length; i < max; i++) {
                        if (_this.favourites.indexOf(_this.stocks[i].code) === -1) {
                            removedStocksIndices.push(i);
                        }
                    }

                    // Remove from the end of the array to not change the indices
                    for (i = removedStocksIndices.length - 1, min = 0; i >= min; i--) {
                        _this.stocks.splice(removedStocksIndices[i], 1);
                    }

                    var oldSelectedStock = _this.selectionService.selectedStock();
                    if (updatedStock) {
                        if (_this.stocks.length === 0) {
                            // If there aren't any stocks, we could be adding one...
                            if (updatedStock.favourite) {
                                _this.selectionService.select(updatedStock);
                            } else if (oldSelectedStock.code === updatedStock.code) {
                                // If there's no stocks and it's not a favourite any more, but also
                                // if the selection is on the updated stock, deselect.
                                _this.selectionService.deselect();
                            }
                        } else if (oldSelectedStock.code === updatedStock.code && (!updatedStock.favourite || _this.favourites.indexOf(oldSelectedStock.code) === -1) && _this.stocks.length > 0) {
                            // The changed favourite was also the selected one!
                            // It was removed, or torn out
                            //
                            // Need to change the selection to the top most
                            var topStock = _this.stocks.filter(function (stock) {
                                return stock.code === _this.favourites[0];
                            })[0];
                            _this.selectionService.select(topStock);
                        }
                    }

                    // Add new stocks from favourites
                    _this.favourites.map(function (favourite) {
                        if (_this.stocks.map(function (stock) {
                            return stock.code;
                        }).indexOf(favourite) === -1) {
                            // This is a new stock
                            _this.quandlService.getData(favourite, function (stock) {
                                var data = stock.data[0],
                                    price,
                                    delta,
                                    percentage;

                                if (data) {
                                    price = data.close;
                                    delta = data.close - data.open;
                                    percentage = delta / data.open * 100;

                                    _this.stocks.push({
                                        name: stock.name,
                                        code: stock.code,
                                        price: price,
                                        delta: delta,
                                        percentage: Math.abs(percentage),
                                        favourite: true,
                                        index: _this.stockSortFunction(stock)
                                    });
                                }
                            });
                        }
                    });
                });
            }
        }, {
            key: 'stockSortFunction',
            value: function stockSortFunction(stock) {
                return this.favourites.indexOf(stock.code);
            }
        }, {
            key: '_watch',
            value: function _watch() {
                var _this2 = this;

                this.$scope.$on('updateFavourites', function (event, data) {
                    _this2.$timeout(function () {
                        _this2.update(data);
                    });
                });
            }
        }]);

        return FavouritesCtrl;
    }();

    FavouritesCtrl.$inject = ['currentWindowService', 'quandlService', 'selectionService', '$scope', '$timeout'];

    angular.module('openfin.favourites').controller('FavouritesCtrl', FavouritesCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.favourites').directive('favourite', [function () {
        return {
            restrict: 'E',
            templateUrl: 'sidebars/favourites/favourite.html',
            scope: {
                stock: '=',
                selection: '&',
                select: '&',
                icon: '&',
                renderChart: '&',
                single: '&'
            }
        };
    }]);
})();

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
        }]);

        return GeometryService;
    }();

    angular.module('openfin.geometry', []).service('geometryService', GeometryService);
})();

(function () {
    'use strict';

    var HoverService = function () {
        function HoverService($rootScope) {
            _classCallCheck(this, HoverService);

            this.$rootScope = $rootScope;

            this.hoverTargets = [];
        }

        _createClass(HoverService, [{
            key: 'get',
            value: function get() {
                return this.hoverTargets;
            }
        }, {
            key: 'add',
            value: function add(hoverArea, stockCode) {
                var newHoverTarget = { hoverArea: hoverArea, code: stockCode };
                if (this.hoverTargets.indexOf(newHoverTarget) === -1) {
                    // This target is new
                    this.hoverTargets.push(newHoverTarget);
                }
            }
        }, {
            key: 'remove',
            value: function remove(stockCode) {
                for (var i = 0, max = this.hoverTargets.length; i < max; i++) {
                    if (this.hoverTargets[i].code === stockCode) {
                        this.hoverTargets.splice(i, 1);
                        break;
                    }
                }
            }
        }]);

        return HoverService;
    }();

    HoverService.$inject = ['$rootScope'];
    angular.module('openfin.hover', []).service('hoverService', HoverService);
})();

(function () {
    'use strict';

    var MinichartCtrl = function () {
        function MinichartCtrl(quandlService, $timeout) {
            _classCallCheck(this, MinichartCtrl);

            this.quandlService = quandlService;
            this.$timeout = $timeout;
        }

        _createClass(MinichartCtrl, [{
            key: 'renderChart',
            value: function renderChart(stock) {
                var _this3 = this;

                this.$timeout(function () {
                    _this3.quandlService.getData(stock.code, function (result) {

                        var extent = fc.util.innerDimensions(document.getElementById(result.code + 'chart'));
                        var width = extent.width,
                            height = extent.height;
                        var data = result.data;
                        data = data.map(function (d) {
                            var date = moment(d.date);
                            d.date = date.toDate();
                            return d;
                        });
                        var container = d3.select('#' + result.code + 'chart').insert('svg', 'div').attr('width', width).attr('height', height);

                        // Create scale for x axis
                        var xScale = fc.scale.dateTime().domain(fc.util.extent().fields('date')(data)).discontinuityProvider(fc.scale.discontinuity.skipWeekends()).range([0, width]);

                        // Create scale for y axis
                        var yScale = d3.scale.linear().domain(fc.util.extent().fields(['high', 'low'])(data)).range([height, 0]).nice();

                        var area = fc.series.area().y1Value(function (d) {
                            return 1000;
                        }).y0Value(function (d) {
                            return d.close;
                        });

                        var line = fc.series.line();

                        var pointData = [].concat(data.slice(0)[0]);
                        var point = fc.series.point();

                        var multi = fc.series.multi().series([area, line, point]).xScale(xScale).yScale(yScale).mapping(function (series) {
                            switch (series) {
                                case point:
                                    return pointData;
                                default:
                                    return data;
                            }
                        });

                        container.append('g').datum(data).call(multi);
                    });
                });
            }
        }]);

        return MinichartCtrl;
    }();

    MinichartCtrl.$inject = ['quandlService', '$timeout'];

    angular.module('openfin.minichart', ['openfin.quandl']).controller('MinichartCtrl', MinichartCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.minichart').directive('minichart', [function () {
        return {
            restrict: 'E',
            templateUrl: 'sidebars/favourites/minichart/minichart.html',
            scope: {
                renderChart: '&',
                stock: '='
            }
        };
    }]);
})();

(function (window) {
    'use strict';

    angular.module('openfin.tearout').directive('tearable', ['geometryService', 'hoverService', 'currentWindowService', function (geometryService, hoverService, currentWindowService) {
        return {
            restrict: 'C',
            link: function link(scope, element, attrs) {
                // TODO: Improve this. Search for first class element upwards?
                var dragElement = element[0],
                    tearElement = dragElement.parentNode.parentNode,
                    tileWidth = tearElement.clientWidth,
                    tileHeight = tearElement.clientHeight,
                    store;

                function createConfig(tearout, width, height) {
                    var config = {
                        'defaultWidth': tileWidth,
                        'defaultHeight': tileHeight,
                        'width': width,
                        'height': height,
                        'autoShow': false,
                        'frame': false
                    };

                    if (tearout) {
                        config.minWidth = tileWidth;
                        config.minHeight = tileHeight;
                        config.url = 'tearout.html';
                    } else {
                        // TODO: Remove duplication of minimum sizes
                        config.minWidth = 918;
                        config.minHeight = 510;
                        config.url = 'index.html';
                    }

                    config.resizable = config.maximizable = config.showTaskbarIcon = config.saveWindowState = !tearout;

                    return config;
                }

                var tearoutWindowConfig = createConfig(true, tileWidth, tileHeight);

                var windowService = window.windowService;
                var tearoutWindow = windowService.createTearoutWindow(tearoutWindowConfig, window.name);

                function initialiseTearout() {
                    var myDropTarget = tearElement.parentNode,
                        parent = myDropTarget.parentNode,
                        myHoverArea = parent.getElementsByClassName('hover-area')[0],
                        offset = { x: 0, y: 0 },
                        currentlyDragging = false,
                        outsideMainWindow = false;

                    var me = {};

                    hoverService.add(myHoverArea, scope.stock.code);

                    // The distance from where the mouse click occurred from the origin of the element that will be torn out.
                    // This is to place the tearout window exactly over the tornout element
                    me.setOffset = function (x, y) {
                        offset.x = x;
                        offset.y = y;

                        return me;
                    };

                    // Sets whether the tearout window is being dragged.
                    // Used to determine whether `mousemove` events should programmatically move the tearout window
                    me.setCurrentlyDragging = function (dragging) {
                        currentlyDragging = dragging;

                        return me;
                    };

                    // A call to the OpenFin API to move the tearout window
                    me.moveTearoutWindow = function (x, y) {
                        var tileTopPadding = 5,
                            tileRightPadding = 5,
                            tearElementWidth = 16;

                        tearoutWindow.moveTo(x - tileWidth + (tearElementWidth - offset.x + tileRightPadding), y - (tileTopPadding + offset.y));

                        return me;
                    };

                    // A call to the OpenFin API to both show the tearout window and ensure that
                    // it is displayed in the foreground
                    me.displayTearoutWindow = function () {
                        tearoutWindow.show();
                        tearoutWindow.setAsForeground();

                        return me;
                    };

                    // Inject the element being tornout into the new, tearout, window
                    me.appendToOpenfinWindow = function (injection, openfinWindow) {
                        openfinWindow.contentWindow.document.body.appendChild(injection);

                        return me;
                    };

                    // Grab the DOM element back from the tearout window and append the given container
                    me.returnFromTearout = function () {
                        myDropTarget.appendChild(tearElement);
                        tearoutWindow.hide();
                    };

                    // Clear out all the elements but keep the js context ;)
                    me.clearIncomingTearoutWindow = function () {
                        tearoutWindow.getNativeWindow().document.body = tearoutWindow.getNativeWindow().document.createElement('body');

                        return me;
                    };

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
                    function elementScreenPosition(windowElement, element1) {
                        var relativeElementPosition = element1.getBoundingClientRect();

                        return {
                            height: relativeElementPosition.height,
                            width: relativeElementPosition.width,
                            top: windowElement.top + relativeElementPosition.top,
                            left: windowElement.left + relativeElementPosition.left
                        };
                    }

                    // On a mousedown event, we grab our destination tearout window and inject
                    // the DOM element to be torn out.
                    //
                    // `handleMouseDown` is the function assigned to the native `mousedown`
                    // event on the element to be torn out. The param `e` is the native event
                    // passed in by the event listener. The steps taken are as follows:
                    // * Set the X and Y offsets to better position the tearout window
                    // * Move the tearout window into position
                    // * Clear out any DOM elements that may already be in the tearout window
                    // * Move the DOM element to be torn out into the tearout
                    // * Display the tearout window in the foreground
                    me.handleMouseDown = function (e) {
                        if (e.button !== 0) {
                            // Only process left clicks
                            return false;
                        }

                        if (dragElement.classList.contains('single')) {
                            // There is only one favourite card so don't allow tearing out
                            return false;
                        }

                        me.setCurrentlyDragging(true).setOffset(e.offsetX, e.offsetY).moveTearoutWindow(e.screenX, e.screenY).clearIncomingTearoutWindow().appendToOpenfinWindow(tearElement, tearoutWindow).displayTearoutWindow();
                    };

                    // On a mousemove event, if we are in a dragging state, move the torn out window programmatically.
                    //
                    // `handleMouseMove` is the function assigned to the `mousemove` event on the `document`.
                    // The param `e` is the native event passed in by the event listener.
                    // If the `currentlyDragging` flag is true move the tearout window.
                    me.handleMouseMove = function (e) {
                        if (currentlyDragging) {
                            me.moveTearoutWindow(e.screenX, e.screenY);
                        }
                    };

                    // On a mouseup event we reset the internal state to be ready for the next dragging event
                    //
                    // `handleMouseUp` is the function assigned to the `mouseup` event on the `document`.
                    me.handleMouseUp = function (e) {
                        if (e.button !== 0) {
                            // Only process left clicks
                            return false;
                        }

                        if (currentlyDragging) {
                            me.setCurrentlyDragging(false);
                            if (!outsideMainWindow) {
                                me.returnFromTearout();
                            } else {
                                if (!store) {
                                    store = window.storeService.open(window.name);
                                }

                                // Remove the stock from the old window
                                store.remove(scope.stock);

                                // Create new window instance
                                var mainApplicationWindowPosition = getWindowPosition(window);

                                var config = createConfig(false, mainApplicationWindowPosition.width, mainApplicationWindowPosition.height);

                                windowService.createMainWindow(config, function (newWindow) {
                                    newWindow.moveTo(e.screenX, e.screenY);
                                    window.storeService.open(newWindow.name).add(scope.stock);
                                });

                                // Remove drop-target from original instance
                                parent.removeChild(myHoverArea);
                                parent.removeChild(myDropTarget);
                                dispose();

                                // Destroy myself.
                                tearoutWindow.close();
                            }
                        }
                    };

                    function reorderFavourites(tearoutRectangle) {
                        var hoverTargets = hoverService.get();

                        for (var i = 0, max = hoverTargets.length; i < max; i++) {
                            var dropTargetRectangle = geometryService.rectangle(elementScreenPosition(getWindowPosition(window), hoverTargets[i].hoverArea)),
                                overDropTarget = tearoutRectangle.intersects(dropTargetRectangle);

                            if (overDropTarget) {
                                // TODO: This is where the pause will go, and the highlighting.
                                if (!store) {
                                    store = window.storeService.open(window.name);
                                }

                                store.reorder(scope.stock.code, hoverTargets[i].code);
                                break;
                            }
                        }
                    }

                    // On the `bounds-changing` event check to see if you are over a potential drop target.
                    // If so update the drop target.
                    tearoutWindow.addEventListener('bounds-changing', function () {
                        // Check if you are over a drop target by seeing if the tearout rectangle intersects the drop target
                        var nativeWindow = tearoutWindow.getNativeWindow(),
                            tearoutRectangle = geometryService.rectangle(getWindowPosition(nativeWindow)),
                            mainApplicationWindowPosition = getWindowPosition(window),
                            mainApplicationRectangle = geometryService.rectangle(mainApplicationWindowPosition);

                        outsideMainWindow = !tearoutRectangle.intersects(mainApplicationRectangle);

                        if (!outsideMainWindow) {
                            reorderFavourites(tearoutRectangle);
                        }
                    });

                    dragElement.addEventListener('mousedown', me.handleMouseDown);
                    document.addEventListener('mousemove', me.handleMouseMove, true);
                    document.addEventListener('mouseup', me.handleMouseUp, true);
                }

                function dispose() {
                    hoverService.remove(scope.stock.code);
                }

                scope.$on('$destroy', function (e) {
                    dispose();
                });

                initialiseTearout();
            }
        };
    }]);
})(window);

(function () {
    'use strict';

    angular.module('openfin.filters').filter('truncate', function () {
        return function (input) {
            if (input) {
                var openBracketIndex = input.indexOf('(');
                return input.slice(0, openBracketIndex - 1); // Also trim the space before the bracket
            }
        };
    });
})();

(function () {
    'use strict';

    angular.module('openfin.scroll').directive('customScrollbar', [function () {
        return {
            restrict: 'C',
            link: function link(scope, element) {
                var scrollPadding = 'scrollPadding';
                element.mCustomScrollbar({
                    callbacks: {
                        onOverflowY: function onOverflowY() {
                            element.addClass(scrollPadding);
                        },
                        onOverflowYNone: function onOverflowYNone() {
                            element.removeClass(scrollPadding);
                        }
                    }
                });
            }
        };
    }]);
})();

(function () {
    'use strict';

    var SearchCtrl = function () {
        function SearchCtrl($scope, quandlService, selectionService, currentWindowService) {
            _classCallCheck(this, SearchCtrl);

            this.$scope = $scope;
            this.quandlService = quandlService;
            this.selectionService = selectionService;
            this.currentWindowService = currentWindowService;

            this.store = null;
            this.query = '';
            this.noResults = false;
            this.stocks = [];

            this._watch();
        }

        _createClass(SearchCtrl, [{
            key: 'selection',
            value: function selection() {
                return this.selectionService.selectedStock().code;
            }
        }, {
            key: 'select',
            value: function select(stock) {
                this.selectionService.select(stock);
            }
        }, {
            key: 'onSearchKeyDown',
            value: function onSearchKeyDown(event) {
                if (event.keyCode === 38) {
                    // Up
                    this.changePointer(-1);
                } else if (event.keyCode === 40) {
                    // Down
                    this.changePointer(1);
                }
            }
        }, {
            key: 'changePointer',
            value: function changePointer(delta) {
                // Change the selection pointer to be the selected stock, if it exists in the list
                // (otherwise, set to -1, which is acceptable as there is no selection yet)
                var currentSelectionPointer = this.stocks.map(function (stockItem) {
                    return stockItem.code;
                }).indexOf(this.selection());

                var newPointer = currentSelectionPointer + delta;

                newPointer = Math.max(0, Math.min(newPointer, this.stocks.length - 1));

                if (this.stocks.length > 0) {
                    this.select(this.stocks[newPointer]);
                }
            }
        }, {
            key: 'submit',
            value: function submit() {
                var _this4 = this;

                this.stocks = [];
                this.noResults = false;

                this.currentWindowService.ready(function () {
                    if (!_this4.store) {
                        _this4.store = window.storeService.open(window.name);
                    }

                    var favourites = _this4.store.get();
                    if (_this4.query) {
                        var length = favourites.length;
                        _this4.quandlService.search(_this4.query, function (stock) {
                            var i;

                            // removing stocks found with old query
                            _this4.stocks = _this4.stocks.filter(function (result, j) {
                                return result.query === _this4.query;
                            });

                            // not adding old stocks
                            if (stock.query !== _this4.query) {
                                return;
                            }

                            // Due to the asynchronicity of the search, if multiple searches
                            // are fired off in a small amount of time, with an intermediate one
                            // returning no results it's possible to have both the noResults flag
                            // set to true, while some stocks have been retrieved by a later search.
                            //
                            // Here we re-set the flag to keep it up-to-date.
                            _this4.noResults = false;

                            var stockAdded = false;
                            for (i = 0; i < length; i++) {
                                if (stock.code === favourites[i]) {
                                    stock.favourite = true;
                                    _this4.stocks.unshift(stock);
                                    stockAdded = true;
                                }
                            }

                            if (!stockAdded) {
                                _this4.stocks.push(stock);
                            }
                        }, function () {
                            return _this4.noResults = true;
                        });
                    } else {
                        favourites.map(function (favourite) {
                            _this4.quandlService.getMeta(favourite, function (stock) {
                                stock.favourite = true;
                                _this4.stocks.push(stock);
                            });
                        });
                    }
                });
            }
        }, {
            key: '_watch',
            value: function _watch() {
                var _this5 = this;

                this.$scope.$watch(
                // Can't watch `this.query` as the subscribers to this controller
                // may alias it (e.g. `searchCtrl.query`), so instead define a
                // function to decouple scoping.
                function () {
                    return _this5.query;
                }, function () {
                    _this5.submit();
                });

                this.$scope.$on('updateFavourites', function (event, data) {
                    if (!data) {
                        return;
                    }

                    var index = _this5.stocks.map(function (stock) {
                        return stock.code;
                    }).indexOf(data.code);
                    if (index > -1) {
                        if (!_this5.query) {
                            // There are no search results, so remove the favourite.
                            _this5.stocks.splice(index, 1);
                        } else {
                            // Update the stock's favourite
                            _this5.stocks[index].favourite = data.favourite;
                        }
                    }
                });
            }
        }]);

        return SearchCtrl;
    }();

    SearchCtrl.$inject = ['$scope', 'quandlService', 'selectionService', 'currentWindowService'];

    angular.module('openfin.search').controller('SearchCtrl', SearchCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.search').directive('search', [function () {
        return {
            restrict: 'E',
            templateUrl: 'sidebars/search/search.html',
            controller: 'SearchCtrl',
            controllerAs: 'searchCtrl'
        };
    }]);
})();

(function () {
    'use strict';

    var classes = {
        expanded: 'expanded',
        contracted: 'contracted'
    };

    var SidebarCtrl = function () {
        function SidebarCtrl() {
            _classCallCheck(this, SidebarCtrl);

            this._favouritesClass = classes.expanded;
            this._searchClass = classes.contracted;

            this._showSearches = false;
            this._showFavourites = true;
            this._searchSmall = true;
        }

        _createClass(SidebarCtrl, [{
            key: 'searchClass',
            value: function searchClass() {
                return this._searchClass;
            }
        }, {
            key: 'favouritesClass',
            value: function favouritesClass() {
                return this._favouritesClass;
            }
        }, {
            key: 'showSearches',
            value: function showSearches() {
                return this._showSearches;
            }
        }, {
            key: 'showFavourites',
            value: function showFavourites() {
                return this._showFavourites;
            }
        }, {
            key: 'searchClick',
            value: function searchClick() {
                if (this._searchSmall) {
                    this._searchSmall = false;
                    this._showFavourites = false;
                    this._searchClass = classes.expanded;
                    this._favouritesClass = classes.contracted;
                    this._showSearches = true;
                }
            }
        }, {
            key: 'favouritesClick',
            value: function favouritesClick() {
                if (!this._searchSmall) {
                    this._searchSmall = true;
                    this._searchClass = classes.contracted;
                    this._favouritesClass = classes.expanded;
                    this._showSearches = false;
                    this._showFavourites = true;
                }
            }
        }]);

        return SidebarCtrl;
    }();

    SidebarCtrl.$inject = [];

    angular.module('openfin.sidebar').controller('SidebarCtrl', SidebarCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.sidebar').directive('sideBar', [function () {
        return {
            restrict: 'E',
            templateUrl: 'sidebars/sidebar.html',
            controller: 'SidebarCtrl',
            controllerAs: 'sidebarCtrl'
        };
    }]);
})();

(function () {
    'use strict';

    var starUrls = {
        off: 'favourite_OFF',
        on: 'favourite_ON',
        offHover: 'favourite_OFF_hover',
        onHover: 'favourite_hover'
    };

    var StarCtrl = function () {
        function StarCtrl($scope, selectionService) {
            _classCallCheck(this, StarCtrl);

            this.$scope = $scope;
            this.store = null;
            this.selectionService = selectionService;

            this.starHovered = false;
            this.check = false;
        }

        _createClass(StarCtrl, [{
            key: 'favouriteUrl',
            value: function favouriteUrl(stock) {
                if (stock.favourite) {
                    return starUrls.on;
                } else if (this.starHovered) {
                    return starUrls.onHover;
                } else if (stock.isHovered || this.selectionService.selectedStock() === stock) {
                    return starUrls.offHover;
                } else {
                    return starUrls.off;
                }
            }
        }, {
            key: 'click',
            value: function click(stock) {
                if (!this.check || confirm('Are you sure you wish to remove this stock (' + stock.code + ') from your favourites?')) {
                    if (!this.store) {
                        this.store = window.storeService.open(window.name);
                    }

                    if (stock.favourite) {
                        stock.favourite = false;
                        this.store.remove(stock);
                    } else {
                        stock.favourite = true;
                        this.store.add(stock);
                    }
                }
            }
        }, {
            key: 'mouseEnter',
            value: function mouseEnter() {
                this.starHovered = true;
            }
        }, {
            key: 'mouseLeave',
            value: function mouseLeave() {
                this.starHovered = false;
            }
        }]);

        return StarCtrl;
    }();

    StarCtrl.$inject = ['$scope', 'selectionService'];

    angular.module('openfin.star').controller('StarCtrl', StarCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.star').directive('star', [function () {
        return {
            restrict: 'E',
            templateUrl: 'sidebars/star/star.html',
            scope: {
                starClick: '&',
                favouriteUrl: '&',
                mouseLeave: '&',
                mouseEnter: '&'
            }
        };
    }]);
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

(function () {
    'use strict';

    var ToolbarCtrl = function () {
        function ToolbarCtrl($timeout, currentWindowService) {
            _classCallCheck(this, ToolbarCtrl);

            this.$timeout = $timeout;
            this.currentWindowService = currentWindowService;
            this.maximised = false;
            this.compact = false;
            currentWindowService.ready(this.onReady.bind(this));
        }

        _createClass(ToolbarCtrl, [{
            key: 'onReady',
            value: function onReady() {
                var _this6 = this;

                this.window = this.currentWindowService.getCurrentWindow();
                this.window.getBounds(function (bounds) {
                    _this6.compact = _this6.currentWindowService.compact = bounds.width === 230;
                });
                this.window.addEventListener('maximized', function () {
                    _this6.$timeout(function () {
                        _this6.maximised = true;
                    });

                    _this6.window.addEventListener('restored', function (e) {
                        this.$timeout(function () {
                            this.maximised = false;
                        });
                    });
                });
                this.window.addEventListener('bounds-changed', function (e) {
                    _this6.window.getBounds(function (bounds) {
                        _this6.currentWindowService.compact = bounds.width === 230;
                    });
                });
            }
        }, {
            key: 'minimiseClick',
            value: function minimiseClick() {
                this.window.minimize();
            }
        }, {
            key: 'maximiseClick',
            value: function maximiseClick() {
                this.window.maximize();
            }
        }, {
            key: 'normalSizeClick',
            value: function normalSizeClick() {
                this.window.restore();
                this.window.resizeTo(1280, 720, 'top-right');
            }
        }, {
            key: 'compactClick',
            value: function compactClick() {
                this.compact = !this.compact;
                this.currentWindowService.compact = this.compact;
                if (this.compact) {
                    this.window.resizeTo(230, 500, 'top-right');
                } else if (this.maximised) {
                    this.window.maximize();
                } else {
                    this.window.resizeTo(1280, 720, 'top-right');
                }
            }
        }, {
            key: 'closeClick',
            value: function closeClick() {
                this.window.close();
            }
        }]);

        return ToolbarCtrl;
    }();

    ToolbarCtrl.$inject = ['$timeout', 'currentWindowService'];

    angular.module('openfin.toolbar').controller('ToolbarCtrl', ToolbarCtrl);
})();

(function () {
    'use strict';

    angular.module('openfin.toolbar').directive('toolbar', [function () {
        return {
            restrict: 'E',
            templateUrl: 'toolbar/toolbar.html',
            controller: 'ToolbarCtrl',
            controllerAs: 'toolbarCtrl'
        };
    }]);
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
                var _this7 = this;

                if (!config.name) {
                    config.name = getName();
                }

                var newWindow = new fin.desktop.Window(config, function () {
                    _this7.windowsCache.push(newWindow);

                    if (successCb) {
                        successCb(newWindow);
                    }
                });

                this.apps.increment();

                newWindow.addEventListener('closed', function (e) {
                    var parent = _this7.openWindows[newWindow.name];
                    if (parent) {
                        for (var i = 0, max = parent.length; i < max; i++) {
                            parent[i].close();
                        }
                    }

                    var index = _this7.windowsCache.indexOf(newWindow);
                    _this7.windowsCache.slice(index, 1);

                    if (closedCb) {
                        closedCb();
                    }

                    _this7.apps.decrement();
                });

                return newWindow;
            }
        }, {
            key: 'createMainWindow',
            value: function createMainWindow(config, successCb) {
                var _this8 = this;

                this._createWindow(config, function (newWindow) {
                    // TODO
                    // Begin super hack
                    newWindow.getNativeWindow().windowService = _this8;
                    newWindow.getNativeWindow().storeService = _this8.storeService;
                    // End super hack

                    if (successCb) {
                        successCb(newWindow);
                    }

                    newWindow.show();
                }, function () {
                    if (_this8.apps.count() !== 1) {
                        _this8.storeService.open(config.name).closeWindow();
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

/* eslint no-underscore-dangle:0,no-console:0,no-unused-vars:0 */
/**
 * @module GTM
 *
 * Google Tag Manager data layer support for Storefront Reference Architechture (SFRA)
 *
 * Assumes jQuery available on window object as this is the current methodology of
 * SFRA. If that changes to use webpack and commonjs properly this would need refactoring to
 * include it properly.
 */

require('./polyfills');
require('intersection-observer');

var preprocessors = require('./preprocessors');
var $ = window.jQuery;

var GDL_MARKER = /gdl:(.*?)(\s|-)/;

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this;
        var args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function findGDLNode(parent, id) {
    var node = null;
    if (parent.childNodes) {
        for (var i = 0; i < parent.childNodes.length; i++) {
            var n = parent.childNodes[i];
            if (n.nodeType === 1) {
                var candidate = findGDLNode(n, id);
                if (candidate) {
                    node = candidate;
                }
            } else if (n.nodeType === 8) {
                var match = n.textContent.match(GDL_MARKER);
                if (match && match[1] === id) {
                    var elementSibling = n.nextElementSibling;
                    if (!elementSibling) {
                        elementSibling = n.nextSibling;
                        var count = 0;
                        while (!elementSibling || elementSibling.nodeType !== 1) {
                            count++;
                            elementSibling = elementSibling.nextSibling;

                            if (count > 10) {
                                break;
                            }
                        }
                    }
                    node = { id: match[1], node: n, element: elementSibling };
                }
            }
        }
    }
    return node;
}

function findGDLNodesR(parent, nodes) {
    if (parent.childNodes) {
        for (var i = 0; i < parent.childNodes.length; i++) {
            var n = parent.childNodes[i];
            if (n.nodeType === 1) {
                findGDLNodesR(n, nodes);
            } else if (n.nodeType === 8) {
                var match = n.textContent.match(GDL_MARKER);
                if (match) {
                    var elementSibling = n.nextElementSibling;
                    nodes.push({ ID: match[1], node: n, element: elementSibling });
                }
            }
        }
    }
}

/**
 * Find Datalayer Comment Nodes and related information
 *
 * @arg {Element} parent parent node to begin search
 * @returns {Array} array of node information
 */
function findGDLNodes(parent) {
    var nodes = [];

    findGDLNodesR(parent, nodes);
    return nodes;
}

function processDataLayer(dataLayer) {
    window.dataLayer = window.dataLayer || [];
    for (var i = 0; i < dataLayer.length; i++) {
        window.dataLayer.push(dataLayer[i]);
    }
}

function processGlobalData(globalData) {
    // shallow merge incoming global data
    if (globalData) {
        for (var attr in globalData) { //eslint-disable-line
            if (Object.prototype.hasOwnProperty.call(globalData, attr)) {
                window._gtmGlobalData[attr] = globalData[attr];
            }
        }
    }
}

function enqueueDataLayerUpdate(dataLayer, globalData) {
    setTimeout(function () {
        processDataLayer(dataLayer);
        processGlobalData(globalData);
    }, 0);
}

function GTMPageContext() {
    var i;
    var This = this;
    window._gdl = window._gdl || []; // eslint-disable-line
    var existingDataLayer = window._gdl;

    this.dataLayer = [];
    this.nodes = [];
    this.nodesByID = {};
    this.dataLayerByID = {};
    this.reportedImpressions = [];
    this.observedImpressions = [];

    window._gdl = this.dataLayer;

    this.io = new IntersectionObserver(this.observer.bind(this), {
        threshold: 0.5
    });
    this.io.POLL_INTERVAL = 1000;

    var originalPush = this.dataLayer.push;
    this.dataLayer.push = function () {
        for (var j = 0; j < arguments.length; j++) {
            var item = arguments[j];
            var node = findGDLNode(document, item.ID);
            This.addInlineDataLayer(item, node);
        }
        originalPush.apply(This.dataLayer, arguments);
    };

    for (i = 0; i < existingDataLayer.length; i++) {
        var dl = existingDataLayer[i];
        this.dataLayer.push(dl);
    }

    GTMPageContext.prototype.impressionReporterDebounced = debounce.call(this, function () {
        this.impressionReporter();
    }, 1000);
}

GTMPageContext.prototype.observer = function (entries, io) {
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.intersectionRatio <= 0) {
            continue; // eslint-disable-line
        }
        io.unobserve(entry.target);

        if (this.reportedImpressions.indexOf(entry.target) === -1 &&
            this.observedImpressions.indexOf(entry.target) === -1) {
            this.observedImpressions.push(entry.target);
        }
    }

    this.impressionReporterDebounced();
};

GTMPageContext.prototype.impressionReporter = function () {
    if (this.observedImpressions.length === 0) {
        return;
    }

    var _dataLayer = {
        ecommerce: {}
    };

    _dataLayer.event = "impressions";

    var impressions = [];
    for (var i = 0; i < this.observedImpressions.length; i++) {
        var el = this.observedImpressions[i];
        var dataLayer = this.dataLayerByID[el._gtmDataLayerID];
        if (dataLayer) {
            impressions.push(dataLayer.d);
        }
    }

    Array.prototype.push.apply(this.reportedImpressions, this.observedImpressions);

    this.observedImpressions = [];
    _dataLayer.ecommerce.impressions = impressions;

    window.dataLayer.push(_dataLayer);
};

GTMPageContext.prototype.addInlineDataLayer = function (item, node) {
    var This = this;
    if (node) {
        if (item.e === 'impressions') {
            item.d = preprocessors.preprocessImpression(item.d, node.element);
            this.io.observe(node.element);

            $(node.element).off('click', 'a').on('click', 'a', function (e) {
                This.impressionReporter();
                var list = item.d.list;
                window.dataLayer.push({
                    event: 'productClick',
                    ecommerce: {
                        click: {
                            actionField: {
                                list: list
                            },
                            products: [item.d]
                        }
                    }
                });
            });
        }

        this.nodes.push(node);
        this.nodesByID[item.ID] = node;
        node.element._gtmDataLayerID = item.ID;
        this.dataLayerByID[item.ID] = item;
    }
};

/**
 * Initialize SFRA GTM Datalayer routines
 *
 * This should only be called once per page load.
 */
exports.init = function () {
    // Find data layer "nodes" rendered prior to initialization
    window.gtmPageContext = new GTMPageContext();

    // Ensure post requests contain contextual gtm data
    // TODO: support json (not a requirement at this time)
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (options.contentType && options.contentType.indexOf('www-form-urlencoded') !== -1 &&
            options.method === 'POST' && window._gtmGlobalData &&
            options.data && options.data.indexOf('_gtmGlobalData') === -1) {
            options.data = options.data + "&_gtmGlobalData=" + JSON.stringify(window._gtmGlobalData);
        }
    });

    // Listen for datalayer and contextual updates in json responses
    $(document).ajaxComplete(function (event, xhr, settings) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var contentType = xhr.getResponseHeader('content-type');
                if (contentType && contentType.indexOf('json')) {
                    try {
                        var rawResponse = xhr.responseText;
                        var resp = JSON.parse(rawResponse); //eslint-disable-line
                        if (resp.GTMDataLayer || resp.GTMGlobalData) {
                            enqueueDataLayerUpdate(resp.GTMDataLayer, resp.GTMGlobalData);
                        }

                    } catch (e) { //eslint-disable-line
                    }
                }
            }
        }
    });
};

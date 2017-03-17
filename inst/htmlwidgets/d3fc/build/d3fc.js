(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-scale'), require('d3-time'), require('d3-random'), require('d3-request'), require('d3-path'), require('d3-selection'), require('d3-shape'), require('d3-dispatch')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-scale', 'd3-time', 'd3-random', 'd3-request', 'd3-path', 'd3-selection', 'd3-shape', 'd3-dispatch'], factory) :
  (factory((global.fc = global.fc || {}),global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3));
}(this, (function (exports,d3Array,d3Scale,d3Time,d3Random,d3Request,d3Path,d3Selection,d3Shape,d3Dispatch) { 'use strict';

var createReboundMethod = (function (target, source, name) {
    var method = source[name];
    if (typeof method !== 'function') {
        throw new Error('Attempt to rebind ' + name + ' which isn\'t a function on the source object');
    }
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var value = method.apply(source, args);
        return value === source ? target : value;
    };
});

var rebind = (function (target, source) {
    for (var _len = arguments.length, names = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        names[_key - 2] = arguments[_key];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            target[name] = createReboundMethod(target, source, name);
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

    return target;
});

var createTransform = function createTransform(transforms) {
    return function (name) {
        return transforms.reduce(function (name, fn) {
            return name && fn(name);
        }, name);
    };
};

var rebindAll = (function (target, source) {
    for (var _len = arguments.length, transforms = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        transforms[_key - 2] = arguments[_key];
    }

    var transform = createTransform(transforms);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(source)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            var result = transform(name);
            if (result) {
                target[result] = createReboundMethod(target, source, name);
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

    return target;
});

var regexify = (function (strsOrRegexes) {
    return strsOrRegexes.map(function (strOrRegex) {
        return typeof strOrRegex === 'string' ? new RegExp('^' + strOrRegex + '$') : strOrRegex;
    });
});

var exclude = (function () {
    for (var _len = arguments.length, exclusions = Array(_len), _key = 0; _key < _len; _key++) {
        exclusions[_key] = arguments[_key];
    }

    exclusions = regexify(exclusions);
    return function (name) {
        return exclusions.every(function (exclusion) {
            return !exclusion.test(name);
        }) && name;
    };
});

var include = (function () {
    for (var _len = arguments.length, inclusions = Array(_len), _key = 0; _key < _len; _key++) {
        inclusions[_key] = arguments[_key];
    }

    inclusions = regexify(inclusions);
    return function (name) {
        return inclusions.some(function (inclusion) {
            return inclusion.test(name);
        }) && name;
    };
});

var includeMap = (function (mappings) {
  return function (name) {
    return mappings[name];
  };
});

var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
};

var prefix = (function (prefix) {
  return function (name) {
    return prefix + capitalizeFirstLetter(name);
  };
});

function identity(d) {
    return d;
}
function noop(d) {}

function functor(v) {
    return typeof v === 'function' ? v : function () {
        return v;
    };
}
function convertNaN(value) {
    return typeof value === 'number' && isNaN(value) ? undefined : value;
}

var _slidingWindow = function () {

    var period = function period() {
        return 10;
    };
    var accumulator = noop;
    var value = identity;
    var defined = function defined(d) {
        return d != null;
    };

    var slidingWindow = function slidingWindow(data) {
        var size = period.apply(this, arguments);
        var windowData = data.slice(0, size).map(value);
        return data.map(function (d, i) {
            if (i >= size) {
                // Treat windowData as FIFO rolling buffer
                windowData.shift();
                windowData.push(value(d, i));
            }
            if (i < size - 1 || windowData.some(function (d) {
                return !defined(d);
            })) {
                return accumulator(undefined, i);
            }
            return accumulator(windowData, i);
        });
    };

    slidingWindow.period = function () {
        if (!arguments.length) {
            return period;
        }
        period = functor(arguments.length <= 0 ? undefined : arguments[0]);
        return slidingWindow;
    };
    slidingWindow.accumulator = function () {
        if (!arguments.length) {
            return accumulator;
        }
        accumulator = arguments.length <= 0 ? undefined : arguments[0];
        return slidingWindow;
    };
    slidingWindow.defined = function () {
        if (!arguments.length) {
            return defined;
        }
        defined = arguments.length <= 0 ? undefined : arguments[0];
        return slidingWindow;
    };
    slidingWindow.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return slidingWindow;
    };

    return slidingWindow;
};

var bollingerBands = function () {

    var multiplier = 2;

    var slidingWindow = _slidingWindow().accumulator(function (values) {
        var stdDev = values && d3Array.deviation(values);
        var average = values && d3Array.mean(values);
        return {
            average: average,
            upper: convertNaN(average + multiplier * stdDev),
            lower: convertNaN(average - multiplier * stdDev)
        };
    });

    var bollingerBands = function bollingerBands(data) {
        return slidingWindow(data);
    };

    bollingerBands.multiplier = function () {
        if (!arguments.length) {
            return multiplier;
        }
        multiplier = arguments.length <= 0 ? undefined : arguments[0];
        return bollingerBands;
    };

    rebind(bollingerBands, slidingWindow, 'period', 'value');

    return bollingerBands;
};

var exponentialMovingAverage = function () {

    var value = identity;
    var period = function period() {
        return 9;
    };

    var initialMovingAverageAccumulator = function initialMovingAverageAccumulator(period) {
        var values = [];
        return function (value) {
            var movingAverage = void 0;
            if (values.length < period) {
                if (value != null) {
                    values.push(value);
                } else {
                    values = [];
                }
            }
            if (values.length >= period) {
                movingAverage = d3Array.mean(values);
            }
            return movingAverage;
        };
    };
    var exponentialMovingAverage = function exponentialMovingAverage(data) {
        var size = period.apply(this, arguments);
        var alpha = 2 / (size + 1);
        var initialAccumulator = initialMovingAverageAccumulator(size);
        var ema = void 0;
        return data.map(function (d, i) {
            var v = value(d, i);
            if (ema === undefined) {
                ema = initialAccumulator(v);
            } else {
                ema = v * alpha + (1 - alpha) * ema;
            }
            return convertNaN(ema);
        });
    };

    exponentialMovingAverage.period = function () {
        if (!arguments.length) {
            return period;
        }
        period = functor(arguments.length <= 0 ? undefined : arguments[0]);
        return exponentialMovingAverage;
    };

    exponentialMovingAverage.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return exponentialMovingAverage;
    };

    return exponentialMovingAverage;
};

var macd = function () {

    var value = identity;

    var fastEMA = exponentialMovingAverage().period(12);
    var slowEMA = exponentialMovingAverage().period(26);
    var signalEMA = exponentialMovingAverage().period(9);

    var macd = function macd(data) {

        fastEMA.value(value);
        slowEMA.value(value);

        var diff = d3Array.zip(fastEMA(data), slowEMA(data)).map(function (d) {
            return d[0] !== undefined && d[1] !== undefined ? d[0] - d[1] : undefined;
        });

        var averageDiff = signalEMA(diff);

        return d3Array.zip(diff, averageDiff).map(function (d) {
            return {
                macd: d[0],
                signal: d[1],
                divergence: d[0] !== undefined && d[1] !== undefined ? d[0] - d[1] : undefined
            };
        });
    };

    macd.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return macd;
    };

    rebindAll(macd, fastEMA, includeMap({ 'period': 'fastPeriod' }));
    rebindAll(macd, slowEMA, includeMap({ 'period': 'slowPeriod' }));
    rebindAll(macd, signalEMA, includeMap({ 'period': 'signalPeriod' }));

    return macd;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var relativeStrengthIndex = function () {

    var slidingWindow = _slidingWindow().period(14);
    var wildersSmoothing = function wildersSmoothing(values, prevAvg) {
        return prevAvg + (values[values.length - 1] - prevAvg) / values.length;
    };
    var downChange = function downChange(_ref) {
        var _ref2 = slicedToArray(_ref, 2),
            prevClose = _ref2[0],
            close = _ref2[1];

        return prevClose < close ? 0 : prevClose - close;
    };
    var upChange = function upChange(_ref3) {
        var _ref4 = slicedToArray(_ref3, 2),
            prevClose = _ref4[0],
            close = _ref4[1];

        return prevClose > close ? 0 : close - prevClose;
    };

    var updateAverage = function updateAverage(changes, prevAverage) {
        return prevAverage !== undefined ? wildersSmoothing(changes, prevAverage) : d3Array.mean(changes);
    };

    var makeAccumulator = function makeAccumulator() {
        var prevClose = void 0;
        var downChangesAvg = void 0;
        var upChangesAvg = void 0;
        return function (closes) {
            if (!closes) {
                if (prevClose !== undefined) {
                    prevClose = NaN;
                }
                return undefined;
            }
            if (prevClose === undefined) {
                prevClose = closes[0];
                return undefined;
            }

            var closePairs = d3Array.pairs([prevClose].concat(toConsumableArray(closes)));
            downChangesAvg = updateAverage(closePairs.map(downChange), downChangesAvg);
            upChangesAvg = updateAverage(closePairs.map(upChange), upChangesAvg);
            var rs = !isNaN(prevClose) ? upChangesAvg / downChangesAvg : NaN;
            return convertNaN(100 - 100 / (1 + rs));
        };
    };

    var rsi = function rsi(data) {
        var rsiAccumulator = makeAccumulator();
        slidingWindow.accumulator(rsiAccumulator);
        return slidingWindow(data);
    };

    rebind(rsi, slidingWindow, 'period', 'value');
    return rsi;
};

var movingAverage = function () {

    var slidingWindow = _slidingWindow().accumulator(function (values) {
        return values && d3Array.mean(values);
    });

    var movingAverage = function movingAverage(data) {
        return slidingWindow(data);
    };

    rebind(movingAverage, slidingWindow, 'period', 'value');

    return movingAverage;
};

var stochasticOscillator = function () {

    var closeValue = function closeValue(d, i) {
        return d.close;
    };
    var highValue = function highValue(d, i) {
        return d.high;
    };
    var lowValue = function lowValue(d, i) {
        return d.low;
    };

    var kWindow = _slidingWindow().period(5).defined(function (d) {
        return closeValue(d) != null && highValue(d) != null && lowValue(d) != null;
    }).accumulator(function (values) {
        var maxHigh = values && d3Array.max(values, highValue);
        var minLow = values && d3Array.min(values, lowValue);
        var kValue = values && 100 * (closeValue(values[values.length - 1]) - minLow) / (maxHigh - minLow);
        return convertNaN(kValue);
    });

    var dWindow = movingAverage().period(3);

    var stochastic = function stochastic(data) {
        var kValues = kWindow(data);
        var dValues = dWindow(kValues);
        return kValues.map(function (k, i) {
            return { k: k, d: dValues[i] };
        });
    };

    stochastic.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return stochastic;
    };
    stochastic.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = arguments.length <= 0 ? undefined : arguments[0];
        return stochastic;
    };
    stochastic.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = arguments.length <= 0 ? undefined : arguments[0];
        return stochastic;
    };

    rebindAll(stochastic, kWindow, includeMap({ 'period': 'kPeriod' }));
    rebindAll(stochastic, dWindow, includeMap({ 'period': 'dPeriod' }));

    return stochastic;
};

var forceIndex = function () {

    var volumeValue = function volumeValue(d, i) {
        return d.volume;
    };
    var closeValue = function closeValue(d, i) {
        return d.close;
    };

    var emaComputer = exponentialMovingAverage().period(13);

    var slidingWindow = _slidingWindow().period(2).defined(function (d) {
        return closeValue(d) != null && volumeValue(d) != null;
    }).accumulator(function (values) {
        return values && convertNaN((closeValue(values[1]) - closeValue(values[0])) * volumeValue(values[1]));
    });

    var force = function force(data) {
        var forceIndex = slidingWindow(data);
        return emaComputer(forceIndex);
    };

    force.volumeValue = function () {
        if (!arguments.length) {
            return volumeValue;
        }
        volumeValue = arguments.length <= 0 ? undefined : arguments[0];
        return force;
    };
    force.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return force;
    };

    rebind(force, emaComputer, 'period');

    return force;
};

var envelope = function () {

    var factor = 0.1;
    var value = identity;

    var envelope = function envelope(data) {
        return data.map(function (d) {
            var lower = convertNaN(value(d) * (1.0 - factor));
            var upper = convertNaN(value(d) * (1.0 + factor));
            return { lower: lower, upper: upper };
        });
    };

    envelope.factor = function () {
        if (!arguments.length) {
            return factor;
        }
        factor = arguments.length <= 0 ? undefined : arguments[0];
        return envelope;
    };

    envelope.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return envelope;
    };

    return envelope;
};

var elderRay = function () {

    var closeValue = function closeValue(d, i) {
        return d.close;
    };
    var highValue = function highValue(d, i) {
        return d.high;
    };
    var lowValue = function lowValue(d, i) {
        return d.low;
    };

    var emaComputer = exponentialMovingAverage().period(13);

    var elderRay = function elderRay(data) {
        emaComputer.value(closeValue);
        return d3Array.zip(data, emaComputer(data)).map(function (d) {
            var bullPower = convertNaN(highValue(d[0]) - d[1]);
            var bearPower = convertNaN(lowValue(d[0]) - d[1]);
            return { bullPower: bullPower, bearPower: bearPower };
        });
    };

    elderRay.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return elderRay;
    };

    elderRay.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = arguments.length <= 0 ? undefined : arguments[0];
        return elderRay;
    };
    elderRay.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = arguments.length <= 0 ? undefined : arguments[0];
        return elderRay;
    };

    rebind(elderRay, emaComputer, 'period');

    return elderRay;
};

var identity$1 = function () {

    var identity = {};

    identity.distance = function (start, end) {
        return end - start;
    };

    identity.offset = function (start, offset) {
        return start instanceof Date ? new Date(start.getTime() + offset) : start + offset;
    };

    identity.clampUp = function (d) {
        return d;
    };

    identity.clampDown = function (d) {
        return d;
    };

    identity.copy = function () {
        return identity;
    };

    return identity;
};

function tickFilter(ticks, scale, domain) {
    var scaledTicks = ticks.map(function (tick) {
        return [scale(tick), tick];
    });

    var valueOf = function valueOf(datum) {
        return datum instanceof Date ? datum.getTime() : datum;
    };

    var uniqueTicks = scaledTicks.reduce(function (arr, tick) {
        if (arr.filter(function (f) {
            return valueOf(f[0]) === valueOf(tick[0]);
        }).length === 0) {
            arr.push(tick);
        }
        return arr;
    }, []);
    return uniqueTicks.map(function (t) {
        return t[1];
    });
}

function discontinuous(adaptedScale) {
    var _this = this;

    if (!arguments.length) {
        adaptedScale = d3Scale.scaleIdentity();
    }

    var discontinuityProvider = identity$1();

    var scale = function scale(value) {
        var domain = adaptedScale.domain();
        var range$$1 = adaptedScale.range();

        // The discontinuityProvider is responsible for determine the distance between two points
        // along a scale that has discontinuities (i.e. sections that have been removed).
        // the scale for the given point 'x' is calculated as the ratio of the discontinuous distance
        // over the domain of this axis, versus the discontinuous distance to 'x'
        var totalDomainDistance = discontinuityProvider.distance(domain[0], domain[1]);
        var distanceToX = discontinuityProvider.distance(domain[0], value);
        var ratioToX = distanceToX / totalDomainDistance;
        var scaledByRange = ratioToX * (range$$1[1] - range$$1[0]) + range$$1[0];
        return scaledByRange;
    };

    scale.invert = function (x) {
        var domain = adaptedScale.domain();
        var range$$1 = adaptedScale.range();

        var ratioToX = (x - range$$1[0]) / (range$$1[1] - range$$1[0]);
        var totalDomainDistance = discontinuityProvider.distance(domain[0], domain[1]);
        var distanceToX = ratioToX * totalDomainDistance;
        return discontinuityProvider.offset(domain[0], distanceToX);
    };

    scale.domain = function () {
        if (!arguments.length) {
            return adaptedScale.domain();
        }
        var newDomain = arguments.length <= 0 ? undefined : arguments[0];

        // clamp the upper and lower domain values to ensure they
        // do not fall within a discontinuity
        var domainLower = discontinuityProvider.clampUp(newDomain[0]);
        var domainUpper = discontinuityProvider.clampDown(newDomain[1]);
        adaptedScale.domain([domainLower, domainUpper]);
        return scale;
    };

    scale.nice = function () {
        adaptedScale.nice();
        var domain = adaptedScale.domain();
        var domainLower = discontinuityProvider.clampUp(domain[0]);
        var domainUpper = discontinuityProvider.clampDown(domain[1]);
        adaptedScale.domain([domainLower, domainUpper]);
        return scale;
    };

    scale.ticks = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var ticks = adaptedScale.ticks.apply(_this, args);
        return tickFilter(ticks, scale, scale.domain());
    };

    scale.copy = function () {
        return discontinuous(adaptedScale.copy()).discontinuityProvider(discontinuityProvider.copy());
    };

    scale.discontinuityProvider = function () {
        if (!arguments.length) {
            return discontinuityProvider;
        }
        discontinuityProvider = arguments.length <= 0 ? undefined : arguments[0];
        return scale;
    };

    rebindAll(scale, adaptedScale, include('range', 'rangeRound', 'interpolate', 'clamp', 'tickFormat'));

    return scale;
}

var skipWeekends = function () {
    var millisPerDay = 24 * 3600 * 1000;
    var millisPerWorkWeek = millisPerDay * 5;
    var millisPerWeek = millisPerDay * 7;

    var skipWeekends = {};

    var isWeekend = function isWeekend(date) {
        return date.getDay() === 0 || date.getDay() === 6;
    };

    skipWeekends.clampDown = function (date) {
        if (date && isWeekend(date)) {
            var daysToSubtract = date.getDay() === 0 ? 2 : 1;
            // round the date up to midnight
            var newDate = d3Time.timeDay.ceil(date);
            // then subtract the required number of days
            return d3Time.timeDay.offset(newDate, -daysToSubtract);
        } else {
            return date;
        }
    };

    skipWeekends.clampUp = function (date) {
        if (date && isWeekend(date)) {
            var daysToAdd = date.getDay() === 0 ? 1 : 2;
            // round the date down to midnight
            var newDate = d3Time.timeDay.floor(date);
            // then add the required number of days
            return d3Time.timeDay.offset(newDate, daysToAdd);
        } else {
            return date;
        }
    };

    // returns the number of included milliseconds (i.e. those which do not fall)
    // within discontinuities, along this scale
    skipWeekends.distance = function (startDate, endDate) {
        startDate = skipWeekends.clampUp(startDate);
        endDate = skipWeekends.clampDown(endDate);

        // move the start date to the end of week boundary
        var offsetStart = d3Time.timeSaturday.ceil(startDate);
        if (endDate < offsetStart) {
            return endDate.getTime() - startDate.getTime();
        }

        var msAdded = offsetStart.getTime() - startDate.getTime();

        // move the end date to the end of week boundary
        var offsetEnd = d3Time.timeSaturday.ceil(endDate);
        var msRemoved = offsetEnd.getTime() - endDate.getTime();

        // determine how many weeks there are between these two dates
        // round to account for DST transitions
        var weeks = Math.round((offsetEnd.getTime() - offsetStart.getTime()) / millisPerWeek);

        return weeks * millisPerWorkWeek + msAdded - msRemoved;
    };

    skipWeekends.offset = function (startDate, ms) {
        var date = isWeekend(startDate) ? skipWeekends.clampUp(startDate) : startDate;

        if (ms === 0) {
            return date;
        }

        var isNegativeOffset = ms < 0;
        var isPositiveOffset = ms > 0;
        var remainingms = ms;

        // move to the end of week boundary for a postive offset or to the start of a week for a negative offset
        var weekBoundary = isNegativeOffset ? d3Time.timeMonday.floor(date) : d3Time.timeSaturday.ceil(date);
        remainingms -= weekBoundary.getTime() - date.getTime();

        // if the distance to the boundary is greater than the number of ms
        // simply add the ms to the current date
        if (isNegativeOffset && remainingms > 0 || isPositiveOffset && remainingms < 0) {
            return new Date(date.getTime() + ms);
        }

        // skip the weekend for a positive offset
        date = isNegativeOffset ? weekBoundary : d3Time.timeDay.offset(weekBoundary, 2);

        // add all of the complete weeks to the date
        var completeWeeks = Math.floor(remainingms / millisPerWorkWeek);
        date = d3Time.timeDay.offset(date, completeWeeks * 7);
        remainingms -= completeWeeks * millisPerWorkWeek;

        // add the remaining time
        date = new Date(date.getTime() + remainingms);
        return date;
    };

    skipWeekends.copy = function () {
        return skipWeekends;
    };

    return skipWeekends;
};

var provider = function provider() {
    for (var _len = arguments.length, ranges = Array(_len), _key = 0; _key < _len; _key++) {
        ranges[_key] = arguments[_key];
    }

    var inRange = function inRange(number, range$$1) {
        return number > range$$1[0] && number < range$$1[1];
    };

    var surroundsRange = function surroundsRange(inner, outer) {
        return inner[0] >= outer[0] && inner[1] <= outer[1];
    };

    var identity = {};

    identity.distance = function (start, end) {
        start = identity.clampUp(start);
        end = identity.clampDown(end);

        var surroundedRanges = ranges.filter(function (r) {
            return surroundsRange(r, [start, end]);
        });
        var rangeSizes = surroundedRanges.map(function (r) {
            return r[1] - r[0];
        });

        return end - start - rangeSizes.reduce(function (total, current) {
            return total + current;
        }, 0);
    };

    var add = function add(value, offset) {
        return value instanceof Date ? new Date(value.getTime() + offset) : value + offset;
    };

    identity.offset = function (location, offset) {
        if (offset > 0) {
            var _ret = function () {
                var currentLocation = identity.clampUp(location);
                var offsetRemaining = offset;
                while (offsetRemaining > 0) {
                    var futureRanges = ranges.filter(function (r) {
                        return r[0] > currentLocation;
                    }).sort(function (a, b) {
                        return a[0] - b[0];
                    });
                    if (futureRanges.length) {
                        var nextRange = futureRanges[0];
                        var delta = nextRange[0] - currentLocation;
                        if (delta > offsetRemaining) {
                            currentLocation = add(currentLocation, offsetRemaining);
                            offsetRemaining = 0;
                        } else {
                            currentLocation = nextRange[1];
                            offsetRemaining -= delta;
                        }
                    } else {
                        currentLocation = add(currentLocation, offsetRemaining);
                        offsetRemaining = 0;
                    }
                }
                return {
                    v: currentLocation
                };
            }();

            if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
        } else {
            var _ret2 = function () {
                var currentLocation = identity.clampDown(location);
                var offsetRemaining = offset;
                while (offsetRemaining < 0) {
                    var futureRanges = ranges.filter(function (r) {
                        return r[1] < currentLocation;
                    }).sort(function (a, b) {
                        return b[0] - a[0];
                    });
                    if (futureRanges.length) {
                        var nextRange = futureRanges[0];
                        var delta = nextRange[1] - currentLocation;
                        if (delta < offsetRemaining) {
                            currentLocation = add(currentLocation, offsetRemaining);
                            offsetRemaining = 0;
                        } else {
                            currentLocation = nextRange[0];
                            offsetRemaining -= delta;
                        }
                    } else {
                        currentLocation = add(currentLocation, offsetRemaining);
                        offsetRemaining = 0;
                    }
                }
                return {
                    v: currentLocation
                };
            }();

            if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
        }
    };

    identity.clampUp = function (d) {
        return ranges.reduce(function (value, range$$1) {
            return inRange(value, range$$1) ? range$$1[1] : value;
        }, d);
    };

    identity.clampDown = function (d) {
        return ranges.reduce(function (value, range$$1) {
            return inRange(value, range$$1) ? range$$1[0] : value;
        }, d);
    };

    identity.copy = function () {
        return identity;
    };

    return identity;
};

var linearExtent = function () {

    var accessors = [function (d) {
        return d;
    }];
    var pad = [0, 0];
    var padUnit = 'percent';
    var symmetricalAbout = null;
    var include = [];

    var instance = function instance(data) {
        var values = new Array(data.length);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = accessors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var accessor = _step.value;

                for (var i = 0; i < data.length; i++) {
                    var value = accessor(data[i], i);
                    if (Array.isArray(value)) {
                        values.push.apply(values, toConsumableArray(value));
                    } else {
                        values.push(value);
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

        var extent$$1 = [d3Array.min(values), d3Array.max(values)];

        extent$$1[0] = extent$$1[0] == null ? d3Array.min(include) : d3Array.min([extent$$1[0]].concat(toConsumableArray(include)));
        extent$$1[1] = extent$$1[1] == null ? d3Array.max(include) : d3Array.max([extent$$1[1]].concat(toConsumableArray(include)));

        if (symmetricalAbout != null) {
            var halfRange = Math.max(Math.abs(extent$$1[1] - symmetricalAbout), Math.abs(extent$$1[0] - symmetricalAbout));
            extent$$1[0] = symmetricalAbout - halfRange;
            extent$$1[1] = symmetricalAbout + halfRange;
        }

        switch (padUnit) {
            case 'domain':
                {
                    extent$$1[0] -= pad[0];
                    extent$$1[1] += pad[1];
                    break;
                }
            case 'percent':
                {
                    var delta = extent$$1[1] - extent$$1[0];
                    extent$$1[0] -= pad[0] * delta;
                    extent$$1[1] += pad[1] * delta;
                    break;
                }
            default:
                throw new Error('Unknown padUnit: ' + padUnit);
        }

        return extent$$1;
    };

    instance.accessors = function () {
        if (!arguments.length) {
            return accessors;
        }
        accessors = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.pad = function () {
        if (!arguments.length) {
            return pad;
        }
        pad = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.padUnit = function () {
        if (!arguments.length) {
            return padUnit;
        }
        padUnit = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.include = function () {
        if (!arguments.length) {
            return include;
        }
        include = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.symmetricalAbout = function () {
        if (!arguments.length) {
            return symmetricalAbout;
        }
        symmetricalAbout = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    return instance;
};

var date = function () {

    var accessors = [];
    var pad = [0, 0];
    var padUnit = 'percent';
    var symmetricalAbout = null;
    var include = [];

    var extent$$1 = linearExtent();

    var instance = function instance(data) {
        var adaptedAccessors = accessors.map(function (accessor) {
            return function () {
                var value = accessor.apply(undefined, arguments);
                return Array.isArray(value) ? value.map(function (date) {
                    return date.valueOf();
                }) : value.valueOf();
            };
        });

        extent$$1.accessors(adaptedAccessors).pad(pad).padUnit(padUnit).symmetricalAbout(symmetricalAbout != null ? symmetricalAbout.valueOf() : null).include(include.map(function (date) {
            return date.valueOf();
        }));

        return extent$$1(data).map(function (value) {
            return new Date(value);
        });
    };

    instance.accessors = function () {
        if (!arguments.length) {
            return accessors;
        }
        accessors = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.pad = function () {
        if (!arguments.length) {
            return pad;
        }
        pad = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.padUnit = function () {
        if (!arguments.length) {
            return padUnit;
        }
        padUnit = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.include = function () {
        if (!arguments.length) {
            return include;
        }
        include = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.symmetricalAbout = function () {
        if (!arguments.length) {
            return symmetricalAbout;
        }
        symmetricalAbout = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    return instance;
};

var geometricBrownianMotion = function () {
    var period = 1;
    var steps = 20;
    var mu = 0.1;
    var sigma = 0.1;
    var randomNormal$$1 = d3Random.randomNormal();

    var geometricBrownianMotion = function geometricBrownianMotion(value) {
        var timeStep = period / steps;
        var pathData = [];

        for (var i = 0; i < steps + 1; i++) {
            pathData.push(value);
            var increment = randomNormal$$1() * Math.sqrt(timeStep) * sigma + (mu - sigma * sigma / 2) * timeStep;
            value = value * Math.exp(increment);
        }

        return pathData;
    };

    geometricBrownianMotion.period = function () {
        if (!arguments.length) {
            return period;
        }
        period = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.steps = function () {
        if (!arguments.length) {
            return steps;
        }
        steps = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.mu = function () {
        if (!arguments.length) {
            return mu;
        }
        mu = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.sigma = function () {
        if (!arguments.length) {
            return sigma;
        }
        sigma = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.randomNormal = function () {
        if (!arguments.length) {
            return randomNormal$$1;
        }
        randomNormal$$1 = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    return geometricBrownianMotion;
};

function functor$1(v) {
    return typeof v === 'function' ? v : function () {
        return v;
    };
}

var financial = function () {
    var startDate = new Date();
    var startPrice = 100;
    var interval = d3Time.timeDay;
    var intervalStep = 1;
    var unitInterval = d3Time.timeYear;
    var unitIntervalStep = 1;
    var filter = null;
    var volume = function volume() {
        var normal = d3Random.randomNormal(1, 0.1);
        return Math.ceil(normal() * 1000);
    };
    var gbm = geometricBrownianMotion();

    var getOffsetPeriod = function getOffsetPeriod(date) {
        var unitMilliseconds = unitInterval.offset(date, unitIntervalStep) - date;
        return (interval.offset(date, intervalStep) - date) / unitMilliseconds;
    };

    var calculateOHLC = function calculateOHLC(start, price) {
        var period = getOffsetPeriod(start);
        var prices = gbm.period(period)(price);
        var ohlc = {
            date: start,
            open: prices[0],
            high: Math.max.apply(Math, prices),
            low: Math.min.apply(Math, prices),
            close: prices[gbm.steps()]
        };
        ohlc.volume = volume(ohlc);
        return ohlc;
    };

    var getNextDatum = function getNextDatum(ohlc) {
        var date = void 0,
            price = void 0,
            filtered = void 0;
        do {
            date = ohlc ? interval.offset(ohlc.date, intervalStep) : new Date(startDate.getTime());
            price = ohlc ? ohlc.close : startPrice;
            ohlc = calculateOHLC(date, price);
            filtered = filter && !filter(ohlc);
        } while (filtered);
        return ohlc;
    };

    var makeStream = function makeStream() {
        var latest = void 0;
        var stream = {};
        stream.next = function () {
            var ohlc = getNextDatum(latest);
            latest = ohlc;
            return ohlc;
        };
        stream.take = function (numPoints) {
            return stream.until(function (d, i) {
                return !numPoints || numPoints < 0 || i === numPoints;
            });
        };
        stream.until = function (comparison) {
            var data = [];
            var index = 0;
            var ohlc = getNextDatum(latest);
            var compared = comparison && !comparison(ohlc, index);
            while (compared) {
                data.push(ohlc);
                latest = ohlc;
                ohlc = getNextDatum(latest);
                index += 1;
                compared = comparison && !comparison(ohlc, index);
            }
            return data;
        };
        return stream;
    };

    var financial = function financial(numPoints) {
        return makeStream().take(numPoints);
    };
    financial.stream = makeStream;
    financial[Symbol.iterator] = function () {
        var stream = makeStream();
        return {
            next: function next() {
                return {
                    value: stream.next(),
                    done: false
                };
            }
        };
    };

    financial.startDate = function () {
        if (!arguments.length) {
            return startDate;
        }
        startDate = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.startPrice = function () {
        if (!arguments.length) {
            return startPrice;
        }
        startPrice = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.interval = function () {
        if (!arguments.length) {
            return interval;
        }
        interval = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.intervalStep = function () {
        if (!arguments.length) {
            return intervalStep;
        }
        intervalStep = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.unitInterval = function () {
        if (!arguments.length) {
            return unitInterval;
        }
        unitInterval = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.unitIntervalStep = function () {
        if (!arguments.length) {
            return unitIntervalStep;
        }
        unitIntervalStep = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.filter = function () {
        if (!arguments.length) {
            return filter;
        }
        filter = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.volume = function () {
        if (!arguments.length) {
            return volume;
        }
        volume = functor$1(arguments.length <= 0 ? undefined : arguments[0]);
        return financial;
    };

    rebind(financial, gbm, 'steps', 'mu', 'sigma');

    return financial;
};

var skipWeekends$1 = function (datum) {
    var day = datum.date.getDay();
    return !(day === 0 || day === 6);
};

// https://docs.gdax.com/#market-data
var gdax = function () {

    var product = 'BTC-USD';
    var start = null;
    var end = null;
    var granularity = null;

    var gdax = function gdax(cb) {
        var params = [];
        if (start != null) {
            params.push('start=' + start.toISOString());
        }
        if (end != null) {
            params.push('end=' + end.toISOString());
        }
        if (granularity != null) {
            params.push('granularity=' + granularity);
        }
        var url = 'https://api.gdax.com/products/' + product + '/candles?' + params.join('&');
        d3Request.json(url, function (error, data) {
            if (error) {
                cb(error);
                return;
            }
            data = data.map(function (d) {
                return {
                    date: new Date(d[0] * 1000),
                    open: d[3],
                    high: d[2],
                    low: d[1],
                    close: d[4],
                    volume: d[5]
                };
            });
            cb(error, data);
        });
    };

    gdax.product = function (x) {
        if (!arguments.length) {
            return product;
        }
        product = x;
        return gdax;
    };
    gdax.start = function (x) {
        if (!arguments.length) {
            return start;
        }
        start = x;
        return gdax;
    };
    gdax.end = function (x) {
        if (!arguments.length) {
            return end;
        }
        end = x;
        return gdax;
    };
    gdax.granularity = function (x) {
        if (!arguments.length) {
            return granularity;
        }
        granularity = x;
        return gdax;
    };

    return gdax;
};

//  https://www.quandl.com/docs/api#datasets
var quandl = function () {

    function defaultColumnNameMap(colName) {
        return colName[0].toLowerCase() + colName.substr(1);
    }

    var database = 'YAHOO';
    var dataset = 'GOOG';
    var apiKey = null;
    var start = null;
    var end = null;
    var rows = null;
    var descending = false;
    var collapse = null;
    var columnNameMap = defaultColumnNameMap;

    var quandl = function quandl(cb) {
        var params = [];
        if (apiKey != null) {
            params.push('api_key=' + apiKey);
        }
        if (start != null) {
            params.push('start_date=' + start.toISOString().substring(0, 10));
        }
        if (end != null) {
            params.push('end_date=' + end.toISOString().substring(0, 10));
        }
        if (rows != null) {
            params.push('rows=' + rows);
        }
        if (!descending) {
            params.push('order=asc');
        }
        if (collapse != null) {
            params.push('collapse=' + collapse);
        }

        var url = 'https://www.quandl.com/api/v3/datasets/' + database + '/' + dataset + '/data.json?' + params.join('&');

        d3Request.json(url, function (error, data) {
            if (error) {
                cb(error);
                return;
            }

            var datasetData = data.dataset_data;

            var nameMapping = columnNameMap || function (n) {
                return n;
            };
            var colNames = datasetData.column_names.map(function (n, i) {
                return [i, nameMapping(n)];
            }).filter(function (v) {
                return v[1];
            });

            var mappedData = datasetData.data.map(function (d) {
                var output = {};
                colNames.forEach(function (v) {
                    output[v[1]] = v[0] === 0 ? new Date(d[v[0]]) : d[v[0]];
                });
                return output;
            });

            cb(error, mappedData);
        });
    };

    // Unique Database Code (e.g. WIKI)
    quandl.database = function (x) {
        if (!arguments.length) {
            return database;
        }
        database = x;
        return quandl;
    };
    // Unique Dataset Code (e.g. AAPL)
    quandl.dataset = function (x) {
        if (!arguments.length) {
            return dataset;
        }
        dataset = x;
        return quandl;
    };
    // Set To Use API Key In Request (needed for premium set or high frequency requests)
    quandl.apiKey = function (x) {
        if (!arguments.length) {
            return apiKey;
        }
        apiKey = x;
        return quandl;
    };
    // Start Date of Data Series
    quandl.start = function (x) {
        if (!arguments.length) {
            return start;
        }
        start = x;
        return quandl;
    };
    // End Date of Data Series
    quandl.end = function (x) {
        if (!arguments.length) {
            return end;
        }
        end = x;
        return quandl;
    };
    // Limit Number of Rows
    quandl.rows = function (x) {
        if (!arguments.length) {
            return rows;
        }
        rows = x;
        return quandl;
    };
    // Return Results In Descending Order (true) or Ascending (false)
    quandl.descending = function (x) {
        if (!arguments.length) {
            return descending;
        }
        descending = x;
        return quandl;
    };
    // Periodicity of Data (daily | weekly | monthly | quarterly | annual)
    quandl.collapse = function (x) {
        if (!arguments.length) {
            return collapse;
        }
        collapse = x;
        return quandl;
    };
    // Function Used to Normalise the Quandl Column Name To Field Name, Return Null To Skip Field
    quandl.columnNameMap = function (x) {
        if (!arguments.length) {
            return columnNameMap;
        }
        columnNameMap = x;
        return quandl;
    };
    // Expose default column name map
    quandl.defaultColumnNameMap = defaultColumnNameMap;

    return quandl;
};

var bucket = function () {

    var bucketSize = 10;

    var bucket = function bucket(data) {
        return bucketSize <= 1 ? data.map(function (d) {
            return [d];
        }) : d3Array.range(0, Math.ceil(data.length / bucketSize)).map(function (i) {
            return data.slice(i * bucketSize, (i + 1) * bucketSize);
        });
    };

    bucket.bucketSize = function (x) {
        if (!arguments.length) {
            return bucketSize;
        }

        bucketSize = x;
        return bucket;
    };

    return bucket;
};

var largestTriangleOneBucket = function () {

    var dataBucketer = bucket();
    var x = function x(d) {
        return d;
    };
    var y = function y(d) {
        return d;
    };

    var largestTriangleOneBucket = function largestTriangleOneBucket(data) {

        if (dataBucketer.bucketSize() >= data.length) {
            return data;
        }

        var pointAreas = calculateAreaOfPoints(data);
        var pointAreaBuckets = dataBucketer(pointAreas);

        var buckets = dataBucketer(data.slice(1, data.length - 1));

        var subsampledData = buckets.map(function (thisBucket, i) {

            var pointAreaBucket = pointAreaBuckets[i];
            var maxArea = d3Array.max(pointAreaBucket);
            var currentMaxIndex = pointAreaBucket.indexOf(maxArea);

            return thisBucket[currentMaxIndex];
        });

        // First and last data points are their own buckets.
        return [].concat([data[0]], subsampledData, [data[data.length - 1]]);
    };

    function calculateAreaOfPoints(data) {

        var xyData = data.map(function (point) {
            return [x(point), y(point)];
        });

        var pointAreas = d3Array.range(1, xyData.length - 1).map(function (i) {
            var lastPoint = xyData[i - 1];
            var thisPoint = xyData[i];
            var nextPoint = xyData[i + 1];

            var base = (lastPoint[0] - nextPoint[0]) * (thisPoint[1] - lastPoint[1]);
            var height = (lastPoint[0] - thisPoint[0]) * (nextPoint[1] - lastPoint[1]);

            return Math.abs(0.5 * base * height);
        });

        return pointAreas;
    }

    rebind(largestTriangleOneBucket, dataBucketer, 'bucketSize');

    largestTriangleOneBucket.x = function (d) {
        if (!arguments.length) {
            return x;
        }

        x = d;

        return largestTriangleOneBucket;
    };

    largestTriangleOneBucket.y = function (d) {
        if (!arguments.length) {
            return y;
        }

        y = d;

        return largestTriangleOneBucket;
    };

    return largestTriangleOneBucket;
};

var largestTriangleThreeBucket = function () {

    var x = function x(d) {
        return d;
    };
    var y = function y(d) {
        return d;
    };
    var dataBucketer = bucket();

    var largestTriangleThreeBucket = function largestTriangleThreeBucket(data) {

        if (dataBucketer.bucketSize() >= data.length) {
            return data;
        }

        var buckets = dataBucketer(data.slice(1, data.length - 1));
        var firstBucket = data[0];
        var lastBucket = data[data.length - 1];

        // Keep track of the last selected bucket info and all buckets
        // (for the next bucket average)
        var allBuckets = [].concat([firstBucket], buckets, [lastBucket]);

        var lastSelectedX = x(firstBucket);
        var lastSelectedY = y(firstBucket);

        var subsampledData = buckets.map(function (thisBucket, i) {

            var nextAvgX = d3Array.mean(allBuckets[i + 1], x);
            var nextAvgY = d3Array.mean(allBuckets[i + 1], y);

            var xyData = thisBucket.map(function (item) {
                return [x(item), y(item)];
            });

            var areas = xyData.map(function (item) {
                var base = (lastSelectedX - nextAvgX) * (item[1] - lastSelectedY);
                var height = (lastSelectedX - item[0]) * (nextAvgY - lastSelectedY);

                return Math.abs(0.5 * base * height);
            });

            var highestIndex = areas.indexOf(d3Array.max(areas));
            var highestXY = xyData[highestIndex];

            lastSelectedX = highestXY[0];
            lastSelectedY = highestXY[1];

            return thisBucket[highestIndex];
        });

        // First and last data points are their own buckets.
        return [].concat([data[0]], subsampledData, [data[data.length - 1]]);
    };

    rebind(largestTriangleThreeBucket, dataBucketer, 'bucketSize');

    largestTriangleThreeBucket.x = function (d) {
        if (!arguments.length) {
            return x;
        }

        x = d;

        return largestTriangleThreeBucket;
    };

    largestTriangleThreeBucket.y = function (d) {
        if (!arguments.length) {
            return y;
        }

        y = d;

        return largestTriangleThreeBucket;
    };

    return largestTriangleThreeBucket;
};

var modeMedian = function () {

    var dataBucketer = bucket();
    var value = function value(d) {
        return d;
    };

    var modeMedian = function modeMedian(data) {

        if (dataBucketer.bucketSize() > data.length) {
            return data;
        }

        var minMax = d3Array.extent(data, value);
        var buckets = dataBucketer(data.slice(1, data.length - 1));

        var subsampledData = buckets.map(function (thisBucket, i) {

            var frequencies = {};
            var mostFrequent;
            var mostFrequentIndex;
            var singleMostFrequent = true;

            var values = thisBucket.map(value);

            var globalMinMax = values.filter(function (value) {
                return value === minMax[0] || value === minMax[1];
            }).map(function (value) {
                return values.indexOf(value);
            })[0];

            if (globalMinMax !== undefined) {
                return thisBucket[globalMinMax];
            }

            values.forEach(function (item, i) {
                if (frequencies[item] === undefined) {
                    frequencies[item] = 0;
                }
                frequencies[item]++;

                if (frequencies[item] > frequencies[mostFrequent] || mostFrequent === undefined) {
                    mostFrequent = item;
                    mostFrequentIndex = i;
                    singleMostFrequent = true;
                } else if (frequencies[item] === frequencies[mostFrequent]) {
                    singleMostFrequent = false;
                }
            });

            if (singleMostFrequent) {
                return thisBucket[mostFrequentIndex];
            } else {
                return thisBucket[Math.floor(thisBucket.length / 2)];
            }
        });

        // First and last data points are their own buckets.
        return [].concat([data[0]], subsampledData, [data[data.length - 1]]);
    };

    rebind(modeMedian, dataBucketer, 'bucketSize');

    modeMedian.value = function (x) {
        if (!arguments.length) {
            return value;
        }

        value = x;

        return modeMedian;
    };

    return modeMedian;
};

var functor$2 = (function (v) {
  return typeof v === 'function' ? v : function () {
    return v;
  };
});

// Renders an OHLC as an SVG path based on the given array of datapoints. Each
// OHLC has a fixed width, whilst the x, open, high, low and close positions are
// obtained from each point via the supplied accessor functions.
var shapeOhlc = (function () {

    var context = null;
    var x = function x(d) {
        return d.date;
    };
    var open = function open(d) {
        return d.open;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var close = function close(d) {
        return d.close;
    };
    var orient = 'vertical';
    var width = functor$2(3);

    var ohlc = function ohlc(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            var xValue = x(d, i);
            var yOpen = open(d, i);
            var yHigh = high(d, i);
            var yLow = low(d, i);
            var yClose = close(d, i);
            var halfWidth = width(d, i) / 2;

            if (orient === 'vertical') {
                drawingContext.moveTo(xValue, yLow);
                drawingContext.lineTo(xValue, yHigh);

                drawingContext.moveTo(xValue, yOpen);
                drawingContext.lineTo(xValue - halfWidth, yOpen);
                drawingContext.moveTo(xValue, yClose);
                drawingContext.lineTo(xValue + halfWidth, yClose);
            } else {
                drawingContext.moveTo(yLow, xValue);
                drawingContext.lineTo(yHigh, xValue);

                drawingContext.moveTo(yOpen, xValue);
                drawingContext.lineTo(yOpen, xValue + halfWidth);
                drawingContext.moveTo(yClose, xValue);
                drawingContext.lineTo(yClose, xValue - halfWidth);
            }
        });

        return context ? null : drawingContext.toString();
    };

    ohlc.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return ohlc;
    };
    ohlc.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.open = function () {
        if (!arguments.length) {
            return open;
        }
        open = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.close = function () {
        if (!arguments.length) {
            return close;
        }
        close = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return ohlc;
    };

    return ohlc;
});

// Renders a bar series as an SVG path based on the given array of datapoints. Each
// bar has a fixed width, whilst the x, y and height are obtained from each data
// point via the supplied accessor functions.
var shapeBar = (function () {

    var context = null;
    var x = function x(d) {
        return d.x;
    };
    var y = function y(d) {
        return d.y;
    };
    var horizontalAlign = 'center';
    var verticalAlign = 'center';
    var height = function height(d) {
        return d.height;
    };
    var width = functor$2(3);

    var bar = function bar(data, index) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            var xValue = x.call(this, d, index || i);
            var yValue = y.call(this, d, index || i);
            var barHeight = height.call(this, d, index || i);
            var barWidth = width.call(this, d, index || i);

            var horizontalOffset = void 0;
            switch (horizontalAlign) {
                case 'left':
                    horizontalOffset = barWidth;
                    break;
                case 'right':
                    horizontalOffset = 0;
                    break;
                case 'center':
                    horizontalOffset = barWidth / 2;
                    break;
                default:
                    throw new Error('Invalid horizontal alignment ' + horizontalAlign);
            }

            var verticalOffset = void 0;
            switch (verticalAlign) {
                case 'bottom':
                    verticalOffset = -barHeight;
                    break;
                case 'top':
                    verticalOffset = 0;
                    break;
                case 'center':
                    verticalOffset = barHeight / 2;
                    break;
                default:
                    throw new Error('Invalid vertical alignment ' + verticalAlign);
            }

            drawingContext.rect(xValue - horizontalOffset, yValue - verticalOffset, barWidth, barHeight);
        }, this);

        return context ? null : drawingContext.toString();
    };

    bar.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return bar;
    };
    bar.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.y = function () {
        if (!arguments.length) {
            return y;
        }
        y = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.horizontalAlign = function () {
        if (!arguments.length) {
            return horizontalAlign;
        }
        horizontalAlign = arguments.length <= 0 ? undefined : arguments[0];
        return bar;
    };
    bar.height = function () {
        if (!arguments.length) {
            return height;
        }
        height = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.verticalAlign = function () {
        if (!arguments.length) {
            return verticalAlign;
        }
        verticalAlign = arguments.length <= 0 ? undefined : arguments[0];
        return bar;
    };

    return bar;
});

// Renders a candlestick as an SVG path based on the given array of datapoints. Each
// candlestick has a fixed width, whilst the x, open, high, low and close positions are
// obtained from each point via the supplied accessor functions.
var shapeCandlestick = (function () {

    var context = null;
    var x = function x(d) {
        return d.date;
    };
    var open = function open(d) {
        return d.open;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var close = function close(d) {
        return d.close;
    };
    var width = functor$2(3);

    var candlestick = function candlestick(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            var xValue = x(d, i);
            var yOpen = open(d, i);
            var yHigh = high(d, i);
            var yLow = low(d, i);
            var yClose = close(d, i);
            var barWidth = width(d, i);
            var halfBarWidth = barWidth / 2;

            // Body
            drawingContext.rect(xValue - halfBarWidth, yOpen, barWidth, yClose - yOpen);
            // High wick
            // // Move to the max price of close or open; draw the high wick
            // N.B. Math.min() is used as we're dealing with pixel values,
            // the lower the pixel value, the higher the price!
            drawingContext.moveTo(xValue, Math.min(yClose, yOpen));
            drawingContext.lineTo(xValue, yHigh);
            // Low wick
            // // Move to the min price of close or open; draw the low wick
            // N.B. Math.max() is used as we're dealing with pixel values,
            // the higher the pixel value, the lower the price!
            drawingContext.moveTo(xValue, Math.max(yClose, yOpen));
            drawingContext.lineTo(xValue, yLow);
        });

        return context ? null : drawingContext.toString();
    };

    candlestick.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return candlestick;
    };
    candlestick.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.open = function () {
        if (!arguments.length) {
            return open;
        }
        open = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.close = function () {
        if (!arguments.length) {
            return close;
        }
        close = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };

    return candlestick;
});

// Renders a box plot series as an SVG path based on the given array of datapoints.
var shapeBoxPlot = (function () {

    var context = null;
    var value = function value(d) {
        return d.value;
    };
    var median = function median(d) {
        return d.median;
    };
    var upperQuartile = function upperQuartile(d) {
        return d.upperQuartile;
    };
    var lowerQuartile = function lowerQuartile(d) {
        return d.lowerQuartile;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var orient = 'vertical';
    var width = functor$2(5);
    var cap = functor$2(0.5);

    var boxPlot = function boxPlot(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            // naming convention is for vertical orientation
            var _value = value(d, i);
            var _width = width(d, i);
            var halfWidth = _width / 2;
            var capWidth = _width * cap(d, i);
            var halfCapWidth = capWidth / 2;
            var _high = high(d, i);
            var _upperQuartile = upperQuartile(d, i);
            var _median = median(d, i);
            var _lowerQuartile = lowerQuartile(d, i);
            var _low = low(d, i);
            var upperQuartileToLowerQuartile = _lowerQuartile - _upperQuartile;

            if (orient === 'vertical') {
                // Upper whisker
                drawingContext.moveTo(_value - halfCapWidth, _high);
                drawingContext.lineTo(_value + halfCapWidth, _high);
                drawingContext.moveTo(_value, _high);
                drawingContext.lineTo(_value, _upperQuartile);

                // Box
                drawingContext.rect(_value - halfWidth, _upperQuartile, _width, upperQuartileToLowerQuartile);
                drawingContext.moveTo(_value - halfWidth, _median);
                // Median line
                drawingContext.lineTo(_value + halfWidth, _median);

                // Lower whisker
                drawingContext.moveTo(_value, _lowerQuartile);
                drawingContext.lineTo(_value, _low);
                drawingContext.moveTo(_value - halfCapWidth, _low);
                drawingContext.lineTo(_value + halfCapWidth, _low);
            } else {
                // Lower whisker
                drawingContext.moveTo(_low, _value - halfCapWidth);
                drawingContext.lineTo(_low, _value + halfCapWidth);
                drawingContext.moveTo(_low, _value);
                drawingContext.lineTo(_lowerQuartile, _value);

                // Box
                drawingContext.rect(_lowerQuartile, _value - halfWidth, -upperQuartileToLowerQuartile, _width);
                drawingContext.moveTo(_median, _value - halfWidth);
                drawingContext.lineTo(_median, _value + halfWidth);

                // Upper whisker
                drawingContext.moveTo(_upperQuartile, _value);
                drawingContext.lineTo(_high, _value);
                drawingContext.moveTo(_high, _value - halfCapWidth);
                drawingContext.lineTo(_high, _value + halfCapWidth);
            }
        });

        return context ? null : drawingContext.toString();
    };

    boxPlot.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return boxPlot;
    };
    boxPlot.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.median = function () {
        if (!arguments.length) {
            return median;
        }
        median = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.upperQuartile = function () {
        if (!arguments.length) {
            return upperQuartile;
        }
        upperQuartile = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.lowerQuartile = function () {
        if (!arguments.length) {
            return lowerQuartile;
        }
        lowerQuartile = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return boxPlot;
    };
    boxPlot.cap = function () {
        if (!arguments.length) {
            return cap;
        }
        cap = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };

    return boxPlot;
});

// Renders an error bar series as an SVG path based on the given array of datapoints.
var shapeErrorBar = (function () {

    var context = null;
    var value = function value(d) {
        return d.x;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var orient = 'vertical';
    var width = functor$2(5);

    var errorBar = function errorBar(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            // naming convention is for vertical orientation
            var _value = value(d, i);
            var _width = width(d, i);
            var halfWidth = _width / 2;
            var _high = high(d, i);
            var _low = low(d, i);

            if (orient === 'vertical') {
                drawingContext.moveTo(_value - halfWidth, _high);
                drawingContext.lineTo(_value + halfWidth, _high);
                drawingContext.moveTo(_value, _high);
                drawingContext.lineTo(_value, _low);
                drawingContext.moveTo(_value - halfWidth, _low);
                drawingContext.lineTo(_value + halfWidth, _low);
            } else {
                drawingContext.moveTo(_low, _value - halfWidth);
                drawingContext.lineTo(_low, _value + halfWidth);
                drawingContext.moveTo(_low, _value);
                drawingContext.lineTo(_high, _value);
                drawingContext.moveTo(_high, _value - halfWidth);
                drawingContext.lineTo(_high, _value + halfWidth);
            }
        });

        return context ? null : drawingContext.toString();
    };

    errorBar.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return errorBar;
    };
    errorBar.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return errorBar;
    };

    return errorBar;
});

var functor$3 = (function (d) {
  return typeof d === 'function' ? d : function () {
    return d;
  };
});

// "Caution: avoid interpolating to or from the number zero when the interpolator is used to generate
// a string (such as with attr).
// Very small values, when stringified, may be converted to scientific notation and
// cause a temporarily invalid attribute or style property value.
// For example, the number 0.0000001 is converted to the string "1e-7".
// This is particularly noticeable when interpolating opacity values.
// To avoid scientific notation, start or end the transition at 1e-6,
// which is the smallest value that is not stringified in exponential notation."
// - https://github.com/mbostock/d3/wiki/Transitions#d3_interpolateNumber
var effectivelyZero = 1e-6;

// Wrapper around d3's selectAll/data data-join, which allows decoration of the result.
// This is achieved by appending the element to the enter selection before exposing it.
// A default transition of fade in/out is also implicitly added but can be modified.

var dataJoinUtil = function (element, className) {
    element = element || 'g';

    var key = function key(_, i) {
        return i;
    };

    var dataJoin = function dataJoin(container, data) {
        data = data || function (d) {
            return d;
        };

        // update
        var selector = className == null ? element : element + '.' + className;
        var selected = container.selectAll(selector)
        // in order to support nested selections, they can be filtered
        // to only return immediate children of the container
        .filter(function () {
            return this.parentNode === container.node();
        });
        var updateSelection = selected.data(data, key);

        // enter
        // when container is a transition, entering elements fade in (from transparent to opaque)
        // N.B. insert() is used to create new elements, rather than append(). insert() behaves in a special manner
        // on enter selections - entering elements will be inserted immediately before the next following sibling
        // in the update selection, if any.
        // This helps order the elements in an order consistent with the data, but doesn't guarantee the ordering;
        // if the updating elements change order then selection.order() would be required to update the order.
        // (#528)
        var enterSelection = updateSelection.enter().insert(element) // <<<--- this is the secret sauce of this whole file
        .attr('class', className);

        // exit
        // when container is a transition, exiting elements fade out (from opaque to transparent)
        var exitSelection = updateSelection.exit();

        // automatically merge in the enter selection
        updateSelection = updateSelection.merge(enterSelection);

        // if transitions are enable inherit the default transition from ancestors
        // and apply a default fade in/out transition
        if (d3Selection.selection.prototype.transition) {
            enterSelection.style('opacity', effectivelyZero);
            updateSelection.transition().style('opacity', 1);
            exitSelection.transition().style('opacity', effectivelyZero);
        }

        // automatically remove nodes in the exit selection
        exitSelection.remove();

        updateSelection.enter = function () {
            return enterSelection;
        };
        updateSelection.exit = function () {
            return exitSelection;
        };

        return updateSelection;
    };

    dataJoin.element = function (x) {
        if (!arguments.length) {
            return element;
        }
        element = x;
        return dataJoin;
    };
    dataJoin.className = function (x) {
        if (!arguments.length) {
            return className;
        }
        className = x;
        return dataJoin;
    };
    dataJoin.key = function (x) {
        if (!arguments.length) {
            return key;
        }
        key = x;
        return dataJoin;
    };

    return dataJoin;
};

var label = (function (layoutStrategy) {

    var decorate = function decorate() {};
    var size = function size() {
        return [0, 0];
    };
    var position = function position(d, i) {
        return [d.x, d.y];
    };
    var strategy = layoutStrategy || function (x) {
        return x;
    };
    var component = function component() {};

    var dataJoin$$1 = dataJoinUtil('g', 'label');

    var label = function label(selection$$1) {

        selection$$1.each(function (data, index, group) {

            var g = dataJoin$$1(d3Selection.select(group[index]), data).call(component);

            // obtain the rectangular bounding boxes for each child
            var nodes = g.nodes();
            var childRects = nodes.map(function (node, i) {
                var d = d3Selection.select(node).datum();
                var childPos = position(d, i, nodes);
                var childSize = size(d, i, nodes);
                return {
                    hidden: false,
                    x: childPos[0],
                    y: childPos[1],
                    width: childSize[0],
                    height: childSize[1]
                };
            });

            // apply the strategy to derive the layout. The strategy does not change the order
            // or number of label.
            var layout = strategy(childRects);

            g.attr('style', function (_, i) {
                return 'display:' + (layout[i].hidden ? 'none' : 'inherit');
            }).attr('transform', function (_, i) {
                return 'translate(' + layout[i].x + ', ' + layout[i].y + ')';
            })
            // set the layout width / height so that children can use SVG layout if required
            .attr('layout-width', function (_, i) {
                return layout[i].width;
            }).attr('layout-height', function (_, i) {
                return layout[i].height;
            }).attr('anchor-x', function (d, i, g) {
                return position(d, i, g)[0] - layout[i].x;
            }).attr('anchor-y', function (d, i, g) {
                return position(d, i, g)[1] - layout[i].y;
            });

            g.call(component);

            decorate(g, data, index);
        });
    };

    rebindAll(label, dataJoin$$1, include('key'));
    rebindAll(label, strategy);

    label.size = function () {
        if (!arguments.length) {
            return size;
        }
        size = functor$3(arguments.length <= 0 ? undefined : arguments[0]);
        return label;
    };

    label.position = function () {
        if (!arguments.length) {
            return position;
        }
        position = functor$3(arguments.length <= 0 ? undefined : arguments[0]);
        return label;
    };

    label.component = function () {
        if (!arguments.length) {
            return component;
        }
        component = arguments.length <= 0 ? undefined : arguments[0];
        return label;
    };

    label.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return label;
    };

    return label;
});

var textLabel = (function (layoutStrategy) {

    var padding = 2;
    var value = function value(x) {
        return x;
    };

    var textJoin = dataJoinUtil('text');
    var rectJoin = dataJoinUtil('rect');
    var pointJoin = dataJoinUtil('circle');

    var textLabel = function textLabel(selection$$1) {
        selection$$1.each(function (data, index, group) {

            var node = group[index];
            var nodeSelection = d3Selection.select(node);

            var width = Number(node.getAttribute('layout-width'));
            var height = Number(node.getAttribute('layout-height'));
            var rect = rectJoin(nodeSelection, [data]);
            rect.attr('width', width).attr('height', height);

            var anchorX = Number(node.getAttribute('anchor-x'));
            var anchorY = Number(node.getAttribute('anchor-y'));
            var circle = pointJoin(nodeSelection, [data]);
            circle.attr('r', 2).attr('cx', anchorX).attr('cy', anchorY);

            var text = textJoin(nodeSelection, [data]);
            text.enter().attr('dy', '0.9em').attr('transform', 'translate(' + padding + ', ' + padding + ')');
            text.text(value);
        });
    };

    textLabel.padding = function () {
        if (!arguments.length) {
            return padding;
        }
        padding = arguments.length <= 0 ? undefined : arguments[0];
        return textLabel;
    };

    textLabel.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = functor$3(arguments.length <= 0 ? undefined : arguments[0]);
        return textLabel;
    };

    return textLabel;
});

var isIntersecting = function isIntersecting(a, b) {
    return !(a.x >= b.x + b.width || a.x + a.width <= b.x || a.y >= b.y + b.height || a.y + a.height <= b.y);
};

var intersect = (function (a, b) {
    if (isIntersecting(a, b)) {
        var left = Math.max(a.x, b.x);
        var right = Math.min(a.x + a.width, b.x + b.width);
        var top = Math.max(a.y, b.y);
        var bottom = Math.min(a.y + a.height, b.y + b.height);
        return (right - left) * (bottom - top);
    } else {
        return 0;
    }
});

// computes the area of overlap between the rectangle with the given index with the
// rectangles in the array
var collisionArea = function collisionArea(rectangles, index) {
    return d3Array.sum(rectangles.map(function (d, i) {
        return index === i ? 0 : intersect(rectangles[index], d);
    }));
};

// computes the total overlapping area of all of the rectangles in the given array

var getPlacement = function getPlacement(x, y, width, height, location) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        location: location
    };
};

// returns all the potential placements of the given label
var placements = (function (label) {
    var x = label.x;
    var y = label.y;
    var width = label.width;
    var height = label.height;
    return [getPlacement(x, y, width, height, 'bottom-right'), getPlacement(x - width, y, width, height, 'bottom-left'), getPlacement(x - width, y - height, width, height, 'top-left'), getPlacement(x, y - height, width, height, 'top-right'), getPlacement(x, y - height / 2, width, height, 'middle-right'), getPlacement(x - width / 2, y, width, height, 'bottom-center'), getPlacement(x - width, y - height / 2, width, height, 'middle-left'), getPlacement(x - width / 2, y - height, width, height, 'top-center')];
});

var substitute = function substitute(array, index, substitution) {
    return [].concat(toConsumableArray(array.slice(0, index)), [substitution], toConsumableArray(array.slice(index + 1)));
};

var lessThan = function lessThan(a, b) {
    return a < b;
};

// a layout takes an array of rectangles and allows their locations to be optimised.
// it is constructed using two functions, locationScore, which score the placement of and
// individual rectangle, and winningScore which takes the scores for a rectangle
// at two different locations and assigns a winningScore.
var layoutComponent = function layoutComponent() {
    var score = null;

    var winningScore = lessThan;

    var locationScore = function locationScore() {
        return 0;
    };

    var rectangles = void 0;

    var evaluatePlacement = function evaluatePlacement(placement, index) {
        return score - locationScore(rectangles[index], index, rectangles) + locationScore(placement, index, substitute(rectangles, index, placement));
    };

    var layout = function layout(placement, index) {
        if (!score) {
            score = d3Array.sum(rectangles.map(function (r, i) {
                return locationScore(r, i, rectangles);
            }));
        }

        var newScore = evaluatePlacement(placement, index);

        if (winningScore(newScore, score)) {
            return layoutComponent().locationScore(locationScore).winningScore(winningScore).score(newScore).rectangles(substitute(rectangles, index, placement));
        } else {
            return layout;
        }
    };

    layout.rectangles = function () {
        if (!arguments.length) {
            return rectangles;
        }
        rectangles = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };
    layout.score = function () {
        if (!arguments.length) {
            return score;
        }
        score = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };
    layout.winningScore = function () {
        if (!arguments.length) {
            return winningScore;
        }
        winningScore = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };
    layout.locationScore = function () {
        if (!arguments.length) {
            return locationScore;
        }
        locationScore = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };

    return layout;
};

var greedy = (function () {

    var bounds = void 0;

    var containerPenalty = function containerPenalty(rectangle) {
        return bounds ? rectangle.width * rectangle.height - intersect(rectangle, bounds) : 0;
    };

    var penaltyForRectangle = function penaltyForRectangle(rectangle, index, rectangles) {
        return collisionArea(rectangles, index) + containerPenalty(rectangle);
    };

    var strategy = function strategy(data) {
        var rectangles = layoutComponent().locationScore(penaltyForRectangle).rectangles(data);

        data.forEach(function (rectangle, index) {
            placements(rectangle).forEach(function (placement, placementIndex) {
                rectangles = rectangles(placement, index);
            });
        });
        return rectangles.rectangles();
    };

    strategy.bounds = function () {
        if (!arguments.length) {
            return bounds;
        }
        bounds = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    return strategy;
});

var randomItem = function randomItem(array) {
    return array[randomIndex(array)];
};

var randomIndex = function randomIndex(array) {
    return Math.floor(Math.random() * array.length);
};

var annealing = (function () {

    var temperature = 1000;
    var cooling = 1;
    var bounds = void 0;

    var orientationPenalty = function orientationPenalty(rectangle) {
        switch (rectangle.location) {
            case 'bottom-right':
                return 0;
            case 'middle-right':
            case 'bottom-center':
                return rectangle.width * rectangle.height / 8;
        }
        return rectangle.width * rectangle.height / 4;
    };

    var containerPenalty = function containerPenalty(rectangle) {
        return bounds ? rectangle.width * rectangle.height - intersect(rectangle, bounds) : 0;
    };

    var penaltyForRectangle = function penaltyForRectangle(rectangle, index, rectangles) {
        return collisionArea(rectangles, index) + containerPenalty(rectangle) + orientationPenalty(rectangle);
    };

    var strategy = function strategy(data) {
        var currentTemperature = temperature;

        // use annealing to allow a new score to be picked even if it is worse than the old
        var winningScore = function winningScore(newScore, oldScore) {
            return Math.exp((oldScore - newScore) / currentTemperature) > Math.random();
        };

        var rectangles = layoutComponent().locationScore(penaltyForRectangle).winningScore(winningScore).rectangles(data);

        while (currentTemperature > 0) {
            var index = randomIndex(data);
            var randomNewPlacement = randomItem(placements(data[index]));
            rectangles = rectangles(randomNewPlacement, index);
            currentTemperature -= cooling;
        }
        return rectangles.rectangles();
    };

    strategy.temperature = function () {
        if (!arguments.length) {
            return temperature;
        }
        temperature = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    strategy.cooling = function () {
        if (!arguments.length) {
            return cooling;
        }
        cooling = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    strategy.bounds = function () {
        if (!arguments.length) {
            return bounds;
        }
        bounds = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    return strategy;
});

var scanForObject = function scanForObject(array, comparator) {
    return array[d3Array.scan(array, comparator)];
};

var removeOverlaps = (function (adaptedStrategy) {

    adaptedStrategy = adaptedStrategy || function (x) {
        return x;
    };

    var removeOverlaps = function removeOverlaps(layout) {
        layout = adaptedStrategy(layout);

        var _loop = function _loop() {
            // find the collision area for all overlapping rectangles, hiding the one
            // with the greatest overlap
            var visible = layout.filter(function (d) {
                return !d.hidden;
            });
            var collisions = visible.map(function (d, i) {
                return [d, collisionArea(visible, i)];
            });
            var maximumCollision = scanForObject(collisions, function (a, b) {
                return b[1] - a[1];
            });
            if (maximumCollision[1] > 0) {
                maximumCollision[0].hidden = true;
            } else {
                return 'break';
            }
        };

        while (true) {
            var _ret = _loop();

            if (_ret === 'break') break;
        }
        return layout;
    };

    rebindAll(removeOverlaps, adaptedStrategy);

    return removeOverlaps;
});

var boundingBox = (function () {

    var bounds = [0, 0];

    var strategy = function strategy(data) {
        return data.map(function (d, i) {
            var tx = d.x;
            var ty = d.y;
            if (tx + d.width > bounds[0]) {
                tx -= d.width;
            }

            if (ty + d.height > bounds[1]) {
                ty -= d.height;
            }
            return { height: d.height, width: d.width, x: tx, y: ty };
        });
    };

    strategy.bounds = function () {
        if (!arguments.length) {
            return bounds;
        }
        bounds = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    return strategy;
});

// "Caution: avoid interpolating to or from the number zero when the interpolator is used to generate
// a string (such as with attr).
// Very small values, when stringified, may be converted to scientific notation and
// cause a temporarily invalid attribute or style property value.
// For example, the number 0.0000001 is converted to the string "1e-7".
// This is particularly noticeable when interpolating opacity values.
// To avoid scientific notation, start or end the transition at 1e-6,
// which is the smallest value that is not stringified in exponential notation."
// - https://github.com/mbostock/d3/wiki/Transitions#d3_interpolateNumber
var effectivelyZero$1 = 1e-6;

// Wrapper around d3's selectAll/data data-join, which allows decoration of the result.
// This is achieved by appending the element to the enter selection before exposing it.
// A default transition of fade in/out is also implicitly added but can be modified.
var dataJoin = (function (element, className) {
    element = element || 'g';

    var key = function key(_, i) {
        return i;
    };
    var explicitTransition = null;

    var dataJoin = function dataJoin(container, data) {
        data = data || function (d) {
            return d;
        };

        var implicitTransition = container.selection ? container : null;
        if (implicitTransition) {
            container = container.selection();
        }

        var selected = container.selectAll(function (d, i, nodes) {
            return Array.from(nodes[i].childNodes).filter(function (node) {
                return node.nodeType === 1;
            });
        }).filter(className == null ? element : element + '.' + className);
        var update = selected.data(data, key);

        var enter = update.enter().append(element).attr('class', className);

        var exit = update.exit();

        // automatically merge in the enter selection
        update = update.merge(enter);

        // if transitions are enabled apply a default fade in/out transition
        var transition = implicitTransition || explicitTransition;
        if (transition) {
            update = update.transition(transition);
            enter.style('opacity', effectivelyZero$1).transition(transition).style('opacity', 1);
            exit = exit.transition(transition).style('opacity', effectivelyZero$1).remove();
        } else {
            exit.remove();
        }

        update.enter = function () {
            return enter;
        };
        update.exit = function () {
            return exit;
        };

        return update;
    };

    dataJoin.element = function () {
        if (!arguments.length) {
            return element;
        }
        element = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };
    dataJoin.className = function () {
        if (!arguments.length) {
            return className;
        }
        className = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };
    dataJoin.key = function () {
        if (!arguments.length) {
            return key;
        }
        key = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };
    dataJoin.transition = function () {
        if (!arguments.length) {
            return explicitTransition;
        }
        explicitTransition = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };

    return dataJoin;
});

// the barWidth property of the various series takes a function which, when given an
// array of x values, returns a suitable width. This function creates a width which is
// equal to the smallest distance between neighbouring datapoints multiplied
// by the given factor
var fractionalBarWidth = (function (fraction) {
    return function (pixelValues) {
        // return some default value if there are not enough datapoints to compute the width
        if (pixelValues.length <= 1) {
            return 10;
        }

        pixelValues.sort();

        // compute the distance between neighbouring items
        var neighbourDistances = d3Array.pairs(pixelValues).map(function (tuple) {
            return Math.abs(tuple[0] - tuple[1]);
        });

        var minDistance = d3Array.min(neighbourDistances);
        return fraction * minDistance;
    };
});

var functor$4 = (function (d) {
  return typeof d === 'function' ? d : function () {
    return d;
  };
});

// Checks that passes properties are 'defined', meaning that calling them with (d, i) returns non null values
function defined() {
    var outerArguments = arguments;
    return function (d, i) {
        for (var c = 0, j = outerArguments.length; c < j; c++) {
            if (outerArguments[c](d, i) == null) {
                return false;
            }
        }
        return true;
    };
}

var xyBase = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var baseValue = function baseValue() {
        return 0;
    };
    var crossValue = function crossValue(d) {
        return d.x;
    };
    var mainValue = function mainValue(d) {
        return d.y;
    };
    var decorate = function decorate() {};
    var barWidth = fractionalBarWidth(0.75);
    var orient = 'vertical';

    var base = function base() {};

    base.defined = function (d, i) {
        return defined(baseValue, crossValue, mainValue)(d, i);
    };

    base.values = function (d, i) {
        if (orient === 'vertical') {
            var y = yScale(mainValue(d, i));
            var y0 = yScale(baseValue(d, i));
            var x = xScale(crossValue(d, i));
            return {
                d: d,
                x: x,
                y: y,
                y0: y0,
                height: y - y0,
                origin: [x, y],
                baseOrigin: [x, y0],
                transposedX: x,
                transposedY: y
            };
        } else {
            var _y = xScale(mainValue(d, i));
            var _y2 = xScale(baseValue(d, i));
            var _x = yScale(crossValue(d, i));
            return {
                d: d,
                x: _x,
                y: _y,
                y0: _y2,
                height: _y - _y2,
                origin: [_y, _x],
                baseOrigin: [_y2, _x],
                transposedX: _y,
                transposedY: _x
            };
        }
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.baseValue = function () {
        if (!arguments.length) {
            return baseValue;
        }
        baseValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.mainValue = function () {
        if (!arguments.length) {
            return mainValue;
        }
        mainValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var red = '#c60';
var green = '#6c0';
var black = '#000';
var gray = '#ddd';
var darkGray = '#999';

var colors = {
    red: red,
    green: green,
    black: black,
    gray: gray,
    darkGray: darkGray
};

var seriesSvgLine = (function () {
    var base = xyBase();

    var lineData = d3Shape.line().defined(base.defined).x(function (d, i) {
        return base.values(d, i).transposedX;
    }).y(function (d, i) {
        return base.values(d, i).transposedY;
    });

    var join = dataJoin('path', 'line');

    var line$$1 = function line$$1(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {
            var path$$1 = join(d3Selection.select(group[index]), [data]);
            path$$1.attr('d', lineData).attr('fill', 'none').attr('stroke', colors.black);
            base.decorate()(path$$1, data, index);
        });
    };

    rebindAll(line$$1, base, exclude('baseValue', 'barWidth'));
    rebind(line$$1, join, 'key');
    rebind(line$$1, lineData, 'curve');

    return line$$1;
});

var line$1 = (function () {
    var base = xyBase();

    var lineData = d3Shape.line().defined(base.defined).x(function (d, i) {
        return base.values(d, i).transposedX;
    }).y(function (d, i) {
        return base.values(d, i).transposedY;
    });

    var line$$1 = function line$$1(data) {
        var context = lineData.context();

        context.beginPath();
        lineData(data);
        context.strokeStyle = colors.black;

        base.decorate()(context, data);

        context.stroke();
        context.closePath();
    };

    rebindAll(line$$1, base, exclude('baseValue', 'barWidth'));
    rebind(line$$1, lineData, 'curve', 'context');

    return line$$1;
});

var point = (function () {
    var symbol$$1 = d3Shape.symbol();

    var base = xyBase();

    var join = dataJoin('g', 'point');

    var containerTransform = function containerTransform(origin) {
        return 'translate(' + origin[0] + ', ' + origin[1] + ')';
    };

    var point = function point(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);

            var g = join(d3Selection.select(group[index]), filteredData);
            g.enter().attr('transform', function (d, i) {
                return containerTransform(base.values(d, i).origin);
            }).attr('fill', colors.gray).attr('stroke', colors.black).append('path');

            g.attr('transform', function (d, i) {
                return containerTransform(base.values(d, i).origin);
            }).select('path').attr('d', symbol$$1);

            base.decorate()(g, data, index);
        });
    };

    rebindAll(point, base, exclude('baseValue', 'barWidth'));
    rebind(point, join, 'key');
    rebind(point, symbol$$1, 'type', 'size');

    return point;
});

var point$1 = (function () {

    var symbol$$1 = d3Shape.symbol();

    var base = xyBase();

    var point = function point(data) {
        var filteredData = data.filter(base.defined);
        var context = symbol$$1.context();

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.origin[0], values.origin[1]);
            context.beginPath();

            symbol$$1(data);

            context.strokeStyle = colors.black;
            context.fillStyle = colors.gray;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebindAll(point, base, exclude('baseValue', 'barWidth'));
    rebind(point, symbol$$1, 'size', 'type', 'context');

    return point;
});

var bar = (function () {

    var pathGenerator = shapeBar().x(0).y(0);

    var base = xyBase();

    var join = dataJoin('g', 'bar');

    var valueAxisDimension = function valueAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.height : generator.width;
    };

    var crossAxisDimension = function crossAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.width : generator.height;
    };

    var translation = function translation(origin) {
        return 'translate(' + origin[0] + ', ' + origin[1] + ')';
    };

    var bar = function bar(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var orient = base.orient();
            if (orient !== 'vertical' && orient !== 'horizontal') {
                throw new Error('The bar series does not support an orientation of ' + orient);
            }

            var filteredData = data.filter(base.defined);
            var projectedData = filteredData.map(base.values);

            pathGenerator.width(0).height(0);

            if (base.orient() === 'vertical') {
                pathGenerator.verticalAlign('top');
                pathGenerator.horizontalAlign('center');
            } else {
                pathGenerator.horizontalAlign('right');
                pathGenerator.verticalAlign('center');
            }

            // set the width of the bars
            var width = base.barWidth()(projectedData.map(function (d) {
                return d.x;
            }));
            crossAxisDimension(pathGenerator)(width);

            var g = join(d3Selection.select(group[index]), filteredData);

            // within the enter selection the pathGenerator creates a zero
            // height bar on the baseline. As a result, when used with a transition the bar grows
            // from y0 to y1 (y)
            g.enter().attr('transform', function (_, i) {
                return translation(projectedData[i].baseOrigin);
            }).attr('class', 'bar ' + base.orient()).attr('fill', colors.darkGray).append('path').attr('d', function (d) {
                return pathGenerator([d]);
            });

            // the container translation sets the origin to the 'tip'
            // of each bar as per the decorate pattern
            g.attr('transform', function (_, i) {
                return translation(projectedData[i].origin);
            }).select('path').attr('d', function (d, i) {
                // set the bar to its correct height
                valueAxisDimension(pathGenerator)(-projectedData[i].height);
                return pathGenerator([d]);
            });

            base.decorate()(g, filteredData, index);
        });
    };

    rebindAll(bar, base);
    rebind(bar, join, 'key');

    return bar;
});

var bar$1 = (function () {
    var base = xyBase();

    var pathGenerator = shapeBar().x(0).y(0);

    var valueAxisDimension = function valueAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.height : generator.width;
    };

    var crossAxisDimension = function crossAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.width : generator.height;
    };

    var bar = function bar(data) {
        var context = pathGenerator.context();

        var filteredData = data.filter(base.defined);
        var projectedData = filteredData.map(base.values);

        var width = base.barWidth()(projectedData.map(function (d) {
            return d.x;
        }));
        crossAxisDimension(pathGenerator)(width);

        if (base.orient() === 'vertical') {
            pathGenerator.verticalAlign('top');
            pathGenerator.horizontalAlign('center');
        } else {
            pathGenerator.horizontalAlign('right');
            pathGenerator.verticalAlign('center');
        }

        projectedData.forEach(function (datum, i) {
            context.save();
            context.beginPath();
            context.translate(datum.origin[0], datum.origin[1]);

            valueAxisDimension(pathGenerator)(-datum.height);
            pathGenerator([datum]);

            context.fillStyle = colors.darkGray;
            base.decorate()(context, datum.d, i);
            context.fill();

            context.closePath();
            context.restore();
        });
    };

    rebindAll(bar, base);
    rebind(bar, pathGenerator, 'context');

    return bar;
});

var errorBarBase = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var crossValue = function crossValue(d) {
        return d.cross;
    };
    var orient = 'vertical';
    var barWidth = fractionalBarWidth(0.5);
    var decorate = function decorate() {};

    var base = function base() {};

    base.defined = function (d, i) {
        return defined(lowValue, highValue, crossValue)(d, i);
    };

    base.computeBarWidth = function (filteredData) {
        var scale = orient === 'vertical' ? xScale : yScale;
        return barWidth(filteredData.map(function (d, i) {
            return scale(crossValue(d, i));
        }));
    };

    base.values = function (d, i) {
        if (orient === 'vertical') {
            var y = yScale(highValue(d, i));
            return {
                origin: [xScale(crossValue(d, i)), y],
                high: 0,
                low: yScale(lowValue(d, i)) - y
            };
        } else {
            var x = xScale(lowValue(d, i));
            return {
                origin: [x, yScale(crossValue(d, i))],
                high: xScale(highValue(d, i)) - x,
                low: 0
            };
        }
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var errorBar = (function () {

    var base = errorBarBase();

    var join = dataJoin('g', 'error-bar');

    var pathGenerator = shapeErrorBar().value(0);

    var propagateTransition = function propagateTransition(maybeTransition) {
        return function (selection$$1) {
            return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
        };
    };

    var containerTranslation = function containerTranslation(values) {
        return 'translate(' + values.origin[0] + ', ' + values.origin[1] + ')';
    };

    var errorBar = function errorBar(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        var transitionPropagator = propagateTransition(selection$$1);

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);
            var projectedData = filteredData.map(base.values);
            var g = join(d3Selection.select(group[index]), filteredData);

            g.enter().attr('stroke', colors.black).attr('fill', colors.gray).attr('transform', function (d, i) {
                return containerTranslation(base.values(d, i)) + ' scale(1e-6, 1)';
            }).append('path');

            var width = base.computeBarWidth(filteredData);

            pathGenerator.orient(base.orient()).width(width);

            g.each(function (d, i, g) {
                var values = projectedData[i];
                pathGenerator.high(values.high).low(values.low);

                transitionPropagator(d3Selection.select(g[i])).attr('transform', containerTranslation(values) + ' scale(1)').select('path').attr('d', pathGenerator([d]));
            });

            base.decorate()(g, data, index);
        });
    };

    rebindAll(errorBar, base);
    rebind(errorBar, join, 'key');

    return errorBar;
});

var errorBar$1 = (function () {

    var base = errorBarBase();

    var pathGenerator = shapeErrorBar().value(0);

    var errorBar = function errorBar(data) {
        var filteredData = data.filter(base.defined);
        var context = pathGenerator.context();

        var width = base.computeBarWidth(filteredData);
        pathGenerator.orient(base.orient()).width(width);

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.origin[0], values.origin[1]);
            context.beginPath();

            pathGenerator.high(values.high).low(values.low)([d]);

            context.strokeStyle = colors.black;
            context.fillStyle = colors.gray;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebindAll(errorBar, base);
    rebind(errorBar, pathGenerator, 'context');

    return errorBar;
});

var area$1 = (function () {
    var base = xyBase();

    var areaData = d3Shape.area().defined(base.defined);

    var join = dataJoin('path', 'area');

    var area$$1 = function area$$1(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var projectedData = data.map(base.values);
            areaData.x(function (_, i) {
                return projectedData[i].transposedX;
            }).y(function (_, i) {
                return projectedData[i].transposedY;
            });

            var valueComponent = base.orient() === 'vertical' ? 'y' : 'x';
            areaData[valueComponent + '0'](function (_, i) {
                return projectedData[i].y0;
            });
            areaData[valueComponent + '1'](function (_, i) {
                return projectedData[i].y;
            });

            var path$$1 = join(d3Selection.select(group[index]), [data]);
            path$$1.attr('d', areaData).attr('fill', colors.gray);
            base.decorate()(path$$1, data, index);
        });
    };

    rebindAll(area$$1, base, exclude('barWidth'));
    rebind(area$$1, join, 'key');
    rebind(area$$1, areaData, 'curve');

    return area$$1;
});

var area$2 = (function () {
    var base = xyBase();

    var areaData = d3Shape.area().defined(base.defined);

    var area$$1 = function area$$1(data) {
        var context = areaData.context();

        var projectedData = data.map(base.values);
        areaData.x(function (_, i) {
            return projectedData[i].transposedX;
        }).y(function (_, i) {
            return projectedData[i].transposedY;
        });

        var valueComponent = base.orient() === 'vertical' ? 'y' : 'x';
        areaData[valueComponent + '0'](function (_, i) {
            return projectedData[i].y0;
        });
        areaData[valueComponent + '1'](function (_, i) {
            return projectedData[i].y;
        });

        context.beginPath();
        areaData(data);
        context.fillStyle = colors.gray;

        base.decorate()(context, data);

        context.fill();
        context.closePath();
    };

    rebindAll(area$$1, base, exclude('barWidth'));
    rebind(area$$1, areaData, 'curve', 'context');

    return area$$1;
});

var ohlcBase$1 = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var crossValue = function crossValue(d) {
        return d.date;
    };
    var openValue = function openValue(d) {
        return d.open;
    };
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var closeValue = function closeValue(d) {
        return d.close;
    };
    var barWidth = fractionalBarWidth(0.75);
    var decorate = function decorate() {};
    var crossValueScaled = function crossValueScaled(d, i) {
        return xScale(crossValue(d, i));
    };

    var base = function base() {};

    base.width = function (data) {
        return barWidth(data.map(crossValueScaled));
    };

    base.defined = function (d, i) {
        return defined(crossValue, openValue, lowValue, highValue, closeValue)(d, i);
    };

    base.values = function (d, i) {
        var closeRaw = closeValue(d, i);
        var openRaw = openValue(d, i);

        var direction = '';
        if (closeRaw > openRaw) {
            direction = 'up';
        } else if (closeRaw < openRaw) {
            direction = 'down';
        }

        return {
            cross: crossValueScaled(d, i),
            open: yScale(openRaw),
            high: yScale(highValue(d, i)),
            low: yScale(lowValue(d, i)),
            close: yScale(closeRaw),
            direction: direction
        };
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.openValue = function () {
        if (!arguments.length) {
            return openValue;
        }
        openValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yValue = base.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };

    return base;
});

var ohlcBase = (function (pathGenerator, seriesName) {
    var base = ohlcBase$1();
    var join = dataJoin('g', seriesName);
    var containerTranslation = function containerTranslation(values) {
        return 'translate(' + values.cross + ', ' + values.high + ')';
    };

    var propagateTransition = function propagateTransition(maybeTransition) {
        return function (selection$$1) {
            return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
        };
    };

    var candlestick = function candlestick(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        var transitionPropagator = propagateTransition(selection$$1);

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);
            pathGenerator.width(base.width(filteredData));

            var g = join(d3Selection.select(group[index]), filteredData);

            g.enter().attr('transform', function (d, i) {
                return containerTranslation(base.values(d, i)) + ' scale(1e-6, 1)';
            }).append('path');

            g.each(function (d, i, g) {

                var values = base.values(d, i);
                var color = values.direction === 'up' ? colors.green : colors.red;

                var singleCandlestick = transitionPropagator(d3Selection.select(g[i])).attr('class', seriesName + ' ' + values.direction).attr('stroke', color).attr('fill', color).attr('transform', function () {
                    return containerTranslation(values) + ' scale(1)';
                });

                pathGenerator.x(0).open(function () {
                    return values.open - values.high;
                }).high(0).low(function () {
                    return values.low - values.high;
                }).close(function () {
                    return values.close - values.high;
                });

                singleCandlestick.select('path').attr('d', pathGenerator([d]));
            });

            base.decorate()(g, data, index);
        });
    };

    rebind(candlestick, join, 'key');
    rebindAll(candlestick, base);

    return candlestick;
});

var candlestick = (function () {
  return ohlcBase(shapeCandlestick(), 'candlestick');
});

var ohlcBase$2 = (function (pathGenerator) {

    var base = ohlcBase$1();

    var candlestick = function candlestick(data) {
        var filteredData = data.filter(base.defined);
        pathGenerator.width(base.width(filteredData));
        var context = pathGenerator.context();

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.cross, values.high);
            context.beginPath();

            pathGenerator.x(0).open(function () {
                return values.open - values.high;
            }).high(0).low(function () {
                return values.low - values.high;
            }).close(function () {
                return values.close - values.high;
            })([d]);

            var color = values.direction === 'up' ? colors.green : colors.red;
            context.strokeStyle = color;
            context.fillStyle = color;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebind(candlestick, pathGenerator, 'context');
    rebindAll(candlestick, base);

    return candlestick;
});

var candlestick$1 = (function () {
  return ohlcBase$2(shapeCandlestick());
});

var boxPlotBase = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var upperQuartileValue = function upperQuartileValue(d) {
        return d.upperQuartile;
    };
    var lowerQuartileValue = function lowerQuartileValue(d) {
        return d.lowerQuartile;
    };
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var crossValue = function crossValue(d) {
        return d.value;
    };
    var medianValue = function medianValue(d) {
        return d.median;
    };
    var orient = 'vertical';
    var barWidth = fractionalBarWidth(0.5);
    var decorate = function decorate() {};

    var base = function base() {};

    base.defined = function (d, i) {
        return defined(lowValue, highValue, lowerQuartileValue, upperQuartileValue, crossValue, medianValue)(d, i);
    };

    base.computeBarWidth = function (filteredData) {
        var scale = orient === 'vertical' ? xScale : yScale;
        return barWidth(filteredData.map(function (d, i) {
            return scale(crossValue(d, i));
        }));
    };

    base.values = function (d, i) {
        if (orient === 'vertical') {
            var y = yScale(highValue(d, i));
            return {
                origin: [xScale(crossValue(d, i)), y],
                high: 0,
                upperQuartile: yScale(upperQuartileValue(d, i)) - y,
                median: yScale(medianValue(d, i)) - y,
                lowerQuartile: yScale(lowerQuartileValue(d, i)) - y,
                low: yScale(lowValue(d, i)) - y
            };
        } else {
            var x = xScale(lowValue(d, i));
            return {
                origin: [x, yScale(crossValue(d, i))],
                high: xScale(highValue(d, i)) - x,
                upperQuartile: xScale(upperQuartileValue(d, i)) - x,
                median: xScale(medianValue(d, i)) - x,
                lowerQuartile: xScale(lowerQuartileValue(d, i)) - x,
                low: 0
            };
        }
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowerQuartileValue = function () {
        if (!arguments.length) {
            return lowerQuartileValue;
        }
        lowerQuartileValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.upperQuartileValue = function () {
        if (!arguments.length) {
            return upperQuartileValue;
        }
        upperQuartileValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.medianValue = function () {
        if (!arguments.length) {
            return medianValue;
        }
        medianValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var boxPlot = (function () {

    var base = boxPlotBase();

    var join = dataJoin('g', 'box-plot');

    var pathGenerator = shapeBoxPlot().value(0);

    var propagateTransition = function propagateTransition(maybeTransition) {
        return function (selection$$1) {
            return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
        };
    };

    var containerTranslation = function containerTranslation(values) {
        return 'translate(' + values.origin[0] + ', ' + values.origin[1] + ')';
    };

    var boxPlot = function boxPlot(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        var transitionPropagator = propagateTransition(selection$$1);

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);
            var g = join(d3Selection.select(group[index]), filteredData);

            g.enter().attr('stroke', colors.black).attr('fill', colors.gray).attr('transform', function (d, i) {
                return containerTranslation(base.values(d, i)) + ' scale(1e-6, 1)';
            }).append('path');

            var width = base.computeBarWidth(filteredData);

            pathGenerator.orient(base.orient()).width(width);

            g.each(function (d, i, g) {
                var values = base.values(d, i);
                pathGenerator.median(values.median).upperQuartile(values.upperQuartile).lowerQuartile(values.lowerQuartile).high(values.high).low(values.low);

                transitionPropagator(d3Selection.select(g[i])).attr('transform', containerTranslation(values)).select('path').attr('d', pathGenerator([d]));
            });

            base.decorate()(g, data, index);
        });
    };

    rebindAll(boxPlot, base);
    rebind(boxPlot, join, 'key');
    rebind(boxPlot, pathGenerator, 'cap');

    return boxPlot;
});

var boxPlot$1 = (function () {

    var base = boxPlotBase();

    var pathGenerator = shapeBoxPlot().value(0);

    var boxPlot = function boxPlot(data) {
        var filteredData = data.filter(base.defined);
        var context = pathGenerator.context();

        var width = base.computeBarWidth(filteredData);
        pathGenerator.orient(base.orient()).width(width);

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.origin[0], values.origin[1]);
            context.beginPath();

            pathGenerator.median(values.median).upperQuartile(values.upperQuartile).lowerQuartile(values.lowerQuartile).high(values.high).low(values.low)([d]);

            context.strokeStyle = colors.black;
            context.fillStyle = colors.gray;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebindAll(boxPlot, base);
    rebind(boxPlot, pathGenerator, 'cap', 'context');

    return boxPlot;
});

var ohlc = (function () {
  return ohlcBase(shapeOhlc(), 'ohlc');
});

var ohlc$1 = (function () {
  return ohlcBase$2(shapeOhlc());
});

var multiBase = (function () {

    var decorate = function decorate() {};
    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var series = [];
    var mapping = function mapping(d) {
        return d;
    };
    var key = function key(_, i) {
        return i;
    };

    var multi = function multi() {};

    multi.mapping = function () {
        if (!arguments.length) {
            return mapping;
        }
        mapping = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.key = function () {
        if (!arguments.length) {
            return key;
        }
        key = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.series = function () {
        if (!arguments.length) {
            return series;
        }
        series = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };

    return multi;
});

var multiSeries = (function () {

    var base = multiBase();

    var innerJoin = dataJoin('g');

    var join = dataJoin('g', 'multi');

    var multi = function multi(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
            innerJoin.transition(selection$$1);
        }

        var mapping = base.mapping();
        var series = base.series();
        var xScale = base.xScale();
        var yScale = base.yScale();

        selection$$1.each(function (data, index, group) {

            var container = join(d3Selection.select(group[index]), series);

            // iterate over the containers, 'call'-ing the series for each
            container.each(function (dataSeries, seriesIndex, seriesGroup) {
                dataSeries.xScale(xScale).yScale(yScale);

                var seriesData = mapping(data, seriesIndex, series);
                var innerContainer = innerJoin(d3Selection.select(seriesGroup[seriesIndex]), [seriesData]);

                innerContainer.call(dataSeries);
            });

            var unwrappedSelection = container.selection ? container.selection() : container;
            unwrappedSelection.order();

            base.decorate()(container, data, index);
        });
    };

    rebindAll(multi, base);
    rebind(multi, join, 'key');

    return multi;
});

var multiSeries$1 = (function () {

    var context = null;
    var base = multiBase();

    var multi = function multi(data) {
        var mapping = base.mapping();
        var series = base.series();
        var xScale = base.xScale();
        var yScale = base.yScale();

        series.forEach(function (dataSeries, index) {
            var seriesData = mapping(data, index, series);
            dataSeries.context(context).xScale(xScale).yScale(yScale);

            var adaptedDecorate = dataSeries.decorate();
            dataSeries.decorate(function (c, d, i) {
                base.decorate()(c, data, index);
                adaptedDecorate(c, d, i);
            });

            dataSeries(seriesData);

            dataSeries.decorate(adaptedDecorate);
        });
    };

    multi.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };

    rebindAll(multi, base);

    return multi;
});

var groupedBase = (function (series) {

    var groupWidth = fractionalBarWidth(0.75);
    var decorate = function decorate() {};
    var xScale = d3Scale.scaleLinear();

    var offsetScale = d3Scale.scaleBand();
    var grouped = function grouped() {};

    var computeGroupWidth = function computeGroupWidth(data) {
        if (!data.length) {
            return 0;
        }
        var seriesData = data[0];
        var crossValue = series.crossValue();
        var x = function x(d, i) {
            return xScale(crossValue(d, i));
        };
        var width = groupWidth(seriesData.map(x));
        return width;
    };

    grouped.configureOffsetScale = function (data) {
        var groupWidth = computeGroupWidth(data);

        var halfWidth = groupWidth / 2;
        offsetScale.domain(d3Array.range(0, data.length)).range([-halfWidth, halfWidth]);

        if (series.barWidth) {
            series.barWidth(offsetScale.bandwidth());
        }
    };

    grouped.offsetScale = function () {
        return offsetScale;
    };

    grouped.groupWidth = function () {
        if (!arguments.length) {
            return groupWidth;
        }
        groupWidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return grouped;
    };
    grouped.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return grouped;
    };
    grouped.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return grouped;
    };

    rebindAll(grouped, offsetScale, includeMap({ 'paddingInner': 'subPadding' }));

    return grouped;
});

var grouped = (function (series) {

    var base = groupedBase(series);

    var join = dataJoin('g', 'grouped');

    var grouped = function grouped(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {
            base.configureOffsetScale(data);

            var g = join(d3Selection.select(group[index]), data);

            g.enter().append('g');

            g.select('g').each(function (_, index, group) {
                var container = d3Selection.select(group[index]);

                // create a composite scale that applies the required offset
                var compositeScale = function compositeScale(x) {
                    return base.xScale()(x) + base.offsetScale()(index) + base.offsetScale().bandwidth() / 2;
                };
                series.xScale(compositeScale);

                // adapt the decorate function to give each series the correct index
                series.decorate(function (s, d) {
                    return base.decorate()(s, d, index);
                });

                container.call(series);
            });
        });
    };

    rebindAll(grouped, series, exclude('decorate', 'xScale'));
    rebindAll(grouped, base, exclude('configureOffsetScale', 'configureOffset'));

    return grouped;
});

var grouped$1 = function (series) {

    var base = groupedBase(series);

    var grouped = function grouped(data) {
        base.configureOffsetScale(data);

        data.forEach(function (seriesData, index) {

            // create a composite scale that applies the required offset
            var compositeScale = function compositeScale(x) {
                return base.xScale()(x) + base.offsetScale()(index) + base.offsetScale().bandwidth() / 2;
            };
            series.xScale(compositeScale);

            // adapt the decorate function to give each series the correct index
            series.decorate(function (c, d) {
                return base.decorate()(c, d, index);
            });
            series(seriesData);
        });
    };

    rebindAll(grouped, series, exclude('decorate', 'xScale'));
    rebindAll(grouped, base, exclude('configureOffsetScale', 'configureOffset'));

    return grouped;
};

var repeat = (function () {

    var orient = 'vertical';
    var series = seriesSvgLine();
    var multi = multiSeries();

    var repeat = function repeat(selection$$1) {
        return selection$$1.each(function (data, index, group) {
            if (orient === 'vertical') {
                multi.series(data[0].map(function (_) {
                    return series;
                })).mapping(function (data, index) {
                    return data.map(function (d) {
                        return d[index];
                    });
                });
            } else {
                multi.series(data.map(function (_) {
                    return series;
                })).mapping(function (data, index) {
                    return data[index];
                });
            }
            d3Selection.select(group[index]).call(multi);
        });
    };

    repeat.series = function () {
        if (!arguments.length) {
            return series;
        }
        series = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    repeat.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    rebindAll(repeat, multi, exclude('series', 'mapping'));

    return repeat;
});

var repeat$1 = (function () {

    var orient = 'vertical';
    var series = line$1();
    var multi = multiSeries$1();

    var repeat = function repeat(data) {
        if (orient === 'vertical') {
            multi.series(data[0].map(function (_) {
                return series;
            })).mapping(function (data, index) {
                return data.map(function (d) {
                    return d[index];
                });
            });
        } else {
            multi.series(data.map(function (_) {
                return series;
            })).mapping(function (data, index) {
                return data[index];
            });
        }
        multi(data);
    };

    repeat.series = function () {
        if (!arguments.length) {
            return series;
        }
        series = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    repeat.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    rebindAll(repeat, multi, exclude('series', 'mapping'));

    return repeat;
});

var constant = (function (value) {
  return typeof value === 'function' ? value : function () {
    return value;
  };
});

var band = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var orient = 'horizontal';
    var fromValue = function fromValue(d) {
        return d.from;
    };
    var toValue = function toValue(d) {
        return d.to;
    };
    var decorate = function decorate() {};

    var join = dataJoin('g', 'annotation-band');

    var pathGenerator = shapeBar().horizontalAlign('center').verticalAlign('center').x(0).y(0);

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        if (orient !== 'horizontal' && orient !== 'vertical') {
            throw new Error('Invalid orientation');
        }

        var horizontal = orient === 'horizontal';
        var translation = horizontal ? function (a, b) {
            return 'translate(' + a + ', ' + b + ')';
        } : function (a, b) {
            return 'translate(' + b + ', ' + a + ')';
        };
        // the value scale which the annotation 'value' relates to, the crossScale
        // is the other. Which is which depends on the orienation!
        var crossScale = horizontal ? xScale : yScale;
        var valueScale = horizontal ? yScale : xScale;
        var crossScaleRange = crossScale.range();
        var crossScaleSize = crossScaleRange[1] - crossScaleRange[0];
        var valueAxisDimension = horizontal ? 'height' : 'width';
        var crossAxisDimension = horizontal ? 'width' : 'height';
        var containerTransform = function containerTransform() {
            return translation((crossScaleRange[1] + crossScaleRange[0]) / 2, (valueScale(toValue.apply(undefined, arguments)) + valueScale(fromValue.apply(undefined, arguments))) / 2);
        };

        pathGenerator[crossAxisDimension](crossScaleSize);
        pathGenerator[valueAxisDimension](function () {
            return valueScale(toValue.apply(undefined, arguments)) - valueScale(fromValue.apply(undefined, arguments));
        });

        selection$$1.each(function (data, index, nodes) {

            var g = join(d3Selection.select(nodes[index]), data);

            g.enter().attr('transform', containerTransform).append('path').classed('band', true);

            g.attr('class', 'annotation-band ' + orient).attr('transform', containerTransform).select('path')
            // the path generator is being used to render a single path, hence
            // an explicit index is provided
            .attr('d', function (d, i) {
                return pathGenerator([d], i);
            });

            decorate(g, data, index);
        });
    };

    instance.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.fromValue = function () {
        if (!arguments.length) {
            return fromValue;
        }
        fromValue = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };
    instance.toValue = function () {
        if (!arguments.length) {
            return toValue;
        }
        toValue = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };

    return instance;
});

var annotationLine = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var value = function value(d) {
        return d;
    };
    var label = value;
    var decorate = function decorate() {};
    var orient = 'horizontal';

    var join = dataJoin('g', 'annotation-line');

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        if (orient !== 'horizontal' && orient !== 'vertical') {
            throw new Error('Invalid orientation');
        }
        var horizontal = orient === 'horizontal';
        var translation = horizontal ? function (a, b) {
            return 'translate(' + a + ', ' + b + ')';
        } : function (a, b) {
            return 'translate(' + b + ', ' + a + ')';
        };
        var lineProperty = horizontal ? 'x2' : 'y2';
        // the value scale which the annotation 'value' relates to, the crossScale
        // is the other. Which is which depends on the orienation!
        var crossScale = horizontal ? xScale : yScale;
        var valueScale = horizontal ? yScale : xScale;
        var handleOne = horizontal ? 'left-handle' : 'bottom-handle';
        var handleTwo = horizontal ? 'right-handle' : 'top-handle';
        var textOffsetX = horizontal ? '9' : '0';
        var textOffsetY = horizontal ? '0' : '9';
        var textOffsetDeltaY = horizontal ? '0.32em' : '0.71em';
        var textAnchor = horizontal ? 'start' : 'middle';

        var scaleRange = crossScale.range();
        // the transform that sets the 'origin' of the annotation
        var containerTransform = function containerTransform() {
            return translation(scaleRange[0], valueScale(value.apply(undefined, arguments)));
        };
        var scaleWidth = scaleRange[1] - scaleRange[0];

        selection$$1.each(function (data, selectionIndex, nodes) {

            var g = join(d3Selection.select(nodes[selectionIndex]), data);

            // create the outer container and line
            var enter = g.enter().attr('transform', containerTransform).style('stroke', '#bbb');
            enter.append('line').attr(lineProperty, scaleWidth);

            // create containers at each end of the annotation
            enter.append('g').classed(handleOne, true).style('stroke', 'none');

            enter.append('g').classed(handleTwo, true).style('stroke', 'none').attr('transform', translation(scaleWidth, 0)).append('text').attr('text-anchor', textAnchor).attr('x', textOffsetX).attr('y', textOffsetY).attr('dy', textOffsetDeltaY);

            // Update
            g.attr('class', 'annotation-line ' + orient);

            // translate the parent container to the left hand edge of the annotation
            g.attr('transform', containerTransform);

            // update the elements that depend on scale width
            g.select('line').attr(lineProperty, scaleWidth);
            g.select('g.' + handleTwo).attr('transform', translation(scaleWidth, 0));

            // Update the text label
            g.select('text').text(label);

            decorate(g, data, selectionIndex);
        });
    };

    instance.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };
    instance.label = function () {
        if (!arguments.length) {
            return label;
        }
        label = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };
    instance.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    return instance;
});

// the barWidth property of the various series takes a function which, when given an
// array of x values, returns a suitable width. This function creates a width which is
// equal to the smallest distance between neighbouring datapoints multiplied
// by the given factor
var fractionalBarWidth$1 = (function (fraction) {
    return function (pixelValues) {
        // return some default value if there are not enough datapoints to compute the width
        if (pixelValues.length <= 1) {
            return 10;
        }

        pixelValues.sort();

        // compute the distance between neighbouring items
        var neighbourDistances = d3Array.pairs(pixelValues).map(function (tuple) {
            return Math.abs(tuple[0] - tuple[1]);
        });

        var minDistance = d3Array.min(neighbourDistances);
        return fraction * minDistance;
    };
});

var functor$5 = (function (d) {
  return typeof d === 'function' ? d : function () {
    return d;
  };
});

// Checks that passes properties are 'defined', meaning that calling them with (d, i) returns non null values
function defined$1() {
    var outerArguments = arguments;
    return function (d, i) {
        for (var c = 0, j = outerArguments.length; c < j; c++) {
            if (outerArguments[c](d, i) == null) {
                return false;
            }
        }
        return true;
    };
}

var xyBase$1 = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var baseValue = function baseValue() {
        return 0;
    };
    var crossValue = function crossValue(d) {
        return d.x;
    };
    var mainValue = function mainValue(d) {
        return d.y;
    };
    var decorate = function decorate() {};
    var barWidth = fractionalBarWidth$1(0.75);
    var orient = 'vertical';

    var base = function base() {};

    base.defined = function (d, i) {
        return defined$1(baseValue, crossValue, mainValue)(d, i);
    };

    base.values = function (d, i) {
        if (orient === 'vertical') {
            var y = yScale(mainValue(d, i));
            var y0 = yScale(baseValue(d, i));
            var x = xScale(crossValue(d, i));
            return {
                d: d,
                x: x,
                y: y,
                y0: y0,
                height: y - y0,
                origin: [x, y],
                baseOrigin: [x, y0],
                transposedX: x,
                transposedY: y
            };
        } else {
            var _y = xScale(mainValue(d, i));
            var _y2 = xScale(baseValue(d, i));
            var _x = yScale(crossValue(d, i));
            return {
                d: d,
                x: _x,
                y: _y,
                y0: _y2,
                height: _y - _y2,
                origin: [_y, _x],
                baseOrigin: [_y2, _x],
                transposedX: _y,
                transposedY: _x
            };
        }
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.baseValue = function () {
        if (!arguments.length) {
            return baseValue;
        }
        baseValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.mainValue = function () {
        if (!arguments.length) {
            return mainValue;
        }
        mainValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var red$1 = '#c60';
var green$1 = '#6c0';
var black$1 = '#000';
var gray$1 = '#ddd';
var darkGray$1 = '#999';

var colors$1 = {
    red: red$1,
    green: green$1,
    black: black$1,
    gray: gray$1,
    darkGray: darkGray$1
};

var seriesSvgPoint = (function () {
    var symbol$$1 = d3Shape.symbol();

    var base = xyBase$1();

    var join = dataJoin('g', 'point');

    var containerTransform = function containerTransform(origin) {
        return 'translate(' + origin[0] + ', ' + origin[1] + ')';
    };

    var point = function point(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);

            var g = join(d3Selection.select(group[index]), filteredData);
            g.enter().attr('transform', function (d, i) {
                return containerTransform(base.values(d, i).origin);
            }).attr('fill', colors$1.gray).attr('stroke', colors$1.black).append('path');

            g.attr('transform', function (d, i) {
                return containerTransform(base.values(d, i).origin);
            }).select('path').attr('d', symbol$$1);

            base.decorate()(g, data, index);
        });
    };

    rebindAll(point, base, exclude('baseValue', 'barWidth'));
    rebind(point, join, 'key');
    rebind(point, symbol$$1, 'type', 'size');

    return point;
});

var errorBarBase$1 = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var crossValue = function crossValue(d) {
        return d.cross;
    };
    var orient = 'vertical';
    var barWidth = fractionalBarWidth$1(0.5);
    var decorate = function decorate() {};

    var base = function base() {};

    base.defined = function (d, i) {
        return defined$1(lowValue, highValue, crossValue)(d, i);
    };

    base.computeBarWidth = function (filteredData) {
        var scale = orient === 'vertical' ? xScale : yScale;
        return barWidth(filteredData.map(function (d, i) {
            return scale(crossValue(d, i));
        }));
    };

    base.values = function (d, i) {
        if (orient === 'vertical') {
            var y = yScale(highValue(d, i));
            return {
                origin: [xScale(crossValue(d, i)), y],
                high: 0,
                low: yScale(lowValue(d, i)) - y
            };
        } else {
            var x = xScale(lowValue(d, i));
            return {
                origin: [x, yScale(crossValue(d, i))],
                high: xScale(highValue(d, i)) - x,
                low: 0
            };
        }
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var ohlcBase$4 = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var crossValue = function crossValue(d) {
        return d.date;
    };
    var openValue = function openValue(d) {
        return d.open;
    };
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var closeValue = function closeValue(d) {
        return d.close;
    };
    var barWidth = fractionalBarWidth$1(0.75);
    var decorate = function decorate() {};
    var crossValueScaled = function crossValueScaled(d, i) {
        return xScale(crossValue(d, i));
    };

    var base = function base() {};

    base.width = function (data) {
        return barWidth(data.map(crossValueScaled));
    };

    base.defined = function (d, i) {
        return defined$1(crossValue, openValue, lowValue, highValue, closeValue)(d, i);
    };

    base.values = function (d, i) {
        var closeRaw = closeValue(d, i);
        var openRaw = openValue(d, i);

        var direction = '';
        if (closeRaw > openRaw) {
            direction = 'up';
        } else if (closeRaw < openRaw) {
            direction = 'down';
        }

        return {
            cross: crossValueScaled(d, i),
            open: yScale(openRaw),
            high: yScale(highValue(d, i)),
            low: yScale(lowValue(d, i)),
            close: yScale(closeRaw),
            direction: direction
        };
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.openValue = function () {
        if (!arguments.length) {
            return openValue;
        }
        openValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yValue = base.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };

    return base;
});

var boxPlotBase$1 = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var upperQuartileValue = function upperQuartileValue(d) {
        return d.upperQuartile;
    };
    var lowerQuartileValue = function lowerQuartileValue(d) {
        return d.lowerQuartile;
    };
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var crossValue = function crossValue(d) {
        return d.value;
    };
    var medianValue = function medianValue(d) {
        return d.median;
    };
    var orient = 'vertical';
    var barWidth = fractionalBarWidth$1(0.5);
    var decorate = function decorate() {};

    var base = function base() {};

    base.defined = function (d, i) {
        return defined$1(lowValue, highValue, lowerQuartileValue, upperQuartileValue, crossValue, medianValue)(d, i);
    };

    base.computeBarWidth = function (filteredData) {
        var scale = orient === 'vertical' ? xScale : yScale;
        return barWidth(filteredData.map(function (d, i) {
            return scale(crossValue(d, i));
        }));
    };

    base.values = function (d, i) {
        if (orient === 'vertical') {
            var y = yScale(highValue(d, i));
            return {
                origin: [xScale(crossValue(d, i)), y],
                high: 0,
                upperQuartile: yScale(upperQuartileValue(d, i)) - y,
                median: yScale(medianValue(d, i)) - y,
                lowerQuartile: yScale(lowerQuartileValue(d, i)) - y,
                low: yScale(lowValue(d, i)) - y
            };
        } else {
            var x = xScale(lowValue(d, i));
            return {
                origin: [x, yScale(crossValue(d, i))],
                high: xScale(highValue(d, i)) - x,
                upperQuartile: xScale(upperQuartileValue(d, i)) - x,
                median: xScale(medianValue(d, i)) - x,
                lowerQuartile: xScale(lowerQuartileValue(d, i)) - x,
                low: 0
            };
        }
    };

    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowerQuartileValue = function () {
        if (!arguments.length) {
            return lowerQuartileValue;
        }
        lowerQuartileValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.upperQuartileValue = function () {
        if (!arguments.length) {
            return upperQuartileValue;
        }
        upperQuartileValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.medianValue = function () {
        if (!arguments.length) {
            return medianValue;
        }
        medianValue = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.barWidth = function () {
        if (!arguments.length) {
            return barWidth;
        }
        barWidth = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var multiBase$1 = (function () {

    var decorate = function decorate() {};
    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var series = [];
    var mapping = function mapping(d) {
        return d;
    };
    var key = function key(_, i) {
        return i;
    };

    var multi = function multi() {};

    multi.mapping = function () {
        if (!arguments.length) {
            return mapping;
        }
        mapping = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.key = function () {
        if (!arguments.length) {
            return key;
        }
        key = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.series = function () {
        if (!arguments.length) {
            return series;
        }
        series = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };

    return multi;
});

var seriesSvgMulti = (function () {

    var base = multiBase$1();

    var innerJoin = dataJoin('g');

    var join = dataJoin('g', 'multi');

    var multi = function multi(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
            innerJoin.transition(selection$$1);
        }

        var mapping = base.mapping();
        var series = base.series();
        var xScale = base.xScale();
        var yScale = base.yScale();

        selection$$1.each(function (data, index, group) {

            var container = join(d3Selection.select(group[index]), series);

            // iterate over the containers, 'call'-ing the series for each
            container.each(function (dataSeries, seriesIndex, seriesGroup) {
                dataSeries.xScale(xScale).yScale(yScale);

                var seriesData = mapping(data, dataSeries, seriesIndex);
                var innerContainer = innerJoin(d3Selection.select(seriesGroup[seriesIndex]), [seriesData]);

                innerContainer.call(dataSeries);
            });

            var unwrappedSelection = container.selection ? container.selection() : container;
            unwrappedSelection.order();

            base.decorate()(container, data, index);
        });
    };

    rebindAll(multi, base);
    rebind(multi, join, 'key');

    return multi;
});

var crosshair = function () {

    var x = function x(d) {
        return d.x;
    };
    var y = function y(d) {
        return d.y;
    };
    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var decorate = function decorate() {};

    var join = dataJoin('g', 'annotation-crosshair');

    var point = seriesSvgPoint();

    var horizontalLine = annotationLine();

    var verticalLine = annotationLine().orient('vertical');

    // The line annotations and point series used to render the crosshair are positioned using
    // screen coordinates. This function constructs an identity scale for these components.
    var xIdentity = d3Scale.scaleIdentity();
    var yIdentity = d3Scale.scaleIdentity();

    var multi = seriesSvgMulti().series([horizontalLine, verticalLine, point]).xScale(xIdentity).yScale(yIdentity).mapping(function (data) {
        return [data];
    });

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, nodes) {

            var g = join(d3Selection.select(nodes[index]), data);

            // Prevent the crosshair triggering pointer events on itself
            g.enter().style('pointer-events', 'none');

            // Assign the identity scales an accurate range to allow the line annotations to cover
            // the full width/height of the chart.
            xIdentity.range(xScale.range());
            yIdentity.range(yScale.range());

            point.crossValue(x).mainValue(y);

            horizontalLine.value(y);

            verticalLine.value(x);

            g.call(multi);

            decorate(g, data, index);
        });
    };

    // Don't use the xValue/yValue convention to indicate that these values are in screen
    // not domain co-ordinates and are therefore not scaled.
    instance.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.y = function () {
        if (!arguments.length) {
            return y;
        }
        y = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    var lineIncludes = include('label');
    rebindAll(instance, horizontalLine, lineIncludes, prefix('y'));
    rebindAll(instance, verticalLine, lineIncludes, prefix('x'));

    return instance;
};

var ticks = (function () {

    var scale = d3Scale.scaleIdentity();
    var count = 10;
    var tickValues = null;

    var ticks = function ticks() {
        return tickValues != null ? tickValues : scale.ticks ? scale.ticks(count) : scale.domain();
    };

    ticks.scale = function () {
        if (!arguments.length) {
            return scale;
        }
        scale = arguments.length <= 0 ? undefined : arguments[0];
        return ticks;
    };

    ticks.ticks = function () {
        if (!arguments.length) {
            return count;
        }
        count = arguments.length <= 0 ? undefined : arguments[0];
        return ticks;
    };

    ticks.tickValues = function () {
        if (!arguments.length) {
            return tickValues;
        }
        tickValues = arguments.length <= 0 ? undefined : arguments[0];
        return ticks;
    };

    return ticks;
});

var identity$2 = function identity$2(d) {
    return d;
};

var gridline = (function () {

    var xDecorate = function xDecorate() {};
    var yDecorate = function yDecorate() {};

    var xTicks = ticks();
    var yTicks = ticks();
    var xJoin = dataJoin('line', 'gridline-y').key(identity$2);
    var yJoin = dataJoin('line', 'gridline-x').key(identity$2);

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            xJoin.transition(selection$$1);
            yJoin.transition(selection$$1);
        }

        selection$$1.each(function (data, index, nodes) {

            var element = nodes[index];
            var container = d3Selection.select(nodes[index]);

            var xScale = xTicks.scale();
            var yScale = yTicks.scale();

            // Stash a snapshot of the scale, and retrieve the old snapshot.
            var xScaleOld = element.__x_scale__ || xScale;
            element.__x_scale__ = xScale.copy();

            var xData = xTicks();
            var xLines = xJoin(container, xData);

            xLines.attr('x1', xScale).attr('x2', xScale).attr('y1', yScale.range()[0]).attr('y2', yScale.range()[1]).attr('stroke', '#bbb');

            xLines.enter().attr('x1', xScaleOld).attr('x2', xScaleOld).attr('y1', yScale.range()[0]).attr('y2', yScale.range()[1]);

            xLines.exit().attr('x1', xScale).attr('x2', xScale);

            xDecorate(xLines, xData, index);

            // Stash a snapshot of the scale, and retrieve the old snapshot.
            var yScaleOld = element.__y_scale__ || yScale;
            element.__y_scale__ = yScale.copy();

            var yData = yTicks();
            var yLines = yJoin(container, yData);

            yLines.attr('y1', yScale).attr('y2', yScale).attr('x1', xScale.range()[0]).attr('x2', xScale.range()[1]).attr('stroke', '#bbb');

            yLines.enter().attr('y1', yScaleOld).attr('y2', yScaleOld).attr('x1', xScale.range()[0]).attr('x2', xScale.range()[1]);

            yLines.exit().attr('y1', yScale).attr('y2', yScale);

            yDecorate(yLines, yData, index);
        });
    };

    instance.yDecorate = function () {
        if (!arguments.length) {
            return yDecorate;
        }
        yDecorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.xDecorate = function () {
        if (!arguments.length) {
            return xDecorate;
        }
        xDecorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    rebindAll(instance, xJoin, includeMap({ 'key': 'xKey' }));
    rebindAll(instance, yJoin, includeMap({ 'key': 'yKey' }));

    rebindAll(instance, xTicks, prefix('x'));
    rebindAll(instance, yTicks, prefix('y'));

    return instance;
});

var identity$3 = function identity$3(d) {
    return d;
};

var axis = function axis(orient, scale) {

    var tickArguments = [10];
    var tickValues = null;
    var decorate = function decorate() {};
    var tickFormat = null;
    var tickSizeOuter = 6;
    var tickSizeInner = 6;
    var tickPadding = 3;

    var svgDomainLine = d3Shape.line();

    var dataJoin$$1 = dataJoin('g', 'tick').key(identity$3);

    var domainPathDataJoin = dataJoin('path', 'domain');

    // returns a function that creates a translation based on
    // the bound data
    var containerTranslate = function containerTranslate(scale, trans) {
        var offset = 0;
        if (scale.bandwidth) {
            offset = scale.bandwidth() / 2;
            if (scale.round()) {
                offset = Math.round(offset);
            }
        }
        return function (d) {
            return trans(scale(d) + offset, 0);
        };
    };

    var translate = function translate(x, y) {
        return isVertical() ? 'translate(' + y + ', ' + x + ')' : 'translate(' + x + ', ' + y + ')';
    };

    var pathTranspose = function pathTranspose(arr) {
        return isVertical() ? arr.map(function (d) {
            return [d[1], d[0]];
        }) : arr;
    };

    var isVertical = function isVertical() {
        return orient === 'left' || orient === 'right';
    };

    var tryApply = function tryApply(fn, args, defaultVal) {
        return scale[fn] ? scale[fn].apply(scale, args) : defaultVal;
    };

    var axis = function axis(selection$$1) {

        if (selection$$1.selection) {
            dataJoin$$1.transition(selection$$1);
            domainPathDataJoin.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var element = group[index];

            var container = d3Selection.select(element);
            if (!element.__scale__) {
                container.attr('fill', 'none').attr('font-size', 10).attr('font-family', 'sans-serif').attr('text-anchor', orient === 'right' ? 'start' : orient === 'left' ? 'end' : 'middle');
            }

            // Stash a snapshot of the new scale, and retrieve the old snapshot.
            var scaleOld = element.__scale__ || scale;
            element.__scale__ = scale.copy();

            var ticksArray = tickValues == null ? tryApply('ticks', tickArguments, scale.domain()) : tickValues;
            var tickFormatter = tickFormat == null ? tryApply('tickFormat', tickArguments, identity$3) : tickFormat;
            var sign = orient === 'bottom' || orient === 'right' ? 1 : -1;

            // add the domain line
            var range$$1 = scale.range();
            var domainPathData = pathTranspose([[range$$1[0], sign * tickSizeOuter], [range$$1[0], 0], [range$$1[1], 0], [range$$1[1], sign * tickSizeOuter]]);

            var domainLine = domainPathDataJoin(container, [data]);
            domainLine.attr('d', svgDomainLine(domainPathData)).attr('stroke', '#000');

            var g = dataJoin$$1(container, ticksArray);

            // enter
            g.enter().attr('transform', containerTranslate(scaleOld, translate)).append('path').attr('stroke', '#000');

            var labelOffset = sign * (tickSizeInner + tickPadding);
            g.enter().append('text').attr('transform', translate(0, labelOffset)).attr('fill', '#000');

            // exit
            g.exit().attr('transform', containerTranslate(scale, translate));

            // update
            g.select('path').attr('d', function (d) {
                return svgDomainLine(pathTranspose([[0, 0], [0, sign * tickSizeInner]]));
            });

            g.select('text').attr('transform', translate(0, labelOffset)).attr('dy', function () {
                var offset = '0em';
                if (isVertical()) {
                    offset = '0.32em';
                } else if (orient === 'bottom') {
                    offset = '0.71em';
                }
                return offset;
            }).text(tickFormatter);

            g.attr('transform', containerTranslate(scale, translate));

            decorate(g, data, index);
        });
    };

    axis.tickFormat = function () {
        if (!arguments.length) {
            return tickFormat;
        }
        tickFormat = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.tickSize = function () {
        if (!arguments.length) {
            return tickSizeInner;
        }
        tickSizeInner = tickSizeOuter = Number(arguments.length <= 0 ? undefined : arguments[0]);
        return axis;
    };

    axis.tickSizeInner = function () {
        if (!arguments.length) {
            return tickSizeInner;
        }
        tickSizeInner = Number(arguments.length <= 0 ? undefined : arguments[0]);
        return axis;
    };

    axis.tickSizeOuter = function () {
        if (!arguments.length) {
            return tickSizeOuter;
        }
        tickSizeOuter = Number(arguments.length <= 0 ? undefined : arguments[0]);
        return axis;
    };

    axis.tickPadding = function () {
        if (!arguments.length) {
            return tickPadding;
        }
        tickPadding = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.scale = function () {
        if (!arguments.length) {
            return scale;
        }
        scale = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.ticks = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        tickArguments = [].concat(args);
        return axis;
    };

    axis.tickArguments = function () {
        if (!arguments.length) {
            return tickArguments.slice();
        }
        tickArguments = (arguments.length <= 0 ? undefined : arguments[0]) == null ? [] : [].concat(toConsumableArray(arguments.length <= 0 ? undefined : arguments[0]));
        return axis;
    };

    axis.tickValues = function () {
        if (!arguments.length) {
            return tickValues.slice();
        }
        tickValues = (arguments.length <= 0 ? undefined : arguments[0]) == null ? [] : [].concat(toConsumableArray(arguments.length <= 0 ? undefined : arguments[0]));
        return axis;
    };

    return axis;
};

var axisTop = function axisTop(scale) {
    return axis('top', scale);
};

var axisBottom = function axisBottom(scale) {
    return axis('bottom', scale);
};

var axisLeft = function axisLeft(scale) {
    return axis('left', scale);
};

var axisRight = function axisRight(scale) {
    return axis('right', scale);
};

/*! (C) Andrea Giammarchi - @WebReflection - Mit Style License */
(function (e, t) {
  "use strict";
  function Ht() {
    var e = wt.splice(0, wt.length);Et = 0;while (e.length) {
      e.shift().call(null, e.shift());
    }
  }function Bt(e, t) {
    for (var n = 0, r = e.length; n < r; n++) {
      Jt(e[n], t);
    }
  }function jt(e) {
    for (var t = 0, n = e.length, r; t < n; t++) {
      r = e[t], Pt(r, A[It(r)]);
    }
  }function Ft(e) {
    return function (t) {
      ut(t) && (Jt(t, e), O.length && Bt(t.querySelectorAll(O), e));
    };
  }function It(e) {
    var t = ht.call(e, "is"),
        n = e.nodeName.toUpperCase(),
        r = _.call(L, t ? N + t.toUpperCase() : T + n);return t && -1 < r && !qt(n, t) ? -1 : r;
  }function qt(e, t) {
    return -1 < O.indexOf(e + '[is="' + t + '"]');
  }function Rt(e) {
    var t = e.currentTarget,
        n = e.attrChange,
        r = e.attrName,
        i = e.target,
        s = e[y] || 2,
        o = e[w] || 3;kt && (!i || i === t) && t[h] && r !== "style" && (e.prevValue !== e.newValue || e.newValue === "" && (n === s || n === o)) && t[h](r, n === s ? null : e.prevValue, n === o ? null : e.newValue);
  }function Ut(e) {
    var t = Ft(e);return function (e) {
      wt.push(t, e.target), Et && clearTimeout(Et), Et = setTimeout(Ht, 1);
    };
  }function zt(e) {
    Ct && (Ct = !1, e.currentTarget.removeEventListener(S, zt)), O.length && Bt((e.target || n).querySelectorAll(O), e.detail === l ? l : a), st && Vt();
  }function Wt(e, t) {
    var n = this;vt.call(n, e, t), Lt.call(n, { target: n });
  }function Xt(e, t) {
    nt(e, t), Mt ? Mt.observe(e, yt) : (Nt && (e.setAttribute = Wt, e[o] = Ot(e), e[u](x, Lt)), e[u](E, Rt)), e[m] && kt && (e.created = !0, e[m](), e.created = !1);
  }function Vt() {
    for (var e, t = 0, n = at.length; t < n; t++) {
      e = at[t], M.contains(e) || (n--, at.splice(t--, 1), Jt(e, l));
    }
  }function $t(e) {
    throw new Error("A " + e + " type is already registered");
  }function Jt(e, t) {
    var n,
        r = It(e);-1 < r && (Dt(e, A[r]), r = 0, t === a && !e[a] ? (e[l] = !1, e[a] = !0, r = 1, st && _.call(at, e) < 0 && at.push(e)) : t === l && !e[l] && (e[a] = !1, e[l] = !0, r = 1), r && (n = e[t + f]) && n.call(e));
  }function Kt() {}function Qt(e, t, r) {
    var i = r && r[c] || "",
        o = t.prototype,
        u = tt(o),
        a = t.observedAttributes || j,
        f = { prototype: u };ot(u, m, { value: function value() {
        if (Q) Q = !1;else if (!this[W]) {
          this[W] = !0, new t(this), o[m] && o[m].call(this);var e = G[Z.get(t)];(!V || e.create.length > 1) && Zt(this);
        }
      } }), ot(u, h, { value: function value(e) {
        -1 < _.call(a, e) && o[h].apply(this, arguments);
      } }), o[d] && ot(u, p, { value: o[d] }), o[v] && ot(u, g, { value: o[v] }), i && (f[c] = i), e = e.toUpperCase(), G[e] = { constructor: t, create: i ? [i, et(e)] : [e] }, Z.set(t, e), n[s](e.toLowerCase(), f), en(e), Y[e].r();
  }function Gt(e) {
    var t = G[e.toUpperCase()];return t && t.constructor;
  }function Yt(e) {
    return typeof e == "string" ? e : e && e.is || "";
  }function Zt(e) {
    var t = e[h],
        n = t ? e.attributes : j,
        r = n.length,
        i;while (r--) {
      i = n[r], t.call(e, i.name || i.nodeName, null, i.value || i.nodeValue);
    }
  }function en(e) {
    return e = e.toUpperCase(), e in Y || (Y[e] = {}, Y[e].p = new K(function (t) {
      Y[e].r = t;
    })), Y[e].p;
  }function tn() {
    X && delete e.customElements, B(e, "customElements", { configurable: !0, value: new Kt() }), B(e, "CustomElementRegistry", { configurable: !0, value: Kt });for (var t = function t(_t2) {
      var r = e[_t2];if (r) {
        e[_t2] = function (t) {
          var i, s;return t || (t = this), t[W] || (Q = !0, i = G[Z.get(t.constructor)], s = V && i.create.length === 1, t = s ? Reflect.construct(r, j, i.constructor) : n.createElement.apply(n, i.create), t[W] = !0, Q = !1, s || Zt(t)), t;
        }, e[_t2].prototype = r.prototype;try {
          r.prototype.constructor = e[_t2];
        } catch (i) {
          z = !0, B(r, W, { value: e[_t2] });
        }
      }
    }, r = i.get(/^HTML[A-Z]*[a-z]/), o = r.length; o--; t(r[o])) {}n.createElement = function (e, t) {
      var n = Yt(t);return n ? gt.call(this, e, et(n)) : gt.call(this, e);
    }, St || (Tt = !0, n[s](""));
  }var n = e.document,
      r = e.Object,
      i = function (e) {
    var t = /^[A-Z]+[a-z]/,
        n = function n(e) {
      var t = [],
          n;for (n in s) {
        e.test(n) && t.push(n);
      }return t;
    },
        i = function i(e, t) {
      t = t.toLowerCase(), t in s || (s[e] = (s[e] || []).concat(t), s[t] = s[t.toUpperCase()] = e);
    },
        s = (r.create || r)(null),
        o = {},
        u,
        a,
        f,
        l;for (a in e) {
      for (l in e[a]) {
        f = e[a][l], s[l] = f;for (u = 0; u < f.length; u++) {
          s[f[u].toLowerCase()] = s[f[u].toUpperCase()] = l;
        }
      }
    }return o.get = function (r) {
      return typeof r == "string" ? s[r] || (t.test(r) ? [] : "") : n(r);
    }, o.set = function (n, r) {
      return t.test(n) ? i(n, r) : i(r, n), o;
    }, o;
  }({ collections: { HTMLAllCollection: ["all"], HTMLCollection: ["forms"], HTMLFormControlsCollection: ["elements"], HTMLOptionsCollection: ["options"] }, elements: { Element: ["element"], HTMLAnchorElement: ["a"], HTMLAppletElement: ["applet"], HTMLAreaElement: ["area"], HTMLAttachmentElement: ["attachment"], HTMLAudioElement: ["audio"], HTMLBRElement: ["br"], HTMLBaseElement: ["base"], HTMLBodyElement: ["body"], HTMLButtonElement: ["button"], HTMLCanvasElement: ["canvas"], HTMLContentElement: ["content"], HTMLDListElement: ["dl"], HTMLDataElement: ["data"], HTMLDataListElement: ["datalist"], HTMLDetailsElement: ["details"], HTMLDialogElement: ["dialog"], HTMLDirectoryElement: ["dir"], HTMLDivElement: ["div"], HTMLDocument: ["document"], HTMLElement: ["element", "abbr", "address", "article", "aside", "b", "bdi", "bdo", "cite", "code", "command", "dd", "dfn", "dt", "em", "figcaption", "figure", "footer", "header", "i", "kbd", "mark", "nav", "noscript", "rp", "rt", "ruby", "s", "samp", "section", "small", "strong", "sub", "summary", "sup", "u", "var", "wbr"], HTMLEmbedElement: ["embed"], HTMLFieldSetElement: ["fieldset"], HTMLFontElement: ["font"], HTMLFormElement: ["form"], HTMLFrameElement: ["frame"], HTMLFrameSetElement: ["frameset"], HTMLHRElement: ["hr"], HTMLHeadElement: ["head"], HTMLHeadingElement: ["h1", "h2", "h3", "h4", "h5", "h6"], HTMLHtmlElement: ["html"], HTMLIFrameElement: ["iframe"], HTMLImageElement: ["img"], HTMLInputElement: ["input"], HTMLKeygenElement: ["keygen"], HTMLLIElement: ["li"], HTMLLabelElement: ["label"], HTMLLegendElement: ["legend"], HTMLLinkElement: ["link"], HTMLMapElement: ["map"], HTMLMarqueeElement: ["marquee"], HTMLMediaElement: ["media"], HTMLMenuElement: ["menu"], HTMLMenuItemElement: ["menuitem"], HTMLMetaElement: ["meta"], HTMLMeterElement: ["meter"], HTMLModElement: ["del", "ins"], HTMLOListElement: ["ol"], HTMLObjectElement: ["object"], HTMLOptGroupElement: ["optgroup"], HTMLOptionElement: ["option"], HTMLOutputElement: ["output"], HTMLParagraphElement: ["p"], HTMLParamElement: ["param"], HTMLPictureElement: ["picture"], HTMLPreElement: ["pre"], HTMLProgressElement: ["progress"], HTMLQuoteElement: ["blockquote", "q", "quote"], HTMLScriptElement: ["script"], HTMLSelectElement: ["select"], HTMLShadowElement: ["shadow"], HTMLSlotElement: ["slot"], HTMLSourceElement: ["source"], HTMLSpanElement: ["span"], HTMLStyleElement: ["style"], HTMLTableCaptionElement: ["caption"], HTMLTableCellElement: ["td", "th"], HTMLTableColElement: ["col", "colgroup"], HTMLTableElement: ["table"], HTMLTableRowElement: ["tr"], HTMLTableSectionElement: ["thead", "tbody", "tfoot"], HTMLTemplateElement: ["template"], HTMLTextAreaElement: ["textarea"], HTMLTimeElement: ["time"], HTMLTitleElement: ["title"], HTMLTrackElement: ["track"], HTMLUListElement: ["ul"], HTMLUnknownElement: ["unknown", "vhgroupv", "vkeygen"], HTMLVideoElement: ["video"] }, nodes: { Attr: ["node"], Audio: ["audio"], CDATASection: ["node"], CharacterData: ["node"], Comment: ["#comment"], Document: ["#document"], DocumentFragment: ["#document-fragment"], DocumentType: ["node"], HTMLDocument: ["#document"], Image: ["img"], Option: ["option"], ProcessingInstruction: ["node"], ShadowRoot: ["#shadow-root"], Text: ["#text"], XMLDocument: ["xml"] } });t || (t = "auto");var s = "registerElement",
      o = "__" + s + (e.Math.random() * 1e5 >> 0),
      u = "addEventListener",
      a = "attached",
      f = "Callback",
      l = "detached",
      c = "extends",
      h = "attributeChanged" + f,
      p = a + f,
      d = "connected" + f,
      v = "disconnected" + f,
      m = "created" + f,
      g = l + f,
      y = "ADDITION",
      b = "MODIFICATION",
      w = "REMOVAL",
      E = "DOMAttrModified",
      S = "DOMContentLoaded",
      x = "DOMSubtreeModified",
      T = "<",
      N = "=",
      C = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,
      k = ["ANNOTATION-XML", "COLOR-PROFILE", "FONT-FACE", "FONT-FACE-SRC", "FONT-FACE-URI", "FONT-FACE-FORMAT", "FONT-FACE-NAME", "MISSING-GLYPH"],
      L = [],
      A = [],
      O = "",
      M = n.documentElement,
      _ = L.indexOf || function (e) {
    for (var t = this.length; t-- && this[t] !== e;) {}return t;
  },
      D = r.prototype,
      P = D.hasOwnProperty,
      H = D.isPrototypeOf,
      B = r.defineProperty,
      j = [],
      F = r.getOwnPropertyDescriptor,
      I = r.getOwnPropertyNames,
      q = r.getPrototypeOf,
      R = r.setPrototypeOf,
      U = !!r.__proto__,
      z = !1,
      W = "__dreCEv1",
      X = e.customElements,
      V = t !== "force" && !!(X && X.define && X.get && X.whenDefined),
      $ = r.create || r,
      J = e.Map || function () {
    var t = [],
        n = [],
        r;return { get: function get(e) {
        return n[_.call(t, e)];
      }, set: function set(e, i) {
        r = _.call(t, e), r < 0 ? n[t.push(e) - 1] = i : n[r] = i;
      } };
  },
      K = e.Promise || function (e) {
    function i(e) {
      n = !0;while (t.length) {
        t.shift()(e);
      }
    }var t = [],
        n = !1,
        r = { "catch": function _catch() {
        return r;
      }, then: function then(e) {
        return t.push(e), n && setTimeout(i, 1), r;
      } };return e(i), r;
  },
      Q = !1,
      G = $(null),
      Y = $(null),
      Z = new J(),
      et = String,
      tt = r.create || function sn(e) {
    return e ? (sn.prototype = e, new sn()) : this;
  },
      nt = R || (U ? function (e, t) {
    return e.__proto__ = t, e;
  } : I && F ? function () {
    function e(e, t) {
      for (var n, r = I(t), i = 0, s = r.length; i < s; i++) {
        n = r[i], P.call(e, n) || B(e, n, F(t, n));
      }
    }return function (t, n) {
      do {
        e(t, n);
      } while ((n = q(n)) && !H.call(n, t));return t;
    };
  }() : function (e, t) {
    for (var n in t) {
      e[n] = t[n];
    }return e;
  }),
      rt = e.MutationObserver || e.WebKitMutationObserver,
      it = (e.HTMLElement || e.Element || e.Node).prototype,
      st = !H.call(it, M),
      ot = st ? function (e, t, n) {
    return e[t] = n.value, e;
  } : B,
      ut = st ? function (e) {
    return e.nodeType === 1;
  } : function (e) {
    return H.call(it, e);
  },
      at = st && [],
      ft = it.attachShadow,
      lt = it.cloneNode,
      ct = it.dispatchEvent,
      ht = it.getAttribute,
      pt = it.hasAttribute,
      dt = it.removeAttribute,
      vt = it.setAttribute,
      mt = n.createElement,
      gt = mt,
      yt = rt && { attributes: !0, characterData: !0, attributeOldValue: !0 },
      bt = rt || function (e) {
    Nt = !1, M.removeEventListener(E, bt);
  },
      wt,
      Et = 0,
      St = s in n,
      xt = !0,
      Tt = !1,
      Nt = !0,
      Ct = !0,
      kt = !0,
      Lt,
      At,
      Ot,
      Mt,
      _t,
      Dt,
      Pt;St || (R || U ? (Dt = function Dt(e, t) {
    H.call(t, e) || Xt(e, t);
  }, Pt = Xt) : (Dt = function Dt(e, t) {
    e[o] || (e[o] = r(!0), Xt(e, t));
  }, Pt = Dt), st ? (Nt = !1, function () {
    var e = F(it, u),
        t = e.value,
        n = function n(e) {
      var t = new CustomEvent(E, { bubbles: !0 });t.attrName = e, t.prevValue = ht.call(this, e), t.newValue = null, t[w] = t.attrChange = 2, dt.call(this, e), ct.call(this, t);
    },
        r = function r(e, t) {
      var n = pt.call(this, e),
          r = n && ht.call(this, e),
          i = new CustomEvent(E, { bubbles: !0 });vt.call(this, e, t), i.attrName = e, i.prevValue = n ? r : null, i.newValue = t, n ? i[b] = i.attrChange = 1 : i[y] = i.attrChange = 0, ct.call(this, i);
    },
        i = function i(e) {
      var t = e.currentTarget,
          n = t[o],
          r = e.propertyName,
          i;n.hasOwnProperty(r) && (n = n[r], i = new CustomEvent(E, { bubbles: !0 }), i.attrName = n.name, i.prevValue = n.value || null, i.newValue = n.value = t[r] || null, i.prevValue == null ? i[y] = i.attrChange = 0 : i[b] = i.attrChange = 1, ct.call(t, i));
    };e.value = function (e, s, u) {
      e === E && this[h] && this.setAttribute !== r && (this[o] = { className: { name: "class", value: this.className } }, this.setAttribute = r, this.removeAttribute = n, t.call(this, "propertychange", i)), t.call(this, e, s, u);
    }, B(it, u, e);
  }()) : rt || (M[u](E, bt), M.setAttribute(o, 1), M.removeAttribute(o), Nt && (Lt = function Lt(e) {
    var t = this,
        n,
        r,
        i;if (t === e.target) {
      n = t[o], t[o] = r = Ot(t);for (i in r) {
        if (!(i in n)) return At(0, t, i, n[i], r[i], y);if (r[i] !== n[i]) return At(1, t, i, n[i], r[i], b);
      }for (i in n) {
        if (!(i in r)) return At(2, t, i, n[i], r[i], w);
      }
    }
  }, At = function At(e, t, n, r, i, s) {
    var o = { attrChange: e, currentTarget: t, attrName: n, prevValue: r, newValue: i };o[s] = e, Rt(o);
  }, Ot = function Ot(e) {
    for (var t, n, r = {}, i = e.attributes, s = 0, o = i.length; s < o; s++) {
      t = i[s], n = t.name, n !== "setAttribute" && (r[n] = t.value);
    }return r;
  })), n[s] = function (t, r) {
    p = t.toUpperCase(), xt && (xt = !1, rt ? (Mt = function (e, t) {
      function n(e, t) {
        for (var n = 0, r = e.length; n < r; t(e[n++])) {}
      }return new rt(function (r) {
        for (var i, s, o, u = 0, a = r.length; u < a; u++) {
          i = r[u], i.type === "childList" ? (n(i.addedNodes, e), n(i.removedNodes, t)) : (s = i.target, kt && s[h] && i.attributeName !== "style" && (o = ht.call(s, i.attributeName), o !== i.oldValue && s[h](i.attributeName, i.oldValue, o)));
        }
      });
    }(Ft(a), Ft(l)), _t = function _t(e) {
      return Mt.observe(e, { childList: !0, subtree: !0 }), e;
    }, _t(n), ft && (it.attachShadow = function () {
      return _t(ft.apply(this, arguments));
    })) : (wt = [], n[u]("DOMNodeInserted", Ut(a)), n[u]("DOMNodeRemoved", Ut(l))), n[u](S, zt), n[u]("readystatechange", zt), it.cloneNode = function (e) {
      var t = lt.call(this, !!e),
          n = It(t);return -1 < n && Pt(t, A[n]), e && O.length && jt(t.querySelectorAll(O)), t;
    });if (Tt) return Tt = !1;-2 < _.call(L, N + p) + _.call(L, T + p) && $t(t);if (!C.test(p) || -1 < _.call(k, p)) throw new Error("The type " + t + " is invalid");var i = function i() {
      return o ? n.createElement(f, p) : n.createElement(f);
    },
        s = r || D,
        o = P.call(s, c),
        f = o ? r[c].toUpperCase() : p,
        p,
        d;return o && -1 < _.call(L, T + f) && $t(f), d = L.push((o ? N : T) + p) - 1, O = O.concat(O.length ? "," : "", o ? f + '[is="' + t.toLowerCase() + '"]' : f), i.prototype = A[d] = P.call(s, "prototype") ? s.prototype : tt(it), O.length && Bt(n.querySelectorAll(O), a), i;
  }, n.createElement = gt = function gt(e, t) {
    var r = Yt(t),
        i = r ? mt.call(n, e, et(r)) : mt.call(n, e),
        s = "" + e,
        o = _.call(L, (r ? N : T) + (r || s).toUpperCase()),
        u = -1 < o;return r && (i.setAttribute("is", r = r.toLowerCase()), u && (u = qt(s.toUpperCase(), r))), kt = !n.createElement.innerHTMLHelper, u && Pt(i, A[o]), i;
  }), Kt.prototype = { constructor: Kt, define: V ? function (e, t, n) {
      if (n) Qt(e, t, n);else {
        var r = e.toUpperCase();G[r] = { constructor: t, create: [r] }, Z.set(t, r), X.define(e, t);
      }
    } : Qt, get: V ? function (e) {
      return X.get(e) || Gt(e);
    } : Gt, whenDefined: V ? function (e) {
      return K.race([X.whenDefined(e), en(e)]);
    } : en };if (!X || t === "force") tn();else try {
    (function (t, r, i) {
      r[c] = "a", t.prototype = tt(HTMLAnchorElement.prototype), t.prototype.constructor = t, e.customElements.define(i, t, r);if (ht.call(n.createElement("a", { is: i }), "is") !== i || V && ht.call(new t(), "is") !== i) throw r;
    })(function on() {
      return Reflect.construct(HTMLAnchorElement, [], on);
    }, {}, "document-register-element-a");
  } catch (nn) {
    tn();
  }try {
    mt.call(n, "a", "a");
  } catch (rn) {
    et = function et(e) {
      return { is: e };
    };
  }
})(window);

var key = '__d3fc-elements__';

var get$2 = function get$2(element) {
  return element[key] || {};
};

var set$2 = function set$2(element, data) {
  return void (element[key] = data);
};

var clear = function clear(element) {
  return delete element[key];
};

/* eslint-env browser */

var find = function find(element) {
    return element.tagName === 'D3FC-GROUP' ? [element].concat(toConsumableArray(element.querySelectorAll('d3fc-canvas, d3fc-group, d3fc-svg'))) : [element];
};

var measure = function measure(element) {
    if (element.tagName === 'D3FC-GROUP') {
        return;
    }

    var _data$get = get$2(element),
        previousWidth = _data$get.width,
        previousHeight = _data$get.height;

    var width = element.clientWidth;
    var height = element.clientHeight;
    var resized = width !== previousWidth || height !== previousHeight;
    set$2(element, { width: width, height: height, resized: resized });
};

var resize = function resize(element) {
    if (element.tagName === 'D3FC-GROUP') {
        return;
    }
    var detail = get$2(element);
    var node = element.childNodes[0];
    node.setAttribute('width', detail.width);
    node.setAttribute('height', detail.height);
    var event$$1 = new CustomEvent('measure', { detail: detail });
    element.dispatchEvent(event$$1);
};

var draw = function draw(element) {
    var detail = get$2(element);
    var event$$1 = new CustomEvent('draw', { detail: detail });
    element.dispatchEvent(event$$1);
};

var redraw = (function (elements) {
    var allElements = elements.map(find).reduce(function (a, b) {
        return a.concat(b);
    });
    allElements.forEach(measure);
    allElements.forEach(resize);
    allElements.forEach(draw);
});

/* eslint-env browser */

var getQueue = function getQueue(element) {
    return get$2(element.ownerDocument).queue || [];
};

var setQueue = function setQueue(element, queue) {
    var _data$get = get$2(element.ownerDocument),
        requestId = _data$get.requestId;

    if (requestId == null) {
        requestId = requestAnimationFrame(function () {
            // This seems like a weak way of retrieving the queue
            // but I can't see an edge case at the minute...
            var queue = getQueue(element);
            redraw(queue);
            clearQueue(element);
        });
    }
    set$2(element.ownerDocument, { queue: queue, requestId: requestId });
};

var clearQueue = function clearQueue(element) {
    return clear(element.ownerDocument);
};

var isDescendentOf = function isDescendentOf(element, ancestor) {
    var node = element;
    do {
        if (node.parentNode === ancestor) {
            return true;
        }
        // eslint-disable-next-line no-cond-assign
    } while (node = node.parentNode);
    return false;
};

var _requestRedraw = (function (element) {
    var queue = getQueue(element);
    var queueContainsElement = queue.indexOf(element) > -1;
    if (queueContainsElement) {
        return;
    }
    var queueContainsAncestor = queue.some(function (queuedElement) {
        return isDescendentOf(element, queuedElement);
    });
    if (queueContainsAncestor) {
        return;
    }
    var queueExcludingDescendents = queue.filter(function (queuedElement) {
        return !isDescendentOf(queuedElement, element);
    });
    queueExcludingDescendents.push(element);
    setQueue(element, queueExcludingDescendents);
});

/* eslint-env browser */

var init = function init(instance, node) {
    instance.__node__ = node;
};

var element = (function (createNode) {
    return function (_HTMLElement) {
        inherits(_class, _HTMLElement);

        // https://github.com/WebReflection/document-register-element/tree/v1.0.10#skipping-the-caveat-through-extends
        // eslint-disable-next-line
        function _class(_) {
            var _this, _ret;

            classCallCheck(this, _class);
            return _ret = (init(_ = (_this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, _)), _this), createNode()), _), possibleConstructorReturn(_this, _ret);
        }

        createClass(_class, [{
            key: 'connectedCallback',
            value: function connectedCallback() {
                this.appendChild(this.__node__);
            }
        }, {
            key: 'requestRedraw',
            value: function requestRedraw() {
                _requestRedraw(this);
            }
        }]);
        return _class;
    }(HTMLElement);
});

var Canvas = element(function () {
  return document.createElement('canvas');
});

/* eslint-env browser */

var _class = function (_HTMLElement) {
    inherits(_class, _HTMLElement);

    // https://github.com/WebReflection/document-register-element/tree/v1.0.10#skipping-the-caveat-through-extends
    // eslint-disable-next-line
    function _class(_) {
        var _this, _ret;

        classCallCheck(this, _class);
        return _ret = (_ = (_this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, _)), _this), _), possibleConstructorReturn(_this, _ret);
    }

    createClass(_class, [{
        key: 'requestRedraw',
        value: function requestRedraw() {
            _requestRedraw(this);
        }
    }, {
        key: 'updateAutoResize',
        value: function updateAutoResize() {
            var _this2 = this;

            if (this.autoResize) {
                if (this.__autoResizeListener__ == null) {
                    this.__autoResizeListener__ = function () {
                        return _requestRedraw(_this2);
                    };
                }
                addEventListener('resize', this.__autoResizeListener__);
            } else {
                removeEventListener('resize', this.__autoResizeListener__);
            }
        }
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(name) {
            switch (name) {
                case 'auto-resize':
                    this.updateAutoResize();
                    break;
            }
        }
    }, {
        key: 'autoResize',
        get: function get() {
            return this.hasAttribute('auto-resize') && this.getAttribute('auto-resize') !== 'false';
        },
        set: function set(autoResize) {
            if (autoResize && !this.autoResize) {
                this.setAttribute('auto-resize', '');
            } else if (!autoResize && this.autoResize) {
                this.removeAttribute('auto-resize');
            }
            this.updateAutoResize();
        }
    }], [{
        key: 'observedAttributes',
        get: function get() {
            return ['auto-resize'];
        }
    }]);
    return _class;
}(HTMLElement);

var Svg = element(function () {
  return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
});

// Adapted from https://github.com/substack/insert-css
var css = 'd3fc-canvas,d3fc-svg{position:relative}d3fc-canvas>canvas,d3fc-svg>svg{position:absolute;top:0;right:0;left:0;bottom: 0}d3fc-svg>svg{overflow:visible}';

var styleElement = document.createElement('style');
styleElement.setAttribute('type', 'text/css');

document.querySelector('head').appendChild(styleElement);

if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText += css;
} else {
    styleElement.textContent += css;
}

/* globals customElements */
customElements.define('d3fc-canvas', Canvas);
customElements.define('d3fc-group', _class);
customElements.define('d3fc-svg', Svg);

var pointer = (function () {
    var event$$1 = d3Dispatch.dispatch('point');

    function mousemove() {
        var point = d3Selection.mouse(this);
        event$$1.call('point', this, [{ x: point[0], y: point[1] }]);
    }

    function mouseleave() {
        void event$$1.call('point', this, []);
    }

    var instance = function instance(selection$$1) {
        selection$$1.on('mouseenter.pointer', mousemove).on('mousemove.pointer', mousemove).on('mouseleave.pointer', mouseleave);
    };

    rebind(instance, event$$1, 'on');

    return instance;
});

var group = (function () {

    var key = '';
    var orient = 'vertical';
    // D3 CSV returns all values as strings, this converts them to numbers
    // by default.
    var value = function value(row, column) {
        return Number(row[column]);
    };

    var verticalgroup = function verticalgroup(data) {
        return Object.keys(data[0]).filter(function (k) {
            return k !== key;
        }).map(function (k) {
            var values = data.filter(function (row) {
                return row[k];
            }).map(function (row) {
                var cell = [row[key], value(row, k)];
                cell.data = row;
                return cell;
            });
            values.key = k;
            return values;
        });
    };

    var horizontalgroup = function horizontalgroup(data) {
        return data.map(function (row) {
            var values = Object.keys(row).filter(function (d) {
                return d !== key;
            }).map(function (k) {
                var cell = [k, value(row, k)];
                cell.data = row;
                return cell;
            });
            values.key = row[key];
            return values;
        });
    };

    var group = function group(data) {
        return orient === 'vertical' ? verticalgroup(data) : horizontalgroup(data);
    };

    group.key = function () {
        if (!arguments.length) {
            return key;
        }
        key = arguments.length <= 0 ? undefined : arguments[0];
        return group;
    };

    group.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return group;
    };

    group.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return group;
    };

    return group;
});

var functor$6 = function functor$6(v) {
    return typeof v === 'function' ? v : function () {
        return v;
    };
};

var cartesianBase = (function (d3fcElementType, plotAreaDrawFunction) {
    return function () {
        var xScale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : d3Scale.scaleIdentity();
        var yScale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : d3Scale.scaleIdentity();


        var yLabel = functor$6('');
        var xLabel = functor$6('');
        var yOrient = 'right';
        var xOrient = 'bottom';
        var chartLabel = functor$6('');
        var plotArea = seriesSvgLine();
        var xTickFormat = null;
        var xTickArgs = void 0;
        var xDecorate = function xDecorate() {};
        var yTickFormat = null;
        var yTickArgs = void 0;
        var yDecorate = function yDecorate() {};
        var decorate = function decorate() {};

        var axisForOrient = function axisForOrient(orient) {
            switch (orient) {
                case 'bottom':
                    return axisBottom();
                case 'top':
                    return axisTop();
                case 'left':
                    return axisLeft();
                case 'right':
                    return axisRight();
            }
        };

        var xAxis = axisForOrient(xOrient);
        var yAxis = axisForOrient(yOrient);

        var containerDataJoin = dataJoin('d3fc-group', 'cartesian-chart');

        var propagateTransition = function propagateTransition(maybeTransition) {
            return function (selection$$1) {
                return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
            };
        };

        var cartesian = function cartesian(selection$$1) {

            var transitionPropagator = propagateTransition(selection$$1);

            selection$$1.each(function (data, index, group) {
                var container = containerDataJoin(d3Selection.select(group[index]), [data]);

                container.enter().attr('style', 'display: flex; height: 100%; width: 100%; flex-direction: column').attr('auto-resize', '').html('<div class=\'chart-label\'\n                                style=\'height: ' + (chartLabel ? 2 : 0) + 'em; line-height: 2em; text-align: center; margin-' + yOrient + ': 4em\'>\n                          </div>\n                          <div style=\'flex: 1; display: flex; flex-direction: ' + (xOrient === 'bottom' ? 'column' : 'column-reverse') + '\'>\n                              <div style=\'flex: 1; display: flex; flex-direction: ' + (yOrient === 'right' ? 'row' : 'row-reverse') + '\'>\n                                  <' + d3fcElementType + ' class=\'plot-area\' style=\'flex: 1; overflow: hidden\'></' + d3fcElementType + '>\n                                  <d3fc-svg class=\'y-axis\' style=\'width: 3em\'></d3fc-svg>\n                                  <div style=\'width: 1em; display: flex; align-items: center; justify-content: center\'>\n                                      <div class=\'y-axis-label\' style=\'transform: rotate(-90deg)\'></div>\n                                  </div>\n                              </div>\n                              <d3fc-svg class=\'x-axis\' style=\'height: 2em; margin-' + yOrient + ': 4em\'></d3fc-svg>\n                              <div class=\'x-axis-label\' style=\'height: 1em; line-height: 1em; text-align: center; margin-' + yOrient + ': 4em\'></div>\n                          </div>');

                container.select('.y-axis-label').text(yLabel(data));

                container.select('.x-axis-label').text(xLabel(data));

                container.select('.chart-label').text(chartLabel(data));

                container.select('.y-axis').on('measure', function (d, i, nodes) {
                    if (yOrient === 'left') {
                        var _event$detail = d3Selection.event.detail,
                            width = _event$detail.width,
                            height = _event$detail.height;

                        d3Selection.select(nodes[i]).select('svg').attr('viewBox', -width + ' 0 ' + width + ' ' + height);
                    }
                }).on('draw', function (d, i, nodes) {
                    yAxis.tickFormat(yTickFormat).decorate(yDecorate);
                    if (yTickArgs) {
                        var _yAxis;

                        (_yAxis = yAxis).ticks.apply(_yAxis, toConsumableArray(yTickArgs));
                    }
                    transitionPropagator(d3Selection.select(nodes[i])).select('svg').call(yAxis.scale(yScale));
                });

                container.select('.x-axis').on('measure', function (d, i, nodes) {
                    if (xOrient === 'top') {
                        var _event$detail2 = d3Selection.event.detail,
                            width = _event$detail2.width,
                            height = _event$detail2.height;

                        d3Selection.select(nodes[i]).select('svg').attr('viewBox', '0 ' + -height + ' ' + width + ' ' + height);
                    }
                }).on('draw', function (d, i, nodes) {
                    xAxis.tickFormat(xTickFormat).decorate(xDecorate);
                    if (xTickArgs) {
                        var _xAxis;

                        (_xAxis = xAxis).ticks.apply(_xAxis, toConsumableArray(xTickArgs));
                    }
                    transitionPropagator(d3Selection.select(nodes[i])).select('svg').call(xAxis.scale(xScale));
                });

                container.select('.plot-area').on('measure', function () {
                    var _event$detail3 = d3Selection.event.detail,
                        width = _event$detail3.width,
                        height = _event$detail3.height;

                    xScale.range([0, width]);
                    yScale.range([height, 0]);
                }).on('draw', function (d, i, nodes) {
                    plotArea.xScale(xScale).yScale(yScale);
                    plotAreaDrawFunction(d, nodes[i], plotArea, transitionPropagator);
                });

                container.each(function (_, index, group) {
                    return group[index].requestRedraw();
                });

                decorate(container, data, index);
            });
        };

        var scaleExclusions = exclude(/range\w*/, // the scale range is set via the component layout
        /tickFormat/ // use axis.tickFormat instead (only present on linear scales)
        );
        rebindAll(cartesian, xScale, scaleExclusions, prefix('x'));
        rebindAll(cartesian, yScale, scaleExclusions, prefix('y'));

        cartesian.xTickFormat = function () {
            if (!arguments.length) {
                return xTickFormat;
            }
            xTickFormat = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xTicks = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            xTickArgs = args;
            return cartesian;
        };
        cartesian.xDecorate = function () {
            if (!arguments.length) {
                return xDecorate;
            }
            xDecorate = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTickFormat = function () {
            if (!arguments.length) {
                return yTickFormat;
            }
            yTickFormat = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTicks = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            yTickArgs = args;
            return cartesian;
        };
        cartesian.yDecorate = function () {
            if (!arguments.length) {
                return yDecorate;
            }
            yDecorate = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yOrient = function () {
            if (!arguments.length) {
                return yOrient;
            }
            var newValue = arguments.length <= 0 ? undefined : arguments[0];
            if (newValue !== yOrient) {
                yAxis = axisForOrient(newValue);
            }
            yOrient = newValue;
            return cartesian;
        };
        cartesian.xOrient = function () {
            if (!arguments.length) {
                return xOrient;
            }
            var newValue = arguments.length <= 0 ? undefined : arguments[0];
            if (newValue !== xOrient) {
                xAxis = axisForOrient(newValue);
            }
            xOrient = newValue;
            return cartesian;
        };
        cartesian.chartLabel = function () {
            if (!arguments.length) {
                return chartLabel;
            }
            chartLabel = functor$6(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.plotArea = function () {
            if (!arguments.length) {
                return plotArea;
            }
            plotArea = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xLabel = function () {
            if (!arguments.length) {
                return xLabel;
            }
            xLabel = functor$6(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.yLabel = function () {
            if (!arguments.length) {
                return yLabel;
            }
            yLabel = functor$6(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.decorate = function () {
            if (!arguments.length) {
                return decorate;
            }
            decorate = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };

        return cartesian;
    };
});

var cartesian = cartesianBase('d3fc-svg', function (data, element, plotArea, transitionPropagator) {
    transitionPropagator(d3Selection.select(element)).select('svg').call(plotArea);
});

var cartesian$1 = (function () {
    return cartesian.apply(undefined, arguments);
});

var cartesian$2 = cartesianBase('d3fc-canvas', function (data, element, plotArea) {
    var canvas = element.childNodes[0];
    plotArea.context(canvas.getContext('2d'));
    plotArea(data);
});

var cartesian$3 = (function () {
    return cartesian$2.apply(undefined, arguments);
});

exports.indicatorBollingerBands = bollingerBands;
exports.indicatorExponentialMovingAverage = exponentialMovingAverage;
exports.indicatorMacd = macd;
exports.indicatorRelativeStrengthIndex = relativeStrengthIndex;
exports.indicatorStochasticOscillator = stochasticOscillator;
exports.indicatorForceIndex = forceIndex;
exports.indicatorEnvelope = envelope;
exports.indicatorElderRay = elderRay;
exports.indicatorMovingAverage = movingAverage;
exports.scaleDiscontinuous = discontinuous;
exports.discontinuitySkipWeekends = skipWeekends;
exports.discontinuityIdentity = identity$1;
exports.discontinuityRange = provider;
exports.extentLinear = linearExtent;
exports.extentDate = date;
exports.randomFinancial = financial;
exports.randomGeometricBrownianMotion = geometricBrownianMotion;
exports.randomSkipWeekends = skipWeekends$1;
exports.feedGdax = gdax;
exports.feedQuandl = quandl;
exports.bucket = bucket;
exports.largestTriangleOneBucket = largestTriangleOneBucket;
exports.largestTriangleThreeBucket = largestTriangleThreeBucket;
exports.modeMedian = modeMedian;
exports.rebind = rebind;
exports.rebindAll = rebindAll;
exports.exclude = exclude;
exports.include = include;
exports.includeMap = includeMap;
exports.prefix = prefix;
exports.shapeOhlc = shapeOhlc;
exports.shapeBar = shapeBar;
exports.shapeCandlestick = shapeCandlestick;
exports.shapeBoxPlot = shapeBoxPlot;
exports.shapeErrorBar = shapeErrorBar;
exports.layoutLabel = label;
exports.layoutTextLabel = textLabel;
exports.layoutGreedy = greedy;
exports.layoutAnnealing = annealing;
exports.layoutRemoveOverlaps = removeOverlaps;
exports.layoutBoundingBox = boundingBox;
exports.dataJoin = dataJoin;
exports.effectivelyZero = effectivelyZero$1;
exports.seriesFractionalBarWidth = fractionalBarWidth;
exports.seriesSvgLine = seriesSvgLine;
exports.seriesCanvasLine = line$1;
exports.seriesSvgPoint = point;
exports.seriesCanvasPoint = point$1;
exports.seriesSvgBar = bar;
exports.seriesCanvasBar = bar$1;
exports.seriesSvgErrorBar = errorBar;
exports.seriesCanvasErrorBar = errorBar$1;
exports.seriesSvgArea = area$1;
exports.seriesCanvasArea = area$2;
exports.seriesSvgCandlestick = candlestick;
exports.seriesCanvasCandlestick = candlestick$1;
exports.seriesSvgBoxPlot = boxPlot;
exports.seriesCanvasBoxPlot = boxPlot$1;
exports.seriesSvgOhlc = ohlc;
exports.seriesCanvasOhlc = ohlc$1;
exports.seriesSvgMulti = multiSeries;
exports.seriesCanvasMulti = multiSeries$1;
exports.seriesSvgGrouped = grouped;
exports.seriesCanvasGrouped = grouped$1;
exports.seriesSvgRepeat = repeat;
exports.seriesCanvasRepeat = repeat$1;
exports.annotationSvgBand = band;
exports.annotationSvgCrosshair = crosshair;
exports.annotationSvgLine = annotationLine;
exports.annotationSvgGridline = gridline;
exports.axisTop = axisTop;
exports.axisBottom = axisBottom;
exports.axisLeft = axisLeft;
exports.axisRight = axisRight;
exports.pointer = pointer;
exports.group = group;
exports.chartSvgCartesian = cartesian$1;
exports.chartCanvasCartesian = cartesian$3;

Object.defineProperty(exports, '__esModule', { value: true });

})));

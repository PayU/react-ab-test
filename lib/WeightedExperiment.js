"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _CoreExperiment = require("./CoreExperiment");

var _CoreExperiment2 = _interopRequireDefault(_CoreExperiment);

var _emitter = require("./emitter");

var _emitter2 = _interopRequireDefault(_emitter);

var _crc = require("fbjs/lib/crc32");

var _crc2 = _interopRequireDefault(_crc);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

_emitter2.default.addActiveVariantListener(function (experimentName, variantName, skipSave) {
  if (skipSave) {
    return;
  }
  _store2.default.setItem('PUSHTELL-' + experimentName, variantName);
});

var WeightedExperiment = function (_Component) {
  _inherits(WeightedExperiment, _Component);

  function WeightedExperiment() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, WeightedExperiment);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WeightedExperiment.__proto__ || Object.getPrototypeOf(WeightedExperiment)).call.apply(_ref, [this].concat(args))), _this), _this.win = function () {
      _emitter2.default.emitWin(_this.props.name);
    }, _this.getSelectedVariant = function () {
      /*
       Choosing a weighted variant:
        For C, A, B with weights 2, 4, 8
         variants = A, B, C
        weights = 4, 8, 2
        weightSum = 14
        weightedIndex = 9
         AAAABBBBBBBBCC
        ========^
        Select B
       */

      // Sorted array of the variant names, example: ["A", "B", "C"]
      var variants = _emitter2.default.getSortedVariants(_this.props.name);
      // Array of the variant weights, also sorted by variant name. For example, if
      // variant C had weight 2, variant A had weight 4, and variant B had weight 8
      // return [4, 8, 2] to correspond with ["A", "B", "C"]
      var weights = _emitter2.default.getSortedVariantWeights(_this.props.name);
      // Sum the weights
      var weightSum = weights.reduce(function (a, b) {
        return a + b;
      }, 0);
      // A random number between 0 and weightSum
      var weightedIndex = typeof _this.props.userIdentifier === 'string' ? Math.abs((0, _crc2.default)(_this.props.userIdentifier) % weightSum) : Math.floor(Math.random() * weightSum);
      // Iterate through the sorted weights, and deduct each from the weightedIndex.
      // If weightedIndex drops < 0, select the variant. If weightedIndex does not
      // drop < 0, default to the last variant in the array that is initially assigned.
      var selectedVariant = variants[variants.length - 1];
      for (var index = 0; index < weights.length; index++) {
        weightedIndex -= weights[index];
        if (weightedIndex < 0) {
          selectedVariant = variants[index];
          break;
        }
      }
      _emitter2.default.setActiveVariant(_this.props.name, selectedVariant);
      return selectedVariant;
    }, _this.getLocalStorageValue = function () {
      if (typeof _this.props.userIdentifier === "string") {
        return _this.getSelectedVariant();
      }
      var activeValue = _emitter2.default.getActiveVariant(_this.props.name);
      if (typeof activeValue === "string") {
        return activeValue;
      }
      var storedValue = _store2.default.getItem('PUSHTELL-' + _this.props.name);
      if (typeof storedValue === "string") {
        _emitter2.default.setActiveVariant(_this.props.name, storedValue, true);
        return storedValue;
      }
      if (typeof _this.props.defaultVariantName === 'string') {
        _emitter2.default.setActiveVariant(_this.props.name, _this.props.defaultVariantName);
        return _this.props.defaultVariantName;
      }
      return _this.getSelectedVariant();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(WeightedExperiment, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(_CoreExperiment2.default, _extends({}, this.props, { value: this.getLocalStorageValue }));
    }
  }]);

  return WeightedExperiment;
}(_react.Component);

WeightedExperiment.propTypes = {
  name: _propTypes2.default.string.isRequired,
  defaultVariantName: _propTypes2.default.string,
  userIdentifier: _propTypes2.default.string
};
WeightedExperiment.displayName = "Pushtell.WeightedExperiment";
exports.default = WeightedExperiment;
module.exports = exports['default'];
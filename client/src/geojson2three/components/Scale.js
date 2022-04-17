function Scale(range, domain) {
  var _range = Math.abs(range[0] - range[1]);
  var _domain = Math.abs(domain[0] - domain[1]);
  var fn = function (value) {
    return ((value - domain[0]) / _domain) * _range - _range / 2;
  };

  fn.range = function () {
    return JSON.parse(JSON.stringify(range));
  };

  fn.domain = function () {
    return JSON.parse(JSON.stringify(domain));
  };

  return fn;
}

export default Scale;


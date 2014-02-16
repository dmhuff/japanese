if (typeof console === 'undefined') {
  console = {
    log: function () {},
    dir: function () {}
  };
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * @overview Extensions to existing JavaScript object.
 * @author Dave Huffman
 * @copyright 2014
 */

// Handle environments that don't provide a console.
if (typeof console === 'undefined') {
  console = {
    debug: function () {}
    dir: function () {},
    log: function () {},
  };
}

/**
 * @returns {String} A capitalized version of this string.
 */
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

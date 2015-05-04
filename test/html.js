(function () {
  var ready = false;
  var sandbox = null;

  function setup() {
    destroy();
    sandbox.style.visibilty = 'hidden';
    sandbox.style.position = 'absolute';
    sandbox.style.top = '-999999px';
    sandbox.style.zIndex = '-1';
    document.body.appendChild(sandbox);
    ready = true;
  }


  function insert(html) {
    setup();
    sandbox.innerHTML = html;
  }

  function destroy() {
    if (sandbox) {
      sandbox.innerHTML = '';
      sandbox.parentNode.removeChild(sandbox);
    }
    sandbox = document.createElement('div');
    ready = false;
  };

  if (typeof exports !== 'undefined') {
    module.exports = insert;
  }
})();
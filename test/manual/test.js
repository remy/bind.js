var Bind = require('../../lib/bind');

console.log('-------');

var d = Bind({
  list: [1,2,3]
}, {
  list: function (v) {
    console.log(v.length);
  }
});

console.log('->>>>>>');
d.list.shift(); // 3 - incorrect
// console.log(data.__export());
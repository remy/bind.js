var Bind = require('../../lib/bind');

console.log('-------');

var data = Bind({
  cats: [{
    name: 'missy',
    type: 'black long haired',
  }, {
    name: 'dizzy',
    type: 'tabby',
  }, {
    name: 'ninja',
    type: 'black and white',
  }]
}, {
  'cats.0.name': function (to, from) {
    console.log('changed', to);
  },
  // cats: {
  //   callback: function (array) {
  //     console.log(array.length);
  //   }
  // }
});

console.log('/////');
data.cats[0].name = 'prince';
data.cats.shift();
data.cats = [{ name: "nap", type: "black" }, { name: "sam", type: "black & white" }];
console.log(data.cats[0].name);
var bind = require('../bind');

var data = bind({
  name: 'rem',
  score: 11,
  location: {
    city: 'Brighton',
    country: 'England'
  }
}, {
  name: function (name) {
    console.log('name is now ' + name);
  },
  score: function (score) {
    console.log('score is now ' + score);
  },
  'location.city': function (city) {
    console.log(data.name + "'s city is now " + city);
  }
});

data.score++;
data.location.city = 'London';
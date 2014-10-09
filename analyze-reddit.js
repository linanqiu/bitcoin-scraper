var redditPath = './reddit';
var fs = require('fs');
var junk = require('junk');
var sentiment = require('sentiment');

var threadCounts = {};
var threadCountsArray = [];
var threads = [];

function dateConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = month + ' ' + date + ', ' + year;
  return time;
}

function loadThreads(dir) {
  fs.readdir(dir, function(err, files) {
    if (err) {
      throw err;
    }

    files = files.filter(junk.not);

    files.forEach(function(elem, index, array) {
      console.log("Reading: " + dir + '/' + elem);
      var tempThreads = JSON.parse(fs.readFileSync(dir + '/' + elem));
      tempThreads = tempThreads['data']['children'];

      tempThreads.forEach(function(tempThread) {
        threads.push(tempThread);
      });
    });

    countThreads(threads);
  });
}

function countThreads(threads) {
  console.log("Thread count: " + threads.length);
  threads.forEach(function(thread, index, array) {
    var date = dateConverter(thread['data']['created_utc']);
    
    if(threadCounts.hasOwnProperty(date)) {
      threadCounts[date]++;
    } else {
      threadCounts[date] = 1;
    }
  });

  for (var date in threadCounts) {

    threadCountsArray.push({
      date: date,
      count: threadCounts[date]
    });
  }

  threadCountsArray.sort(function(a, b) {
    dateA = new Date(a['date']);
    dateB = new Date(b['date']);
    return (dateA.valueOf() - dateB.valueOf());
  });

  console.log(threadCountsArray);
}


loadThreads(redditPath + '/threads');
// console.log(sentiment('Bitcoin is awesome and amazing!'));
// console.log(sentiment('Bitcoin is a piece of crap'));



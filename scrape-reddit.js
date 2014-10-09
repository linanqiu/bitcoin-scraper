var reddit = require('redwrap');
var fs = require('fs');
var request = require('request');
var junk = require('junk');

var redditPath = './reddit';
// var timeNow = parseInt((new Date).getTime() / 1000);
var timeNow = parseInt(new Date().getTime() / 1000);
var timePast = parseInt(new Date('Jan 1, 2012').getTime() / 1000);
var iterations = 100;

var threads = [];
var threadCount = 0;

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

function scrapeThreads(subreddit, timePast, timeNow) {
  reddit.search('bitcoin', timePast, timeNow).all(function(res) {
    var fileName = redditPath + '/threads/' + subreddit;

    res.on('data', function(data, res) {
      var children = data['data']['children'];
      var lastThread = children[children.length - 1];
      if (lastThread !== undefined) {
        timeNow = lastThread['data']['created_utc'];
        console.log(dateConverter(timeNow));


        fs.writeFile(fileName + '_' + threadCount + '.json', JSON.stringify(data, null, 2), function(err) {
          if (err) {
            throw err;
          }
        });
        threadCount++;
      }
    });

    res.on('error', function(e) {
      throw err;
    });

    res.on('end', function() {
      iterations--;
      console.log('Iterations left: ' + iterations);
      scrapeThreads(subreddit, timePast, timeNow);
    });
  });
}

function loadThreads(dir, cb) {
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
        scrapeComment(tempThread);
      });
    });
  });
}

function scrapeComment(thread) {
  var subreddit = thread['data']['subreddit'];
  var id = thread['data']['id'];

  reddit.comments(subreddit, id, function(err, data, res) {
    fs.writeFile(redditPath + '/comments/' + subreddit + '_' + id + '.json', JSON.stringify(data, null, 2), function(err) {
      if (err) {
        throw err;
      } else {
        console.log("Done writing: " + redditPath + '/comments/' + subreddit + '_' + id + '.json');
      }
    });
  });
}

// var scrapeThreadsForComments = function(threads) {
//   threads.forEach(function(elem, index, array) {
//     scrapeComment(elem);
//   });
// }

// scrapeThreads('bitcoin', timePast, timeNow);
loadThreads(redditPath + '/threads');
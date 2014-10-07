var reddit = require('redwrap');
var fs = require('fs');
var request = require('request');
var junk = require('junk');

var redditPath = './reddit'

var threads = [];

function scrapeThreads(subreddit) {
  reddit.r(subreddit).sort('new').all(function(res) {

    var fileName = redditPath + '/threads/' + subreddit;

    var i = 0;

    res.on('data', function(data, res) {
      fs.writeFile(fileName + '_' + i + '.json', JSON.stringify(data, null, 2), function(err) {
        if (err) {
          throw err;
        }
      });
      i++;
    });

    res.on('error', function(e) {
      throw err;
    });

    res.on('end', function() {
      console.log('All Done');

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
        threads.push(tempThread);
      });
    });

    cb(threads);
  });
}

function scrapeComment(thread) {
  var subreddit = thread['data']['subreddit'];
  var id = thread['data']['id'];

  reddit.comments(subreddit, id, function(err, data, res) {
    fs.writeFile(redditPath + '/comments/' + subreddit + '_' + id + '.json', JSON.stringify(data, null, 2), function(err) {
      if (err) {
        throw err;
      }
    });
  });
}

var scrapeThreadsForComments = function(threads) {
  threads.forEach(function(elem, index, array) {
    scrapeComment(elem);
  });
}

// scrapeThreads('bitcoin');
loadThreads(redditPath + '/threads', scrapeThreadsForComments);



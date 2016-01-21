'use strict';

var webPage = require('webpage');
var system = require('system');
var page = webPage.create();
var pdfPage = webPage.create();
var fs = require('fs');
var url, filePath;

/**
 * Variables Init
 */
var resourceWait = 300,
  maxRenderWait = 10000,
  count = 0,
  forcedRenderTimeout,
  renderTimeout,
  debug = false;

/**
 * Functions / Events
 */

function open(currentPage, url, ownCallback) {
  currentPage.open(url, function (status) {
    if (status !== 'success') {
      if (debug) {
        console.log('Unable to load url');
      }
      phantom.exit(-1);
    } else {
      ownCallback();
    }
  });
}

function doRender() {
  var tmpFilePath = './public/'.concat(btoa(filePath), '.html');

  if (debug) {
    console.debug('Start export PDF...');
  }

  fs.write(tmpFilePath,
    page.content
      .replace(new RegExp('\\s*<script[^>]*>[\\s\\S]*?</script>\\s*', 'ig'), '')
      .replace(new RegExp('\\s*<div class="pace[^>]*>[\\s\\S]*?</div>\\s*', 'ig'), '')
      .replace(new RegExp('\\s*<div id="wrapper-loader[^>]*>[\\s\\S]*?</div>\\s*', 'ig'), ''),
    'w');
  page.close();

  open(pdfPage, tmpFilePath, function () {
    pdfPage.render(filePath);
    if (!debug) {
      fs.remove(tmpFilePath);
    }
    phantom.exit();
  });
}

function onResourceRequested(req) {
  count += 1;
  if (debug) {
    console.log('> ' + req.id + ' - ' + req.url);
  }
  clearTimeout(renderTimeout);
}

function onResourceReceived(res) {
  if (!res.stage || res.stage === 'end') {
    count -= 1;
    if (debug) {
      console.log(res.id + ' ' + res.status + ' - ' + res.url);
    }
    if (count === 0) {
      renderTimeout = setTimeout(doRender, resourceWait);
    }
  }
}

function onError(msg, trace) {
  if (debug) {
    console.log(msg);
    trace.forEach(function (item) {
      console.log('  ', item.file, ':', item.line);
    });
  }
}

/**
 * Page Config & Main
 */

[page, pdfPage].forEach(function (cPage) {
  cPage.onError = onError;
  cPage.onResourceRequested = onResourceRequested;
  cPage.onResourceReceived = onResourceReceived;
});

pdfPage.paperSize = {
  format: 'A4',
  orientation: 'portrait',
  margin: {left: '0.5cm', right: '0.5cm', top: '1cm', bottom: '1cm'},
};

if (system.args.length < 3 || system.args.length > 4) {
  console.log('Parameter missing');
  phantom.exit(-1);
} else {
  url = system.args[1];
  filePath = system.args[2];
  /*jshint eqeqeq: false */
  debug = system.args[3] == 1;
  /*jshint eqeqeq: true */

  open(page, url, function () {
    forcedRenderTimeout = setTimeout(function () {
      if (debug) {
        console.log(count);
      }
      doRender();
    }, maxRenderWait);
  });
}


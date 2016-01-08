"use strict";

var webPage = require('webpage');
var system = require('system');
var page = webPage.create();
var pdfPage = webPage.create();
var fs = require('fs');
var url;

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
 * Page Config
 */

[page, pdfPage].forEach(function (cPage) {
  cPage.onError = onError;
  cPage.onResourceRequested = onResourceRequested;
  cPage.onResourceReceived = onResourceReceived;
});

pdfPage.paperSize = {
  format: "A4",
  orientation: "portrait",
  margin: {left: "0.5cm", right: "0.5cm", top: "1cm", bottom: "1cm"},
};


function doRender() {
  var filePath = 'public/test.html';

  if (debug) {
    console.log('Start export PDF...');
  }

  fs.write(filePath,
    page.content
      .replace(new RegExp('\\s*<script[^>]*>[\\s\\S]*?</script>\\s*', 'ig'), '')
      .replace(new RegExp('\\s*<div class="pace[^>]*>[\\s\\S]*?</div>\\s*', 'ig'), '')
    , 'w');
  page.close();

  pdfPage.clearMemoryCache();
  open(pdfPage, filePath, function () {
    pdfPage.render('public/exports/export.pdf');
    fs.remove(filePath);
    phantom.exit();
  });
}

if (system.args.length < 2 || system.args.length > 3) {
  console.log('Parameter missing');
  phantom.exit(-1);
} else {
  url = system.args[1];
  debug = system.args[2] == 1;

  page.clearMemoryCache();
  open(page, url, function () {
    forcedRenderTimeout = setTimeout(function () {
      if (debug) {
        console.log(count);
      }
      doRender();
    }, maxRenderWait);
  });
}

/**
 * Functions / Events
 */

function open(currentPage, url, ownCallback) {
  currentPage.open(url, function (status) {
    if (status !== "success") {
      if (debug) {
        console.log('Unable to load url');
      }
      phantom.exit(-1);
    } else {
      ownCallback();
    }
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


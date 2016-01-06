"use strict";

var webPage = require('webpage');
var page = webPage.create();
var system = require('system');
var path = require('path');
var fs = require('fs');
var url;

function waitFor(testFx, onReady, timeOutMillis) {
  var maxTimeOutMillis = timeOutMillis ? timeOutMillis : 3000,
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function () {
      if ((new Date().getTime() - start < maxTimeOutMillis) && !condition) {
        condition = (typeof(testFx) === "string" ? eval(testFx) : testFx());
      } else {
        if (!condition) {
          console.log("'waitFor()' timeout");
          phantom.exit(-1);
        } else {
          console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
          typeof(onReady) === "string" ? eval(onReady) : onReady();
          clearInterval(interval);
        }
      }
    }, 250);
};

if (system.args.length != 2) {
  console.log('Parameter missing');
  phantom.exit(-1);
} else {
  url = system.args[1];

  page.paperSize = {
    format: "A4",
    orientation: "portrait",
    margin: {left: "1cm", right: "1cm", top: "1cm", bottom: "1cm"},
    header: {
      height: "3cm",
      contents: phantom.callback(function (pageNum, numPages) {
        // todo
      })
    },
    footer: {
      class: "pull-right",
      height: "1cm",
      contents: phantom.callback(function (pageNum, numPages) {
        return (pageNum + "/" + numPages);
      })
    }
  };

  page.open(url, function (status) {
    console.log(url);
    waitFor(function () {
      console.log('Waiting...');
      return page.evaluate(function () {
        return document.querySelectorAll('.versions.pdf').length > 0;
      });
    }, function () {
      console.log("Should be ok now.");
      page.render('public/exports/export.pdf');
      phantom.exit();
    });
  });
}


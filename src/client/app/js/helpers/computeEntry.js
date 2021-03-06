'use strict';

var PRICE = 1 << 0;
var TIME = 1 << 1;
var HIGH = 1 << 2;
var LOW = 1 << 3;
var TASKS = 1 << 4;
var ESTIM_DEV = 1 << 5;
var ESTIM_SM = 1 << 6;

function getAttributeName(opts) {
  var attrName;
  if (opts & HIGH) {
    attrName = 'otrHigh';
  } else if (opts & LOW) {
    attrName = 'otrLow';
  } else {
    attrName = 'durationMinutes';
  }

  return attrName;
}

// minutes is the default unit here
function getConvertMultiplier(setting, opts) {
  var mult = 1;
  if (opts & (HIGH | LOW)) {
    switch (setting.rangeEstimateUnit) {
      case 'hour':
        mult = 60;
        break;
      case 'day':
        mult = 60 * setting.hourPerDay;
        break;
    }
  }

  return mult;
}

function recursiveWalk(elements, setting, id, opts, cb) {
  if (elements !== undefined) {
    elements.forEach(function (subElement) {
      if (subElement._id === id) {
        cb(subElement);
      } else {
        recursiveWalk(subElement.children, setting, id, opts, cb);
      }
    });
  }
}

function getRate(setting, opts) {
  return parseFloat(getConvertMultiplier(setting, opts) * setting.rateMultiplier / (100 * 60 * setting.hourPerDay));
}

function getDevTime(entry, setting, opts) {
  var result = 0;
  if (setting.showDev === true) {
    result += parseFloat(entry.estimate[getAttributeName(opts)] * getRate(setting, opts));
  }

  return result;
}

function getSMTime(entry, setting, opts) {
  var result = 0;
  if (setting.showManagement === true) {
    var occupationSmPercentage = parseFloat(setting.scrummasterOccupation / 100);
    result += parseFloat(entry.estimate[getAttributeName(opts)] * occupationSmPercentage * getRate(setting, opts));
  }

  return result;
}

function computeTotal(entries, setting, opts) {
  var total = 0;

  entries.forEach(function (entry) {
    if (opts & TASKS) {
      total += entry.size;
    }
    if (opts & ESTIM_DEV) {
      var totalDev = getDevTime(entry, setting, opts);
      if (opts & PRICE) {
        totalDev *= setting.contributorPrice;
      }
      total += totalDev;
    }
    if (opts & ESTIM_SM) {
      var totalSm = getSMTime(entry, setting, opts);
      if (opts & PRICE) {
        totalSm *= setting.scrummasterPrice;
      }
      total += totalSm;
    }
  });

  return total;
}

function computeTime(entry, setting, opts) {
  return getSMTime(entry, setting, opts) + getDevTime(entry, setting, opts);
}

function computePrice(entry, setting, opts) {
  var result = 0;

  if (setting.showManagement === true) {
    result += getSMTime(entry, setting, opts) * setting.scrummasterPrice;
  }
  if (setting.showDev === true) {
    result += getDevTime(entry, setting, opts) * setting.contributorPrice;
  }

  return parseFloat(result);
}

function computeDayPerPersonPerIter(entries, setting) {
  return setting.contributorOccupation * setting.dayPerWeek * setting.weekPerIteration / 100;
}

function iterations(entries, setting, opts) {
  return (computeTotal(entries, setting, ESTIM_DEV | ESTIM_SM | opts) /
    computeDayPerPersonPerIter(entries, setting)) / setting.contributorAvailable;
}


function walkElement(entries, setting, id, opts) {
  var result = '-';
  if (opts !== undefined && id !== undefined) {
    entries.forEach(function (entry) {
      recursiveWalk(entry.children, setting, id, opts, function (element) {
        if (opts & PRICE) {
          result = computePrice(element, setting, opts);
        } else if (opts & TIME) {
          result = computeTime(element, setting, opts);
        }
      });
    });
  }

  return result;
}

module.exports = {
  walkElement: walkElement,
  computeTotal: computeTotal,
  computeDayPerPersonPerIter: computeDayPerPersonPerIter,
  iterations: iterations,
  const: {
    TASKS: TASKS,
    ESTIM_DEV: ESTIM_DEV,
    ESTIM_SM: ESTIM_SM,
    PRICE: PRICE,
    TIME: TIME,
    HIGH: HIGH,
    LOW: LOW,
  }
};
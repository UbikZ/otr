'use strict';

var PRICE = 1<<0;
var TIME = 1<<1;
var HIGH = 1<<2;
var LOW = 1<<3;
var TASKS = 1<<4;
var ESTIM_DEV = 1<<5;
var ESTIM_SM = 1<<6;

function getAttributeName(opts) {
  var attrName;
  if (opts & HIGH) {
    attrName = 'otr_high';
  } else if (opts & LOW) {
    attrName = 'otr_high';
  } else {
    attrName = 'duration_minutes';
  }

  return attrName;
}

// No need recursion here (3 levels max) (todo: add factorization)
function walkElement(entries, setting, id, opts) {
  var result = '-';

  if (opts != undefined && id != undefined) {
    entries.forEach(function (entry) {
      entry.children.forEach(function (subEntry) {
        if (subEntry._id == id) {
          if (opts & PRICE) {
            result = computePrice(subEntry, setting, opts);
          } else if (opts & TIME) {
            result = computeTime(subEntry, setting, opts);
          }
        } else {
          subEntry.children.forEach(function (element) {
            if (element._id == id) {
              if (opts & PRICE) {
                result = computePrice(element, setting, opts);
              } else if (opts & TIME) {
                result = computeTime(element, setting, opts);
              }
            }
          });
        }
      });
    });
  }

  return result;
}

function computeDayPerPersonPerIter(entries, setting) {
  return setting.contributorOccupation * setting.dayPerWeek * setting.weekPerIteration / 100;
}

function interations(entries, setting) {
  return (computeTotal(entries, setting, ESTIM_DEV | ESTIM_SM) / computeDayPerPersonPerIter(entries, setting))
    / setting.contributorAvailable;
}

function computeTotal(entries, setting, opts) {
  var total = 0;

  entries.forEach(function (entry) {
    if (opts & TASKS) {
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
  return getSMTime(entry, setting, opts) + getDevTime(entry, setting, opts);;
}

function getRate(setting) {
  return parseFloat(setting.rateMultiplier / (100 * 60 * setting.hourPerDay));
}

function getDevTime(entry, setting, opts) {
  var result = 0;
  if (setting.showDev === true) {
    result += parseFloat(entry.estimate[getAttributeName(opts)] * getRate(setting));
  }

  return result;
}

function getSMTime(entry, setting, opts) {
  var result = 0;
  if (setting.showManagement === true) {
    var occupationSmPercentage = parseFloat(setting.scrummasterOccupation / 100);
    result += parseFloat(entry.estimate[getAttributeName(opts)] * occupationSmPercentage * getRate(setting));
  }

  return result;
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

module.exports = {
  walkElement: walkElement,
  computeTotal: computeTotal,
  computeDayPerPersonPerIter: computeDayPerPersonPerIter,
  interations: interations,
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
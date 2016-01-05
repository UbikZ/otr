'use strict';

const PRICE = 1<<0;
const TIME = 1<<1;
const HIGH = 1<<2;
const LOW = 1<<3;
const TASKS = 1<<4;
const ESTIM_DEV = 1<<5;
const ESTIM_SM = 1<<6;

function walkElement(entries, setting, id, _depth, opts) {
  var result = '-';
  var depth = _depth || 1;

  if (opts != undefined && id != undefined) {
    entries.forEach(function (entry) {
      entry.children.forEach(function (subEntry) {
        if (subEntry._id == id) {
          if (opts & PRICE) {
            result = computePrice(subEntry, setting);
          } else if (opts & TIME) {
            result = computeTime(subEntry, setting);
          }
        } else if (depth > 1) {
          subEntry.children.forEach(function (element) {
            // todo
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
      var totalDev = getDevTime(entry, setting);
      if (opts & PRICE) {
        totalDev *= setting.contributorPrice;
      }
      total += totalDev;
    }
    if (opts & ESTIM_SM) {
      var totalSm = getSMTime(entry, setting);
      if (opts & PRICE) {
        totalSm *= setting.scrummasterPrice;
      }
      total += totalSm;
    }
  });

  return total;
}

function computeTime(entry, setting) {
  var result = 0;

  if (setting.estimateType == 'range') {
    // todo
  } else {
    result = getSMTime(entry, setting) + getDevTime(entry, setting);
  }

  return result;
}

function getRate(setting) {
  return parseFloat(setting.rateMultiplier / (100 * 60 * setting.hourPerDay));
}

function getDevTime(entry, setting) {
  var result = 0;
  if (setting.showDev === true) {
    result += parseFloat(entry.estimate.duration_minutes * getRate(setting));
  }

  return result;
}

function getSMTime(entry, setting) {
  var result = 0;
  if (setting.showManagement === true) {
    var occupationSmPercentage = parseFloat(setting.scrummasterOccupation / 100);
    result += parseFloat(entry.estimate.duration_minutes * occupationSmPercentage * getRate(setting));
  }

  return result;
}

function computePrice(entry, setting) {
  var result = 0;

  if (setting.showManagement === true) {
    result += getSMTime(entry, setting) * setting.scrummasterPrice;
  }
  if (setting.showDev === true) {
    result += getDevTime(entry, setting) * setting.contributorPrice;
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
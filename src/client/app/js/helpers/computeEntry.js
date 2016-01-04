'use strict';

function walkElement(entries, setting, id, _depth, isPrice) {
  var result = '-';
  var depth = _depth || 1;

  if (id != undefined) {
    entries.forEach(function (entry) {
      entry.children.forEach(function (subEntry) {
        if (subEntry._id == id) {
          result = isPrice == true ? computePrice(subEntry, setting) : computeTime(subEntry, setting);
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
};
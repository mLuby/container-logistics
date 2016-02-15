import {compose} from "redux"
import MapBoxMap from "./../lib/mapFunctions"
function log (...args) { console.log(...args) } // eslint-disable-line no-console

function loadLocalCSV (relativeFilePath, callback) { $.ajax({url: relativeFilePath, success: callback}) }
function mergeObjs (objList) {
  return Object.assign.apply(0, objList)
}
function csvToJson (csv) {
  const allLines = csv.split("\n")
  const keys = allLines[0].split(",")
  return allLines.slice(1)
  .map(line => line.split(",").map((value, index) => ({[keys[index]]: value})))
  .map(mergeObjs)
}

loadLocalCSV("../data/nodes.csv", compose(log, csvToJson))
loadLocalCSV("../data/edges.csv", compose(log, csvToJson))

const map = new MapBoxMap("map")
log(map)

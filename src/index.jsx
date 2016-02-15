import {compose} from "redux"
import axios from "axios"
import MapBoxMap from "./../lib/mapFunctions"

const map = new MapBoxMap("map")
const nodesList = []
const nodesObj = {}

function log (...args) { console.log(...args) } // eslint-disable-line no-console
function first (list) { return list[0] }
function loadLocalCSV (relativeFilePath) { return axios.get(relativeFilePath) }
function mergeObjs (objList) {
  return Object.assign.apply(0, objList)
}
function respToData (response) { return response.data }
function csvToJson (csv) {
  const allLines = csv.split("\n")
  const keys = allLines[0].split(",")
  return allLines.slice(1)
  .map(line => line.split(",").map((value, index) => ({[keys[index]]: value})))
  .map(mergeObjs)
}
function nodeClickHandler (event) { log(event) }
function addNodesToMap (nodes) {
  nodes.forEach(node => map.addMarkerToMap(node, node.color || "default", nodeClickHandler))
  return nodes
}
function addNodesToListAndObj (nodes) {
  nodesList.concat(nodes)
  nodes.reduce((obj, node) => Object.assign(obj, {[node.id]: node}), nodesObj)
  return nodes
}
function addEdgesToMap (edges) {
  const color = "grey"
  edges.forEach(edge => {
    const node1 = nodesObj[edge.first_node_id]
    const node2 = nodesObj[edge.second_node_id]
    map.addEdgeToMap(node1, node2, color)
  })
}

const nodesPromise = loadLocalCSV("../data/nodes.csv").then(compose(addNodesToListAndObj, addNodesToMap, csvToJson, respToData))
const edgesPromise = loadLocalCSV("../data/edges.csv").then(compose(csvToJson, respToData))
axios.all([edgesPromise, nodesPromise]).then(compose(addEdgesToMap, first))

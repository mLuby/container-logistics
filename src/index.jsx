import {compose} from "redux"
import axios from "axios"
import MapBoxMap from "./../lib/mapFunctions"

const map = new MapBoxMap("map")
const nodesList = []
const nodesObj = {}
const edgesList = []

function fst (list) { return list[0] }
function snd (list) { return list[1] }
function loadLocalCSV (relativeFilePath) { return axios.get(relativeFilePath) }
function mergeObjs (objList) {
  return Object.assign.apply(0, objList)
}
function prop (key) { return obj => obj[key] }
function respToData (response) { return prop("data")(response) }
function tryNum (maybeNum) { return isNaN(Number(maybeNum)) ? maybeNum : Number(maybeNum) }
function trim (str) { return str.trim() }
function csvToJson (csv) {
  const allLines = csv.split("\n")
  const keys = allLines[0].split(",").map(trim) // note: first line of nodes ends in both \n and \r
  return allLines.slice(1)
  .map(line => line
    .split(",")
    .map(trim)
    .map((value, index) => ({[keys[index]]: tryNum(value)})))
  .map(mergeObjs)
}
function addNodesToMap (nodes) {
  nodes.forEach(node => map.addMarkerToMap(node, node.color || "default", nodeClickHandler))
  return nodes
}
function addNodesToListAndObj (nodes) {
  nodes.forEach(node => nodesList.push(node))
  nodes.reduce((obj, node) => Object.assign(obj, {[node.id]: node}), nodesObj)
  return nodesList
}
function addEdgesToList (edges) {
  edges.forEach(edge => edgesList.push(edge))
  return edges
}
function addEdgesToMap (edges) {
  const color = "grey"
  edges.forEach(edge => {
    const node1 = nodesObj[edge.first_node_id]
    const node2 = nodesObj[edge.second_node_id]
    map.addEdgeToMap(node1, node2, color)
  })
  return edges
}
function clearMap () {
  map.clearMarkers()
  map.clearEdges()
  addNodesToMap(nodesList)
  addEdgesToMap(edgesList)
}
function countContainers (nodes) {
  return nodes.reduce((sum, node) => sum + node.number_of_containers_at_location, 0)
}
function shortestDistanceFirst (edge1, edge2) {
  return edge1.travel_time_in_hours_between_nodes - edge2.travel_time_in_hours_between_nodes
}
function addEdgesToNode (edges) {
  return node => {
    node.edges = edges
    .filter(edge => edge.first_node_id === node.id || edge.second_node_id === node.id)
    .sort(shortestDistanceFirst)
  }
}
function createGraph (edges) {
  nodesList.forEach(addEdgesToNode(edges))
  return nodesList
}
const city = prop("city_name")
function nodesInRange (targetNode, time, node = targetNode, nodes = []) {
  function edgeWithinTravelTime (edge) { return edge.travel_time_in_hours_between_nodes <= time }
  function nodeTimeFromEdge (edge) { return {time: edge.travel_time_in_hours_between_nodes, node: edge.first_node_id === node.id ? nodesObj[edge.second_node_id] : nodesObj[edge.first_node_id]} }
  function notInNodes (nodeTime) { return !nodes.includes(nodeTime.node) }
  function notTarget (nodeTime) { return nodeTime.node !== targetNode }
  function pushToNodes (theNode) { nodes.push(theNode) }
  function toNode (nodeTime) { return nodeTime.node }
  // given some nodes
  // find node's neighbors within travel time
  // dedup neighbors against nodes (consider Map)
  const neighbors = node.edges
  .filter(edgeWithinTravelTime)
  .map(nodeTimeFromEdge)
  .filter(notInNodes)
  .filter(notTarget)
  // push unique neighbors to nodes
  neighbors
  .map(toNode)
  .forEach(pushToNodes)
  // recurse into unique neighbors with new time and nodes
  neighbors
  .forEach(nodeTime => nodesInRange(targetNode, time - nodeTime.time, nodeTime.node, nodes))
  // debugger
  return nodes
}
function markNodes (nodes, color) { nodes.forEach(node => map.addMarkerToMap(node, color, nodeClickHandler)) }
// function markEdges (nodePairs, color) { nodePairs.forEach(nodePair => map.addEdgeToMap(fst(nodePair), snd(nodePair), color)) }
function nodeClickHandler (event) {
  function hasLatLng (node) { return node.latitude === event.latlng.lat && node.longitude === event.latlng.lng }
  const targetNode = fst(nodesList.filter(hasLatLng))
  const time = 15
  const nodes = nodesInRange(targetNode, time)
  console.log('node', targetNode, 'time', time)
  console.log('nodesInRange 10', nodes.map(city))
  console.log('countContainers', countContainers(nodes))
  clearMap()
  markNodes([targetNode], "green")
  markNodes(nodes, "red")
}
const nodesPromise = loadLocalCSV("../data/nodes.csv").then(compose(addNodesToListAndObj, addNodesToMap, csvToJson, respToData))
const edgesPromise = loadLocalCSV("../data/edges.csv").then(compose(csvToJson, respToData))
axios.all([edgesPromise, nodesPromise]).then(compose(createGraph, addEdgesToMap, addEdgesToList, fst))

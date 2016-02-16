// imports
import {compose} from "redux"
import axios from "axios"
import MapBoxMap from "./mapFunctions"
import * as earths from "./webglearth"
// constants
const [grey, red] = ["#808080", "#FF0000"]
const edgeOpacity = 0.1
const activeEdgeOpacity = 0.5
const nodesList = []
const nodesObj = {}
const edgesList = []
const earthsMarkersList = []
const earthsEdgesList = []
// pure helpers
function fst (list) { return list[0] }
function mergeObjs (objList) {
  return Object.assign.apply(0, objList)
}
function prop (key) { return obj => obj[key] }
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
function pushTo (list) { return item => { list.push(item); return item } }
function notInList (list) { return item => !list.includes(item) }
// business logic
function addNodesToListAndObj (nodes) {
  nodes.forEach(node => nodesList.push(node))
  nodes.reduce((obj, node) => Object.assign(obj, {[node.id]: node}), nodesObj)
  return nodesList
}
function addEdgesToList (edges) {
  edges.forEach(edge => edgesList.push(edge))
  return edges
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
function inRange (targetNode, time, node = targetNode, nodes = [], edges = []) {
  function edgeWithinTravelTime (edge) { return edge.travel_time_in_hours_between_nodes <= time }
  function nodeTimeFromEdge (edge) { return {time: edge.travel_time_in_hours_between_nodes, node: edge.first_node_id === node.id ? nodesObj[edge.second_node_id] : nodesObj[edge.first_node_id]} }
  function notTarget (nodeTime) { return nodeTime.node !== targetNode }
  // find edges within travel time and dedup (consider Map)
  const validEdges = node.edges
  .filter(edgeWithinTravelTime)
  .filter(notInList(edges))
  .map(pushTo(edges))
  // find nodes within travel time from valid edges and dedup (consider Map)
  const nodeTimes = validEdges
  .map(nodeTimeFromEdge)
  .filter(notInList(nodes))
  .filter(notTarget)
  // push unique neighbors to nodes
  nodeTimes
  .map(prop("node"))
  .forEach(pushTo(nodes))
  // recurse into unique neighbors with new time and nodes
  nodeTimes
  .forEach(nodeTime => inRange(targetNode, time - nodeTime.time, nodeTime.node, nodes, edges))
  return [nodes, edges]
}
function countContainers (nodes) {
  return nodes.reduce((sum, node) => sum + node.number_of_containers_at_location, 0)
}
// display helpers
function displayNodes (nodes, color) {
  nodes.forEach(node => mapBoxMap.addMarker(node.latitude, node.longitude, color || "default", nodeClickHandler(node))) // eslint-disable-line no-use-before-define
  nodes.forEach(node => {
    const [m1, m2] = earths.addMarker(node.latitude, node.longitude, color || "blue", nodeClickHandler(node)) // eslint-disable-line no-use-before-define
    earthsMarkersList.push(m1)
    earthsMarkersList.push(m2)
  })
  return nodes
}
function displayEdges (edges, color = grey, opacity = edgeOpacity) {
  edges.forEach(edge => {
    const node1 = nodesObj[edge.first_node_id]
    const node2 = nodesObj[edge.second_node_id]
    mapBoxMap.addEdge(node1.latitude, node1.longitude, node2.latitude, node2.longitude, color, opacity) // eslint-disable-line no-use-before-define
    const [e1, e2] = earths.addEdge(node1.latitude, node1.longitude, node2.latitude, node2.longitude, color, opacity)
    earthsEdgesList.push(e1)
    earthsEdgesList.push(e2)
  })
  return edges
}
function clearDisplay () {
  mapBoxMap.clearMarkers() // eslint-disable-line no-use-before-define
  mapBoxMap.clearEdges() // eslint-disable-line no-use-before-define
  earths.clearMarkers(earthsMarkersList)
  earths.clearEdges(earthsEdgesList)
  displayNodes(nodesList)
  displayEdges(edgesList)
}
function nodeClickHandler (targetNode) {
  return () => {
    const time = 10
    const [nodes, edges] = inRange(targetNode, time)
    // console.log('node', targetNode, 'time', time)
    // console.log('inRange nodes', nodes.map(prop("city_name")))
    // console.log('inRange edges', edges)
    // console.log('countContainers', countContainers(nodes))
    clearDisplay()
    displayEdges(edges, red, activeEdgeOpacity)
    displayNodes(nodes, "red")
    displayNodes([targetNode], "green")
  }
}
// loading CSVs and displays
function loadLocalCSV (relativeFilePath) { return axios.get(relativeFilePath) }
const mapBoxMap = new MapBoxMap("map")
earths.create()
const nodesPromise = loadLocalCSV("../data/nodes.csv").then(compose(addNodesToListAndObj, displayNodes, csvToJson, prop("data")))
const edgesPromise = loadLocalCSV("../data/edges.csv").then(compose(csvToJson, prop("data")))
axios.all([edgesPromise, nodesPromise]).then(compose(createGraph, displayEdges, addEdgesToList, fst))

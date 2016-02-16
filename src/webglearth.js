const WebGLEarth = window.WebGLEarth
const WE = window.WE
const msBetweenUpdate = 50
const proxyHost = "http://data.webglearth.com/cgi-bin/corsproxy.fcgi"

let earth1
let earth2
let center = [40.0, -100.0] // eslint-disable-line no-magic-numbers
let zoom = 3.0 // eslint-disable-line no-magic-numbers

function antipode (coord) {
  return [-1 * coord[0], coord[1] - 180] // eslint-disable-line no-magic-numbers
}

function update () {
  if (center[0] === earth1.getCenter()[0] && center[1] === earth1.getCenter()[1]) {
    center = antipode(earth2.getCenter())
    earth1.setView([center[0], center[1]])
  } else {
    center = earth1.getCenter()
    const antip = antipode(earth1.getCenter())
    earth2.setView([antip[0], antip[1]])
  }
  if (earth1.getZoom() === zoom) {
    zoom = earth2.getZoom()
    earth1.setZoom(zoom)
  } else {
    zoom = earth1.getZoom()
    earth2.setZoom(zoom)
  }
}

function markerPath (color) { return `./imgs/${color}-icon.png` }

export function create () {
  earth1 = new WebGLEarth("earth1", {proxyHost, center})
  earth2 = new WebGLEarth("earth2", {proxyHost, center: antipode(center)})
  earth1.setZoom(zoom)
  earth2.setZoom(zoom)
  // Recalculate positions whenever any of the two globes moves
  setInterval(update, msBetweenUpdate)
  return [earth1, earth2]
}

export function addMarker (latitude, longitude, color, clickHandler) {
  const marker1 = WE.marker([latitude, longitude], markerPath(color))
  const marker2 = WE.marker([latitude, longitude], markerPath(color))
  marker1.addTo(earth1)
  marker2.addTo(earth2)
  marker1.element.onclick = clickHandler
  marker2.element.onclick = clickHandler
  return [marker1, marker2]
}

export function addEdge (lat1, lon1, lat2, lon2, color, opacity) {
  const edge1 = WE.polygon([[lat1, lon1], [lat2, lon2], [lat1, lon1]], {color, opacity})
  const edge2 = WE.polygon([[lat1, lon1], [lat2, lon2], [lat1, lon1]], {color, opacity})
  edge1.addTo(earth1)
  edge2.addTo(earth2)
  return [edge1, edge2]
}

export function clearMarkers (markers) {
  while (markers.length) {
    const marker = markers.pop() // need to clear out markers so it can be refilled
    earth1.removeMarker(marker)
    earth2.removeMarker(marker) // would be nice to know which one marker is part of
  }
}

export function clearEdges (edges) {
  while (edges.length) {
    const edge = edges.pop() // need to clear out edges so it can be refilled
    earth1.removeMarker(edge)
    earth2.removeMarker(edge) // would be nice to know which one marker is part of
  }
}

const WebGLEarth = window.WebGLEarth
const WE = window.WE
const proxyHost = "http://data.webglearth.com/cgi-bin/corsproxy.fcgi"

let earth1
const center = [40.0, -100.0] // eslint-disable-line no-magic-numbers
const zoom = 3.0 // eslint-disable-line no-magic-numbers

function markerPath (color) { return `./imgs/${color}-icon.png` }

export function create () {
  earth1 = new WebGLEarth("earth1", {proxyHost, center})
  earth1.setZoom(zoom)
  return [earth1]
}

export function addMarker (latitude, longitude, color, clickHandler) {
  const marker1 = WE.marker([latitude, longitude], markerPath(color))
  marker1.addTo(earth1)
  marker1.element.onclick = clickHandler
  return [marker1]
}

export function addEdge (lat1, lon1, lat2, lon2, color, opacity) {
  const edge1 = WE.polygon([[lat1, lon1], [lat2, lon2], [lat1, lon1]], {color, opacity})
  edge1.addTo(earth1)
  return [edge1]
}

export function clearMarkers (markers) {
  while (markers.length) {
    const marker = markers.pop() // need to clear out markers so it can be refilled
    earth1.removeMarker(marker)
  }
}

export function clearEdges (edges) { // TODO doesn't work…
  while (edges.length) {
    const edge = edges.pop() // need to clear out edges so it can be refilled
    earth1.removeMarker(edge)
  }
}

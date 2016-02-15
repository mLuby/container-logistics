const WebGLEarth = window.WebGLEarth
const WE = window.WE
const msBetweenUpdate = 50

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

export function createEarths () {
  const proxyHost = "http://data.webglearth.com/cgi-bin/corsproxy.fcgi"
  earth1 = new WebGLEarth("earth1", {proxyHost, center})
  earth2 = new WebGLEarth("earth2", {proxyHost, center: antipode(center)})
  earth1.setZoom(zoom)
  earth2.setZoom(zoom)

  const marker = WE.marker([51.5, -0.09], markerPath("blue")).addTo(earth1) // eslint-disable-line no-magic-numbers
  marker.bindPopup("<b>Hello world!</b><br>I am a popup.<br /><span style='font-size:10pxcolor:#999'>Tip: Another popup is hidden in Cairo..</span>", {maxWidth: 150, closeButton: true}).openPopup()

  const marker2 = WE.marker([30.058056, 31.228889], markerPath("green")).addTo(earth2) // eslint-disable-line no-magic-numbers
  marker2.bindPopup("<b>Cairo</b><br>Yay, you found me!", {maxWidth: 120, closeButton: false})

  const markerCustom = WE.marker([50, -9], markerPath("red")) // eslint-disable-line no-magic-numbers
  markerCustom.addTo(earth1)

  // Recalculate positions whenever any of the two globes moves
  setInterval(update, msBetweenUpdate)
  return [earth1, earth2]
}

function generateMarkerClickHandler (_lat, _lng, _id) {
  return () => {
    const lat = _lat
    const lng = _lng
    const nodeId = _id
    debugger
  }
}

export function addMarker (lat, lng, color, id) {
  const marker1 = WE.marker([lat, lng], markerPath(color))
  marker1.addTo(earth1)
  marker1.element.onclick = generateMarkerClickHandler(lat, lng, id)
  const marker2 = WE.marker([lat, lng], markerPath(color))
  marker2.addTo(earth2)
  marker2.element.onclick = generateMarkerClickHandler(lat, lng, id)
  return [marker1, marker2]
}

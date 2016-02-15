"use strict"
const WebGLEarth = window.WebGLEarth
const WE = window.WE
const msBetweenUpdate = 50
const redMarker = "./imgs/red-icon.png"
const greenMarker = "./imgs/green-icon.png"
const blueMarker = "./imgs/blue-icon.png"

let earth1
let earth2
let zoom = 2
let center = [45.0, 6.0] // eslint-disable-line no-magic-numbers

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

function initialize () {
  const proxyHost = "http://data.webglearth.com/cgi-bin/corsproxy.fcgi"
  earth1 = new WebGLEarth("earth1", {zoom, proxyHost, center})
  earth2 = new WebGLEarth("earth2", {zoom, proxyHost, center: antipode(center)})

  const marker = WE.marker([51.5, -0.09], blueMarker).addTo(earth1) // eslint-disable-line no-magic-numbers
  marker.bindPopup("<b>Hello world!</b><br>I am a popup.<br /><span style='font-size:10pxcolor:#999'>Tip: Another popup is hidden in Cairo..</span>", {maxWidth: 150, closeButton: true}).openPopup()

  const marker2 = WE.marker([30.058056, 31.228889], greenMarker).addTo(earth2) // eslint-disable-line no-magic-numbers
  marker2.bindPopup("<b>Cairo</b><br>Yay, you found me!", {maxWidth: 120, closeButton: false})

  const markerCustom = WE.marker([50, -9], redMarker) // eslint-disable-line no-magic-numbers
  markerCustom.addTo(earth1)

  // earth1.setView([51.505, 0], 6)

  // Recalculate positions whenever any of the two globes moves
  setInterval(update, msBetweenUpdate)
}

initialize()

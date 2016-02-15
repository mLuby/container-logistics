const L = window.L
export default class Map {
  /*
   *  Initiates the map.
   *  When you initiate a Map, it renders a leaflet map inside divID.  Example usage: var map = new Map('mydivid');
   *  Important Note: please make sure to set the height of your div, otherwise the leaflet map will not display.
   *  @param {string} divID
   */
  constructor (divID) {
    this.map = this.createMap(divID)
    this.markerLayer = this.addMarkerLayerToMap(this.map)
    this.polylineLayer = this.addPolylineLayerToMap(this.map)
  }

  /*
   *  Adds a node to the map.
   *  @param: {Object} node
   *  @param: {float} node.latitude
   *  @param: {float} node.longitude
   *
   *  @param: {String} color - Either "green", "red", or "default"
   *  @param: {requestCallback} callbackFunction - This is called when the marker is clicked on.
   */
  addMarkerToMap (node, color, callbackFunction) {
    let icon

    if (color === "green") {
      icon = this.getGreenIcon()
    } else if (color === "red") {
      icon = this.getRedIcon()
    } else if (color === "default") {
      icon = null
    }

    if (icon) {
      L.marker([node.latitude, node.longitude], {icon}).addTo(this.markerLayer).on("click", callbackFunction)
    } else {
      L.marker([node.latitude, node.longitude]).addTo(this.markerLayer).on("click", callbackFunction)
    }
  }

  /*
   *  Adds an edge to the map.
   *  @param: {Object} node1
   *  @param: {float} node1.latitude
   *  @param: {float} node1.longitude
   *
   *  @param: {Object} node2
   *  @param: {float} node2.latitude
   *  @param: {float} node2.longitude
   *
   *  @param: {String} color - "red", "grey", "black", etc.
   */
  addEdgeToMap (node1, node2, color) {
    const latlngs = []
    const opacity = 0.4
    latlngs.push(L.latLng(node1.latitude, node1.longitude))
    latlngs.push(L.latLng(node2.latitude, node2.longitude))
    const polyline = L.polyline(latlngs, {color, opacity})
    this.polylineLayer.addLayer(polyline)
  }

  /*
  * Clears all markers on the map
  */
  clearMarkers () {
    this.markerLayer.clearLayers()
  }

  /*
  * Clears all edges on the map
  */
  clearEdges () {
    this.polylineLayer.clearLayers()
  }

  // PRIVATE METHODS, DON'T NEED TO USE THESE

  /*
  * Renders a map inside divID
  * @param {string} divID
  */
  createMap (divID) {
    const publicAccessToken = "pk.eyJ1IjoiZGllZ29jMSIsImEiOiJjaWoxbnZyNG0wMGMxdWFsemVmdHE1M3o0In0.31tbvIxDPX8z2rO368-E0Q"
    L.mapbox.accessToken = publicAccessToken
    const map = L.mapbox.map(divID, "mapbox.streets", {
      maxZoom: 4,
      minZoom: 4
    }).setView([43, -99], 3) // eslint-disable-line no-magic-numbers
    map.dragging.disable()
    return map
  }

  /*
  * Adds a layer for markers to map
  * @param {Leaflet Map} map
  */
  addMarkerLayerToMap (map) {
    return new L.LayerGroup().addTo(map)
  }

  /*
  * Adds a layer for edges to map
  * @param {Leaflet Map} map
  */
  addPolylineLayerToMap (map) {
    return new L.LayerGroup().addTo(map)
  }

  /*
  * Returns a red leaflet icon
  */
  getRedIcon () {
    const RedIcon = L.Icon.Default.extend({
      options: {
        iconUrl: "imgs/red-icon.png"
      }
    })
    return new RedIcon()
  }

  /*
  * Returns a green leaflet icon
  */
  getGreenIcon () {
    const GreenIcon = L.Icon.Default.extend({
      options: {
        iconUrl: "imgs/green-icon.png"
      }
    })
    return new GreenIcon()
  }
}

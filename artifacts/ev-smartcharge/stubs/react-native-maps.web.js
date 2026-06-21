// Web stub for react-native-maps — no-ops so the web bundle doesn't break
const React = require("react");
const { View } = require("react-native");

const MapView = React.forwardRef(function MapView({ children, style }, ref) {
  return React.createElement(View, { style }, children);
});

const Marker = function Marker() { return null; };
const Polyline = function Polyline() { return null; };
const Polygon = function Polygon() { return null; };
const Circle = function Circle() { return null; };
const Callout = function Callout() { return null; };
const UrlTile = function UrlTile() { return null; };
const Overlay = function Overlay() { return null; };

module.exports = MapView;
module.exports.default = MapView;
module.exports.Marker = Marker;
module.exports.Polyline = Polyline;
module.exports.Polygon = Polygon;
module.exports.Circle = Circle;
module.exports.Callout = Callout;
module.exports.UrlTile = UrlTile;
module.exports.Overlay = Overlay;
module.exports.PROVIDER_GOOGLE = "google";
module.exports.PROVIDER_DEFAULT = null;

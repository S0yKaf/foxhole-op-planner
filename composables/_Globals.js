export var canvas = new Canvas()
export var connection

export function set_connection(conn) {
    connection = conn
}

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const pixelToMeters = (pixels) => {
    return (1097/1024) * pixels
}

export const metersToPixels = (meters) => {
    return (1024/1097) * meters
}

export const smoothstep = (min, max, value) => {
    var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
    return x*x*(3 - 2*x);
  };

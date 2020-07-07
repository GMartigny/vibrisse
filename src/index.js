/* eslint-disable no-bitwise */

const defaultOptions = {
    precision: 2,
    frequency: 60,
};

const setPrecision = precision => x => +x.toFixed(precision);

const getXYZ = precision => ({ x, y, z }) => {
    const toPrecision = setPrecision(precision);
    return {
        x: toPrecision(x),
        y: toPrecision(y),
        z: toPrecision(z),
    };
};
const getQuaternion = precision => ({ quaternion }) => {
    const toPrecision = setPrecision(precision);
    const [x, y, z, w] = quaternion;
    return {
        x: toPrecision(x),
        y: toPrecision(y),
        z: toPrecision(z),
        w: toPrecision(w),
    };
};

function getValueXYZ (precision) {
    return getXYZ(precision)(this);
}
function getValueQuaternion (precision) {
    return getQuaternion(precision)(this);
}

/**
 * Read the gravity and its direction applied to the device
 */
class Orientation extends Accelerometer {
}
Orientation.prototype.getValue = getValueXYZ;

/**
 * Read the change in rotation momentum of the device
 */
class RadialAcceleration extends Gyroscope {
}
RadialAcceleration.prototype.getValue = getValueXYZ;

/**
 * Read the change in linear momentum of the device
 */
class LinearAcceleration extends LinearAccelerationSensor{
}
LinearAcceleration.prototype.getValue = getValueXYZ;

/**
 * Read the change in orientation relative to when the sensor is set up (quaternion)
 */
class RelativeOrientation extends RelativeOrientationSensor {
}
RelativeOrientation.prototype.getValue = getValueQuaternion;

/**
 * Read the change in orientation relative to the Earth reference (quaternion)
 */
class AbsoluteOrientation extends AbsoluteOrientationSensor {
}
AbsoluteOrientation.prototype.getValue = getValueQuaternion;

// class Compass extends Magnetometer {
// }
// Compass.prototype.getValue = getValueXYZ;

const available = [
    Orientation,
    RadialAcceleration,
    LinearAcceleration,
    RelativeOrientation,
    AbsoluteOrientation,
    // Compass,
];

const sensors = {};
available.forEach((api, index) => {
    sensors[api.name] = 2 ** index;
});

const checkPermissions = async () => {
    const result = {};
    await Promise.all([
        "accelerometer",
        "gyroscope",
        "magnetometer",
    ].map(name => navigator.permissions.query({
        name,
    }).then(({ state }) => result[name] = state)));
    return result;
};

/**
 * @typedef {Object} Options
 * @prop {Number} precision - Number of digits to appear after the decimal point (between 0 and 20)
 */
/**
 * Start reading requested sensor values
 * @param {Number} mask - List of required sensor to read
 * @param {Function} callback - Function called 60 times a second with read values
 * @param {Options} options - Some options
 * @return {Promise<{stop: stop}>}
 */
const listen = async (mask, callback, options) => {
    await checkPermissions();

    const { precision, frequency } = {
        ...defaultOptions,
        ...options,
    };

    const values = {};
    const readers = {};
    available.forEach((API) => {
        const key = sensors[API.name];
        if (mask & key) {
            values[key] = {};
            const reader = new API({
                frequency,
            });
            readers[key] = reader;
            reader.addEventListener("reading", () => {
                values[key] = reader.getValue(precision);
            });
            reader.addEventListener("error", ({ name, message }) => {
                values[key] = {
                    error: `${name}: ${message}`,
                };
            });
        }
    });
    let isLoop = false;
    const loop = (time = 0) => {
        if (isLoop) {
            requestAnimationFrame(loop);
        }
        values.time = time;
        callback(values);
    };

    return {
        /**
         * Start all sensors
         */
        start: () => {
            isLoop = true;
            Object.keys(readers).forEach(key => readers[key].start());
            loop();
        },

        readers,

        /**
         * Stop reading the sensors
         */
        stop: () => {
            isLoop = false;
            Object.keys(readers).forEach(key => readers[key].stop());
        },
    };
};

export {
    sensors,
    listen,
};

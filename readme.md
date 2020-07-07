# Vibrisse

[![Package version](https://flat.badgen.net/npm/v/vibrisse)](https://www.npmjs.com/package/vibrisse)

Swiftly read device spacial sensors


## Installation

    npm install vibrisse


## Usage

```js
import { listen, sensors } from "vibrisse";

const api = listen(sensors.RadialAcceleration + sensors.LinearAcceleration, (readings) => {
    const radial = readings[sensors.RadialAcceleration];
    const linear = readings[sensors.LinearAcceleration];
    // ...
});
api.start();

// Later
api.stop();
```


### Available sensors

 - `Orientation` - Read the gravity and its direction applied to the device
 - `RadialAcceleration` - Read the change in rotation momentum of the device
 - `LinearAcceleration` - Read the change in linear momentum of the device
 - `RelativeOrientation` - Read the change in orientation relative to when the sensor is set up (quaternion)
 - `AbsoluteOrientation` - Read the change in orientation relative to the Earth (quaternion)


## License

[MIT](license)

# RigidBit Interface

This is the primary web based interface for the RigidBit app.

## Prerequisites

Before developing on this application you should have working knowledge of the following technologies and toolchains:

* HTML 5 / CSS 3 / Javascript (ECMAScript 6)
* SASS (https://sass-lang.com/)
* Node.js (https://nodejs.org/en/docs/)
* Npm (https://www.npmjs.com/)
* Webpack (https://webpack.js.org/)

You should also have working experience with the following frameworks and libraries:

* React (https://reactjs.org/)
* MobX (https://mobx.js.org/)
* jQuery (http://jquery.com/)
* Router5 (https://router5.js.org/)
* Lodash (https://lodash.com/)

You must have the following installed in your development environment:

* Node.js (Via NVM is recommended: https://github.com/creationix/nvm#install-script)
* Npm (Automatically installed by nvm.)

## Setup

Enter the root directory and execute the following command to install all project depedencies and dev dependencies.

```
npm i
```

## Development

Use the following command to start the Webpack dev server.

```
npm start
```

If the RigidBit server is not on localhost, it can be specified manually. Load the RigidBit Interface in a web browser, then open the development console. Set the "baseUrl" cookie using the command below, replacing the IP address to your RigidBit server IP. Be sure to change the IP and port accordingly.

```
Cookies.set("baseUrl", "http://192.168.0.123:8000", { expires: 365 });
```

To restore default functionality, remove the baseUrl cookie using your browser's cookie manager, or use the command below in the development console.

```
Cookies.remove("baseUrl");
```

## Building

Use the following command to build the production HTML, JS, and CSS files without launching the server. This only needs to be done as a final step, and does not need to be done during development. The final files will be emitted to the `dist` directory. The contents of the dist directory can then be copied to the remote webserver.

```
npm run build
```
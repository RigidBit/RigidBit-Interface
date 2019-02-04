# RigidBit Interface

This is the primary web based interface that is built into the [RigidBit](https://github.com/RigidBit/RigidBit) application. 

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

You must have the following installed in your development environment to properly build:

* Node.js (Via NVM is recommended: https://github.com/creationix/nvm#install-script)
* Npm (Automatically installed by nvm.)

## Development Setup

Enter the root directory and execute the following command to install all project depedencies and dev dependencies.

```
npm i
```

## Developing

Use the following command to start the Webpack dev server. The viewing URL will be displayed, which can be opened in any supported web browser.

```
npm start
```

The dev server will present the interface, but it still requires a RigidBit server to function. The URL to a RigidBit server must be specified manually. Load the RigidBit Interface in a web browser, then open the development console. Set the "baseUrl" cookie using the command below, replacing the IP address to your RigidBit server IP. Be sure to change the IP and port or this will not work.

```
Cookies.set("baseUrl", "http://192.168.0.123:8000", { expires: 365 });
```

To restore default functionality, remove the baseUrl cookie using your browser's cookie manager, or use the command below in the development console.

```
Cookies.remove("baseUrl");
```

Note: Due to issues with CORS, using two different machines can cause problems with cookies. If you login successfully then get authentication errors, this is probably a cookie problem. The easiest work around is to enable single user mode on the server. The second work around is to setup subdomains for each host, such as `desktop.rigidbit.local` and `server.rigidbit.local`. Because they share `rigidbit.local` there shouldn't be a cookie issue. Setting up temporary subdomains can be done easily by [editing your hosts file](https://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/).

## Building

Use the following command to build the production files without launching the server. This only needs to be done as a final step, and does not need to be done during development. The final files will be emitted to the `dist` directory. The contents of the dist directory can then be copied into the main [RigidBit](https://github.com/RigidBit/RigidBit) application's `src/http/resources` directory so it can be built directly into the application when compiled.

```
npm run build
```

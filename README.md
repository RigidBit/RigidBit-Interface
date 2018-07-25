# RigidBit Interface

This is the repo for the primary web based interface for the RigidBit app.

## Prerequisites

Before developing on this application you should have working knowledge of the following:

* HTML 5 / CSS 3 / Javascript (ECMAScript 6)
* SASS (https://sass-lang.com/)
* Node.js (https://nodejs.org/en/docs/)
* Npm (https://www.npmjs.com/)

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

## Building

Use the following command to build the final dist/index.html file without launching the server. This only needs to be done as a final step, and does not need to be done during development.

```
npm run build
```
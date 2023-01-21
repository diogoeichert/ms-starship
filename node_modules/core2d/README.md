[![code style](https://img.shields.io/badge/code_style-classic-blue.svg)](http://diogoeichert.github.io/eslint-config-classic)
[![downloads](https://img.shields.io/npm/dt/core2d.svg)](https://www.npmjs.com/package/core2d)
[![license](https://img.shields.io/github/license/core2d/core2d.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/core2d.svg)](https://www.npmjs.com/package/core2d)

# core2d
Multiplatform 2D interaction engine

*"Everything should be made as simple as possible, but not simpler". - Albert Einstein*

Core2D is the powerhouse used by [Maragato マラガト](https://maragato.itch.io) titles, among others.

## Concept
Apps created with Core2D are made of one or more scenes, which may contain one or more sprites. That's it.

## Features
- collision detection: translated to events, to keep update logic clean
- image cache: assets and their transformations are reused automatically
- user input: human interaction is abstracted via controllers and pointers
- virtual resolution: internal geometry frees the app logic from displays

## Installing
### Node.js
```
npm install core2d
```
then
```
<script src="node_modules/core2d/core2d.js"></script>
<script src="node_modules/core2d/plugin.js"></script>
<script src="app.js"></script>
```

## Usage
- try the [skel](https://core2d.github.io/core2d/skel) app for a kick-start
- refer to [core2d.js](core2d.js) and [plugin.js](plugin.js) to see what the API is capable of

## Support
Please consider joining the [discussions](https://github.com/core2d/core2d/discussions) for collaboration and support.

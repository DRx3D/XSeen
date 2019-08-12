# XSeen Documentation

XSeen displays 3D content in a rectangular region on a web page. It does this by defining the region, declaring the content, effects, animation, and interaction. This version uses Three.js as the scene graph rendering engine. The XSeen region is treated by the browser like any other rectangular div on the page. Other page content can go in front or behind the XSeen content. 

XSeen also has the ability to use other features of the device including touch-screen, full-screen, camera, and orientation sensor. If a desired feature is not available, then XSeen gracefully degrades. Some features (e.g., camera) require user permission (active consent) before they can be used. 

XSeen is fully DOM integrated. This means that XSeen tags look and function like any other HTML tag. Changes to XSeen tags and/or attributes are immediately reflected in the display.

## Features
_coming soon_

## Getting Started
Getting started with XSeen is easy. It is necessary to include two JavaScript libraries and one CSS file. All XSeen tags are children of \<x-scene>. Any tags that are children of a non-XSeen tag are ignored. There is more information in the Getting Started guide.

## XSeen Tags
Each XSeen tag defines a component of the 3D environment. The components work together in the entire 3D scene to create the experience for the user. A scene usually requires a background, camera, and model. All of the tags and attributes are described in the [Tag manual](Tags.md).
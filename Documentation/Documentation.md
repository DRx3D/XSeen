# XSeen Documentation

XSeen displays 3D content in a rectangular region on a web page. It does this by defining the region, declaring the content, effects, animation, and interaction. This version uses Three.js as the scene graph rendering engine. The XSeen region is treated by the browser like any other rectangular div on the page. Other page content can go in front or behind the XSeen content. 

XSeen also has the ability to use other features of the device including touch-screen, full-screen, camera, and orientation sensor. If a desired feature is not available, then XSeen gracefully degrades. Some features (e.g., camera) require user permission (active consent) before they can be used. 

XSeen is fully DOM integrated. This means that XSeen tags look and function like any other HTML tag. 
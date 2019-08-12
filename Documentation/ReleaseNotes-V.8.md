# Release Notes
## V0.8
All items are prefixed 0.8.

_Mostly events and support W3C Immersive Web AR display concepts_

 45. Created new file ($.js) for general purpose tag support functions
 1. Added mutation support to 'group' tag
 1. Fixed 'animate delay="x" ...' to only introduce a delay on the initial animation
 1. Added support for group mutation in 'solids.js'
 1. Added support for 'emissive' color in 'solids.js'
 1. Cleaned up & refined splash screen placement
 1. Added camera and device normals to events
 1. Created XSeen drag (mousemove) event
 1. Improved support for device camera (see TODO note below) to match W3C Immersive Web concepts (full-screen)
 1. Multi-touch events
 1. Added methods to mark/unmark object as Active
 1. Disabled Orbit tracker if camera is not being used (mostly needed for device motion tracking)
 1. Added methods to enable/disable cursor/mouse event handling (needed for Gesture handling)
 1. Added method to perform Y-axis rotation
 1. Added new attribute to XSeen that lets the developer specify a tag for full-screen
 1. Added xseen-go event to indicate start of animation loop
 1. Revised control state button handling
 1. Added node to handle cubemaps as a resource
 1. Fixed camera controls bug. controls broken with 0.8.56
 1. Update 'model' and 'background' to use cubemaps with event handlers
 1. Added getVideoFrame method to XSeen
 1. Added events for asynchronous content loading (start, progress, complete, fail)
 1. Added reporting of LOAD events with tag attribute (in progress)
 1. Added ability to control logging from URL (?xseen_debug=<defined-level-string>)
 1. Added (CSS) animation to initial wait
 1. Added logging levels and cleaned up existing code debug statements
 1. Fixed timing condition with loading texture cubes for scene backgrounds

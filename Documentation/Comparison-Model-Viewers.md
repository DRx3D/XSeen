# Comparison of Model Viewers

Quick comparison guide between a number of different 3D model viewers made on 2019-06-19.

| Feature | XSeen | Google's Model Viewer | XRToolkit |
| ------- | ----- | --------------------- | --------- |
| Reference | https://xseen.org/ | https://github.com/GoogleWebComponents/model-viewer | https://github.com/XRTK/XRTK-Core |
| Language | JavaScript | JavaScript | C# |
| API | DOM | DOM | C#/Unity |
| Declarative | Yes | Yes | No |
| Multiple Models | Yes | No | Yes |
| Single-page Multiple Instances | No | Yes | N/A |
| Model Format | glTF, obj | glTF, GLB | See Unity |
| Gesture Control | custom with library | Built-in | See Unity |
| Platform | Web browser (with WebGL) | Web browser (WebGL) + ARCore | Unity |
| Lighting | Environment map, detailed scene lighting | Environment map, simple scene lighting | See Unity |
| Shadows | Not yet | Yes | See Unity |
| Camera Access | Yes with permission | Through SceneViewer | See Unity |
| Take Picture | Yes | No | See Unity |
| Model Animations | glTF built-in, rigid body | Single named built-in animation | See Unity |
| License | MIT, GPL | Apache | MIT |
| Renderer | THREE.js | THREE.js | Unity |
| AR Usage (Android) | Browser-based | Requires ARCore (SceneViewer app built-in) | See Unity |
| AR Usage (iOS) | Browser-based | Uses app with ARKit (requires USDZ model) | See Unity |
| Examples | tbd | tbd - https://googlewebcomponents.github.io/model-viewer/ | tbd |

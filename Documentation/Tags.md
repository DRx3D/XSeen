# XSeen Tags

XSeen tags fit into the following categories
* Scene Assets
* Background, Camera, and LIghts
* Models
* Animation
* Effects

A number of attributes appear in multiple tags. The same definition and functionality are used whenever the same attribute name is used.

## Scene Assets
Scene assets are loaded prior to anything else loading in the scene. They provide for reuse of assets minimizing download size and memory usage. The following are XSeen Asset Tags 
* scene
* asset
* cubemap
* class3d
* style3d


# Background, Camera, and LIghts
The camera tags provide a means to view the 3D scene. It and the background tag provide the primary means to control the user's experience. Most recent models use physically-based rendering (PBR). These models are light by environment maps. Older models and some scenes may need lighting. 
* background
* camera
* light


# Models
The standard model format is glTF. This format supports PBR, texturing, and animation. The OBJ format is also allowed, though it is a strictly geometry format without material. Also in this category are 2D surfaces and 3D solids. 
* model
* attribute
* box
* cone
* cylinder
* dodecahedron
* icosahedron
* octahedron
* sphere
* tetrahedron
* torus
* tknot
* plane
* ring
* triangles
* points
* normals
* material
* geometry
* group


# Animation
Rigid body movement is accomplished using the animate and key tags. This type of animation changes some property of an object according to a pre-defined path. The path is defined by a series of way-points. This is not model or character animation that moves bones with deformed skin. That would be built into the glTF model.
* animate
* key


# Effects
This is a collection of tags that support the display of 3D content but are not always used. 
* fog
* label
* leader
* metadata
* subscene

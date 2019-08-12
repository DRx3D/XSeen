# XSeen

XSeen is a framework for integrating and manipulating Declarative 3D scenes as HTML5 DOM elements, which are rendered via WebGL with THREE.js. The open-source system allows defining 3D scene description and runtime
behavior declaratively, without any low-level JavaScript or GLSL coding.


## Getting started

The original documentation is at http://tools.realism.com/specification/xseen. Starting with V0.8, the documentation is being moved to [Documentation](Documentation/Documentation.md) as part of the GitHub repo.

glTF models with animation (including deformed skin from joint animation) are supported and texture cubes are supported for all uses (backgrounds and environment maps. 

V0.8 now supports AR mode where the device camera (if available) is used as the background. The 3D content is "drawn" over the background.

The release code is in /Release
Release notes for each minor release
 
 * [0.6](Documentation/ReleaseNotes-V.6.md)
 * [0.7](Documentation/ReleaseNotes-V.7.md)
 * [0.8](Documentation/ReleaseNotes-V.8.md)


External libraries are kept for convenience in /ExternalLibraries. These can be updated
and replaced as needed. This directory includes
 * jquery-3.2.1.min.js -- from http://jquery.com/download/
 * three.js R89 -- from https://threejs.org/
 * Tween.js -- from https://github.com/tweenjs/tween.js


The _utils_ directory contains various utilities, including example loaders from THREE, including
 * GLTFLoader
 * GLTF2Loader
 * LoadManager

These may or may not be replaced in a future release. 


Three.js is used for all rendering and scene graph management. jQuery is only used to assist in the AJAX download of files

The XSeen license and copyrights do not apply to those files. They retain they copyright and license
as originally released at the above URLs.


XSeen runs as local files in Firefox. Other browsers may not allow local files to be loaded
at run-time. It can run as a client in any server environment (Python SimpleServer, Node.js. Apache, etc.).

## Next Release

0.9 will contain some major items to be released prior to the first standardized release. The biggest change will be preparation for the new tag prefix. XSeen will use the prefix 'xr-' for all tags. In V0.9, both 'x-' and 'xr-' will be supported with the 'x-' version being deprecated. After that 'x-' will only be supported as a conversion marker. Details will be providing during the release. 

In addition the following items are planned for the next release (0.9).

 1. Provide support for cubemap asset for all solid geometries
 1. Ensure compatibility between AR & VR modes
 1. Add speherical harmonic lighting
 1. Update to latest release of support libraries
 1. Remove dependency on jQuery
 1. Add audio
 1. Add SLAM (Simultanouse Locationization and Mapping)




Need help?
----------
This is not yet intended for anything but development. Please contribute using
the GitHub messaging or direct emails to the developer.


Mailing List
-------------
Not yet available


Issue Tracker
-------------
Please report issues and attach patches here. General help and questions can also be done through GitHub's comments and issue tracker.

https://github.com/DrX3D/XSeen/issues


**Uploading Files to the Issue Tracker**   
The GitHub issue tracker does not allow to upload files. However, there is a service that helps you with sharing files: https://gist.github.com. Just copy and paste your file contents there and then copy the Gist URL into the issues form.

It immensely helps us if you can provide a live web page illustrating your problem. So if you have webspace and can upload and post the URL with your issue, the chances we will have a look at it increase.


Contributing
------------
We encourage you to contribute to XSeen! Support will be coming soon.

You can send pull requests via GitHub. Patches should:

 1. Follow the style of the existing code.
 1. One commit should do exactly one thing.
 1. Commit messages should start with a summary line below 80 characters followed by a blank line, and then the reasoning/analysis for why the change was made (if appropriate).
 1. Commits that fix a bug in a previous commit (which has already been merged) should start with `fixup!` and then the summary line of the commit it fixes.
 1. Rebase your branch against the upstream’s master. We don’t want to pull redundant merge commits.
 1. **Be clear about what license applies to your patch:** The files within this repository are under the MIT or GPL3 (or later) but, as the original creators, we are still allowed to create non-free derivatives. However, if patches are given to us under GPL then those cannot make it into any non-free derivatives we may later wish to create. So to make it easier for us (and avoid any legal issues) we prefer if patches are released as public domain.


### GitHub Workflow

Developing patches should follow this workflow:

  1.  Fork on GitHub (click Fork button)
  1.  Clone to computer: `git clone git@github.com:«github account»/x3dom.git`
  1.  cd into your repo: `cd x3dom`
  1.  Set up remote upstream: `git remote add -f upstream git://github.com/DrX3d/XSeen.git`
  1.  Create a branch for the new feature: `git checkout -b my_new_feature`
  1.  Work on your feature, add and commit as usual. Creating a branch is not strictly necessary, but it makes it easy to delete your branch when the feature has been merged into upstream, diff your branch with the version that actually ended in upstream, and to submit pull requests for multiple features (branches).
  1.  Push branch to GitHub: `git push origin my_new_feature`
  1.  Issue pull request: Click Pull Request button on GitHub

#### Useful Commands

If a lot of changes have happened upstream you can replay your local changes on top of these, this is done with `rebase`, e.g.:

    git fetch upstream
    git rebase upstream/master

This will fetch changes and re-apply your commits on top of these.

This is generally better than merge, as it will give a clear picture of which commits are local to your branch. It will also “prune” any of your local commits if the same changes have been applied upstream.

You can use `-i` with `rebase` for an “interactive” rebase. This allows you to drop, re-arrange, merge, and reword commits, e.g.:

	git rebase -i upstream/master

[GPL 3]:         http://www.gnu.org/copyleft/gpl.html

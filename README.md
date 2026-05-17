![](/screenshots/logo_small.png)
# Texturinator
## A free web-based procedural texture and volume generation toolkit for volumetric rendering, terrain generation.

Currently focused on:
- Pseudo volume texture generation aka. 3D textures
- Terrain / erosion map generation

Originally started as a rework of the older Unity-based tool:
https://acetix.itch.io/pseudo-volume-generator

---

## Try the Live Version

https://texturinator.buttermilch-dev.de

---

# Features

## Volumetric Texture Generation

Generate pseudo volume textures (3D texture atlases) for:
- Volumetric clouds
- Nebulae
- Fog
- Smoke
- Raymarching shaders

These textures can be used in:
- Unity
- Unreal Engine
- Godot
- Custom OpenGL/WebGPU/WebGL renderers

### Example

[![Volumetric raymarching example](https://img.youtube.com/vi/i6RR4T7nzuU/0.jpg)](https://www.youtube.com/watch?v=i6RR4T7nzuU)

Generates these textures           |  Used for rendering volumes
:-------------------------:|:-------------------------:
![](/screenshots/3d-volumes/texture_example.png)  |  ![](/screenshots/3d-volumes/volume_preview.png)

---

## Terrain & Erosion Generation

The project now also includes terrain and erosion texture generation based on the work of Rune Skovbo Johansen:

https://blog.runevision.com/2026/03/fast-and-gorgeous-erosion-filter.html

Used for generating height/erosion maps

### Example
![](/screenshots/terrain-generator/map.png)

---

# Project Goals

The long-term goal is to turn this into a modular procedural graphics toolkit for:
- Volumetrics
- Terrain generation
- Procedural textures
- Shader authoring workflows
- Technical art pipelines

---

# Contributions

Feel free to create issues or PRs if you have:
- ideas
- feature requests
- bug reports
- optimization improvements
- rendering experiments

Contributions are always welcome.

---
## Angular setup

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# CALL OF SPACE

<<<<<<< HEAD
**YOUR MISSION. YOUR DECISIONS. YOUR UNIVERSE.**

CALL OF SPACE is an interactive educational space-mission simulator
designed to make space exploration and mission planning more accessible
through hands-on gameplay.

Players take the role of mission commanders and experience key stages of
a space mission, from choosing objectives and preparing a spacecraft to
launch, navigation, and exploration.

> **Project status:** This repository describes the project vision and
> development direction. Features and integrations should only be
> presented as complete when they are implemented and tested in the
> current build.

## Overview

Space missions involve complex decisions about spacecraft design,
equipment, fuel, energy, communication, navigation, and mission
objectives. CALL OF SPACE aims to turn these concepts into an
interactive learning experience.

The project is designed to help players explore the principles behind
space missions by making decisions, managing limited resources, and
learning from the consequences.

## Planned Gameplay

The intended mission workflow includes:

1.  **Mission selection** --- choose a destination and define mission
    objectives.
2.  **Spacecraft configuration** --- select a spacecraft and equip it
    for the mission.
3.  **Pre-flight inspection** --- review essential systems before
    launch.
4.  **Launch** --- initiate the launch sequence and manage the ascent.
5.  **Flight and navigation** --- control the spacecraft manually or use
    assisted/automatic piloting where available.
6.  **Exploration** --- reach the destination and carry out mission
    activities.
7.  **Mission review** --- evaluate the outcome and the decisions made
    during the mission.

Potential destinations include the Moon, Mars, asteroids, and other
celestial bodies as the simulation develops.

## Educational Goals

CALL OF SPACE aims to introduce and reinforce concepts such as:

-   Rocket propulsion and launch procedures
-   Orbital mechanics and spacecraft navigation
-   Spacecraft systems and engineering
-   Mission planning and decision-making
-   Resource management, including fuel, oxygen, and energy
-   Scientific exploration and problem-solving

## Technology

The current development environment includes:

-   **React**
-   **JavaScript**
-   **Vite**
-   **Node.js**
-   **npm**
-   **Cursor** for AI-assisted development

Additional 3D and simulation technologies may be introduced as
development progresses. Their use should be documented here once they
are integrated into the project.

## Run Locally

Make sure Node.js and npm are installed.

1.  Clone the repository:

    ``` bash
    git clone <REPOSITORY_URL>
    ```

2.  Open the project folder:

    ``` bash
    cd <PROJECT_FOLDER>
    ```

3.  Install dependencies:

    ``` bash
    npm install
    ```

4.  Start the development server:

    ``` bash
    npm run dev
    ```

5.  Open the local URL shown in the terminal (usually
    `http://localhost:5173/`).

If the project uses a different port, use the URL printed by Vite.

## NASA Data and Resources

NASA resources were researched as potential sources of scientific
information and visual assets relevant to the project. The following
official resources were identified:

  ----------------------------------------------------------------------------------------
  Resource                Potential relevance     Official link
  ----------------------- ----------------------- ----------------------------------------
  NASA 3D Resources       3D models of            https://science.nasa.gov/3d-resources/
                          spacecraft, rockets,    
                          planets, and other      
                          space-related objects   

  NASA Image and Video    NASA photographs,       https://images.nasa.gov/
  Library                 videos, and mission     
                          imagery                 

  NASA Open APIs          Scientific data that    https://api.nasa.gov/
                          may support interactive 
                          features                

  NASA/JPL Horizons       Celestial body          https://ssd.jpl.nasa.gov/horizons/
                          positions and           
                          trajectory information  
  ----------------------------------------------------------------------------------------

**Transparency note:** Listing a resource here does not, by itself, mean
it has been integrated into the current build. Before describing any
NASA resource as used in the submitted project, the team must verify
that the corresponding data, model, image, or API is actually
incorporated and document where and how it is used. Follow the relevant
NASA usage and attribution requirements.

## Project Roadmap

The following are development goals and should not be interpreted as
completed features unless demonstrated in the current version:

-   Expand mission types and destinations
-   Improve spacecraft systems and resource-management mechanics
-   Refine manual, assisted, and automatic flight controls
-   Improve 3D spacecraft, planetary environments, and visual effects
-   Explore support for mobile devices and Virtual Reality (VR)
-   Integrate verified NASA data and resources into relevant gameplay
    systems

## Contributing

CALL OF SPACE is a team project. Contributions, suggestions, and
feedback that improve the educational value, usability, scientific
accuracy, and technical quality of the simulation are welcome.

Before contributing, discuss significant changes with the project team
and avoid committing secrets, API keys, personal data, or local
environment files.

## Credits and Acknowledgements

We acknowledge NASA and the Jet Propulsion Laboratory for making
scientific information, imagery, and other educational resources
publicly accessible. Any specific asset or dataset used in the project
should be credited individually according to its source and applicable
usage terms.

## Team

**Project:** CALL OF SPACE\
**Tagline:** YOUR MISSION. YOUR DECISIONS. YOUR UNIVERSE.

Add your team members, contact information, demo link, and project
website here.

## License

No license has been specified yet. Until the team selects and adds a
license, do not assume that this repository is open for reuse,
modification, or redistribution.
=======
Educational mission-design game for NASA Space Apps Challenge 2026. Local demo, no account required.

```bash
npm install
npm run dev
```

Open the printed local URL. Choose a language, enter the demo, and use **Load lunar training design** if you want the jury path. Fly with the sliders or W/S (thrust) and A/D (pitch).

`npm run sim` checks that the training rocket passes the lunar checklist and that a scripted pilot can arrive.

## What is real NASA data

No Challenge 13 resource pack was in the project folder. These records were retrieved directly on 14 Nov 2026 and are listed in the in-app NASA data page:

- JPL Horizons Moon (301) and Mars (499), geometric range from Earth (399), plus the Moon radius and surface gravity from the Horizons body header. Fallback: `public/data/nasa-cache.json`.
- JPL Small-Body Mission Design sample for 2012 TC4 (one low departure-v-infinity option).
- JPL Small-Body Database for 2012 TC4: Apollo orbit, a 1.62 au, e 0.404, period 753 d, H 26.71. Saved response: `public/data/sbdb-2012tc4.json`.
- NASA Image and Video Library photographs, copied into `public/assets/` and listed in `public/assets/SOURCES.md`: as11-40-5874, s130e009953, PIA00122, PIA00407. The same files remain in `public/nasa/`.

Rocket mass, cost, and thrust are gameplay values. The 3D planets are colored meshes, not those photographs. GMAT, NTRS, and NASA 3D models are not integrated. Supabase, WebRTC, LiveKit, and VR are not configured.

## Simulation assumptions

Powered flight is integrated at 8× so a launch fits a demonstration. Propellant flow follows real seconds. One correction burn stands in for a multi-day transfer. The rocket equation uses standard gravity 9.80665 m/s². This is not a certified flight simulator.
>>>>>>> 6e0b834 (Premier commit : Space Challenge 2)

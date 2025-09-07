# Hexagon Physics Simulation Game

🌐 [中文](README.md) | **English**

A real-time physics simulation demo based on modern web technologies, showcasing the physical motion of balls within a rotating hexagonal container.

## 🎮 Game Features

### Core Functionality
- **Rotating Hexagonal Container**: Visual regular hexagonal container that can continuously rotate around its center
- **Physics Balls**: Balls with complete physical properties including gravity, friction, and elasticity
- **Precise Collision Detection**: Accurate collision detection with all six sides of the hexagon
- **Real-time Physics Simulation**: Smooth 60fps physics calculations and rendering

### Physics Properties
- ✅ **Gravity System**: Adjustable downward gravity acceleration
- ✅ **Friction**: Affects the motion decay of the ball
- ✅ **Elastic Collision**: Adjustable elasticity coefficient to control energy retention after collision
- ✅ **Air Resistance**: Simulates realistic air resistance effects
- ✅ **Speed Limit**: Maximum speed limit to prevent physics calculation overflow

### Visual Effects
- 🎨 **Modern UI Design**: Dark theme with gradient colors
- 🌟 **Trail Tracking**: Displays the ball's motion path
- 💫 **Particle Effects**: Balls with gradient and highlight effects
- 📱 **Responsive Design**: Adapts to different screen sizes

## 🛠️ Technical Implementation

### Tech Stack
- **Frontend Framework**: Preact (lightweight React alternative)
- **Build Tool**: Vite (fast development and building)
- **Language**: TypeScript (type safety)
- **Rendering**: Canvas 2D API (high-performance graphics rendering)
- **Styling**: CSS3 (modern styling and animations)

### Core Algorithms
- **Vector Mathematics**: Complete 2D vector operation library
- **Collision Detection**: Precise collision algorithm between points and line segments
- **Physics Simulation**: Motion calculation based on Newtonian mechanics
- **Coordinate Transformation**: Normal vector calculation in rotating coordinate system

### Architecture Design
```
src/
├── utils/
│   ├── Vector2D.ts      # 2D vector mathematics library
│   ├── Physics.ts       # Physics engine core
│   ├── Hexagon.ts       # Hexagonal geometry calculations
│   ├── Ball.ts          # Ball entity class
│   └── GameEngine.ts    # Game engine and rendering system
├── components/
│   ├── ControlPanel.tsx # Control panel component
│   └── HexagonGame.tsx  # Main game component
├── app.tsx              # Application entry
├── app.css              # Game styles
└── index.css            # Global styles
```

## 🎯 Operation Instructions

### Basic Controls
- **Mouse Click**: Click inside the hexagon to relocate the ball
- **Spacebar**: Pause/resume the game
- **R Key**: Reset game state

### Parameter Adjustment
Real-time adjustment through the right control panel:

#### Physics Parameters
- **Gravity**: Adjust gravity acceleration (0-1000)
- **Friction**: Adjust friction coefficient (0.9-1.0)
- **Elasticity**: Adjust energy retention after collision (0-1.0)
- **Air Resistance**: Adjust air resistance coefficient (0.99-1.0)
- **Max Speed**: Limit the ball's maximum speed (100-2000)

#### Hexagon Control
- **Rotation Speed**: Adjust hexagon rotation speed (-2 to 2 radians/second)

#### Ball Settings
- **Radius**: Adjust ball size (5-30 pixels)
- **Mass**: Adjust ball mass (0.1-5.0)
- **Color**: Customize ball color
- **Trail Length**: Adjust trail display length (0-100)
- **Show Trail**: Toggle trail display

## 🚀 Quick Start

### Requirements
- Node.js 16+ 
- npm or pnpm

### Installation and Running
```bash
# Clone the project
git clone https://github.com/zym9863/Preact-Hexagon.git
cd Preact-Hexagon

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev

# Build production version
npm run build
# or
pnpm build
```

### Access Application
After the development server starts, visit `http://localhost:5173/` in your browser

## 🔬 Physics Principles

### Collision Detection Algorithm
1. **Point to Line Segment Distance Calculation**: Use vector projection to calculate the shortest distance from ball center to hexagon edges
2. **Normal Vector Calculation**: Calculate correct normal vectors based on the current rotation angle of the hexagon
3. **Penetration Detection**: Detect if the ball has penetrated the hexagon boundary
4. **Position Correction**: Push the ball out of the collision area

### Physics Force Calculation
1. **Gravity**: Constant downward acceleration
2. **Friction**: Resistance proportional to velocity
3. **Air Resistance**: Square term resistance of velocity
4. **Elastic Collision**: Rebound calculation based on momentum conservation

### Numerical Integration
Use Euler integration method to update object position and velocity:
```
velocity = velocity + acceleration * deltaTime
position = position + velocity * deltaTime
```

## 🎨 Customization and Extension

### Adding New Physics Effects
1. Add new force calculation methods in `Physics.ts`
2. Apply new forces in the update loop of `GameEngine.ts`
3. Add corresponding control interfaces in `ControlPanel.tsx`

### Modifying Rendering Effects
1. Modify ball rendering methods in `Ball.ts`
2. Modify hexagon rendering styles in `Hexagon.ts`
3. Adjust UI styles in `app.css`

### Performance Optimization Suggestions
- Use `requestAnimationFrame` for smooth rendering
- Limit `deltaTime` to avoid large time jumps
- Use object pooling to reduce garbage collection
- Optimize computational complexity of collision detection algorithms

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📞 Contact

For questions or suggestions, please contact through GitHub Issues.
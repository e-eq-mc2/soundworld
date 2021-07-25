var Matter = require("matter-js")
var Engine     = Matter.Engine,
    Events     = Matter.Events,
    Runner     = Matter.Runner,
    Render     = Matter.Render,
    World      = Matter.World,
    Body       = Matter.Body,
    Mouse      = Matter.Mouse,
    Common     = Matter.Common,
    Composites = Matter.Composites,
    Composite  = Matter.Composite,
    Bodies     = Matter.Bodies;

var Font  = require("./font.js")
var Colormap = require("./lib/colormap.js")
import {fontSVG} from "./font_svg.js"

// create engine
var engine = Engine.create();
var world = engine.world;

engine.constraintIterations = 1
engine.positionIterations = 1
engine.velocityIterations = 1

const worldWidth  = document.documentElement.clientWidth
const worldHeight = document.documentElement.clientHeight

// create renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: worldWidth,
    height: worldHeight,
    wireframes: false,
    background: '#000000',
    pixelRatio: 'auto'
  }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// add bodies
const wallStyle = { fillStyle: '#222' };
const wallThickness = 20;

Composite.add(world, [
  Bodies.rectangle(worldWidth/2,             0,    worldWidth, wallThickness, { isStatic: true, render: wallStyle, collisionFilter: {'group':  0, 'category': 2, 'mask': 4} }),
  Bodies.rectangle(worldWidth/2,   worldHeight,    worldWidth, wallThickness, { isStatic: true, render: wallStyle, collisionFilter: {'group':  0, 'category': 2, 'mask': 4} }),
  Bodies.rectangle(  worldWidth, worldHeight/2, wallThickness,   worldHeight, { isStatic: true, render: wallStyle, collisionFilter: {'group':  0, 'category': 2, 'mask': 4} }),
  Bodies.rectangle(           0, worldHeight/2, wallThickness,   worldHeight, { isStatic: true, render: wallStyle, collisionFilter: {'group':  0, 'category': 2, 'mask': 4} })
]);

// create a body with an attractor
world.gravity.scale = 0.0;

const attract = function(bodyA, bodyB) {
  return {
    x: (bodyA.position.x - bodyB.position.x) * 3.5e-7,
    y: (bodyA.position.y - bodyB.position.y) * 3.5e-7
  }
}

var attractiveBody = Bodies.circle(
	render.options.width / 2,
	render.options.height / 2,
	0.001, 
	{
		isStatic: true,
	}
);

World.add(world, attractiveBody);

var attraction = function(engine) {
  var bodies = Composite.allBodies(engine.world);

  for (var i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if ( body.isStatic ) continue;

    Body.applyForce(body, body.position, attract(attractiveBody, body));
  }
};

var explosion = function(engine) {
  var bodies = Composite.allBodies(engine.world);

  const abx = attractiveBody.position.x;
  const aby = attractiveBody.position.y;

  for (var i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if ( body.isStatic ) continue;

    const dx = body.position.x - abx;
    const dy = body.position.y - aby;
    const invl = 1.0 / (dx * dx + dy * dy) ** 0.5;

    const forceMagnitude = 4.0e-2 * body.mass ;

    Body.applyForce(body, body.position, {
      x: forceMagnitude * dx * invl, 
      y: forceMagnitude * dy * invl
    });
  }
};

var fadeout = function(engine) {
  var bodies = Composite.allBodies(engine.world);

  for (var i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if ( body.isStatic ) continue;

    if ( body.render.opacity < 0.05 ) Composite.remove(world, body)
    body.render.opacity -= 0.005
  }
};

const timeScaleTargetMax = 0.7;
const timeScaleTargetMin = 0.1;
var timeScaleTarget = timeScaleTargetMax;
var counter = 0;

Events.on(engine, 'afterUpdate', function(event) {
  // tween the timescale for bullet time slow-mo
  engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 0.08;
  counter += 1;

  fadeout(engine)

  //console.log(`counter: ${counter} timeScale: ${engine.timing.timeScale} timeScaleTarget: ${timeScaleTarget}`);
  // every 1.5 sec
  if (counter >= 60 * 1) {

    // flip the timescale
    if (timeScaleTarget < timeScaleTargetMax) {
      timeScaleTarget = timeScaleTargetMax;
    } else {
      timeScaleTarget = timeScaleTargetMin;
    }

    // create some random forces
    explosion(engine);

    // reset counter
    counter = 0;
  } else{
    //attraction(engine)
  }
});

const maxBodies = 2300
function add_word(words, font, world, render) {

  const numBodies = Composite.allBodies(engine.world).length;
  console.log(`num bodies: ${numBodies} (max: ${maxBodies})`)
  if ( numBodies >  maxBodies ) return

  const numw  = words.length
  const inv   = Math.pow(numw, 1.0/2)
  const scale = 600 / inv

  const nump = Math.round( 150 / inv )
  const maxr = 10 / inv
  const clist = ['blue', 'aqua', 'green', 'red', 'purple', 'mix']
  //const clist = ['blue2', 'aqua2', 'green2', 'red2', 'purple2', 'mix2']
  for (var i = 0; i < numw; i++) {
    const word = words.charAt(i)
    const offx = Common.random(scale/2, render.options.width - scale/2)
    const offy = Common.random(scale/2, render.options.height - scale/2)

    colormap.set(Common.choose(clist))

    font.travase(word, nump, (x, y) => {
      const xx = ( x - 0.5 ) * scale + offx
      const yy = ( y - 0.5 ) * scale + offy
      const rr = Common.random(1, maxr)
      const cc = colormap.choose()
      const point = Bodies.circle(xx, yy, rr, {
        mass: 1.0e-5,
        inertia: Infinity, 
        restitution: 1, 
        friction: 0, 
        frictionAir: 0.0001, 
        slop: 1, 
        render: {fillStyle: cc}
      });

      // turns off collisions
      point.collisionFilter = {
        'group':  1,
        'category': 4,
        'mask': 2,
      }

      World.add(world, point);
    })
  }
}

const colormap = new Colormap('red')
const font = new Font(10, 10)
font.parse(fontSVG)

window.api.on((words) => {
  console.log(`Detected: ${words}`)
  add_word(words, font, world, render)

})

// add mouse control
var mouse = Mouse.create(render.canvas);

Events.on(engine, 'afterUpdate', function() {
	if ( ! mouse.position.x ) return

	// smoothly move the attractor body towards the mouse
	Body.translate(attractiveBody, {
		x: (mouse.position.x - attractiveBody.position.x) * 0.25,
		y: (mouse.position.y - attractiveBody.position.y) * 0.25
	});
});

//looks for key presses and logs them
document.body.addEventListener("keydown", function(e) {
  console.log(`keydown: ${e.code}`);

  switch(e.code) {
    case 'KeyA':
      add_word("あ", font, world, render)
      break;
    case 'KeyI':
      add_word("い", font, world, render)
      break;
    case 'KeyU':
      add_word("う", font, world, render)
      break;
    case 'KeyE':
      add_word("え", font, world, render)
      break;
    case 'KeyO':
      add_word("お", font, world, render)
      break;
    case 'KeyQ':
      add_word("？", font, world, render)
      break;
    case 'Digit0':
      colormap.set('black')
      break
    case 'Digit1':
      colormap.set('white')
      break
    case 'Digit2':
      colormap.set('binary')
      break
    case 'Digit3':
      colormap.set('blue')
      break
    case 'Digit4':
      colormap.set('aqua')
      break
    case 'Digit5':
      colormap.set('green')
      break
    case 'Digit6':
      colormap.set('yellow')
      break
    case 'Digit7':
      colormap.set('red')
      break
    case 'Digit8':
      colormap.set('rose')
      break
    case 'Digit9':
      colormap.set('purple')
      break
   case 'KeyM':
      colormap.set('mix')
      break
    default:
      break
  }
});
document.body.addEventListener("keyup", function(e) { });

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: worldWidth, y: worldHeight }
});



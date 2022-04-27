//import './style.css'

import * as THREE from './three.module.js';
//import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
//import * as THREE from './vendor/three/build/three.module.js';
//import { Color } from 'three';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/TrackballControls.js';
//import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three-trackballcontrols@0.9.0/index.min.js'
import { FontLoader } from "./FontLoader.js";
import { TextGeometry } from "./TextGeometry.js";
import { SVGLoader } from "./SVGLoader.js"
import { GLTFLoader } from "./GLTFLoader.js"
import { TWEEN } from './Tween.js';
import { DragControls } from './DragControls.js';

var container = document.getElementById('container'),
    containerWidth, containerHeight,
    renderer,
    scene,
    camera,
    cubes,
    geom,
    range = 50,
    mouseVector,
    raycaster,
    axes,
    controls;

containerWidth = window.innerWidth;
containerHeight = window.innerHeight;



const AU = 150; // 1 Astronomical Unit = 149 597 871 kilometers

const MOON_DISTFROM_EARTH_UA = 0.00267;
const EARTH_DISTFROM_SUN_UA = 1;
const MERCURY_DISTFROM_SUN_UA = 0.39;
const VENUS_DISTFROM_SUN_UA = 0.72;
const MARS_DISTFROM_SUN_UA = 1.52;
const JUPYTER_DISTFROM_SUN_UA = 5.2;
const SATURN_DISTFROM_SUN_UA = 9.53;
const URANUS_DISTFROM_SUN_UA = 19.1;
const NEPTUNO_DISTFROM_SUN_UA = 30.0;

/*
Mercury – 1,516mi (2,440km) radius; about 1/3 the size of Earth
Venus – 3,760mi (6,052km) radius; only slightly smaller than Earth
Earth – 3,959mi (6,371km) radius
Mars – 2,106mi (3,390km) radius; about half the size of Earth
Jupiter – 43,441mi (69,911km) radius; 11x Earth’s size
Saturn – 36,184mi (58,232km) radius; 9x larger than Earth
Uranus – 15,759mi (25,362km) radius; 4x Earth’s size
Neptune – 15,299mi (24,622km) radius; only slightly smaller than Uranus
*/
const SUN_Radius = 69.5;                         // 695 500 KM
const EARTH__Radius = 0.01 * SUN_Radius;        //   6 371 km (0.00916031631919482386772106398275 * SUN_Radius)
const MOON_Radius = 0.273 * EARTH__Radius;                    //   1 738 KM (0.27279861874117093078009731596296 * Earth_Radius)

const MERCURY__Radius = 0.33 * EARTH__Radius;
const VENUS__Radius = 0.92 * EARTH__Radius;
const MARS__Radius = 0.55 * EARTH__Radius;
const JUPYTER__Radius = 11 * EARTH__Radius;
const SATURN__Radius = 9 * EARTH__Radius;
const URANUS__Radius = 4 * EARTH__Radius;
const NEPTUNO__Radius = 3.92 * EARTH__Radius;

const SATURN__Radius_KM = 58232; //58,232 km
const SATURN__Inner_Ring_Distance_From_Saturn_Center = 74510; // 74510 km
const SATURN__Outer_Ring_Distance_From_Saturn_Center = 154000; //154000 km - Janus/Epimetheus Ring
const SATURN__Inner_Ring_Radius_Coefficient = SATURN__Inner_Ring_Distance_From_Saturn_Center / SATURN__Radius_KM;
const SATURN__Outer_Ring_Radius_Coefficient = SATURN__Outer_Ring_Distance_From_Saturn_Center / SATURN__Radius_KM;

const URANUS__Radius_KM = 25367; //25,368 km
const URANUS__Inner_Ring_Distance_From_Uranus_Center = 26837; // 41837 km - Ring 6
const URANUS__Inner_Ring_Distance_From_Uranus_Center_Visible = 47175 //47 175 km - Ring Eta
const URANUS__Outer_Ring_Distance_From_Uranus_Center = 51149; //103000 51149 km - Ring Epsilon
const URANUS__Inner_Ring_Radius_Coefficient = URANUS__Inner_Ring_Distance_From_Uranus_Center / URANUS__Radius_KM;
const URANUS__Outer_Ring_Radius_Coefficient = URANUS__Outer_Ring_Distance_From_Uranus_Center / URANUS__Radius_KM;
/*
Orbital velocities of the Planets[6]
Planet	Orbital
velocity
Mercury	47.9 km/s
Venus	35.0 km/s
Earth	29.8 km/s
Mars	24.1 km/s
Jupiter	13.1 km/s
Saturn	9.7 km/s
Uranus	6.8 km/s
Neptune	5.4 km/s

Moon 0.97–1.08 km/s
*/

const PLANET__Speed_Constant = 1 / 10;
const MOON__Speed = 1.08 * PLANET__Speed_Constant;

const MERCURY__Speed = 47.9 * PLANET__Speed_Constant;
const VENUS__Speed = 35.0 * PLANET__Speed_Constant;
const MARS__Speed = 29.8 * PLANET__Speed_Constant;
const JUPYTER__Speed = 24.1 * PLANET__Speed_Constant;
const SATURN__Speed = 9.7 * PLANET__Speed_Constant;
const URANUS__Speed = 6.8 * PLANET__Speed_Constant;
const NEPTUNO__Speed = 5.4 * PLANET__Speed_Constant;


const planets = new THREE.Object3D();
//let INTERSECTED;

scene = new THREE.Scene();

scene.add(planets);

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);

renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(200);
camera.position.setX(-50);
camera.position.setY(70);



const loadingManager = new THREE.LoadingManager();
//scene.add(loadingManager);

const progressBar = document.getElementById('progress-bar');

loadingManager.onStart = function (url, loaded, total) {
    const progressBarContainer = document.querySelector('#bg');
    progressBarContainer.style.visibility = 'hidden';
    console.log("Starting loading");
}

loadingManager.onProgress = function (url, loaded, total) {
    progressBar.value = (loaded / total) * 100;
    console.log(progressBar.value);
    //canvas.visible = false;
}

loadingManager.onLoad = function (url, loaded, total) {
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const canvas = document.querySelector('#bg');
    //const mouseTrail = document.querySelectorAll('.trail')
    //mouseTrail.style.visibility = 'visible';
    //
    //progressBar.style.backgroundColor = 'red';
    setTimeout(function () {
        canvas.style.visibility = 'visible';
        progressBarContainer.style.visibility = 'hidden';
    }, 5000)

    console.log("Done");
    //canvas.visible = false;
}





//renderer.render( scene, camera );
let animateLoop_id;

//
raycaster = new THREE.Raycaster();
mouseVector = new THREE.Vector2();

// User interaction
//window.addEventListener( 'pointermove', onMouseMove, false );
window.addEventListener("pointerdown", onClickDown, false);
window.addEventListener("pointerup", onClickUp, false);
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keydown', onkeydown, false);
window.addEventListener('keyup', onkeyup, false);

controls = new TrackballControls(camera, renderer.domElement);
controls.zoomSpeed = 0.1;
//
let mesh;

function onkeydown(event) {
    const keyName = event.key;
    //console.log(event.key);
    if (keyName === ' ') {
        console.log("Space dog");
        cancelAnimationFrame(animateLoop_id);
    }
    if (keyName === '1') {
        console.log("1");
        droid_batallion_0.visible = true;
        //cancelAnimationFrame(animateLoop_id);
    }
    if (keyName === '2') {
        console.log("2");
        droid_batallion_1.visible = true;
        //cancelAnimationFrame(animateLoop_id);
    }
    if (keyName === '3') {
        console.log("3");
        droid_batallion_2.visible = true;
        //cancelAnimationFrame(animateLoop_id);
    }
    if (keyName === '4') {
        console.log("4");
        droid_batallion_3.visible = true;
        //cancelAnimationFrame(animateLoop_id);
    }
    if (keyName === '5') {
        console.log("5");
        animate3D(droid_animation_mixer);
        //cancelAnimationFrame(animateLoop_id);
    }


}

function onkeyup(event) {
    const keyName = event.key;
    //console.log(event.key);
    if (keyName === ' ') {
        console.log("Space dog");
        animate();
    }
}

function onClickUp(e) {
    let INTERSECTED;
    console.log("ClickUp");
    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * (e.clientY / containerHeight);

    raycaster.setFromCamera(mouseVector, camera);

    /*
    var intersects = raycaster.intersectObjects( planets.children );
    
    planets.children.forEach(function( planet ) {
        //cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
        planet.radius *= 2;
    });
    */
    const intersects = raycaster.intersectObjects(planets.children, false);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.scale.set(2, 2, 2);

            INTERSECTED = intersects[0].object;
            //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.scale.set(1, 1, 1);
            scene.remove(mesh);
        }

    } else {

        if (INTERSECTED) INTERSECTED.scale.set(2, 2, 2);

        INTERSECTED = null;

    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

/*  
createText("text", true, false, -10, 10, 0); 
setTimeout(function(){
       scene.add(mesh);
}, 10000);
console.log("waiting a min...");
   
setTimeout(function(){
    console.log("done");
    scene.remove(mesh);
}, 20000);
*/

function createText(text, add_to_scene, remove_from_scene, x, y, z) {
    var loader = new FontLoader(loadingManager);

    loader.load('./fonts/helvetiker_regular.typeface.json', function (font) {

        var textGeo = new TextGeometry(text, {

            font: font,
            size: 20,
            height: 10
        });

        var textMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        mesh = new THREE.Mesh(textGeo, textMaterial);
        //console.log(sun.position.x);
        mesh.position.set(x, y, z);

        //scene.add( mesh );

    });
    /*
    console.log("waiting a min...");
    scene.add(mesh);
    sleep(20000);
    console.log("done");
    scene.remove(mesh);
*/
    //code before the pause
    /*
    console.log("waiting a min...");
    scene.add(mesh);
    setTimeout(function(){
        console.log("done");
        scene.remove(mesh);
    }, 20000);
    */
    /*
    if(add_to_scene == true)
    {
        scene.add(mesh);
    } 	
    else if(remove_from_scene == true)
    {
        scene.remove(mesh);
    }*/
}

function onClickDown(e) {
    let INTERSECTED;
    console.log("ClickDown");

    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * (e.clientY / containerHeight);

    raycaster.setFromCamera(mouseVector, camera);

    //scene.add(mesh);
    /*
    var intersects = raycaster.intersectObjects( planets.children );
    
    planets.children.forEach(function( planet ) {
        //cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
        planet.radius *= 2;
    });
    */
    const intersects = raycaster.intersectObjects(planets.children, false);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);

            INTERSECTED = intersects[0].object;
            //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.scale.set(2, 2, 2);
            //createText("text", true, false, -10, 10, 0);  
        }

    } else {

        if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);

        INTERSECTED = null;

    }

}


function onMouseMove(e) {
    let INTERSECTED;
    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * (e.clientY / containerHeight);

    raycaster.setFromCamera(mouseVector, camera);

    //var intersects = raycaster.intersectObjects( planets.children, false );
    //var raycaster = projector.pickingRay( mouseVector.clone(), camera ),
    //intersects = raycaster.intersectObjects( cubes.children );

    //cubes.children.forEach(function( cube ) {
    //    cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
    //});
    /*
    planets.children.forEach(function( planet ) {
        //cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
        planet.position.x += 0.1;
    });*/
    const intersects = raycaster.intersectObjects(planets.children, false);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);

            INTERSECTED = intersects[0].object;
            //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.scale.set(2, 2, 2);

        }

    } else {

        if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);

        INTERSECTED = null;

    }
    /*    
    for( var i = 0; i < intersects.length; i++ ) {
        var intersection = intersects[ i ],
            obj = intersection.object;

        obj.material.color.setRGB( 1.0 - i / intersects.length, 0, 0 );
    }
    */

}

function onWindowResize(e) {
    containerWidth = window.innerWidth;
    containerHeight = window.innerHeight;
    renderer.setSize(containerWidth, containerHeight);
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
}

//  crearea gogoasa
const geometry = new THREE.TorusGeometry(20, 7, 33, 200);
//const material = new THREE.MeshBasicMaterial( {color: 0xFF00FF, wireframe: true});
const material = new THREE.MeshStandardMaterial({ color: 0xFF00FF });
const torus = new THREE.Mesh(geometry, material);
//scene.add(torus);

//  lumini
/*
const light = new THREE.PointLight( 0xff0000, 1, 100 );
light.position.set( 50, 50, 50 );
scene.add( light );
*/

/*
const directionalLight = new THREE.DirectionalLight(0xffffff, 2 );
        directionalLight.position.set(10, 10 , 10); 
        directionalLight.target.position.set(0, 0 , 0); 
        directionalLight.shadow.camera.near = 0;
        directionalLight.shadow.camera.far = 50; //ALTURA DEL CUBO
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 3 * 512; 
        directionalLight.shadow.mapSize.height = 3 * 512;
        directionalLight.shadow.camera.top = 25; //X
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.bottom = -25;
        directionalLight.shadow.camera.visible = true;
        scene.add(directionalLight);
*/

const spotLight_1 = new THREE.SpotLight(0xffffff, 5, 100, 1);
spotLight_1.position.set(0, 0, 100);
//scene.add( spotLight_1 );

const spotLight_2 = new THREE.SpotLight(0xffffff, 5, 100, 1);
spotLight_2.position.set(0, 0, -100);
//scene.add( spotLight_2 );

const spotLight_3 = new THREE.SpotLight(0xffffff, 5, 100, 0.5);
spotLight_3.position.set(0, 100, 0);
//scene.add( spotLight_3 );

const spotLight_4 = new THREE.SpotLight(0xffffff, 5, 100, 0.5);
spotLight_4.position.set(0, -100, 0);
//scene.add( spotLight_4 );

const spotLight_5 = new THREE.SpotLight(0xffffff, 5, 100, 0.5);
spotLight_5.position.set(100, 0, 0);
//scene.add( spotLight_5 );

const spotLight_6 = new THREE.SpotLight(0xffffff, 5, 100, 0.5);
spotLight_6.position.set(-100, 0, 0);
//scene.add( spotLight_6 );

const spotLight_7 = new THREE.SpotLight(0xffffff, 100, 1000, 1);
spotLight_7.position.set(0, 100, 0);
//scene.add( spotLight_7 );

const spotLight_8 = new THREE.SpotLight(0xffffff, 100, 1000, 1);
spotLight_8.position.set(0, -100, 0);
//scene.add( spotLight_8 );

const spotLight_9 = new THREE.SpotLight(0xffffff, 10000, 55, 0.5);
spotLight_9.position.set(0, 50, 0);
spotLight_9.power = 50;
//scene.add( spotLight_9 );

const spotLight_10 = new THREE.SpotLight(0xffffff, 10000, 55, 0.5);
spotLight_10.position.set(0, -50, 0);
spotLight_10.power = 50;
//scene.add( spotLight_10 );

const spotLight_11 = new THREE.SpotLight(0xffffff, 10000, 55, 0.5);
spotLight_11.position.set(50, 0, 0);
spotLight_11.power = 50;
//scene.add( spotLight_11 );

const spotLight_12 = new THREE.SpotLight(0xffffff, 10000, 55, 0.5);
spotLight_12.position.set(-50, 0, 0);
spotLight_12.power = 50;
//scene.add( spotLight_12 );


const spotLightHelper = new THREE.SpotLightHelper(spotLight_7);
//scene.add( spotLightHelper );
//scene.add( new THREE.SpotLightHelper( spotLight_6 ) );
//scene.add( new THREE.SpotLightHelper( spotLight_8 ) );
//scene.add( new THREE.SpotLightHelper( spotLight_11 ) );
//scene.add( new THREE.SpotLightHelper( spotLight_12 ) );
//spotLightHelper.cone;

const pointLight = new THREE.PointLight(0xFFFFFF, 1, 100000, 4);
pointLight.position.set(0, 0, 0);
//pointLight.distance = 0;
pointLight.castShadow = true;
pointLight.power = 10;
//pointLight.position.x = 25;
scene.add(pointLight);


const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF);
hemiLight.position.set(0, 1000, 0);
//scene.add(hemiLight);

const hemiLightHelper = new THREE.PointLightHelper(hemiLight);
//scene.add(hemiLightHelper);

const lightHelper = new THREE.PointLightHelper(pointLight);
scene.add(lightHelper);

const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(gridHelper);

// adaugare functie de 'camera move'
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.keyPanSpeed = 20;
console.log(orbitControls.keys);
// wasd controls
orbitControls.keys = {
    LEFT: 65, //aleft arrow
    UP: 87, //w up arrow
    RIGHT: 68, //d right arrow
    BOTTOM: 83 //s down arrow
};
orbitControls.saveState();
console.log(orbitControls.keys);

//  adauga 'stele'
function addStar() {
    // creaza stea
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: /*0xFFF000*//* yellow */0xFFFFFF });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    planetRotate(star, 0.01, 0.005, 0.01);
    scene.add(star);
}

//  creaza constelatie (array de 200 de stele) 
//Array(200).fill().forEach(addStar);

//  adauga universe texture(more like galaxy)
const spaceTexture = new THREE.TextureLoader(loadingManager).load('39607.jpg');
scene.background = spaceTexture;


// Earth object
const earthTexture = new THREE.TextureLoader(loadingManager).load('8k_earth_daymap.jpg');
const normalEarthTexture = new THREE.TextureLoader(loadingManager).load('8k_earth_normal_map.jpg');
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH__Radius, 100, 100),
    new THREE.MeshStandardMaterial({
        map: earthTexture,
        normalMap: normalEarthTexture
    })
);
scene.add(earth);
earth.position.z = EARTH_DISTFROM_SUN_UA * AU;
//earth.position.setX(-20);

// Earth at night object
const earthAtNightTexture = new THREE.TextureLoader(loadingManager).load('8k_earth_nightmap.jpg');
const normalEarthAtNightTexture = new THREE.TextureLoader(loadingManager).load('8k_earth_normal_map.jpg');
const earthAtNight = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH__Radius, 100, 100),
    new THREE.MeshStandardMaterial({
        map: earthAtNightTexture,
        normalMap: normalEarthAtNightTexture
    })
);
//scene.add(earthAtNight);
earthAtNight.position.z = 30;
earthAtNight.position.setX(5);

// Moon object
const moonTexture = new THREE.TextureLoader(loadingManager).load('lroc_color_poles_8k.jpg');
const normalMoonTexture = new THREE.TextureLoader(loadingManager).load('moon-kaguya-nm.jpg');
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_Radius, 100, 100),
    new THREE.MeshStandardMaterial({
        map: moonTexture,
        normalMap: normalMoonTexture
    })
);
scene.add(moon);
//moon.position.z = 30;
//moon.scale.set(10,10,10);
moon.position.z = EARTH_DISTFROM_SUN_UA * AU;
moon.position.setX(MOON_DISTFROM_EARTH_UA * AU);

// Sun object
const sunTexture = new THREE.TextureLoader(loadingManager).load('8k_sun.jpg');
//const normalSunTexture = new THREE.TextureLoader(loadingManager).load('moon-kaguya-nm.jpg');
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_Radius / 2, 250, 250),
    new THREE.MeshStandardMaterial({
        map: sunTexture,
        //normalMap: normalSunTexture
    })
);
sun.name = "SUN"
sun.position.x = 0;
sun.position.y = 0;
sun.position.z = 0;
scene.add(sun);
planets.add(sun);

/*
var info = document.createElement( 'div' );
info.style.position = 'absolute';
info.style.top = '10px';
info.style.width = '100%';
info.style.textAlign = 'center';
info.innerHTML = sun.name;
body.appendChild( info );
*/
/*
window.addEventListener( 'mousemove', onMouseMove, false );

//projector = new THREE.Projector();
const mouseVector = new THREE.Vector3();

function onMouseMove()
{
    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / containerHeight );
}
*/

function orbitLines(collor, orbit /* the distance from origin (SUN)*/) {
    //var orbit = position_vector[2];
    var shape = new THREE.Shape();
    shape.moveTo(orbit, 0);
    shape.absarc(0, 0, orbit, 0, 2 * Math.PI, false);
    var spacedPoints = shape.getSpacedPoints(2 ** 10);
    var orbitGeom = new THREE.BufferGeometry().setFromPoints(spacedPoints);
    orbitGeom.rotateX(THREE.Math.degToRad(-90));
    //var orbit = new THREE.Line(orbitGeom, new THREE.LineBasicMaterial({
    var orbit = new THREE.LineSegments(orbitGeom, new THREE.LineDashedMaterial({
        color: collor//"yellow"
    }));
    scene.add(orbit);
    return orbit;
}

function planet2DText(name) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext("2d");
    ctx.font = "44pt Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;
    ctx.strokeText(name, 128, 46);
    ctx.fillText(name, 128, 46);

    //console.log(ctx);
    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    var spriteMat = new THREE.SpriteMaterial({
        map: tex
    });
    var sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(100, 100, 10);
    return sprite
}

function createPlanet(planet, name, texture_path, normal_texture_path, radius, width_segments, height_segments, ADD_TO_SCENE,
    position_vector, rotation_vector, orbitalVelocity, ring)
//function addStar2(radius, width_segments, height_segments)
{
    const texture = new THREE.TextureLoader(loadingManager).load(texture_path);
    //let planet;
    if (normal_texture_path != null) {
        const normal_texture = new THREE.TextureLoader(loadingManager).load(normal_texture_path);
        planet = new THREE.Mesh(
            new THREE.SphereGeometry(radius, width_segments, height_segments),
            new THREE.MeshStandardMaterial({
                map: texture,
                normalMap: normal_texture
            })
        )
        //if( ADD_TO_SCENE )
        //{scene.add(planetName);}
        //planetName.position.setX(-15);
    }
    else {
        planet = new THREE.Mesh(
            new THREE.SphereGeometry(radius, width_segments, height_segments),
            new THREE.MeshStandardMaterial({
                map: texture
            })
        )
        //if( ADD_TO_SCENE )
        //{scene.add(planetName);}
    }

    orbitLines("yellow", position_vector[2]);
    /*
    var orbit = position_vector[2];
    var shape = new THREE.Shape();
    shape.moveTo(orbit, 0);
    shape.absarc(0, 0, orbit, 0, 2 * Math.PI, false);
    var spacedPoints = shape.getSpacedPoints(128);
    var orbitGeom = new THREE.BufferGeometry().setFromPoints(spacedPoints); 
    orbitGeom.rotateX(THREE.Math.degToRad(-90));
    var orbit = new THREE.Line(orbitGeom, new THREE.LineBasicMaterial({
      color: "yellow"
    }));
    scene.add(orbit);
    */
    /*
        var canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
        var ctx = canvas.getContext("2d");
            ctx.font = "44pt Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 8;
            ctx.strokeText(name, 128, 46);
            ctx.fillText(name, 128, 46);
    
        console.log(ctx);
        var tex = new THREE.Texture(canvas);
            tex.needsUpdate = true;
        var spriteMat = new THREE.SpriteMaterial({
          map: tex
        });
        var sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(100,100,10);
    */
    planet.add(planet2DText(name));


    //const geometry = new THREE.SphereGeometry(radius, width_segments, height_segments); 
    //const material = new THREE.MeshStandardMaterial( {color: /*0xFFF000*//* yellow */0xFFFFFF} );
    //const star2 = new THREE.Mesh( geometry, material);

    //const [x, y, z] = Array(3).fill().map( () => THREE.MathUtils.randFloatSpread( 100 ) );

    //star2.position.set( 10, 10, 10);
    //planetRotate(star2);
    //scene.add( star2 );
    //planetName.position.set( 10, 10, 10);
    planet.position.set(position_vector[0], position_vector[1], position_vector[2]);
    //planetName.rotation.set( position_vector[0], position_vector[1], position_vector[2]);
    planetRotate(planet, rotation_vector[0], rotation_vector[1], rotation_vector[2]);
    planetOrbitAroundSun(planet, position_vector[2], orbitalVelocity);
    //scene.add(planetName); 

    //let ringMesh    ;
    if (ring) {
        const textureLoader = new THREE.TextureLoader(loadingManager);
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32, 32);
        const ringMat = new THREE.MeshStandardMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide,
            alphaTest: 0.05,
            //transparent: true,
            //depthWrite: false,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        planet.add(ringMesh);
        //scene.add(ringMesh);
        //planetRotate(ringMesh, rotation_vector[0], rotation_vector[1], rotation_vector[2]);
        //planetOrbitAroundSun( ringMesh, position_vector[2], orbitalVelocity );
        //ringMesh.position.x = position_vector[2];
        //ringMesh.rotation.x = -0.5 * Math.PI;
    }

    if (ADD_TO_SCENE) {
        scene.add(planet);
        planets.add(planet);

    }
    //name.position.z = 100;
    //return planetName;*/
    return planet;
}
let neptune, mercury, venus, mars, jupiter, uranus, saturn;
//neptune.name = "neptune";
createPlanet(neptune, "neptune", '2k_neptune.jpg', null, NEPTUNO__Radius, 100, 100, true, [0, 0, NEPTUNO_DISTFROM_SUN_UA * AU], [0.01, 0.005, 0.01], NEPTUNO__Speed);
uranus = createPlanet(uranus, "uranus", '2k_uranus.jpg', null, URANUS__Radius, 100, 100, true, [0, 0, URANUS_DISTFROM_SUN_UA * AU], [0.01, 0.005, 0.01], URANUS__Speed, { innerRadius: URANUS__Radius * URANUS__Inner_Ring_Radius_Coefficient, outerRadius: URANUS__Radius * URANUS__Outer_Ring_Radius_Coefficient, texture: "./uranus_ring.png" });
createPlanet(jupiter, "jupiter", '8k_jupiter.jpg', null, JUPYTER__Radius, 100, 100, true, [0, 0, JUPYTER_DISTFROM_SUN_UA * AU], [0.01, 0.005, 0.01], JUPYTER__Speed);
createPlanet(mars, "mars", '8k_mars.jpg', null, MARS__Radius, 100, 100, true, [0, 0, MARS_DISTFROM_SUN_UA * AU], [0.01, 0.005, 0.01], MARS__Speed);
createPlanet(mercury, "mercury", '8k_mercury.jpg', null, MERCURY__Radius, 100, 100, true, [0, 0, MERCURY_DISTFROM_SUN_UA * AU], [0.01, 0.005, 0.01], MERCURY__Speed);
saturn = createPlanet(saturn, "saturn", '8k_saturn.jpg', null, SATURN__Radius, 100, 100, true, [0, 0, SATURN_DISTFROM_SUN_UA * AU], [0.01, 0.005, 0.01], SATURN__Speed, { innerRadius: SATURN__Radius * SATURN__Inner_Ring_Radius_Coefficient, outerRadius: SATURN__Radius * SATURN__Outer_Ring_Radius_Coefficient, texture: "./saturn_ring.png" });
createPlanet(venus, "venus", '8k_venus_surface.jpg', null, VENUS__Radius, 100, 100, true, [0, 0, VENUS_DISTFROM_SUN_UA * AU], [0.01, 0.005, 0.01], VENUS__Speed);
//uranus.scale.set(100,100,100);
//saturn.scale.set(100,100,100);

//let unu = addStar2(10,240,240);
//const Texture = new THREE.TextureLoader(loadingManager).load('2k_neptune.jpg');
//const normalSunTexture = new THREE.TextureLoader(loadingManager).load('moon-kaguya-nm.jpg');
/*const nep = new THREE.Mesh(
    new THREE.SphereGeometry(8,80,80),
    //new THREE.MeshStandardMaterial({
        //map: Texture,
        //normalMap: normalSunTexture
    //})
);
scene.add(nep);
nep.position.x = 30;
*/
/*function moonRotate() {
    requestAnimationFrame( moonRotate );
moon.rotation.x += 0.01;
moon.rotation.y += 0.005;
moon.rotation.z += 0.01;
}
moonRotate();
*/
function planetRotate(planet, speed_on_x, speed_on_y, speed_on_z) {
    //
    /* if(typeof planet != "undefined") {
         planet.rotation.x = 0.01;
         planet.rotation.y = 0.005;
         planet.rotation.z = 0.01;
 
     }*/
    //this.planet = 'default'
    /*
        planet.rotation.x = 0.01;
        planet.rotation.y = 0.005;
        planet.rotation.z = 0.01;
    */
    //);
    /*
    planet.rotation.x += 0.01;
    planet.rotation.y += 0.005;
    planet.rotation.z += 0.01;
    */
    planet.rotation.x += speed_on_x;
    planet.rotation.y += speed_on_y;
    planet.rotation.z += speed_on_z;
    requestAnimationFrame(() => planetRotate(planet, speed_on_x, speed_on_y, speed_on_z));
    //return moon;
}
var earthSystem = new THREE.Object3D();
scene.add(earthSystem);

function planetOrbitAroundSun(planet, orbit, speed) {
    var timestamp = Date.now() * 0.00001;
    planet.position.x = Math.cos(timestamp * speed) * orbit;
    planet.position.z = Math.sin(timestamp * speed) * orbit;
    if (planet == earth) {
        //console.log("cacac");
        earthSystem.position.x = planet.position.x;
        earthSystem.position.z = planet.position.z;
    }
    requestAnimationFrame(() => planetOrbitAroundSun(planet, orbit, speed));
}

//  either add earth.position to moon.position or use earthSystem as a pivotPoint(that gets eart.position anyway) for the moon object in order to rotate ok
/*function moonOrbit(orbit, speed)
{
   
    var timestamp = Date.now() * 0.0001;
    moon.position.x = earth.position.x + Math.cos(timestamp * speed) * orbit;
    moon.position.z = earth.position.z + Math.sin(timestamp * speed) * orbit;

    requestAnimationFrame(() =>  moonOrbit( orbit, speed) );
}
*/
function moonOrbit(orbit, speed, moonError, firstIterationFlag) {
    if (firstIterationFlag) {
        orbit *= moonError;
        speed *= moonError;
        firstIterationFlag = false;
    }


    var timestamp = Date.now() * 0.00001;
    moon.position.x = earth.position.x + Math.cos(timestamp * speed) * orbit;
    moon.position.z = earth.position.z + Math.sin(timestamp * speed) * orbit;

    requestAnimationFrame(() => moonOrbit(orbit, speed, moonError, firstIterationFlag));
}

//var pivotPoint = new THREE.Object3D();

//earth.add(earthSystem);
//earthSystem.add(moon);


function create3D_Object(obj, obj_path, scale) {
    let temp;
    let loader = new GLTFLoader(loadingManager);
    loader.load(obj_path, temp = function (gltf) {
        //temp = gltf;
        obj = gltf.scene.children[0];
        obj.scale.set(scale, scale, scale);
        //gltf.scale.set(100,100,100);
        //scene.add(gltf.scene);
        //animate();
        //return gltf;
        objects.add(obj);
        //objects.children[0].name = obj.name;
        console.log(obj);
    });
    //temp.position.set(100,100,100);
    //return temp;

}
const clock = new THREE.Clock();
let mixer, house;
let animation;//= new THREE.AnimationClip();
/*
function createAnimated_3D_Object( obj, obj_path, scale )
{let obj_scene;
    let loader = new GLTFLoader(loadingManager);
    loader.load(obj_path, obj_scene = function(gltf){

        
        //obj = gltf.scene.children[0];
        //obj.scale.set(scale,scale,scale);
        obj_scene = gltf.scene.children[0];
        obj_scene.scale.set(scale,scale,scale);
        obj = new THREE.AnimationMixer( obj_scene );
        obj.clipAction(gltf.animations[0]).play().setLoop();
        //console.log(gltf.animations[0]);
        //const delta = clock.getDelta();
            //mixer.update(delta);
    scene.add(gltf.scene);
    //requestAnimationFrame(() =>  createAnimated_3D_Object( obj, obj_path, scale ) );
        animate3D( obj );
    //animate();//
    
    console.log(obj_scene);
    return obj_scene;
});
    console.log(obj_scene);
    return obj_scene;
}
*/
let nume = ['ana', "dan", "ion"];
let i = 0, s = 50;
let mixer2;
const objects = new THREE.Object3D();
function createAnimated_3D_Object(obj, obj_path, scale) {

    let loader = new GLTFLoader(loadingManager);

    loader.load(obj_path, (gltf) => load_handler(gltf, obj));
    //scene.add(obj);

    /*
    setTimeout(function(){
    var obj2 = new THREE.AnimationMixer( objects );    
    //var obj2 = new THREE.AnimationMixer( objects );
    //obj2.clipAction(objects.children[0].animations[0]).play().setLoop();
    obj2.clipAction(animation).play().setLoop();
    animate3D(obj2);
    }, 7000);
    */
    //console.log(obj);
    /*
    
        console.log(objects.getObjectByName('ana'));
        return objects.getObjectByName(nume[i-1]);
        //console.log(_3DObj4);
    
    */
    //console.log(objects.getObjectByName(0));
    //console.log(objects.getObjectByName(1));

}



function load_handler(gltf, object) {
    //obj = gltf.scene.children[0];
    //obj.scale.set(scale,scale,scale);
    var obj_scene, obj2;
    obj_scene = gltf.scene.children[0];
    //obj_scene.scale.set(s,s,s);
    //obj2 = new THREE.AnimationMixer( obj_scene );
    //obj2.clipAction(gltf.animations[0]).play().setLoop();
    animation = gltf.animations[0];
    //console.log(gltf.animations[0]);
    //const delta = clock.getDelta();
    //mixer.update(delta);
    //s*=2;
    //scene.add(obj_scene);
    //objects.add(obj_scene);
    //obj_scene.name = nume[i++];
    object.add(obj_scene);
    //objects.animations[0] = gltf.animations[0];
    //requestAnimationFrame(() =>  createAnimated_3D_Object( obj, obj_path, scale ) );
    //animate3D( obj2 );
    //animate();//

    //console.log( gltf);
    //console.log(obj_scene);
    //return obj_scene;
}

function animate3D(obj) {
    //requestAnimationFrame(animate3D( obj ));

    const delta = clock.getDelta();
    //mixer.update(delta);
    obj.update(delta);
    //animate();
    //renderer.render(scene,camera);
    requestAnimationFrame(() => animate3D(obj));
}

function animate3D2(obj) {
    const delta = clock.getDelta();
    obj.update(delta);
    requestAnimationFrame(() => animate3D2(obj));
}

//_3DObj1 = create3D_Object(_3DObj1,'./fortnite_mr_joker/scene.gltf', 100);
let _3DObj1, _3DObj2, _3DObj3, _3DObj4, _3DObj5;
let Thanos_model = './fortnite-thanos/scene.gltf';
let Star_Wars_fighter_model = './3d_t.i.e_fighter_-_star_wars_model/scene.gltf';
let Star_Wars_battle_droid_model = './b1_battle_droid/scene.gltf';
_3DObj2 = create3D_Object(_3DObj2, Thanos_model, 0.2);
_3DObj3 = create3D_Object(_3DObj3, Star_Wars_fighter_model, 2);
_3DObj4 = create3D_Object(_3DObj4, Star_Wars_battle_droid_model, 10);

function createObject_group(object_group, number_of_elements, model_path) {
    for (let j = 0; j < number_of_elements; j++) {
        createAnimated_3D_Object(object_group, model_path);
    }
}

//createObject_group( objects, 250, Star_Wars_battle_droid_model)
//console.log(_3DObj4);
//_3DObj4.scale.set(100,100,100);
//createAnimated_3D_Object(objects,'./b1_battle_droid/scene.gltf', 100);
//console.log(_3DObj5.children);
//_3DObj5.scale.set(50,50,50);
//objects.scale.set(100,100,100);

//console.log(objects.getObjectByName('ana'));
/*setTimeout(function(){
    let x =  objects.children[0].clone();
    scene.add(x);
    console.log(x);
    x.visible = true;
    animate();
    objects.add(objects.children[0].clone(),objects.children[0].clone());
    objects.children[1].name = 'ana2';
    objects.children[2].name = 'ana3';
    console.log(objects.getObjectByName('ana'));
    //objects.getObjectByName('ana').scale.set(100,100,100);
    //objects.getObjectByName('dan').scale.set(50,50,50);
    console.log(objects.children);
}, 5000);
*/



const droid_batallion_0 = new THREE.Object3D;
const droid_batallion_1 = new THREE.Object3D;
const droid_batallion_2 = new THREE.Object3D;
const droid_batallion_3 = new THREE.Object3D;
let droid_animation_mixer;
var animationObjectGroup = new THREE.AnimationObjectGroup();

function droidChilrenSetup(object_group, starting_scale, starting_x_position, starting_z_position, starting_y_position, step_size, functie) {
    scene.add(object_group);

    let x_position = starting_x_position, y_position = starting_y_position, z_position = starting_z_position, scale = starting_scale;
    for (let j = 0; ; j++) {
        if (object_group.children[j]) {
            if (j % 25 == 0) {
                x_position = starting_x_position;
                z_position += step_size;
            }
            x_position += step_size;
            object_group.children[j].scale.set(scale, scale, scale);
            object_group.children[j].position.setX(x_position);
            object_group.children[j].position.setZ(z_position);
            object_group.children[j].position.setY(y_position); //  height
            animationObjectGroup.add(object_group.children[j]);
        }
        else
            break
        //break
    }
    console.log(animationObjectGroup);
    droid_animation_mixer = new THREE.AnimationMixer(animationObjectGroup);
    //var obj2 = new THREE.AnimationMixer( objects );
    //obj2.clipAction(objects.children[0].animations[0]).play().setLoop();
    droid_animation_mixer.clipAction(animation).play().setLoop();
    //animate3D(droid_animation_mixer);
    //functie(obj2);
    //animate();
    object_group.visible = false
}
//setTimeout(()=>droidChilrenSetup( objects, 10, -500, -500, 0, 20, animate3D2 ), 15000);



function createDroidArmy() {
    createObject_group(droid_batallion_0, 250, Star_Wars_battle_droid_model);
    //animate3D(droid_animation_mixer);
    createObject_group(droid_batallion_1, 250, Star_Wars_battle_droid_model);
    createObject_group(droid_batallion_2, 250, Star_Wars_battle_droid_model);
    createObject_group(droid_batallion_3, 250, Star_Wars_battle_droid_model);
    setTimeout(() => droidChilrenSetup(droid_batallion_0, 10, -500, -500, 0, 20, animate3D2), 20000);
    setTimeout(() => droidChilrenSetup(droid_batallion_1, 10, 0, -500, 0, 20, animate3D), 25000);
    setTimeout(() => droidChilrenSetup(droid_batallion_2, 10, -500, 0, 0, 20, animate3D), 30000);
    setTimeout(() => droidChilrenSetup(droid_batallion_3, 10, 0, 0, 0, 20, animate3D), 35000);
}
createDroidArmy();
//setTimeout(()=>animate3D(droid_animation_mixer), 15000);

function trueRandom()   //  for negative random values
{
    let x = Math.random();
    if (x > 0.5)
        return Math.random();
    else
        return -Math.random();
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

scene.add(objects);
function flyShip(planet, orbit, speed) {
    var timestamp = Date.now() * 0.0001;
    //planet.translate.x += Math.random();
    //planet.position.z += Math.random();
    //planet.position.y += Math.random();
    planet.position.lerp(new THREE.Vector3(100, 100, 100), 0.01);
    for (let k = 0; k < 1000; k++);
    planet.position.lerp(new THREE.Vector3(0, 0, 0), 0.01);
    requestAnimationFrame(() => flyShip(planet, orbit, speed));
}
var initial_position = new THREE.Vector3(0, 50, 0);


function tweenDemo(object) {
    //objects.children[0].add(spotLight_7);
    //objects.children[0].add(spotLight_8);
    //spotLight_7.position.add(initial_position);
    var position = { x: 0, y: 0 };
    var target = { x: 400, y: 250 };
    var tween = new TWEEN.Tween(position).to(target, 2000);
    tween.onUpdate(function () {
        object.position.x = position.x;
        object.position.y = position.y;
        //console.log(spotLight_7.position);
        //console.log('---')
        //console.log(object.position);
        //spotLight_7.position.set(object.position.x,object.position.y,object.position.z).add(initial_position);
        //spotLight_7.position.x = object.position.x + initial_position.x;
        //spotLight_7.position.y = object.position.y + initial_position.y;
        //spotLight_7.position.z = object.position.z + initial_position.z;

    });
    tween.delay(500);
    tween.easing(TWEEN.Easing.Bounce.Out)
    tween.start();
    //object.position.x = 100;

    //console.log(spotLight_7.position);
    tweenUpdate();
    //TWEEN.update();
    //requestAnimationFrame(() => tweenDemo ( object ) );
}

function flyShip2(object) {
    //objects.children[1].add(spotLight_9);
    //objects.children[1].add(spotLight_10);
    //objects.children[1].add(spotLight_11);
    //objects.children[1].add(spotLight_12);
    //objects.children[1].add(ambientLight2);
    //objects.children[1].receiveShadows = false;
    //spotLight_7.position.add(initial_position);
    var position = { x: 0, y: 0 };
    var target = { x: -400, y: 250 };
    var tween = new TWEEN.Tween(position).to(target, 2000);
    tween.onUpdate(function () {
        object.position.x = position.x;
        object.position.y = position.y;
        //console.log(spotLight_7.position);
        //console.log('---')
        //console.log(object.position);
        //spotLight_7.position.set(object.position.x,object.position.y,object.position.z).add(initial_position);
        //spotLight_7.position.x = object.position.x + initial_position.x;
        //spotLight_7.position.y = object.position.y + initial_position.y;
        //spotLight_7.position.z = object.position.z + initial_position.z;

    });
    tween.delay(500);
    tween.easing(TWEEN.Easing.Bounce.Out)
    tween.start();
    //object.position.x = 100;

    //console.log(spotLight_7.position);
    tweenUpdate();
    //TWEEN.update();
    //requestAnimationFrame(() => tweenDemo ( object ) );
}

function tweenUpdate() {
    requestAnimationFrame(tweenUpdate);
    //objects.children[1].rotation.x += 0.09;
    TWEEN.update();
}
//tweenDemo(objects.children[0]);
//setTimeout(()=>tweenDemo(objects.children[0]), 7000);
//setTimeout(()=>flyShip2(objects.children[1]), 10000);

function addStars() {
    // stars    -from official example
    const radius = 63.71;
    const r = radius, starsGeometry = [new THREE.BufferGeometry(), new THREE.BufferGeometry()];

    const vertices1 = [];
    const vertices2 = [];

    const vertex = new THREE.Vector3();

    for (let i = 0; i < 250; i++) {

        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);

        vertices1.push(vertex.x, vertex.y, vertex.z);

    }

    for (let i = 0; i < 1500; i++) {

        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);

        vertices2.push(vertex.x, vertex.y, vertex.z);

    }

    starsGeometry[0].setAttribute('position', new THREE.Float32BufferAttribute(vertices1, 3));
    starsGeometry[1].setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3));

    const starsMaterials = [
        new THREE.PointsMaterial({ color: 0x555555, size: 2, sizeAttenuation: false }),
        new THREE.PointsMaterial({ color: 0x555555, size: 1, sizeAttenuation: false }),
        new THREE.PointsMaterial({ color: 0x333333, size: 2, sizeAttenuation: false }),
        new THREE.PointsMaterial({ color: 0x3a3a3a, size: 1, sizeAttenuation: false }),
        new THREE.PointsMaterial({ color: 0x1a1a1a, size: 2, sizeAttenuation: false }),
        new THREE.PointsMaterial({ color: 0x1a1a1a, size: 1, sizeAttenuation: false })
    ];

    for (let i = 10; i < 30; i++) {

        const stars = new THREE.Points(starsGeometry[i % 2], starsMaterials[i % 6]);

        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;
        stars.scale.setScalar(i * 10);

        stars.matrixAutoUpdate = false;
        stars.updateMatrix();

        //console.log(stars);
        scene.add(stars);

    }
}
addStars();

//function mouseTrail()

// dots is an array of Dot objects,
// mouse is an object used to track the X and Y position
// of the mouse, set with a mousemove event listener below
var dots = [],
    mouse = {
        x: 0,
        y: 0
    };

// The Dot object used to scaffold the dots
var Dot = function () {
    this.x = 0;
    this.y = 0;
    this.node = (function () {
        var n = document.createElement("div");
        n.className = "trail";
        document.body.appendChild(n);
        return n;
    }());
};
// The Dot.prototype.draw() method sets the position of 
// the object's <div> node
Dot.prototype.draw = function () {
    this.node.style.left = this.x + "px";
    this.node.style.top = this.y + "px";
};

// Creates the Dot objects, populates the dots array
for (var j = 0; j < 12; j++) {
    var d = new Dot();
    dots.push(d);
}

// This is the screen redraw function
function draw() {
    // Make sure the mouse position is set everytime
    // draw() is called.
    var x = mouse.x,
        y = mouse.y;

    // This loop is where all the 90s magic happens
    dots.forEach(function (dot, index, dots) {
        var nextDot = dots[index + 1] || dots[0];

        dot.x = x;
        dot.y = y;
        dot.draw();
        x += (nextDot.x - dot.x) * .6;
        y += (nextDot.y - dot.y) * .6;

    });
}

addEventListener("mousemove", function (event) {
    //event.preventDefault();
    mouse.x = event.pageX;
    mouse.y = event.pageY;
});
//requestAnimationFrame(()=> draw());



/*
var canvas = document.querySelector('#bg'),
    ctx = canvas.getContext('2d'),
    points = [],
    m = {x: null, y: null},
    r = 0;

var a = 20; // how many dots to have
var b = 5; // how fast to spin
var c = 0.1; // how much to fade. 1 all, 0.5 half, 0 none
var d = 100; // distance from the mouse


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

m.x = canvas.width / 2;
m.y = canvas.height / 2;

window.addEventListener('mousemove', function(e){
    TweenMax.to(m, 0.3, {x: e.clientX, y: e.clientY, ease: 'linear'})
    //document.querySelector('.message').className = 'hide';
})

for(var j=0;j<a;j++){
    points.push({
        r: 360 / a * j,
        p: {x: null, y: null},
        w: Math.random()*5,
        c: '#fff',
        d: Math.random() * (d + 5) - 5,
        s: Math.random() * (b + 5) - 5
    })
}

function render(){
    if(m.x == null || m.y == null) return;

    ctx.fillStyle = 'rgba(0,0,0,'+c+')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = 'round';

    for(var i=0; i<points.length; i++){
        var p = points[i];

        p.r += p.s;
        if(p.r >= 360) p.r = p.r - 360;

        var vel = {
            x: p.d * Math.cos(p.r * Math.PI / 180),
            y: p.d * Math.sin(p.r * Math.PI / 180)
        };

        if(p.p.x != null && p.p.y != null){
            ctx.strokeStyle = p.c;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.p.x, p.p.y);
            ctx.lineTo(m.x + vel.x, m.y + vel.y)
            ctx.stroke();
            ctx.closePath();
        }

        p.p.x = m.x + vel.x;
        p.p.y = m.y + vel.y;
    }
}


window.requestAnimFrame = (function(){
return  window.requestAnimationFrame   ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();

(function animloop(){
    requestAnimFrame(animloop);
    render();
})();
*/
/*
;(function(main) {
    main();
})(function() {

    'use strict';

    var c = document.querySelector('#bg');
    var ctx = c.getContext('2d');

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    var mouse = {
        x: 0,
        y: 0,
        isMoved: false
    };

    var Particle = function() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.r = 255;
        this.g = 255;
        this.b = 255;
        this.a = 0;
        this.life = 0;
        this.radius = Math.random() * 5;
    };

    Particle.prototype = {
        constructor: Particle,
        update: function() {
            if(this.life > 0) {
                this.life -= 2;
                if(this.life < 50) {
                    this.vx += Math.random() * 4 - 2;
                    this.vy += Math.random() * 4 - 2;
                    this.vx *= 0.9;
                    this.vy *= 0.9;
                    this.x += this.vx;
                    this.y += this.vy;
                    this.a = this.life / 50;						
                }
            }
        },
        render: function(ctx) {
            ctx.save();
            ctx.fillStyle = 'rgba('+ this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a +')';
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        },
        reset: function(tx, ty) {
            this.x = tx;
            this.y = ty;
            this.vx = Math.random() * 4 - 1;
            this.vy = Math.random() * 4 - 1;
            this.life = 150;
            this.a = 1;
            this.g = Math.round(255 * (this.x / WIDTH));
            this.b = Math.round(255 * (this.y / HEIGHT));
            this.radius = Math.random() * 5;
        }
    };

    var particles = [];
    var particle = null;
    var particleCount = 500;
    var tx = 0;
    var ty = HEIGHT / 2;
    var idx = 0;
    var temp = {
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        x: WIDTH / 2,
        y: HEIGHT / 2
    }

    for(var i = 0; i < particleCount; i++) {
        particle = new Particle();
        particles.push(particle);
    }

    function spawn(target) {

        tx += (target.x - tx) * 0.2;
        ty += (target.y - ty) * 0.2;

        particles[idx].reset(tx, ty);
        if(++idx >= particles.length) idx = 0;

    }

    c.addEventListener('mousemove', function(e) {

        var rect = c.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.isMoved = true;

        spawn(mouse);

    });

    requestAnimationFrame(function loop() {
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        if(!mouse.isMoved) {
            temp.vx += Math.random() * 4 - 2;
            temp.vy += Math.random() * 4 - 2;
            temp.vx *= 0.98;
            temp.vy *= 0.98;
            temp.x += temp.vx;
            temp.y += temp.vy;
            if(temp.x > WIDTH) {
                temp.x = WIDTH;
                temp.vx *= -1;
            }
            if(temp.x < 0) {
                temp.x = 0;
                temp.vx *= -1;
            }
            if(temp.y > HEIGHT) {
                temp.y = HEIGHT;
                temp.vy *= -1;
            }
            if(temp.y < 0) {
                temp.y = 0;
                temp.vy *= -1;
            }				
            spawn(temp);
        }

        for(var i = 0; i < particleCount; i++) {
            particle = particles[i];
            particle.update();
            particle.render(ctx);
        }
    });


});
*/
/*
window.onload = function () {
    //functions definition
  
    //class definition
    class segm {
      constructor(x, y, l) {
        this.b = Math.random()*1.9+0.1;
        this.x0 = x;
        this.y0 = y;
        this.a = Math.random() * 2 * Math.PI;
        this.x1 = this.x0 + l * Math.cos(this.a);
        this.y1 = this.y0 + l * Math.sin(this.a);
        this.l = l;
      }
      update(x, y) {
        this.x0 = x;
        this.y0 = y;
        this.a = Math.atan2(this.y1 - this.y0, this.x1 - this.x0);
        this.x1 = this.x0 + this.l * Math.cos(this.a);
        this.y1 = this.y0 + this.l * Math.sin(this.a);
      }
    }
    class rope {
      constructor(tx, ty, l, b, slq, typ) {
        if(typ == "l"){
          this.res = l / 2;
        }else{
          this.res = l / slq;
        }
        this.type = typ;
        this.l = l;
        this.segm = [];
        this.segm.push(new segm(tx, ty, this.l / this.res));
        for (let i = 1; i < this.res; i++) {
          this.segm.push(
            new segm(this.segm[i - 1].x1, this.segm[i - 1].y1, this.l / this.res)
          );
        }
        this.b = b;
      }
      update(t) {
        this.segm[0].update(t.x, t.y);
        for (let i = 1; i < this.res; i++) {
          this.segm[i].update(this.segm[i - 1].x1, this.segm[i - 1].y1);
        }
      }
      show() {
        if(this.type == "l"){
        c.beginPath();
        for (let i = 0; i < this.segm.length; i++) {
          c.lineTo(this.segm[i].x0, this.segm[i].y0);
        }
        c.lineTo(
          this.segm[this.segm.length - 1].x1,
          this.segm[this.segm.length - 1].y1
        );
        c.strokeStyle = "white";
        c.lineWidth = this.b;
        c.stroke();
  
        c.beginPath();
        c.arc(this.segm[0].x0, this.segm[0].y0, 1, 0, 2 * Math.PI);
        c.fillStyle = "white";
        c.fill();
  
        c.beginPath();
        c.arc(
          this.segm[this.segm.length - 1].x1,
          this.segm[this.segm.length - 1].y1,
          2,
          0,
          2 * Math.PI
        );
        c.fillStyle = "white";
        c.fill();
        }else{
        for (let i = 0; i < this.segm.length; i++) {
          c.beginPath();
          c.arc(this.segm[i].x0, this.segm[i].y0, this.segm[i].b, 0, 2*Math.PI);
          c.fillStyle = "white";
        c.fill();
        }
          c.beginPath();
        c.arc(
          this.segm[this.segm.length - 1].x1,
          this.segm[this.segm.length - 1].y1,
          2, 0, 2*Math.PI
        );
        c.fillStyle = "white";
        c.fill();
        }
      }
    }
  
    //setting up canvas
    let c = init("bg").c,
         canvas = init("bg").canvas,
      w = (canvas.width = window.innerWidth),
      h = (canvas.height = window.innerHeight),
      ropes = [];
  
    //variables definition
    let nameOfVariable = "value",
      mouse = {},
      last_mouse = {},
      rl = 50,
      randl = [],
      target = { x: w/2, y: h/2 },
      last_target = {},
      t = 0,
      q = 10,
      da = [],
      type = "l";
  
    for (let i = 0; i < 100; i++) {
      if(Math.random() > 0.25){
          type = "l";
        }else{
          type = "o";
        }
      ropes.push(
        new rope(
          w / 2,
          h / 2,
          (Math.random() * 1 + 0.5) * 500,
          Math.random() * 0.4 + 0.1,
          Math.random()*15+5,
          type
        )
      );
      randl.push(Math.random() * 2 - 1);
      da.push(0);
    }
  
    //place for objects in animation
    function draw() {
      
      if (mouse.x) {
        target.errx = mouse.x - target.x;
        target.erry = mouse.y - target.y;
      } else {
        target.errx =
          w / 2 +
          (h / 2 - q) *
            Math.sqrt(2) *
            Math.cos(t) /
            (Math.pow(Math.sin(t), 2) + 1) -
          target.x;
        target.erry =
          h / 2 +
          (h / 2 - q) *
            Math.sqrt(2) *
            Math.cos(t) *
            Math.sin(t) /
            (Math.pow(Math.sin(t), 2) + 1) -
          target.y;
      }
  
      target.x += target.errx / 10;
      target.y += target.erry / 10;
  
      t += 0.01;
      
      for (let i = 0; i < ropes.length; i++) {
        if (randl[i] > 0) {
          da[i] += (1 - randl[i]) / 10;
        } else {
          da[i] += (-1 - randl[i]) / 10;
        }
        ropes[i].update({
          x:
            target.x +
            randl[i] * rl * Math.cos((i * 2 * Math.PI) / ropes.length + da[i]),
          y:
            target.y +
            randl[i] * rl * Math.sin((i * 2 * Math.PI) / ropes.length + da[i])
        });
        ropes[i].show();
      }
      last_target.x = target.x;
      last_target.y = target.y;
    }
  
    //mouse position
    canvas.addEventListener(
      "mousemove",
      function (e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;
  
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
      },
      false
    );
    
    canvas.addEventListener("mouseleave", function(e) {
      mouse.x = false;
      mouse.y = false;
    });
  
    //animation frame
    function loop() {
      window.requestAnimFrame(loop);
      c.clearRect(0, 0, w, h);
      draw();
    }
  
    //window resize
    window.addEventListener("resize", function () {
      (w = canvas.width = window.innerWidth),
        (h = canvas.height = window.innerHeight);
      loop();
    });
  
    //animation runner
    loop();
    setInterval(loop, 1000 / 60);
  };
*/
//let controls;
/*
setTimeout(function(){
    controls = new DragControls( [ ... objects.children], camera, renderer.domElement );
                controls.addEventListener( 'drag', animate );

}, 20000);
*/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 16.66666666666667);
        };
})();

/*
window.onload = function()
{
    var progress = document.createElement('div');
var progressBar = document.createElement('div');

progress.appendChild(progressBar);

document.body.appendChild(progress);

var manager = new THREE.LoadingManager();
manager.onProgress = function ( item, loaded, total ) {
  progressBar.style.width = (loaded / total * 100) + '%';
};

function addRandomPlaceHoldItImage(){
  var r = Math.round(Math.random() * 4000);
  new THREE.ImageLoader(manager).load('./shreck2.png');
}

for(var j = 0; j < 10; j++) addRandomPlaceHoldItImage();

}
*/



//requestAnimFrame(draw);

//camera.position.z = radius * 5;
//setTimeout(()=>flyShip(objects.children[1],100, 3), 7000);

/*
const physics = new AmmoPhysics(scene)
        physics.debug.enable(true)

        // add a ground
        physics.add.ground({ width: 20, height: 20 })
*/
//flyShip(objects.children[1]);

/*
let mesh2;

// Create an AnimationMixer, and get the list of AnimationClip instances
const mixer = new THREE.AnimationMixer( mesh2 );
const clips = mesh2.animations;

// Update the mixer on each frame
function update () {
    mixer.update( deltaSeconds );
}

// Play a specific animation
const clip = THREE.AnimationClip.findByName( clips, 'dance' );
const action = mixer.clipAction( clip );
action.play();
*/

planetOrbitAroundSun(earth, EARTH_DISTFROM_SUN_UA * AU, 1);
//earth.scale.set(10,10,10); //earth.add(moon);
//
orbitLines("blue", EARTH_DISTFROM_SUN_UA * AU);
earth.add(planet2DText("earth"));
//scene.add(earth);
moonOrbit(MOON_DISTFROM_EARTH_UA * AU, MOON__Speed, 100, true);
earthSystem.add(orbitLines("red", MOON_DISTFROM_EARTH_UA * AU * 100));
moon.add(planet2DText("moon"));
planets.add(moon).add(earth);
//console.log(moon.children[0].scale.set(10,10,10));

planetRotate(moon, 0.01, 0.005, 0.01);
//planetRotate( moon, 0, 0, 0.01 );
planetRotate(earth, 0.01, 0.005, 0.01);//moon.position.set(0,0,0);moon.position.set(0,0,MOON_DISTFROM_EARTH_UA*AU*100);
planetRotate(earthAtNight, 0.01, 0.005, 0.01);
planetRotate(sun, 0.01, 0.005, 0.01);

function animate() {
    animateLoop_id = requestAnimationFrame(animate);

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;

    draw();
    //moon.position.set(10,0,0);
    //moon.rotation.y += 1;

    orbitControls.update();
    //TWEEN.update(); 
    renderer.render(scene, camera);
}

animate();
//renderer.render( scene, camera);
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
gui.close()
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const starsTexture = textureLoader.load('/textures/particles/5.png')
const planetTexture = textureLoader.load('/textures/planet.jpg')
const normalMap = textureLoader.load('/textures/NormalMap.png')


/**
 * Stars
 */
// Stars Geometry
const starsGeometry = new THREE.BufferGeometry()
const count = 200
const positions = new Float32Array(count *3)

for(let i=0; i < count * 3; i++)
{
    positions[i] = (Math.random() - 0.5) * 20
}
starsGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
// Stars Material
const starsMaterial = new THREE.PointsMaterial({
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    alphaMap: starsTexture
})

/**
 * UpdateMaterials
 */
const stars = new THREE.Points(starsGeometry, starsMaterial)
scene.add(stars)

const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMap = environmentMap
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/EnvironmentMap/px.png',
    '/textures/EnvironmentMap/nx.png',
    '/textures/EnvironmentMap/py.png',
    '/textures/EnvironmentMap/ny.png',
    '/textures/EnvironmentMap/pz.png',
    '/textures/EnvironmentMap/nz.png',
])
scene.background = environmentMap

/**
 * Darth Vader
 */
const gltfLoader = new GLTFLoader()

gltfLoader.load(
    '/lego23.glb',
    (gltf) =>
    {
        gltf.scene.position.set(-1.5, -1, 0.2)
        gltf.scene.rotation.y = Math.PI * 0.1
        scene.add(gltf.scene)

        // updateAllMaterials()
    
    }
)
/**
 * Planet
 */
const material = new THREE.MeshStandardMaterial({map: planetTexture})
const planet = new THREE.Mesh(new THREE.SphereBufferGeometry(5, 32, 32), material)
planet.geometry.setAttribute('uv2', 
                new THREE.BufferAttribute(planet.geometry.attributes.uv.array),
                2 )

planet.position.set(0.4, -6, 0)
planet.rotation.z = Math.PI * 0.25
planet.material.color.set('#306258')
planet.material.metalness = 0.3
planet.material.roughness = 0.5
planet.material.normalMap = normalMap
planet.material.normalScale.set(0.5, 0.5)

scene.add(planet)

gui.add(material, 'metalness').min(0).max(1).step(0.001).name('PlanetMetallness')
gui.add(material, 'roughness').min(0).max(1).step(0.001).name('PlanetRoughness')

/**
 * Fonts
 */
 const fontLoader = new THREE.FontLoader()


fontLoader.load(
    '/fonts/droid_serif_regular.typeface.json',
    (font) =>
    {
        // Material
        const textMaterial = new THREE.MeshMatcapMaterial()

        // Text
        const textGeometry = new THREE.TextBufferGeometry(
            'I N T E R A C T I V E \nE V R     F O R C E',
            {
                font: font,
                size: 0.4,
                height: 0.1,
                curveSegments: 12,
                // bevelEnabled: true,
                // bevelThickness: 0.1,
                // bevelSize: 0.005,
                // bevelOffset: 0,
                // bevelSegments: 5
            }
        )
        textGeometry.center()

        const text = new THREE.Mesh(textGeometry, textMaterial)
        text.material.color.set('#78866b')
        text.position.set(-2.5, 2.7, -4)
        text.rotation.y = Math.PI / 4

        scene.add(text)

    }
)

/**
 * PointLight
 */
let mouse = {
    x: 0,
    y: 0
}
const pointLight = new THREE.PointLight(0xffffff, 5, 2, 1);
scene.add(pointLight);

window.addEventListener('mousemove', (event) =>
{
    event.preventDefault()
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
    pointLight.position.set(mouse.x, mouse.y, 0.3)
})

/**
 * Light
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 5)
directionalLight.position.set(-0.25, 1.5, 3)
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('LightIntensity')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping

/**
 * Bloom
 */
const effectComposer = new EffectComposer(renderer)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 2
unrealBloomPass.radius = 0.2
unrealBloomPass.threshold = 0.5
effectComposer.addPass(unrealBloomPass)

gui.add(unrealBloomPass, 'strength').min(0).max(8).step(0.01).name('BloomStrength')
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001).name('BloomRadius')
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001).name('BloomThreshold')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    planet.rotation.y = elapsedTime * 0.05
    stars.rotation.y = elapsedTime * 0.02
    // Update controls
    controls.update()

    // // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =====================
// 1. 配置与数据 (Config & Data)
// =====================
const config = {
    lang: 'zh', // 'zh' or 'en'
    orbitSpeedMultiplier: 0.2, // 整体公转速度
    rotationSpeedMultiplier: 0.05, // 整体自转速度
    sunSize: 15,
    cameraFOV: 45
};

// 文本数据 (中英双语)
const i18n = {
    zh: {
        radius: "半径", temp: "表面温度", orbit: "公转周期", wiki: "查看维基百科",
        sun: { name: "太阳", desc: "太阳系中心的恒星，提供了地球上生命所需的光和热。" },
        mercury: { name: "水星", desc: "太阳系中最小且最靠近太阳的行星。" },
        venus: { name: "金星", desc: "太阳系中最热的行星，拥有厚重的大气层。" },
        earth: { name: "地球", desc: "我们要守护的家园，目前已知唯一孕育生命的星球。" },
        mars: { name: "火星", desc: "这颗红色星球是寻找地外生命迹象的主要目标。" },
        jupiter: { name: "木星", desc: "巨大的气态巨行星，拥有标志性的大红斑风暴。" },
        saturn: { name: "土星", desc: "以其壮观的环系闻名，主要由冰粒和岩石组成。" },
        uranus: { name: "天王星", desc: "躺在轨道上旋转的冰巨星，颜色呈青蓝色。" },
        neptune: { name: "海王星", desc: "太阳系最外层的行星，拥有强烈的风暴。" }
    },
    en: {
        radius: "Radius", temp: "Temperature", orbit: "Orbit Period", wiki: "View Wikipedia",
        sun: { name: "Sun", desc: "The star at the center of the Solar System." },
        mercury: { name: "Mercury", desc: "The smallest and innermost planet in the Solar System." },
        venus: { name: "Venus", desc: "The hottest planet, covered in thick clouds." },
        earth: { name: "Earth", desc: "Our home, the only place known to harbor life." },
        mars: { name: "Mars", desc: "The red planet, a key target for searching for life." },
        jupiter: { name: "Jupiter", desc: "A massive gas giant with the iconic Great Red Spot." },
        saturn: { name: "Saturn", desc: "Famous for its spectacular ring system." },
        uranus: { name: "Uranus", desc: "An ice giant that rotates on its side." },
        neptune: { name: "Neptune", desc: "The outermost planet with supersonic winds." }
    }
};

// 行星参数 (真实性与艺术性的折中)
// distance: 距离太阳的单位距离
// radius: 相对大小
// speed: 公转速度系数
// color: 备用颜色
const planetsData = [
    { id: 'mercury', distance: 30, radius: 1.5, speed: 4.1, color: 0xA5A5A5, texture: 'mercury.jpg', data: { r: '2,439 km', t: '167°C', o: '88 days' } },
    { id: 'venus', distance: 45, radius: 2.8, speed: 1.6, color: 0xE3BB76, texture: 'venus.jpg', data: { r: '6,051 km', t: '464°C', o: '225 days' } },
    { id: 'earth', distance: 65, radius: 3, speed: 1, color: 0x2233FF, texture: 'earth.jpg', cloud: true, data: { r: '6,371 km', t: '15°C', o: '365 days' } },
    { id: 'mars', distance: 85, radius: 2.2, speed: 0.53, color: 0xD14A28, texture: 'mars.jpg', data: { r: '3,389 km', t: '-65°C', o: '687 days' } },
    { id: 'jupiter', distance: 130, radius: 9, speed: 0.08, color: 0xD8CA9D, texture: 'jupiter.jpg', data: { r: '69,911 km', t: '-110°C', o: '12 years' } },
    { id: 'saturn', distance: 180, radius: 8, speed: 0.03, color: 0xF4D03F, texture: 'saturn.jpg', ring: true, data: { r: '58,232 km', t: '-140°C', o: '29 years' } },
    { id: 'uranus', distance: 230, radius: 5, speed: 0.01, color: 0x4FD0E7, texture: 'uranus.jpg', data: { r: '25,362 km', t: '-195°C', o: '84 years' } },
    { id: 'neptune', distance: 270, radius: 4.8, speed: 0.006, color: 0x2955E1, texture: 'neptune.jpg', data: { r: '24,622 km', t: '-200°C', o: '165 years' } }
];

// 纹理 URL 基础路径 (使用 Github 上的常用纹理源，若失败则回退到颜色)
const TEXTURE_PATH = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';

// =====================
// 2. 初始化 Three.js (Init)
// =====================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// 雾效增强深空感
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

const camera = new THREE.PerspectiveCamera(config.cameraFOV, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 120, 200);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 性能优化
renderer.shadowMap.enabled = false; // 关闭阴影提升性能

// 轨道控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 600;
controls.minDistance = 20;

// 光照
const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // 基础环境光
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2.5, 600);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// =====================
// 3. 构建场景对象 (Build Scene)
// =====================
const textureLoader = new THREE.TextureLoader();
const meshObjects = []; // 存储所有可交互网格
const orbitSystems = []; // 存储公转组

// 3.1 创建星空背景
function createStars() {
    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const posArray = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 1500;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({ size: 1.5, color: 0xffffff, transparent: true, opacity: 0.8 });
    const starMesh = new THREE.Points(geometry, material);
    scene.add(starMesh);
}
createStars();

// 3.2 创建太阳
const sunGeo = new THREE.SphereGeometry(config.sunSize, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 }); // 太阳自发光
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
scene.add(sunMesh);
// 添加太阳光晕效果(简单版)
const glowGeo = new THREE.SphereGeometry(config.sunSize * 1.2, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.3, side: THREE.BackSide });
const glowMesh = new THREE.Mesh(glowGeo, glowMat);
scene.add(glowMesh);

// 3.3 创建行星
planetsData.forEach(p => {
    // 创建一个公转的父容器
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    orbitSystems.push({ group: orbitGroup, speed: p.speed, distance: p.distance });

    // 绘制轨道线
    const orbitPathGeo = new THREE.RingGeometry(p.distance - 0.2, p.distance + 0.2, 64);
    const orbitPathMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true, side: THREE.DoubleSide });
    const orbitPath = new THREE.Mesh(orbitPathGeo, orbitPathMat);
    orbitPath.rotation.x = -Math.PI / 2;
    scene.add(orbitPath);

    // 行星本体
    const geometry = new THREE.SphereGeometry(p.radius, 32, 32);
    let material;
    
    // 尝试加载纹理，如果不需要纹理或加载失败，使用颜色
    // 注意：本地 file:// 打开可能会跨域，为了健壮性，这里做了简单处理
    // 在真实生产环境应使用 try/catch 或 loading manager
    const texUrl = p.id === 'earth' ? 'earth_atmos_2048.jpg' : p.texture;
    
    // 加载纹理逻辑
    material = new THREE.MeshStandardMaterial({ 
        color: p.color,
        roughness: 0.7,
        metalness: 0.1
    });

    // 异步加载纹理
    textureLoader.load(TEXTURE_PATH + texUrl, 
        (tex) => { material.map = tex; material.needsUpdate = true; material.color.setHex(0xffffff); },
        undefined,
        (err) => { /* console.log('Texture load fallback'); */ }
    );

    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.position.x = p.distance; // 初始位置
    planetMesh.userData = { id: p.id, isPlanet: true, radius: p.radius, dist: p.distance }; // 绑定数据
    orbitGroup.add(planetMesh);
    meshObjects.push(planetMesh);

    // 土星环特例
    if(p.ring) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xccaa88, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2; // 初始水平
        ring.rotation.y = -0.2; // 稍微倾斜
        planetMesh.add(ring);
    }
    
    // 绑定该行星对应的 Mesh 到数据对象，方便后续引用
    p.mesh = planetMesh;
    p.orbitGroup = orbitGroup;
});

// =====================
// 4. 逻辑控制与动画 (Logic & Animation)
// =====================
let isFocused = false;
let focusedPlanet = null;
let animationId;

// 射线检测
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function animate() {
    animationId = requestAnimationFrame(animate);
    
    // 公转动画 (如果正在聚焦某行星，停止公转以保持画面稳定，或者你可以选择让它继续转)
    if (!isFocused) {
        const time = Date.now() * 0.0005;
        orbitSystems.forEach(sys => {
            sys.group.rotation.y += sys.speed * config.orbitSpeedMultiplier * 0.01;
        });
    }

    // 自转动画
    meshObjects.forEach(mesh => {
        mesh.rotation.y += config.rotationSpeedMultiplier;
    });

    controls.update();
    renderer.render(scene, camera);
}
animate();

// =====================
// 5. 交互事件处理 (Interactions)
// =====================

// 5.1 点击/触摸选择
window.addEventListener('pointerdown', onPointerDown);

function onPointerDown(event) {
    // 如果点击的是 UI 元素，不触发 3D 交互
    if (event.target.closest('#info-panel') || event.target.closest('.controls') || event.target.closest('#search-container')) return;

    // 计算鼠标坐标 (-1 到 +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshObjects);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.isPlanet) {
            focusOnPlanet(object);
        }
    } else {
        // 点击空白处，重置视角
        if(isFocused && !event.target.closest('button')) {
            resetView();
        }
    }
}

// 5.2 聚焦行星逻辑
function focusOnPlanet(mesh) {
    if (isFocused && focusedPlanet === mesh) return;
    
    isFocused = true;
    focusedPlanet = mesh;

    // 获取行星的世界坐标
    const targetPos = new THREE.Vector3();
    mesh.getWorldPosition(targetPos);

    // 计算新的相机位置：在行星前方并稍微向上
    // 为了让行星在屏幕左下角，我们需要相机的 Target 是行星，
    // 但相机的 offset 位置要偏右上方，或者我们利用 HTML 布局遮挡右侧，让视觉重心在左侧。
    // 这里采用简单方案：拉近镜头，利用 UI 遮挡右侧。
    
    const offsetDistance = mesh.userData.radius * 4; // 距离表面 4 倍半径
    // 简单的偏移向量
    const offset = new THREE.Vector3(offsetDistance, offsetDistance * 0.5, offsetDistance); 
    
    const newCameraPos = targetPos.clone().add(offset);

    // 使用 GSAP 平滑过渡
    gsap.to(camera.position, {
        x: newCameraPos.x,
        y: newCameraPos.y,
        z: newCameraPos.z,
        duration: 1.5,
        ease: "power2.out"
    });

    gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => controls.update()
    });

    // 展开 UI 面板
    showInfoPanel(mesh.userData.id);
    // 隐藏搜索框
    document.getElementById('search-container').classList.add('hidden');
}

// 5.3 重置视角
function resetView() {
    isFocused = false;
    focusedPlanet = null;
    hideInfoPanel();
    document.getElementById('search-container').classList.remove('hidden');

    gsap.to(camera.position, {
        x: 0, y: 120, z: 200,
        duration: 1.5,
        ease: "power2.inOut"
    });
    
    gsap.to(controls.target, {
        x: 0, y: 0, z: 0,
        duration: 1.5,
        ease: "power2.inOut"
    });
}

// =====================
// 6. UI 逻辑 (UI Logic)
// =====================

// 时间更新
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}, 1000);

// 搜索框显隐
document.getElementById('toggle-search-btn').addEventListener('click', () => {
    const search = document.getElementById('search-container');
    search.classList.toggle('hidden');
});

// 信息面板控制
function showInfoPanel(id) {
    const panel = document.getElementById('info-panel');
    const data = planetsData.find(p => p.id === id);
    const textData = i18n[config.lang][id];
    const commonData = i18n[config.lang];

    if (!data) return;

    document.getElementById('planet-name').innerText = textData.name;
    document.getElementById('planet-desc').innerText = textData.desc;
    
    // 更新参数
    document.getElementById('val-radius').innerText = data.data.r;
    document.getElementById('val-temp').innerText = data.data.t;
    document.getElementById('val-orbit').innerText = data.data.o;

    // 更新 Wiki 链接
    const wikiLang = config.lang === 'zh' ? 'zh' : 'en';
    document.getElementById('wiki-link').href = `https://${wikiLang}.wikipedia.org/wiki/${textData.name}`;

    // 更新标签语言
    document.querySelectorAll('.data-item .label').forEach(el => {
        const key = el.getAttribute('data-key');
        if(commonData[key]) el.innerText = commonData[key];
    });

    panel.classList.remove('hidden');
}

function hideInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
}

document.getElementById('close-panel').addEventListener('click', () => {
    resetView();
});

// 语言切换
document.getElementById('lang-btn').addEventListener('click', () => {
    config.lang = config.lang === 'zh' ? 'en' : 'zh';
    // 如果面板打开，刷新文本
    if(isFocused && focusedPlanet) {
        showInfoPanel(focusedPlanet.userData.id);
    }
});

// 窗口大小适配
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 移除 Loading
window.onload = () => {
    setTimeout(() => {
        document.getElementById('loader').style.opacity = 0;
    }, 1000);
};
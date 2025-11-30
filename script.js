import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =====================
// 1. 配置 (Configuration)
// =====================
const config = {
    lang: 'zh', 
    orbitSpeed: 0.1, // 全局公转倍率
    rotationSpeed: 0.05, // 全局自转倍率
    cameraFOV: 45,
    mobile: window.innerWidth < 768
};

// 数据: 行星参数 (半真实半艺术调整)
const planetsData = [
    { id: 'mercury', distance: 35, radius: 1.2, speed: 4.1, color: 0xA5A5A5, map: 'mercury.jpg', data: { r: '2,439 km', t: '167°C', o: '88 days' } },
    { id: 'venus', distance: 50, radius: 2.2, speed: 1.6, color: 0xE3BB76, map: 'venus_surface.jpg', atmosphere: 'venus_atmosphere.jpg', data: { r: '6,051 km', t: '464°C', o: '225 days' } },
    { id: 'earth', distance: 75, radius: 2.5, speed: 1, color: 0x2233FF, map: 'earth_daymap.jpg', cloud: 'earth_clouds.jpg', data: { r: '6,371 km', t: '15°C', o: '365 days' } },
    { id: 'mars', distance: 100, radius: 1.8, speed: 0.53, color: 0xD14A28, map: 'mars.jpg', data: { r: '3,389 km', t: '-65°C', o: '687 days' } },
    { id: 'jupiter', distance: 150, radius: 8, speed: 0.08, color: 0xD8CA9D, map: 'jupiter.jpg', data: { r: '69,911 km', t: '-110°C', o: '12 years' } },
    { id: 'saturn', distance: 200, radius: 7, speed: 0.03, color: 0xF4D03F, map: 'saturn.jpg', ring: true, data: { r: '58,232 km', t: '-140°C', o: '29 years' } },
    { id: 'uranus', distance: 250, radius: 5, speed: 0.01, color: 0x4FD0E7, map: 'uranus.jpg', data: { r: '25,362 km', t: '-195°C', o: '84 years' } },
    { id: 'neptune', distance: 290, radius: 4.8, speed: 0.006, color: 0x2955E1, map: 'neptune.jpg', data: { r: '24,622 km', t: '-200°C', o: '165 years' } }
];

// 文本 (I18n)
const i18n = {
    zh: {
        radius: "平均半径", temp: "表面温度", orbit: "公转周期", wiki: "查看维基百科",
        mercury: { name: "水星", desc: "太阳系中最小且最靠近太阳的行星。昼夜温差极大，表面布满陨石坑。" },
        venus: { name: "金星", desc: "太阳系中最热的行星。厚重的二氧化碳大气层导致了极强的温室效应。" },
        earth: { name: "地球", desc: "我们的家园。它是目前宇宙中已知唯一存在生命的星球，表面71%被水覆盖。" },
        mars: { name: "火星", desc: "这颗红色星球因其氧化铁表面而得名，是寻找地外生命的主要目标。" },
        jupiter: { name: "木星", desc: "巨大的气态巨行星，质量是其他所有行星总和的2.5倍，拥有标志性的大红斑。" },
        saturn: { name: "土星", desc: "以其壮观的复杂环系闻名。它是一个气态巨行星，密度甚至低于水。" },
        uranus: { name: "天王星", desc: "躺在轨道上旋转的冰巨星。其大气中含有甲烷，使其呈现美丽的青蓝色。" },
        neptune: { name: "海王星", desc: "太阳系最外层的行星。这里有太阳系最强烈的风暴，风速可达超音速。" }
    },
    en: {
        radius: "Mean Radius", temp: "Avg Temp", orbit: "Orbit Period", wiki: "Visit Wikipedia",
        mercury: { name: "Mercury", desc: "The smallest planet in the Solar System. It has a solid, cratered surface." },
        venus: { name: "Venus", desc: "The hottest planet. Its thick atmosphere traps heat in a runaway greenhouse effect." },
        earth: { name: "Earth", desc: "Our home. The only place known to harbor life, with liquid water covering most of the surface." },
        mars: { name: "Mars", desc: "The Red Planet. Dusty, cold, desert world with a very thin atmosphere." },
        jupiter: { name: "Jupiter", desc: "A gas giant and the largest planet. The Great Red Spot is a centuries-old storm." },
        saturn: { name: "Saturn", desc: "Adorned with a dazzling, complex system of icy rings." },
        uranus: { name: "Uranus", desc: "An ice giant that rotates at a nearly 90-degree angle from the plane of its orbit." },
        neptune: { name: "Neptune", desc: "The most distant major planet. Dark, cold, and whipped by supersonic winds." }
    }
};

// 纹理基础路径 (GitHub raw 资源，带错误处理)
const TEXTURE_BASE = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';

// =====================
// 2. 初始化场景 (Init)
// =====================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
// 使用指数雾增加深空纵深感
scene.fog = new THREE.FogExp2(0x000000, 0.001);

const camera = new THREE.PerspectiveCamera(config.cameraFOV, window.innerWidth / window.innerHeight, 0.1, 1500);
// 初始位置：俯视偏侧
camera.position.set(0, 150, 250);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 600;
controls.minDistance = 20;

// 光照系统
// 环境光
const ambientLight = new THREE.AmbientLight(0x333333); 
scene.add(ambientLight);
// 太阳点光源
const sunLight = new THREE.PointLight(0xffffff, 2, 800);
scene.add(sunLight);

// =====================
// 3. 构建天体 (Objects)
// =====================
const textureLoader = new THREE.TextureLoader();
const meshObjects = []; 
const orbitGroups = [];

// 3.1 太阳 (更真实的发光体)
function createSun() {
    // 核心
    const sunGeo = new THREE.SphereGeometry(18, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 }); 
    const sun = new THREE.Mesh(sunGeo, sunMat);
    
    // 光晕 (利用背面的透明球体模拟大气)
    const glowGeo = new THREE.SphereGeometry(18.5, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0xff4500, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    sun.add(glow);
    
    // 外部大光晕 (简单粒子效果或大球)
    const haloGeo = new THREE.SphereGeometry(22, 64, 64);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    sun.add(halo);

    scene.add(sun);
    return sun;
}
const sunMesh = createSun();

// 3.2 星空背景 (粒子 + 流星)
function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const count = 5000;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for(let i=0; i<count*3; i+=3) {
        pos[i] = (Math.random() - 0.5) * 2000;
        pos[i+1] = (Math.random() - 0.5) * 2000;
        pos[i+2] = (Math.random() - 0.5) * 2000;
        
        // 星星颜色微调 (蓝/白/黄)
        const starType = Math.random();
        if(starType > 0.9) { colors[i]=1; colors[i+1]=0.9; colors[i+2]=0.5; } // 黄
        else if(starType > 0.7) { colors[i]=0.7; colors[i+1]=0.8; colors[i+2]=1; } // 蓝
        else { colors[i]=1; colors[i+1]=1; colors[i+2]=1; } // 白
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}
createStarField();

// 流星管理
const shootingStars = [];
function createShootingStar() {
    if(Math.random() > 0.05) return; // 限制产生频率
    
    const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,10) // 尾巴长度
    ]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
    const line = new THREE.Line(geo, mat);
    
    // 随机位置
    const r = 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    line.position.x = r * Math.sin(phi) * Math.cos(theta);
    line.position.y = r * Math.cos(phi);
    line.position.z = r * Math.sin(phi) * Math.sin(theta);
    
    // 随机方向
    line.lookAt(0,0,0);
    
    // 速度
    line.userData = { speed: 8 + Math.random() * 5, life: 1.0 };
    scene.add(line);
    shootingStars.push(line);
}

// 3.3 创建行星
planetsData.forEach(p => {
    // 1. 公转组
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    
    // 随机初始角度，避免都在一条线上
    orbitGroup.rotation.y = Math.random() * Math.PI * 2;
    orbitGroups.push({ group: orbitGroup, speed: p.speed, id: p.id });

    // 2. 轨道线
    const pathGeo = new THREE.RingGeometry(p.distance - 0.3, p.distance + 0.3, 128);
    const pathMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.08, 
        transparent: true, 
        side: THREE.DoubleSide 
    });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    scene.add(path);

    // 3. 行星 Mesh
    const geometry = new THREE.SphereGeometry(p.radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({ 
        color: p.color, // 默认颜色
        roughness: 0.8,
        metalness: 0.1
    });

    // 纹理加载 (带失败回退)
    textureLoader.load(
        TEXTURE_BASE + p.map,
        (tex) => { 
            material.map = tex; 
            material.color.setHex(0xffffff); // 纹理加载成功，重置颜色
            material.needsUpdate = true; 
        },
        undefined, 
        (err) => { 
            // console.warn(`Texture ${p.map} failed, using fallback color.`); 
        }
    );

    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = p.distance;
    planet.userData = { isPlanet: true, ...p };
    
    orbitGroup.add(planet);
    meshObjects.push(planet);
    p.meshRef = planet; // 引用保存

    // 4. 特殊装饰：云层 (地球)
    if(p.cloud) {
        const cloudGeo = new THREE.SphereGeometry(p.radius * 1.02, 64, 64);
        const cloudMat = new THREE.MeshStandardMaterial({
            alphaMap: null, // 需要专门的 alpha 图，这里简化处理
            transparent: true,
            opacity: 0.3,
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        textureLoader.load(TEXTURE_BASE + p.cloud, (tex) => {
            cloudMat.map = tex;
            cloudMat.transparent = true;
            cloudMat.opacity = 0.4;
            cloudMat.needsUpdate = true;
        });
        const clouds = new THREE.Mesh(cloudGeo, cloudMat);
        planet.add(clouds);
        p.cloudsRef = clouds;
    }

    // 5. 特殊装饰：光环 (土星)
    if(p.ring) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.3, 64);
        const ringTex = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn_ring.png');
        
        // 调整 UV 以匹配环形纹理
        const pos = ringGeo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++){
            v3.fromBufferAttribute(pos, i);
            ringGeo.attributes.uv.setXY(i, v3.length() < p.radius * 1.8 ? 0 : 1, 1);
        }

        const ringMat = new THREE.MeshBasicMaterial({ 
            map: ringTex,
            color: 0xffffff, 
            side: THREE.DoubleSide, 
            transparent: true,
            opacity: 0.8 
        });
        
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.rotation.y = 0.1; // 稍微倾斜
        planet.add(ring);
    }
});

// =====================
// 4. 逻辑与动画 (Logic)
// =====================
let isFocused = false;
let focusedPlanetData = null;

// 射线检测
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 1. 行星公转 (如果未聚焦)
    if (!isFocused) {
        orbitGroups.forEach(obj => {
            obj.group.rotation.y += obj.speed * config.orbitSpeed * 0.05;
        });
    }

    // 2. 自转 (一直进行)
    meshObjects.forEach(mesh => {
        mesh.rotation.y += config.rotationSpeed;
        // 云层稍快一点
        if(mesh.children.length > 0 && mesh.userData.id === 'earth') {
            mesh.children[0].rotation.y += 0.002;
        }
    });

    // 3. 流星动画
    createShootingStar();
    for(let i=shootingStars.length-1; i>=0; i--) {
        const s = shootingStars[i];
        s.translateZ(s.userData.speed);
        s.material.opacity -= 0.02;
        if(s.material.opacity <= 0) {
            scene.remove(s);
            shootingStars.splice(i, 1);
        }
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// =====================
// 5. 交互 (Interactions)
// =====================

window.addEventListener('pointerdown', onPointerDown);

function onPointerDown(event) {
    // 忽略 UI 点击
    if (event.target.closest('#info-panel') || event.target.closest('.controls') || event.target.closest('#search-container')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshObjects);

    if (intersects.length > 0) {
        const target = intersects[0].object;
        focusOnPlanet(target);
    } else {
        if(isFocused && !event.target.closest('button')) resetView();
    }
}

function focusOnPlanet(mesh) {
    if (isFocused && focusedPlanetData === mesh.userData) return;
    
    isFocused = true;
    focusedPlanetData = mesh.userData;

    // 计算目标位置
    // 我们需要把相机放在星球的“右上方”，这样星球看起来就在“左下角”
    const planetWorldPos = new THREE.Vector3();
    mesh.getWorldPosition(planetWorldPos);

    const distance = mesh.userData.radius * 4.0; // 距离
    
    // 偏移量：X轴正向偏移(右)，Y轴正向(上)，Z轴正向(前)
    const offset = new THREE.Vector3(distance * 1.2, distance * 0.6, distance * 1.2);
    
    // 如果是手机端，策略改变：星球居中偏下
    if(window.innerWidth < 768) {
        offset.set(0, distance * 1.5, distance * 2);
    }

    const newCamPos = planetWorldPos.clone().add(offset);

    // 1. 移动相机
    gsap.to(camera.position, {
        x: newCamPos.x, y: newCamPos.y, z: newCamPos.z,
        duration: 1.5,
        ease: "power2.inOut"
    });

    // 2. 锁定视角中心到星球
    gsap.to(controls.target, {
        x: planetWorldPos.x, y: planetWorldPos.y, z: planetWorldPos.z,
        duration: 1.5,
        ease: "power2.inOut"
    });

    // 3. UI 变化
    document.getElementById('search-container').classList.add('hidden');
    updateInfoPanel(mesh.userData.id);
}

function resetView() {
    isFocused = false;
    focusedPlanetData = null;

    document.getElementById('info-panel').classList.add('hidden');
    document.getElementById('search-container').classList.remove('hidden');

    gsap.to(camera.position, {
        x: 0, y: 150, z: 250,
        duration: 1.8,
        ease: "power2.inOut"
    });
    gsap.to(controls.target, {
        x: 0, y: 0, z: 0,
        duration: 1.8,
        ease: "power2.inOut"
    });
}

// UI 内容更新
function updateInfoPanel(id) {
    const text = i18n[config.lang][id];
    const data = planetsData.find(p => p.id === id).data;
    const labels = i18n[config.lang];

    document.getElementById('planet-name').innerText = text.name;
    document.getElementById('planet-desc').innerText = text.desc;
    document.getElementById('val-radius').innerText = data.r;
    document.getElementById('val-temp').innerText = data.t;
    document.getElementById('val-orbit').innerText = data.o;
    
    // 更新标签
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if(labels[key]) el.innerText = labels[key];
    });

    // 维基链接
    const langPrefix = config.lang === 'zh' ? 'zh' : 'en';
    document.getElementById('wiki-link').href = `https://${langPrefix}.wikipedia.org/wiki/${text.name}`;

    document.getElementById('info-panel').classList.remove('hidden');
}

// 事件监听
document.getElementById('close-panel').addEventListener('click', resetView);

document.getElementById('lang-btn').addEventListener('click', () => {
    config.lang = config.lang === 'zh' ? 'en' : 'zh';
    if(isFocused && focusedPlanetData) updateInfoPanel(focusedPlanetData.id);
});

document.getElementById('toggle-search-btn').addEventListener('click', () => {
    document.getElementById('search-container').classList.toggle('hidden');
});

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 初始化 Loading 移除
window.onload = () => {
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
        }, 800);
    }, 1500); // 稍微多给点时间加载纹理
};
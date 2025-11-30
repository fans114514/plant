// =================配置与数据=================
const CONFIG = {
    cameraZ: 150,
    orbitSpeedMultiplier: 0.2, // 全局速度控制
    focusOffset: { x: 10, y: 5, z: 15 }, // 聚焦时相机的相对偏移
    mobileFocusOffset: { x: 0, y: 15, z: 25 }
};

const TEXTURES = {
    sun: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Map_of_the_full_sun.jpg',
    mercury: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg',
    venus: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg',
    earth: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Solarsystemscope_texture_2k_earth_daymap.jpg',
    mars: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
    jupiter: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg',
    saturn: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg', // 简化：没有环的贴图，环程序化生成
    uranus: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg',
    neptune: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg',
    stars: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Hyades.jpg' // 星空背景
};

const PLANET_DATA = [
    { name: "Mercury", nameCN: "水星", radius: 0.8, distance: 20, speed: 0.02, color: 0xAAAAAA, texture: TEXTURES.mercury, desc: "The smallest planet in the Solar System.", descCN: "太阳系中最小的行星，距离太阳最近。", realData: { r: "2,439 km", t: "167°C", o: "88 days" } },
    { name: "Venus", nameCN: "金星", radius: 1.5, distance: 30, speed: 0.015, color: 0xE3BB76, texture: TEXTURES.venus, desc: "Second planet from the Sun. It's the hottest.", descCN: "距离太阳第二近的行星，也是最热的行星。", realData: { r: "6,051 km", t: "464°C", o: "225 days" } },
    { name: "Earth", nameCN: "地球", radius: 1.6, distance: 45, speed: 0.01, color: 0x2233FF, texture: TEXTURES.earth, desc: "Our home, the only known planet with life.", descCN: "我们的家园，目前已知唯一孕育生命的星球。", realData: { r: "6,371 km", t: "15°C", o: "365 days" } },
    { name: "Mars", nameCN: "火星", radius: 1.2, distance: 60, speed: 0.008, color: 0xFF4500, texture: TEXTURES.mars, desc: "The Red Planet, a dusty, cold, desert world.", descCN: "红色星球，一个寒冷、沙尘覆盖的沙漠世界。", realData: { r: "3,389 km", t: "-65°C", o: "687 days" } },
    { name: "Jupiter", nameCN: "木星", radius: 3.5, distance: 85, speed: 0.005, color: 0xBCAB8C, texture: TEXTURES.jupiter, desc: "The largest planet in the Solar System.", descCN: "太阳系中体积最大的行星。", realData: { r: "69,911 km", t: "-110°C", o: "12 years" } },
    { name: "Saturn", nameCN: "土星", radius: 3.0, distance: 110, speed: 0.004, color: 0xE6DBA0, texture: TEXTURES.saturn, hasRing: true, desc: "Adorned with a dazzling, complex system of icy rings.", descCN: "拥有复杂而耀眼的冰环系统。", realData: { r: "58,232 km", t: "-140°C", o: "29 years" } },
    { name: "Uranus", nameCN: "天王星", radius: 2.2, distance: 135, speed: 0.003, color: 0x76D7EA, texture: TEXTURES.uranus, desc: "An ice giant that spins on its side.", descCN: "一颗躺着自转的冰巨星。", realData: { r: "25,362 km", t: "-195°C", o: "84 years" } },
    { name: "Neptune", nameCN: "海王星", radius: 2.1, distance: 160, speed: 0.002, color: 0x4B70DD, texture: TEXTURES.neptune, desc: "The most distant major planet orbiting our Sun.", descCN: "距离太阳最远的行星，拥有猛烈的风暴。", realData: { r: "24,622 km", t: "-200°C", o: "165 years" } }
];

// =================全局变量=================
let scene, camera, renderer, controls;
let planets = []; // 存储行星网格对象
let orbits = []; // 存储轨道线
let sun;
let isFocusing = false;
let currentFocusPlanet = null;
let lang = 'zh'; // 'zh' or 'en'
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// =================初始化系统=================
function init() {
    // 1. 场景
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002); // 远景雾化，增加深邃感

    // 2. 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 60, CONFIG.cameraZ);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 性能优化
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 4. 控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 300;
    controls.minDistance = 10;

    // 5. 灯光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // 环境光
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 1.5, 300); // 太阳点光源
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 6. 创建对象
    createStars();
    createSun();
    createPlanets();

    // 7. 事件监听
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('pointerdown', onMouseDown, false);
    renderer.domElement.addEventListener('pointerup', onMouseUp, false);
    
    // UI 事件
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') performSearch(); });
    document.getElementById('hide-search-btn').addEventListener('click', toggleSearch);
    document.getElementById('close-panel').addEventListener('click', clearFocus);
    document.getElementById('lang-btn').addEventListener('click', toggleLang);

    // 启动循环
    animate();
    updateClock();
    setInterval(updateClock, 1000);
}

// =================创建场景物体=================

// 纹理加载器
const textureLoader = new THREE.TextureLoader();

function createStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const posArray = new Float32Array(starCount * 3);
    for(let i=0; i<starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
}

function createSun() {
    // 太阳本体
    const geometry = new THREE.SphereGeometry(8, 64, 64);
    const texture = textureLoader.load(TEXTURES.sun);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        color: 0xffff00 // 纹理加载失败时的后备颜色
    });
    sun = new THREE.Mesh(geometry, material);
    scene.add(sun);

    // 太阳光晕 (Sprite)
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: textureLoader.load('https://threejs.org/examples/textures/sprites/glow.png'), 
        color: 0xffaa00, 
        transparent: true, 
        blending: THREE.AdditiveBlending 
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(30, 30, 1.0);
    sun.add(sprite); // 添加到太阳对象中
}

function createPlanets() {
    PLANET_DATA.forEach(data => {
        // 1. 创建轨道线
        const orbitCurve = new THREE.EllipseCurve(0, 0, data.distance, data.distance, 0, 2 * Math.PI, false, 0);
        const points = orbitCurve.getPoints(128);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
        const orbit = new THREE.LineLoop(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        orbits.push(orbit);

        // 2. 创建行星组（用于自转和公转）
        const planetGroup = new THREE.Group();
        // 初始位置
        const startAngle = Math.random() * Math.PI * 2;
        planetGroup.userData = { angle: startAngle, distance: data.distance, speed: data.speed, info: data };
        planetGroup.position.set(Math.cos(startAngle) * data.distance, 0, Math.sin(startAngle) * data.distance);
        scene.add(planetGroup);

        // 3. 行星网格
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        
        let material;
        // 尝试加载纹理，如果失败显示颜色
        textureLoader.load(data.texture, 
            (tex) => { material.map = tex; material.needsUpdate = true; },
            undefined,
            (err) => { console.log("Texture load failed, using color"); }
        );

        material = new THREE.MeshStandardMaterial({
            color: data.color, // 底色
            roughness: 0.7,
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { isPlanet: true, parentGroup: planetGroup }; // 标记用于点击检测
        planetGroup.add(mesh);
        planets.push(planetGroup);

        // 4. 土星环特例
        if (data.hasRing) {
            const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.2, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xaa9977, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            planetGroup.add(ring);
        }
    });
}

// =================动画循环=================
function animate() {
    requestAnimationFrame(animate);

    // 太阳自转
    if(sun) sun.rotation.y += 0.002;

    // 行星公转与自转
    if (!isFocusing) { // 聚焦时不公转，方便观察
        planets.forEach(p => {
            p.userData.angle += p.userData.speed * CONFIG.orbitSpeedMultiplier;
            p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
            p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
            
            // 行星自转
            p.children[0].rotation.y += 0.01;
        });
    } else if (currentFocusPlanet) {
        // 聚焦时仅自转
        currentFocusPlanet.children[0].rotation.y += 0.005;
        
        // 相机跟随（可选：如果希望镜头一直锁定即使公转也行，这里简单处理为暂停公转）
    }

    controls.update();
    renderer.render(scene, camera);
}

// =================交互逻辑=================

// 点击处理（区别拖拽和点击）
let mouseDownTime = 0;
let mouseDownPos = new THREE.Vector2();

function onMouseDown(event) {
    mouseDownTime = Date.now();
    mouseDownPos.set(event.clientX, event.clientY);
}

function onMouseUp(event) {
    const timeDiff = Date.now() - mouseDownTime;
    const distDiff = Math.abs(event.clientX - mouseDownPos.x) + Math.abs(event.clientY - mouseDownPos.y);

    // 如果按下时间短且移动距离小，视为点击
    if (timeDiff < 300 && distDiff < 5) {
        onMouseClick(event);
    }
}

function onMouseClick(event) {
    // 归一化设备坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 检测相交物体 (递归检测)
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // 找到第一个是行星的对象
        const target = intersects.find(obj => obj.object.userData.isPlanet);
        if (target) {
            focusOnPlanet(target.object.userData.parentGroup);
        } else {
            // 点击空白处，如果当前在聚焦，则退出
            if (isFocusing) clearFocus();
        }
    } else {
        if (isFocusing) clearFocus();
    }
}

function focusOnPlanet(planetGroup) {
    isFocusing = true;
    currentFocusPlanet = planetGroup;
    
    const data = planetGroup.userData.info;
    const isMobile = window.innerWidth < 768;
    
    // 计算目标位置
    // 我们希望相机在行星附近，稍微偏移，使得行星在屏幕左下角（或移动端的中心）
    // 简单做法：相机看向行星中心，但通过 offset 调整相机位置
    const offset = isMobile ? CONFIG.mobileFocusOffset : CONFIG.focusOffset;
    
    // 目标相机位置（相对于行星的世界坐标）
    const targetPos = new THREE.Vector3(
        planetGroup.position.x + offset.x,
        planetGroup.position.y + offset.y,
        planetGroup.position.z + offset.z
    );

    // 1. 移动相机
    gsap.to(camera.position, {
        duration: 1.5,
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        ease: "power2.inOut",
        onUpdate: () => {
             // 在动画过程中保持看向行星，或者稍微偏一点使得行星不在正中心
             controls.target.copy(planetGroup.position);
        }
    });

    // 2. 锁定控制器中心
    gsap.to(controls.target, {
        duration: 1.5,
        x: planetGroup.position.x,
        y: planetGroup.position.y,
        z: planetGroup.position.z,
        ease: "power2.inOut"
    });

    // 3. 显示 UI
    updateInfoPanel(data);
    document.getElementById('info-panel').classList.remove('hidden');
    document.getElementById('search-container').classList.add('hidden-ui');
}

function clearFocus() {
    if (!isFocusing) return;
    isFocusing = false;
    currentFocusPlanet = null;

    // 恢复相机到概览视角
    gsap.to(camera.position, {
        duration: 1.5,
        x: 0, 
        y: 60, 
        z: CONFIG.cameraZ,
        ease: "power2.inOut"
    });

    gsap.to(controls.target, {
        duration: 1.5,
        x: 0, y: 0, z: 0,
        ease: "power2.inOut"
    });

    document.getElementById('info-panel').classList.add('hidden');
    document.getElementById('search-container').classList.remove('hidden-ui');
}

// =================UI & 工具函数=================

function updateInfoPanel(data) {
    const isCN = lang === 'zh';
    document.getElementById('planet-name').innerText = isCN ? data.nameCN : data.name;
    document.getElementById('planet-desc').innerText = isCN ? data.descCN : data.desc;
    
    document.getElementById('val-radius').innerText = data.realData.r;
    document.getElementById('val-temp').innerText = data.realData.t;
    document.getElementById('val-orbit').innerText = data.realData.o;
    
    const wikiUrl = `https://${isCN ? 'zh' : 'en'}.wikipedia.org/wiki/${data.name}`;
    document.getElementById('wiki-btn').href = wikiUrl;
}

function toggleLang() {
    lang = lang === 'zh' ? 'en' : 'zh';
    // 更新按钮文字
    document.getElementById('lang-btn').innerText = lang === 'zh' ? 'EN / 中' : 'CN / 英';
    
    // 更新当前显示的面板
    if (isFocusing && currentFocusPlanet) {
        updateInfoPanel(currentFocusPlanet.userData.info);
    }
    
    // 更新静态文本
    const tips = {
        'zh': "双击聚焦行星 / 拖拽旋转视角",
        'en': "Double click to focus / Drag to rotate"
    };
    document.querySelector('#footer-tip span').innerText = tips[lang];
    
    const searchPH = {
        'zh': "必应搜索...",
        'en': "Bing Search..."
    };
    document.getElementById('search-input').placeholder = searchPH[lang];
}

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function performSearch() {
    const query = document.getElementById('search-input').value;
    if (query) {
        window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
}

function toggleSearch() {
    const box = document.querySelector('.search-box');
    const isHidden = box.style.opacity === '0';
    box.style.opacity = isHidden ? '1' : '0';
    box.style.pointerEvents = isHidden ? 'auto' : 'none';
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 启动
init();
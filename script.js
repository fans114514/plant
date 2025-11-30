/**
 * 3D Solar System Configuration & Logic
 */

// ================= 1. 数据配置 (Data Config) =================
const SYSTEM_CONFIG = {
    lang: 'zh', // 'zh' or 'en'
    rotateSpeedBase: 0.5,
    textureQuality: 'high' // 'high' or 'low'
};

const TEXTS = {
    zh: {
        radius: "半径", temp: "平均温度", orbit: "公转周期", wiki: "查看百科",
        searchPlaceholder: "必应搜索...", loading: "正在加载星系资源...",
        sun: "太阳", mercury: "水星", venus: "金星", earth: "地球", mars: "火星",
        jupiter: "木星", saturn: "土星", uranus: "天王星", neptune: "海王星"
    },
    en: {
        radius: "Radius", temp: "Avg Temp", orbit: "Orbit Period", wiki: "Wikipedia",
        searchPlaceholder: "Search Bing...", loading: "Loading Solar System...",
        sun: "Sun", mercury: "Mercury", venus: "Venus", earth: "Earth", mars: "Mars",
        jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune"
    }
};

// 行星数据 (模拟比例，非严格真实比例，为了视觉效果做了调整)
const PLANETS = [
    {
        key: 'sun', color: 0xFFAA00, radius: 12, distance: 0, speed: 0,
        temp: "5500°C", orbitPeriod: "-", type: 'star',
        desc_zh: "太阳系的中心恒星，占太阳系总质量的99.86%。",
        desc_en: "The star at the center of the Solar System.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Sun_texture.jpg" // 示例纹理
    },
    {
        key: 'mercury', color: 0xA5A5A5, radius: 2, distance: 25, speed: 0.02,
        temp: "167°C", orbitPeriod: "88 days",
        desc_zh: "最小的行星，也是离太阳最近的行星。",
        desc_en: "The smallest planet and closest to the Sun.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg"
    },
    {
        key: 'venus', color: 0xE3BB76, radius: 3.5, distance: 38, speed: 0.015,
        temp: "464°C", orbitPeriod: "225 days",
        desc_zh: "太阳系中最热的行星，有着厚厚的大气层。",
        desc_en: "The hottest planet in the solar system with a thick atmosphere.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg"
    },
    {
        key: 'earth', color: 0x2233FF, radius: 3.6, distance: 55, speed: 0.01,
        temp: "15°C", orbitPeriod: "365 days",
        desc_zh: "我们的家园，目前已知唯一孕育生命的星球。",
        desc_en: "Our home, the only planet known to harbor life.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/c/cb/The_Blue_Marble_%28remastered%29.jpg"
    },
    {
        key: 'mars', color: 0xFF4500, radius: 2.5, distance: 70, speed: 0.008,
        temp: "-65°C", orbitPeriod: "687 days",
        desc_zh: "红色星球，表面布满氧化铁。",
        desc_en: "The Red Planet, dusty and cold.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg"
    },
    {
        key: 'jupiter', color: 0xC88B3A, radius: 8, distance: 100, speed: 0.005,
        temp: "-110°C", orbitPeriod: "12 years",
        desc_zh: "巨大的气态巨行星，拥有标志性的大红斑。",
        desc_en: "A gas giant and the largest planet in the solar system.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg"
    },
    {
        key: 'saturn', color: 0xC5AB6E, radius: 7, distance: 140, speed: 0.003,
        temp: "-140°C", orbitPeriod: "29 years", hasRing: true,
        desc_zh: "以其美丽复杂的行星环系统而闻名。",
        desc_en: "Famous for its prominent ring system.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg"
    },
    {
        key: 'uranus', color: 0x4FD0E7, radius: 5, distance: 180, speed: 0.002,
        temp: "-195°C", orbitPeriod: "84 years",
        desc_zh: "冰巨星，其自转轴几乎与轨道平面平行（躺着转）。",
        desc_en: "An ice giant that rotates on its side.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg"
    },
    {
        key: 'neptune', color: 0x2E5D9C, radius: 4.8, distance: 210, speed: 0.0015,
        temp: "-200°C", orbitPeriod: "165 years",
        desc_zh: "太阳系最外层的行星，风暴猛烈。",
        desc_en: "The most distant planet, known for supersonic winds.",
        texture: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg"
    }
];

// ================= 2. Three.js 初始化 (Initialization) =================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// 相机设置
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 80, 150); // 初始俯视角度

// 渲染器设置
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 性能优化
container.appendChild(renderer.domElement);

// 控制器
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 500;
controls.minDistance = 20;

// 星空背景 (程序化生成)
function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) {
        positions[i] = (Math.random() - 0.5) * 1000;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 1.5, color: 0xFFFFFF, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(geometry, material);
    scene.add(starField);
}
createStarfield();

// 灯光
const ambientLight = new THREE.AmbientLight(0x333333); // 环境光
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xFFFFFF, 2, 400); // 太阳光
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// 纹理加载器
const textureLoader = new THREE.TextureLoader();

// 辅助函数：创建备用纹理（如果图片加载失败，生成带颜色的Canvas）
function createFallbackTexture(colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + new THREE.Color(colorHex).getHexString();
    ctx.fillRect(0,0,64,64);
    // 加一点噪点模拟纹理
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.font = "12px Arial";
    ctx.fillText("Texture", 5, 30);
    return new THREE.CanvasTexture(canvas);
}

// ================= 3. 构建太阳系 (Build Solar System) =================
const planetMeshes = []; // 存储行星网格以便交互
const orbitLines = [];   // 存储轨道

PLANETS.forEach(data => {
    // 1. 创建轨道 (Orbit)
    if (data.distance > 0) {
        const orbitGeometry = new THREE.RingGeometry(data.distance - 0.2, data.distance + 0.2, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.1 
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = -Math.PI / 2;
        scene.add(orbit);
        orbitLines.push(orbit);
    }

    // 2. 创建行星组 (Group for rotation center)
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // 3. 创建行星本体
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    let material;

    if (data.key === 'sun') {
        // 太阳特殊处理：发光
        material = new THREE.MeshBasicMaterial({ color: 0xFF9900 });
        // 添加光晕
        const spriteMat = new THREE.SpriteMaterial({ 
            map: textureLoader.load('https://threejs.org/examples/textures/sprites/glow.png'), 
            color: 0xFF8800, transparent: true, blending: THREE.AdditiveBlending 
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(60, 60, 1.0);
        planetGroup.add(sprite);
    } else {
        // 普通行星
        material = new THREE.MeshStandardMaterial({
            roughness: 0.7,
            metalness: 0.1,
            color: data.color // 基础底色，防止纹理未加载时黑屏
        });
        
        // 加载纹理
        textureLoader.load(data.texture, (tex) => {
            material.map = tex;
            material.needsUpdate = true;
        }, undefined, () => {
            // Error fallback
            console.log(`Failed to load texture for ${data.key}`);
            material.map = createFallbackTexture(data.color);
        });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = data.distance; // 初始位置
    mesh.userData = data; // 绑定数据
    
    // 添加一个不可见的点击热区（比星球略大），方便手机点击
    const hitboxGeo = new THREE.SphereGeometry(data.radius * 1.5, 16, 16);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    mesh.add(hitbox);
    
    // 土星环
    if (data.hasRing) {
        const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0xC5AB6E, side: THREE.DoubleSide, transparent: true, opacity: 0.6 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2; // 水平放置，但因为被加到了mesh（球体）上，需要调整
        // 修正：环应该加在mesh内部或group内部，这里为了简单加在mesh上并旋转mesh
        // 更好的方式：将环加在mesh里，让环相对于球体倾斜
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
        mesh.rotation.z = Math.PI / 6; // 整体倾斜一点
    }

    planetGroup.add(mesh);
    planetMeshes.push(mesh);
    
    // 存储引用用于动画
    data.mesh = mesh;
    data.group = planetGroup;
    data.angle = Math.random() * Math.PI * 2; // 随机初始角度
});

// ================= 4. 动画循环 (Animation Loop) =================
let isFocused = false; // 是否处于聚焦模式

function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    controls.update();

    // 只有在非聚焦模式下，才进行公转
    if (!isFocused) {
        PLANETS.forEach(p => {
            if (p.speed > 0) {
                p.angle += p.speed * 0.5; // 速度调整
                p.mesh.position.x = Math.cos(p.angle) * p.distance;
                p.mesh.position.z = Math.sin(p.angle) * p.distance;
                // 自转
                p.mesh.rotation.y += 0.005;
            }
        });
    } else {
         // 聚焦模式下仅保留自转，增加观赏性
         PLANETS.forEach(p => {
             if(p.mesh) p.mesh.rotation.y += 0.002;
         });
    }

    renderer.render(scene, camera);
}

// ================= 5. 交互逻辑 (Interactions) =================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 点击事件处理
function onMouseClick(event) {
    // 计算鼠标坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 允许检测 Hitbox 和 Planet Mesh
    const intersects = raycaster.intersectObjects(scene.children, true);

    // 过滤掉 Starfield 和 Orbit Lines
    const target = intersects.find(hit => hit.object.geometry.type === 'SphereGeometry' && hit.object !== scene);

    if (target) {
        // 找到所属的行星 Mesh (可能是 Hitbox，所以找父级或自己)
        let planetMesh = target.object;
        if (!planetMesh.userData.key && planetMesh.parent.userData.key) {
            planetMesh = planetMesh.parent;
        }

        if (planetMesh.userData.key) {
            focusOnPlanet(planetMesh);
        }
    } else {
        // 点击空白处，如果已聚焦则还原
        if (isFocused && !event.target.closest('.side-panel') && !event.target.closest('.top-bar') && !event.target.closest('#search-container')) {
            resetView();
        }
    }
}

// 聚焦行星逻辑
function focusOnPlanet(mesh) {
    if (isFocused && currentFocus === mesh) return;
    isFocused = true;
    currentFocus = mesh;

    const data = mesh.userData;
    
    // 1. 停止公转动画 (在 animate 中通过 isFocused 标志控制)

    // 2. 计算相机目标位置
    // 我们希望行星在屏幕左下角。
    // 在 3D 世界中，这意味相机要看向行星，但位置要偏右上方。
    
    const offsetDistance = data.radius * 4; // 距离行星多远
    const targetPos = new THREE.Vector3();
    mesh.getWorldPosition(targetPos); // 获取行星当前世界坐标

    const cameraEndPos = {
        x: targetPos.x + offsetDistance, 
        y: targetPos.y + offsetDistance * 0.5, 
        z: targetPos.z + offsetDistance
    };

    // 使用 Tween 平滑移动相机
    new TWEEN.Tween(camera.position)
        .to(cameraEndPos, 1500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    // 同时平滑移动控制器的聚焦点
    new TWEEN.Tween(controls.target)
        .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, 1500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    // 3. 显示 UI 信息
    showInfoPanel(data);
    
    // 隐藏搜索框
    document.getElementById('search-container').classList.add('hidden-search');
}

// 还原视图逻辑
let currentFocus = null;
function resetView() {
    isFocused = false;
    currentFocus = null;

    // 还原相机位置
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 80, z: 150 }, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    new TWEEN.Tween(controls.target)
        .to({ x: 0, y: 0, z: 0 }, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    hideInfoPanel();
    document.getElementById('search-container').classList.remove('hidden-search');
}

// ================= 6. UI 更新 (DOM Updates) =================
const infoPanel = document.getElementById('info-panel');
const titleEl = document.getElementById('planet-name');
const descEl = document.getElementById('planet-desc');
const wikiBtn = document.getElementById('wiki-btn');

function showInfoPanel(data) {
    infoPanel.classList.remove('hidden');
    
    // 更新文本
    updateLanguageUI(); // 确保是当前语言
    
    // 动态值
    document.getElementById('val-radius').innerText = data.radius * 1000 + " km (Scale)";
    document.getElementById('val-temp').innerText = data.temp;
    document.getElementById('val-orbit').innerText = data.orbitPeriod;
    
    // 简介与维基链接
    const isZh = SYSTEM_CONFIG.lang === 'zh';
    titleEl.innerText = isZh ? TEXTS.zh[data.key] : TEXTS.en[data.key]; // 名字映射
    descEl.innerText = isZh ? data.desc_zh : data.desc_en;
    wikiBtn.href = `https://${isZh?'zh':'en'}.wikipedia.org/wiki/${data.key}`;
    
    // 模拟图片预览 (使用Canvas截取当前渲染不太稳定，直接用CSS背景色或占位图)
    const imgDiv = document.getElementById('planet-img-view');
    imgDiv.style.backgroundColor = '#' + new THREE.Color(data.color).getHexString();
}

function hideInfoPanel() {
    infoPanel.classList.add('hidden');
}

// 语言切换
function updateLanguageUI() {
    const isZh = SYSTEM_CONFIG.lang === 'zh';
    const t = isZh ? TEXTS.zh : TEXTS.en;

    document.getElementById('lang-btn').innerText = isZh ? "English" : "中文";
    document.getElementById('search-input').placeholder = t.searchPlaceholder;
    document.getElementById('wiki-btn').innerText = t.wiki;
    
    // 更新 Panel Labels
    document.querySelectorAll('.label').forEach(el => {
        const key = el.getAttribute('data-key');
        if(t[key]) el.innerText = t[key];
    });

    // 如果面板打开中，实时更新当前行星信息
    if (isFocused && currentFocus) {
        const data = currentFocus.userData;
        titleEl.innerText = isZh ? TEXTS.zh[data.key] : TEXTS.en[data.key];
        descEl.innerText = isZh ? data.desc_zh : data.desc_en;
        wikiBtn.href = `https://${isZh?'zh':'en'}.wikipedia.org/wiki/${data.key}`;
    }
}

// ================= 7. 事件监听 (Event Listeners) =================

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 鼠标/触摸点击
window.addEventListener('mousedown', (e) => {
    // 简单的区分拖拽和点击
    window.mouseStart = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseup', (e) => {
    const dx = e.clientX - window.mouseStart.x;
    const dy = e.clientY - window.mouseStart.y;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        onMouseClick(e);
    }
});
// 移动端触摸支持
window.addEventListener('touchstart', (e) => {
    if(e.touches.length === 1) {
        window.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
});
window.addEventListener('touchend', (e) => {
    if(!window.touchStart) return;
    const dx = e.changedTouches[0].clientX - window.touchStart.x;
    const dy = e.changedTouches[0].clientY - window.touchStart.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        // 构造伪造的 event 对象传递给 onMouseClick
        onMouseClick({
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY,
            target: e.target
        });
    }
});

// 搜索功能
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const val = e.target.value;
        if (val) window.open(`https://www.bing.com/search?q=${encodeURIComponent(val)}`, '_blank');
    }
});

// 显隐搜索框
document.getElementById('toggle-search-btn').addEventListener('click', () => {
    document.getElementById('search-container').classList.toggle('hidden-search');
});

// 关闭详情页
document.getElementById('close-info-btn').addEventListener('click', resetView);

// 语言切换
document.getElementById('lang-btn').addEventListener('click', () => {
    SYSTEM_CONFIG.lang = SYSTEM_CONFIG.lang === 'zh' ? 'en' : 'zh';
    updateLanguageUI();
});

// 时钟
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString();
}, 1000);

// 移除 Loading
window.onload = () => {
    setTimeout(() => {
        document.getElementById('loading-overlay').style.opacity = 0;
        setTimeout(() => document.getElementById('loading-overlay').remove(), 500);
    }, 1000); // 假装加载一会，给纹理一点时间
    animate();
};
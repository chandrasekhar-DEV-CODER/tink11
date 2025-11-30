# My School Ride MVP需求文档

## 1. 网站名称
My School Ride -校车追踪管理系统（MVP版）

## 2. 网站描述
一个面向学校的校车管理平台，提供统一登录入口，支持管理员、司机、学生、家长四种角色。核心功能包括：管理员对车辆、司机、学生、家长的全面管理；司机实时GPS位置上报；学生和家长实时查看校车位置；推送通知提醒；路线可视化管理。

## 3. 核心功能模块
\n### 3.1 统一登录系统
- **统一登录入口**：所有用户类型（管理员、司机、学生、家长）通过同一登录页面访问系统
- **角色选择机制**：登录页面提供下拉菜单或按钮组，用户需先选择角色后输入凭证
- **角色验证**：系统根据选中角色验证对应数据库表中的用户名和密码
- **管理员专用路由**：访问 `/adminherelogin` 自动跳转至登录页并预选管理员角色
- **预配置超级管理员账号**：\n  - 用户名：`chandrasekharadmin`
  - 密码：`chandrasekharadmin1023@@`
- JWT身份认证和会话管理

### 3.2 管理员模块（Phase 1: Operational Data Management）
\n#### 3.2.1 车辆管理（CRUD）
- **添加车辆**：车辆ID、车牌号、型号、载客量、路线名称（如'Route 4- North Campus'）
- **查看车辆列表**：使用 shadcn/ui Data Tables 组件展示，支持搜索和筛选
- **编辑车辆信息**：通过 Dialog/Sheet 组件实现无刷新编辑
- **停用/删除车辆记录**\n- **路线分配**：为每辆车分配文本型路线名称（MVP简化方案）

#### 3.2.2 司机管理（CRUD）
- **添加司机**：姓名、联系方式、驾照号、分配车辆（vehicle_id关联）
- **查看司机列表**：使用 shadcn/ui Data Tables 组件\n- **编辑司机信息**：通过 Dialog/Sheet 组件实现\n- **停用/删除司机账号**
- **车辆关联**：创建司机时必须指定 vehicle_id 建立关系链接

#### 3.2.3 学生管理（CRUD）
- **添加学生**：姓名、学号、年级、接送点坐标、关联家长\n- **查看学生列表**：使用 shadcn/ui Data Tables 组件
- **编辑学生信息**\n- **停用/删除学生记录**
\n#### 3.2.4 家长管理（CRUD）
- **添加家长**：姓名、联系方式、关联学生\n- **查看家长列表**：使用 shadcn/ui Data Tables 组件
- **编辑家长信息**
- **停用/删除家长账号**

#### 3.2.5 路线与站点管理（CRUD）
- **路线绘制工具**：使用 mapbox-gl-draw 插件在地图上点击创建路线
- **站点标记**：在路线上标记接送站点坐标
- **路线保存**：将路线以 polyline 字符串格式存储
- **路线编辑**：支持修改已有路线和站点位置
- **路线分配**：将路线关联到具体车辆

#### 3.2.6 实时监控地图\n- **全局车辆视图**：在管理后台地图上实时显示所有在线车辆位置
- **车辆状态标识**：通过不同颜色或图标区分车辆状态（行驶中/停止/离线）
- **车辆详情查看**：点击地图标记查看车辆详细信息
- **实时数据更新**：通过 Socket.io 接收车辆位置更新并刷新地图

#### 3.2.7 权限控制
- Supabase RLS（Row Level Security）策略：
  - 管理员角色：允许 INSERT和 UPDATE 所有表
  - 司机角色：仅允许 READ 车辆和路线信息
\n### 3.3 司机模块（Phase 3: Driver Dashboard - The Publisher）

#### 3.3.1 司机控制台（Web版）
- **状态显示**：显示当前在线/离线状态
- **行程控制按钮**：\n  - START TRIP：开始追踪，按钮为翠绿色（#10b981）
  - STOP TRIP：停止追踪，按钮为红色（#ef4444）
  - 按钮样式：大尺寸（py-6 text-2xl），圆角设计，带阴影效果
- **实时位置显示**：显示当前经纬度坐标（保留4位小数）
- **车辆信息展示**：显示分配的车辆信息和当前任务\n- **速度与方向显示**：显示当前行驶速度和方向\n\n#### 3.3.2 实时追踪功能
- **GPS数据采集**：\n  - 使用 `navigator.geolocation.watchPosition` API（优于 getCurrentPosition）
  - 采集内容：经纬度、行驶方向（heading）、速度\n  - 配置参数：enableHighAccuracy: true, timeout: 5000, maximumAge: 0
- **数据节流机制**：每5-10秒更新一次数据库（避免过度写入）
- **位置数据上传**：通过 Socket.io 实时发送至后端
- **后台持续运行**：即使应用在后台也保持位置更新

#### 3.3.3 GPS上报逻辑（Socket.io实现）
-司机端通过 `socket.emit('driver:ping', payload)` 发送位置数据
- payload 包含：busId、lat、lng、speed、heading、timestamp
- 后端接收后广播给所有订阅该车辆的客户端
\n### 3.4 学生与家长模块（Phase 4: Parent/Student View - The Subscriber）

#### 3.4.1 实时地图追踪（Phase 2: Map Integration）
- **地图引擎**：React-Leaflet + CartoDB Dark Matter Tiles
- **视觉风格**：Cyber-dark主题配合霓虹绿标记
- **核心功能**：
  - 登录后自动加载地图界面
  - 显示分配给该学生的校车实时位置
  - 车辆标记使用霓虹绿脉冲动画效果（Neon Green Pulse Marker）
  - 车辆标记随GPS数据更新自动移动
  - 显示车辆移动轨迹
  - 平滑动画过渡：使用CSS transition在两个坐标点间插值，使校车呈现滑行效果而非瞬移
  - 车辆行驶时显示脉冲动画效果（speed > 0时触发）

#### 3.4.2 位置信息展示
- 学生接送点标记\n- 校车当前位置与接送点距离
- 预计到达时间（ETA）
- 地图自动刷新机制（通过Socket.io实时订阅实现）

#### 3.4.3 实时数据订阅
- 使用 Socket.io 订阅车辆位置更新
- 按busId 过滤相关车辆数据
- 无需手动刷新页面，数据自动推送更新
- 使用 hashmap 数据结构高效管理多车辆状态：`{ busId: { lat, lng, speed, heading } }`

#### 3.4.4 地理围栏与推送提醒（Phase 5: Advanced）
- **距离计算**：使用 Haversine 公式计算校车与学生接送点距离
- **到达提醒**：当距离 < 500米时，触发推送通知：'Bus is arriving soon!'
- **推送通知实现**（移动端）：
  - 使用 expo-notifications 库
  - 自动请求推送权限
  - 获取 FCM Token 并上传至后端
  - 配置通知处理器：shouldShowAlert、shouldPlaySound、shouldSetBadge
  - 监听通知接收事件并在控制台记录
- **触发逻辑**：实时监测位置变化并自动判断\n
### 3.5 开发与测试工具
\n#### 3.5.1 GPS模拟器（simulateBus.js）
- **用途**：模拟校车沿预设路线行驶，用于开发测试
- **运行方式**：`node scripts/simulateBus.js <busId>`
- **功能**：
  - 通过 Socket.io 客户端连接后端
  - 模拟司机认证流程
  - 按预设路线数组循环发送GPS坐标
  - 每3秒发送一次位置更新
  - 包含速度（45km/h）和方向（90度）模拟数据
- **路线配置**：支持自定义 MOCK_ROUTE 数组或使用 polyline 解码器

## 4. 技术架构说明

### 4.1 数据库设计
- **独立用户表结构**：
  - `admins` 表：管理员账号信息
  - `drivers` 表：司机账号及详细信息（含vehicle_id 外键、fcmToken字段）
  - `students` 表：学生档案及接送点坐标
  - `parents` 表：家长账号及关联学生（含fcmToken字段）
  - `vehicles` 表：车辆信息、分配状态、路线名称
  - `routes` 表：路线信息（polyline字符串、站点坐标数组）
  - `gps_logs` 表：司机实时位置记录（driver_id、vehicle_id、latitude、longitude、heading、speed、timestamp）

### 4.2 后端技术栈
- Supabase（替代传统 Node.js + MongoDB方案）
- Supabase Auth（JWT身份认证）\n- Socket.io（WebSocket实时通信，替代Supabase Realtime）
- RESTful API 自动生成
- Row Level Security（RLS）权限控制
- GeofenceService（地理围栏距离计算服务）
- Push Notification Service（推送通知服务，集成FCM）

### 4.3 前端技术栈
\n#### 管理后台：
- React（Vite构建）
- Tailwind CSS\n- shadcn/ui 组件库（Data Tables、Dialog、Sheet）
- Socket.io Client（实时通信）
- react-map-gl 或 React-Leaflet（地图组件）
- mapbox-gl-draw（路线绘制插件）
\n#### 司机端（Web版）：
- React（Vite构建）\n- Tailwind CSS
- Socket.io Client
- Geolocation API（浏览器原生）
- 响应式设计，支持移动浏览器访问

#### 学生/家长端（移动端）：
- React Native + Expo\n- expo-notifications（推送通知）
- React-Leaflet 或 react-native-maps\n- Socket.io Client
- Geolocation API
\n#### 地图组件依赖安装：
```bash\nnpm install leaflet react-leaflet\nnpm install -D @types/leaflet\nnpm install mapbox-gl @mapbox/mapbox-gl-draw
npm install socket.io-client\nnpm install expo-notifications (移动端)
```

#### 全局CSS配置（src/index.css）：
```css
@import'leaflet/dist/leaflet.css';
\n.leaflet-container {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  z-index: 0;
}\n```

### 4.4 核心API端点
- `POST /api/auth/login`：统一登录接口（需传递角色参数）
- `POST /api/gps/update`：司机上报GPS位置（通过 Socket.io 实现）
- `GET /api/gps/latest/:driverId`：获取指定司机最新位置\n- `GET /api/admin/vehicles`：管理员获取车辆列表
- `POST /api/admin/vehicles`：管理员添加车辆
- `PUT /api/admin/vehicles/:id`：管理员更新车辆\n- `DELETE /api/admin/vehicles/:id`：管理员删除车辆
- `POST /api/routes`：创建路线（接收polyline字符串）
- `GET /api/routes/:id`：获取路线详情
- `PUT /api/routes/:id`：更新路线
- `POST /api/users/update-fcm`：更新用户FCM Token
- 类似的CRUD端点适用于 drivers、students、parents\n
### 4.5 Socket.io 事件定义
\n#### 司机端事件：
- `driver:auth`：司机认证（发送token和busId）
- `driver:ping`：发送位置更新（busId、lat、lng、speed、heading、timestamp）
\n#### 管理员端事件：
- `admin:all_buses_update`：接收所有车辆位置更新
\n#### 家长/学生端事件：
- `parent:subscribe`：订阅特定车辆位置\n- `bus:location_update`：接收订阅车辆的位置更新
\n### 4.6 LiveMap 组件实现（src/components/map/LiveMap.jsx）

#### 组件配置：
- 地图瓦片：CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- 自定义标记：使用 `L.divIcon` 创建霓虹绿脉冲图标
- Tailwind 动画类：`animate-ping`、`shadow-green-400`
- 默认中心点：[17.3850, 78.4867]（Hyderabad示例）
- 默认缩放级别：13
\n#### 组件接口：
```typescript
interface VehicleLocation {
  id: string;\n  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: 'moving' | 'stopped' | 'offline';
}\n\ninterface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  vehicles?: VehicleLocation[];
}\n```

#### 状态管理：
- 使用 hashmap 结构存储车辆状态：`{ busId: { lat, lng, speed, heading } }`
- 通过 Socket.io 监听 `admin:all_buses_update` 事件动态更新\n- 车辆标记根据 speed 值显示/隐藏脉冲动画
\n#### 使用示例：
```typescript
import LiveMap from '@/components/map/LiveMap';

const DashboardPage = () => {
  const [buses, setBuses] = useState({});
  const { socket } = useSocket();
\n  useEffect(() => {\n    if (!socket) return;
    socket.on('admin:all_buses_update', (data) => {
      setBuses(prev => ({
        ...prev,
        [data.busId]: data\n      }));
    });
    return () => socket.off('admin:all_buses_update');\n  }, [socket]);

  return (
    <div className='h-screen'>
      <LiveMap \n        center={[17.3850, 78.4867]} 
        zoom={13} \n        vehicles={Object.values(buses)} 
      />
    </div>
  );\n};
```
\n### 4.7 推送通知实现（mobile/hooks/useNotifications.ts）

#### 功能配置：
- 使用 expo-notifications 库\n- 配置通知处理器：应用打开时显示通知、播放声音、不设置角标
- 自动请求推送权限
- 获取 Expo Push Token（FCM Token）
- 监听通知接收事件\n
#### 集成步骤：
1. 在用户登录后调用 `useNotifications()` hook
2. 获取的 FCM Token 需上传至后端：`axios.post('/api/users/update-fcm', { fcmToken: token })`
3. 后端在触发地理围栏时，通过 FCM 向对应用户发送推送

## 5. 实时追踪实现方案

### 5.1 司机端（数据发布者）
-使用 `navigator.geolocation.watchPosition` 获取位置\n- 每3-5秒通过 Socket.io 发送位置数据
- 包含字段：busId、latitude、longitude、speed、heading、timestamp
- 支持Web端和移动端\n
### 5.2 服务器端（Socket.io + Supabase）
- 接收司机端位置数据并存入`gps_logs` 表\n- 通过 Socket.io 实时广播给订阅客户端
- 执行地理围栏计算（GeofenceService）
- 触发推送通知（距离 < 500米时）
- 位置数据保留策略：保存最近24小时轨迹用于历史回放

### 5.3 学生/家长端（数据订阅者）
- 建立 Socket.io 连接并订阅特定车辆\n- 监听 `bus:location_update` 事件
- 接收最新位置并更新地图标记
- 使用 CSS transition 实现平滑移动动画
- 接收推送通知提醒

### 5.4 管理员端（全局监控）
- 建立 Socket.io 连接\n- 监听 `admin:all_buses_update` 事件
- 实时更新所有车辆位置
- 使用 hashmap 高效管理多车辆状态
\n### 5.5 性能优化
- GPS数据节流存储（3-10秒间隔，避免数据库过载）
- Socket.io 房间机制（按车辆ID分组广播）
- 地理空间索引优化查询性能
- 前端标记插值动画（减少视觉跳跃感）
- 使用 hashmap 替代数组遍历提升更新效率

## 6. 开发阶段规划

### Phase 1: Operational Data Management（优先级：高，复杂度：低）
- 实现管理员CRUD 界面
- 使用 shadcn/ui Data Tables 和 Dialog 组件
- 配置 Supabase RLS 权限策略
\n### Phase 2: Map Integration（优先级：高，复杂度：中）
- 集成 React-Leaflet 和 CartoDB Dark Matter
- 创建 LiveMap 组件
- 实现霓虹绿脉冲标记
- 集成 mapbox-gl-draw 路线绘制工具

### Phase 3: Driver Location Logic（优先级：中，复杂度：高）
- 实现 Geolocation API 调用
- 配置数据节流机制
- 完成GPS数据上报逻辑（Socket.io）
- 开发司机Web控制台界面

### Phase 4: Realtime Subscriptions（优先级：中，复杂度：高）
- 配置 Socket.io 服务端和客户端
- 实现事件订阅逻辑
- 添加平滑动画过渡\n- 开发GPS模拟器测试工具

### Phase 5: Geofencing & Push Notifications（优先级：可选，复杂度：中）
- 实现 Haversine 距离计算（GeofenceService）
- 集成 expo-notifications\n- 配置 FCM 推送服务
- 实现到达提醒功能
- 配置 Toast 通知组件

### Phase 6: Route Management（优先级：中，复杂度：中）
- 开发路线绘制界面（RouteBuilder.jsx）
- 实现站点标记功能
- 完成路线与车辆关联逻辑
\n## 7. 测试与部署流程

### 7.1 开发测试流程
1. **启动GPS模拟器**：`node scripts/simulateBus.js bus_001`
2. **打开司机控制台**：在移动浏览器访问 `http://192.168.1.x:3000/driver`（使用本地IP）
3. **打开管理后台**：在桌面浏览器访问实时监控地图
4. **验证数据流**：确认地图标记随模拟器或真实GPS移动

### 7.2 关键验证点
- Socket.io 连接状态\n- GPS数据上报频率
- 地图标记平滑移动效果
- 推送通知触发时机
- 多车辆并发追踪性能

### 7.3 部署检查清单
- 生成 Google Maps 自定义样式 JSON（mapStyle.json）以匹配 Cyber-Dark 主题
- 配置生产环境 Socket.io 服务器地址
- 设置 FCM 服务端密钥
- 配置Supabase 生产环境变量
- 启用HTTPS（推送通知和地理定位必需）

## 8. 安全与性能\n- 密码加密存储（Supabase Auth 内置 bcrypt）
- JWT令牌过期机制
- CORS跨域配置
- 请求限流保护
- GPS数据节流存储（3-10秒间隔）
- 地理空间索引优化查询性能
- Supabase RLS 行级安全策略
- Socket.io 房间隔离机制
- FCM Token 安全存储和更新

## 9. 网站设计风格
- **主题定位**：Cyber-dark 风格，霓虹绿点缀，强调科技感和未来感
- **配色方案**：\n  - 主背景：#1a1a1a（深黑）
  - 卡片背景：#ffffff（纯白，管理后台）
  - 主题色：#3b82f6（科技蓝）
  - 霓虹绿：#10b981（翠绿，用于地图标记、强调元素、START按钮）
  - 警告色/停止按钮：#ef4444（红色）
  - 边框色：#e2e8f0（浅灰）
- **视觉细节**：
  - 地图标记：霓虹绿脉冲动画（animate-ping）配合阴影效果（shadow-green-400），车辆行驶时显示脉冲\n  - 圆角：中等圆角（0.5rem），大按钮使用 rounded-xl\n  - 阴影：轻微卡片阴影，按钮使用 shadow-lg增强层次感
  - 按钮：扁平化设计，悬停时轻微提升效果，司机控制台按钮采用大尺寸设计（py-6 text-2xl）
  - 地图：CartoDB Dark Matter 深色底图，清晰的标记图标，车辆标记带方向指示和速度状态
  - 表格：斑马纹行样式，悬停高亮\n  - 状态指示器：使用颜色区分在线/离线状态（ON AIR为翠绿色，OFFLINE为灰色）
- **布局方式**：
  - 管理后台：侧边栏导航 + 主内容区\n  - 司机控制台：全屏垂直居中布局，大按钮设计便于移动端操作
  - 移动端/家长端：全屏地图视图+ 底部状态栏
  - 表单：垂直排列，清晰的字段标签
  - 响应式设计，适配桌面和移动设备
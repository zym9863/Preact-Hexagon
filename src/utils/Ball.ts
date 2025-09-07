import { Vector2D } from './Vector2D';

/**
 * 小球轨迹点接口
 */
export interface TrailPoint {
  position: Vector2D;
  timestamp: number;
  alpha: number;
}

/**
 * 小球配置接口
 */
export interface BallConfig {
  radius: number;
  mass: number;
  color: string;
  trailLength: number;
  trailEnabled: boolean;
}

/**
 * 默认小球配置
 */
export const DEFAULT_BALL_CONFIG: BallConfig = {
  radius: 15,
  mass: 1,
  color: '#00ff88',
  trailLength: 50,
  trailEnabled: true
};

/**
 * 小球类，表示游戏中的物理小球
 */
export class Ball {
  private position: Vector2D;
  private velocity: Vector2D;
  private acceleration: Vector2D;
  private config: BallConfig;
  private trail: TrailPoint[];
  private lastTrailTime: number;

  constructor(
    initialPosition: Vector2D,
    initialVelocity: Vector2D = Vector2D.zero(),
    config: Partial<BallConfig> = {}
  ) {
    this.position = initialPosition.clone();
    this.velocity = initialVelocity.clone();
    this.acceleration = Vector2D.zero();
    this.config = { ...DEFAULT_BALL_CONFIG, ...config };
    this.trail = [];
    this.lastTrailTime = 0;
  }

  /**
   * 更新小球状态
   */
  update(_deltaTime: number): void {
    // 更新轨迹
    this.updateTrail();
    
    // 清除加速度（每帧重新计算）
    this.acceleration = Vector2D.zero();
  }

  /**
   * 更新轨迹点
   */
  private updateTrail(): void {
    const currentTime = Date.now();
    
    // 添加新的轨迹点（每隔一定时间）
    if (currentTime - this.lastTrailTime > 16) { // 约60fps
      this.trail.push({
        position: this.position.clone(),
        timestamp: currentTime,
        alpha: 1.0
      });
      this.lastTrailTime = currentTime;
    }

    // 移除过老的轨迹点
    if (this.trail.length > this.config.trailLength) {
      this.trail.shift();
    }

    // 更新轨迹点的透明度
    const maxAge = 1000; // 1秒
    this.trail = this.trail.filter(point => {
      const age = currentTime - point.timestamp;
      if (age > maxAge) return false;
      
      point.alpha = 1 - (age / maxAge);
      return true;
    });
  }

  /**
   * 应用力到小球
   */
  applyForce(force: Vector2D): void {
    // F = ma, 所以 a = F/m
    const acceleration = force.divide(this.config.mass);
    this.acceleration = this.acceleration.add(acceleration);
  }

  /**
   * 设置位置
   */
  setPosition(position: Vector2D): void {
    this.position = position.clone();
  }

  /**
   * 获取位置
   */
  getPosition(): Vector2D {
    return this.position.clone();
  }

  /**
   * 设置速度
   */
  setVelocity(velocity: Vector2D): void {
    this.velocity = velocity.clone();
  }

  /**
   * 获取速度
   */
  getVelocity(): Vector2D {
    return this.velocity.clone();
  }

  /**
   * 获取加速度
   */
  getAcceleration(): Vector2D {
    return this.acceleration.clone();
  }

  /**
   * 获取半径
   */
  getRadius(): number {
    return this.config.radius;
  }

  /**
   * 获取质量
   */
  getMass(): number {
    return this.config.mass;
  }

  /**
   * 更新物理状态
   */
  updatePhysics(newPosition: Vector2D, newVelocity: Vector2D): void {
    this.position = newPosition;
    this.velocity = newVelocity;
  }

  /**
   * 处理碰撞后的位置调整
   */
  resolveCollision(_contactPoint: Vector2D, normal: Vector2D, penetration: number): void {
    // 将球推出碰撞区域
    const correction = normal.multiply(penetration);
    this.position = this.position.add(correction);
  }

  /**
   * 获取小球配置
   */
  getConfig(): BallConfig {
    return { ...this.config };
  }

  /**
   * 更新小球配置
   */
  updateConfig(newConfig: Partial<BallConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 渲染小球到Canvas
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 渲染轨迹
    if (this.config.trailEnabled && this.trail.length > 1) {
      this.renderTrail(ctx);
    }

    // 渲染小球主体
    this.renderBall(ctx);

    ctx.restore();
  }

  /**
   * 渲染轨迹
   */
  private renderTrail(ctx: CanvasRenderingContext2D): void {
    if (this.trail.length < 2) return;

    // 绘制发光轨迹
    ctx.globalCompositeOperation = 'screen';
    for (let i = 1; i < this.trail.length; i++) {
      const current = this.trail[i];
      const previous = this.trail[i - 1];
      
      ctx.beginPath();
      ctx.moveTo(previous.position.x, previous.position.y);
      ctx.lineTo(current.position.x, current.position.y);
      
      // 计算轨迹宽度和透明度
      const alpha = current.alpha * 0.4;
      const width = this.config.radius * 0.4 * alpha;
      
      // 发光效果
      ctx.strokeStyle = this.hexToRgba(this.config.color, alpha * 0.8);
      ctx.lineWidth = width * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    // 绘制主轨迹
    for (let i = 1; i < this.trail.length; i++) {
      const current = this.trail[i];
      const previous = this.trail[i - 1];
      
      ctx.beginPath();
      ctx.moveTo(previous.position.x, previous.position.y);
      ctx.lineTo(current.position.x, current.position.y);
      
      // 计算轨迹属性
      const alpha = current.alpha * 0.8;
      const width = this.config.radius * 0.25 * alpha;
      
      // 创建轨迹渐变
      const gradient = ctx.createLinearGradient(
        previous.position.x, previous.position.y,
        current.position.x, current.position.y
      );
      gradient.addColorStop(0, this.hexToRgba(this.config.color, alpha * 0.5));
      gradient.addColorStop(1, this.hexToRgba(this.config.color, alpha));
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // 绘制轨迹粒子效果
    this.renderTrailParticles(ctx);
  }

  /**
   * 渲染轨迹粒子效果
   */
  private renderTrailParticles(ctx: CanvasRenderingContext2D): void {
    const particleCount = Math.min(this.trail.length, 10);
    for (let i = 0; i < particleCount; i++) {
      const point = this.trail[Math.floor(i * this.trail.length / particleCount)];
      if (!point) continue;
      
      const size = (point.alpha * this.config.radius * 0.1) + Math.random() * 2;
      const offset = Math.random() * this.config.radius * 0.3;
      const angle = Math.random() * Math.PI * 2;
      
      const particleX = point.position.x + Math.cos(angle) * offset;
      const particleY = point.position.y + Math.sin(angle) * offset;
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, 2 * Math.PI);
      ctx.fillStyle = this.hexToRgba(this.config.color, point.alpha * 0.3);
      ctx.fill();
    }
  }

  /**
   * 渲染小球主体
   */
  private renderBall(ctx: CanvasRenderingContext2D): void {
    const speed = this.velocity.magnitude();
    const speedFactor = Math.min(speed / 500, 1); // 归一化速度
    
    // 绘制发光效果
    this.renderGlow(ctx, speedFactor);
    
    // 绘制主要渐变球体
    this.renderMainSphere(ctx);
    
    // 绘制增强高光
    this.renderHighlights(ctx);
    
    // 根据速度绘制动态效果
    if (speedFactor > 0.3) {
      this.renderSpeedEffect(ctx, speedFactor);
    }
  }

  /**
   * 渲染发光效果
   */
  private renderGlow(ctx: CanvasRenderingContext2D, speedFactor: number): void {
    const glowRadius = this.config.radius * (1.5 + speedFactor * 0.5);
    const glowAlpha = 0.1 + speedFactor * 0.15;
    
    // 外层发光
    const outerGlow = ctx.createRadialGradient(
      this.position.x, this.position.y, this.config.radius,
      this.position.x, this.position.y, glowRadius
    );
    outerGlow.addColorStop(0, this.hexToRgba(this.config.color, glowAlpha));
    outerGlow.addColorStop(1, this.hexToRgba(this.config.color, 0));
    
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, glowRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * 渲染主球体
   */
  private renderMainSphere(ctx: CanvasRenderingContext2D): void {
    // 多层渐变创造更丰富的光影效果
    const gradient = ctx.createRadialGradient(
      this.position.x - this.config.radius * 0.25,
      this.position.y - this.config.radius * 0.25,
      0,
      this.position.x,
      this.position.y,
      this.config.radius * 1.1
    );
    
    // 更丰富的渐变色阶
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.15, this.lightenColor(this.config.color, 0.4));
    gradient.addColorStop(0.4, this.config.color);
    gradient.addColorStop(0.8, this.darkenColor(this.config.color, 0.3));
    gradient.addColorStop(1, this.darkenColor(this.config.color, 0.6));

    // 绘制主球体
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.config.radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制增强边框
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.config.radius, 0, 2 * Math.PI);
    const borderGradient = ctx.createLinearGradient(
      this.position.x - this.config.radius,
      this.position.y - this.config.radius,
      this.position.x + this.config.radius,
      this.position.y + this.config.radius
    );
    borderGradient.addColorStop(0, this.lightenColor(this.config.color, 0.2));
    borderGradient.addColorStop(0.5, this.darkenColor(this.config.color, 0.4));
    borderGradient.addColorStop(1, this.lightenColor(this.config.color, 0.2));
    
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * 渲染高光效果
   */
  private renderHighlights(ctx: CanvasRenderingContext2D): void {
    // 主高光
    ctx.beginPath();
    ctx.arc(
      this.position.x - this.config.radius * 0.3,
      this.position.y - this.config.radius * 0.3,
      this.config.radius * 0.25,
      0,
      2 * Math.PI
    );
    const highlightGradient = ctx.createRadialGradient(
      this.position.x - this.config.radius * 0.3,
      this.position.y - this.config.radius * 0.3,
      0,
      this.position.x - this.config.radius * 0.3,
      this.position.y - this.config.radius * 0.3,
      this.config.radius * 0.25
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // 次级高光
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.config.radius * 0.4,
      this.position.y + this.config.radius * 0.4,
      this.config.radius * 0.1,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
  }

  /**
   * 渲染速度效果
   */
  private renderSpeedEffect(ctx: CanvasRenderingContext2D, speedFactor: number): void {
    if (this.velocity.magnitude() < 1) return;
    
    const velocityNorm = this.velocity.normalize();
    const trailLength = this.config.radius * 1.5 * speedFactor;
    
    // 运动模糊效果
    for (let i = 0; i < 3; i++) {
      const offset = trailLength * (i + 1) / 3;
      const trailPos = this.position.subtract(velocityNorm.multiply(offset));
      const alpha = (1 - i / 3) * speedFactor * 0.3;
      
      ctx.beginPath();
      ctx.arc(trailPos.x, trailPos.y, this.config.radius * (1 - i * 0.1), 0, 2 * Math.PI);
      ctx.fillStyle = this.hexToRgba(this.config.color, alpha);
      ctx.fill();
    }
  }

  /**
   * 颜色加深工具函数
   */
  private darkenColor(color: string, factor: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      const newR = Math.floor(r * (1 - factor));
      const newG = Math.floor(g * (1 - factor));
      const newB = Math.floor(b * (1 - factor));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }

  /**
   * 颜色加亮工具函数
   */
  private lightenColor(color: string, factor: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
      const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
      const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }

  /**
   * 十六进制颜色转 RGBA
   */
  private hexToRgba(hex: string, alpha: number): string {
    if (hex.startsWith('#')) {
      const hexColor = hex.slice(1);
      const r = parseInt(hexColor.slice(0, 2), 16);
      const g = parseInt(hexColor.slice(2, 4), 16);
      const b = parseInt(hexColor.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex;
  }

  /**
   * 重置小球状态
   */
  reset(position: Vector2D, velocity: Vector2D = Vector2D.zero()): void {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.acceleration = Vector2D.zero();
    this.trail = [];
    this.lastTrailTime = 0;
  }

  /**
   * 获取小球的动能
   */
  getKineticEnergy(): number {
    return 0.5 * this.config.mass * this.velocity.magnitudeSquared();
  }

  /**
   * 获取小球的速度大小
   */
  getSpeed(): number {
    return this.velocity.magnitude();
  }
}

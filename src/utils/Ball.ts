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
    for (let i = 1; i < this.trail.length; i++) {
      const current = this.trail[i];
      const previous = this.trail[i - 1];
      
      ctx.beginPath();
      ctx.moveTo(previous.position.x, previous.position.y);
      ctx.lineTo(current.position.x, current.position.y);
      
      // 设置轨迹颜色和透明度
      const alpha = current.alpha * 0.6;
      ctx.strokeStyle = this.config.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = this.config.radius * 0.3 * alpha;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  /**
   * 渲染小球主体
   */
  private renderBall(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createRadialGradient(
      this.position.x - this.config.radius * 0.3,
      this.position.y - this.config.radius * 0.3,
      0,
      this.position.x,
      this.position.y,
      this.config.radius
    );
    
    // 创建渐变效果
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, this.config.color);
    gradient.addColorStop(1, this.darkenColor(this.config.color, 0.3));

    // 绘制小球
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.config.radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制边框
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.config.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = this.darkenColor(this.config.color, 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制高光
    ctx.beginPath();
    ctx.arc(
      this.position.x - this.config.radius * 0.3,
      this.position.y - this.config.radius * 0.3,
      this.config.radius * 0.2,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }

  /**
   * 颜色加深工具函数
   */
  private darkenColor(color: string, factor: number): string {
    // 简单的颜色加深实现
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

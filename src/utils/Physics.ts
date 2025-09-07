import { Vector2D } from './Vector2D';

/**
 * 物理引擎配置接口
 */
export interface PhysicsConfig {
  gravity: number;           // 重力加速度
  friction: number;          // 摩擦系数
  restitution: number;       // 弹性系数（恢复系数）
  airResistance: number;     // 空气阻力系数
  maxVelocity: number;       // 最大速度限制
}

/**
 * 默认物理配置
 */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  gravity: 500,              // 像素/秒²
  friction: 0.98,            // 摩擦系数
  restitution: 0.8,          // 弹性系数
  airResistance: 0.999,      // 空气阻力
  maxVelocity: 1000          // 最大速度
};

/**
 * 物理引擎类，处理物理计算和碰撞检测
 */
export class Physics {
  private config: PhysicsConfig;

  constructor(config: PhysicsConfig = DEFAULT_PHYSICS_CONFIG) {
    this.config = { ...config };
  }

  /**
   * 更新物理配置
   */
  updateConfig(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前物理配置
   */
  getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  /**
   * 应用重力到速度向量
   */
  applyGravity(velocity: Vector2D, deltaTime: number): Vector2D {
    const gravityForce = new Vector2D(0, this.config.gravity * deltaTime);
    return velocity.add(gravityForce);
  }

  /**
   * 应用摩擦力
   */
  applyFriction(velocity: Vector2D): Vector2D {
    return velocity.multiply(this.config.friction);
  }

  /**
   * 应用空气阻力
   */
  applyAirResistance(velocity: Vector2D): Vector2D {
    return velocity.multiply(this.config.airResistance);
  }

  /**
   * 限制最大速度
   */
  limitVelocity(velocity: Vector2D): Vector2D {
    const magnitude = velocity.magnitude();
    if (magnitude > this.config.maxVelocity) {
      return velocity.normalize().multiply(this.config.maxVelocity);
    }
    return velocity;
  }

  /**
   * 计算碰撞后的速度（基于弹性碰撞）
   */
  calculateCollisionVelocity(velocity: Vector2D, normal: Vector2D): Vector2D {
    // 计算法向分量
    const normalComponent = normal.multiply(velocity.dot(normal));
    // 计算切向分量
    const tangentComponent = velocity.subtract(normalComponent);
    
    // 应用弹性系数到法向分量，切向分量保持不变
    const newNormalComponent = normalComponent.multiply(-this.config.restitution);
    
    return newNormalComponent.add(tangentComponent);
  }

  /**
   * 检测点与线段的碰撞
   */
  checkLineCollision(
    point: Vector2D, 
    lineStart: Vector2D, 
    lineEnd: Vector2D, 
    radius: number
  ): { collision: boolean; normal: Vector2D; distance: number } {
    // 计算线段向量
    const lineVector = lineEnd.subtract(lineStart);
    const pointVector = point.subtract(lineStart);
    
    // 计算投影参数
    const lineLength = lineVector.magnitudeSquared();
    if (lineLength === 0) {
      // 线段退化为点
      const distance = point.distanceTo(lineStart);
      return {
        collision: distance <= radius,
        normal: point.subtract(lineStart).normalize(),
        distance: distance
      };
    }
    
    const t = Math.max(0, Math.min(1, pointVector.dot(lineVector) / lineLength));
    
    // 计算最近点
    const closestPoint = lineStart.add(lineVector.multiply(t));
    const distance = point.distanceTo(closestPoint);
    
    // 计算法向量（从线段指向点）
    const normal = distance > 0 ? point.subtract(closestPoint).normalize() : new Vector2D(0, -1);
    
    return {
      collision: distance <= radius,
      normal: normal,
      distance: distance
    };
  }

  /**
   * 更新物体位置和速度
   */
  updateMotion(
    position: Vector2D, 
    velocity: Vector2D, 
    deltaTime: number
  ): { position: Vector2D; velocity: Vector2D } {
    // 应用物理力
    let newVelocity = this.applyGravity(velocity, deltaTime);
    newVelocity = this.applyFriction(newVelocity);
    newVelocity = this.applyAirResistance(newVelocity);
    newVelocity = this.limitVelocity(newVelocity);
    
    // 更新位置
    const newPosition = position.add(newVelocity.multiply(deltaTime));
    
    return {
      position: newPosition,
      velocity: newVelocity
    };
  }

  /**
   * 计算两点间的弹簧力
   */
  calculateSpringForce(
    point1: Vector2D, 
    point2: Vector2D, 
    restLength: number, 
    springConstant: number
  ): Vector2D {
    const displacement = point2.subtract(point1);
    const distance = displacement.magnitude();
    const extension = distance - restLength;
    
    if (distance === 0) return Vector2D.zero();
    
    const direction = displacement.normalize();
    return direction.multiply(springConstant * extension);
  }
}

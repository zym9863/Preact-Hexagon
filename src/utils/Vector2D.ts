/**
 * 二维向量类，用于处理位置、速度、加速度等物理量
 */
export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * 向量加法
   */
  add(vector: Vector2D): Vector2D {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }

  /**
   * 向量减法
   */
  subtract(vector: Vector2D): Vector2D {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }

  /**
   * 向量标量乘法
   */
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * 向量除法
   */
  divide(scalar: number): Vector2D {
    if (scalar === 0) throw new Error("Division by zero");
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  /**
   * 计算向量长度（模）
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * 计算向量长度的平方（避免开方运算，提高性能）
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * 向量归一化（单位向量）
   */
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return this.divide(mag);
  }

  /**
   * 向量点积
   */
  dot(vector: Vector2D): number {
    return this.x * vector.x + this.y * vector.y;
  }

  /**
   * 向量叉积（2D中返回标量）
   */
  cross(vector: Vector2D): number {
    return this.x * vector.y - this.y * vector.x;
  }

  /**
   * 计算两向量间的距离
   */
  distanceTo(vector: Vector2D): number {
    return this.subtract(vector).magnitude();
  }

  /**
   * 计算两向量间的角度（弧度）
   */
  angleTo(vector: Vector2D): number {
    return Math.atan2(vector.y - this.y, vector.x - this.x);
  }

  /**
   * 向量旋转
   */
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  /**
   * 向量反射（基于法向量）
   */
  reflect(normal: Vector2D): Vector2D {
    const normalizedNormal = normal.normalize();
    return this.subtract(normalizedNormal.multiply(2 * this.dot(normalizedNormal)));
  }

  /**
   * 复制向量
   */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  /**
   * 设置向量值
   */
  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 向量是否为零向量
   */
  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  /**
   * 向量字符串表示
   */
  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  /**
   * 静态方法：创建零向量
   */
  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  /**
   * 静态方法：从角度和长度创建向量
   */
  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    );
  }
}

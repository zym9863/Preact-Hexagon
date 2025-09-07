import { Vector2D } from './Vector2D';

/**
 * 六边形边的表示
 */
export interface HexagonEdge {
  start: Vector2D;
  end: Vector2D;
  normal: Vector2D;  // 指向内部的法向量
}

/**
 * 六边形类，处理正六边形的几何计算和碰撞检测
 */
export class Hexagon {
  private center: Vector2D;
  private radius: number;
  private rotation: number;
  private rotationSpeed: number;
  private vertices: Vector2D[];
  private edges: HexagonEdge[];

  constructor(
    center: Vector2D, 
    radius: number, 
    rotationSpeed: number = 0
  ) {
    this.center = center;
    this.radius = radius;
    this.rotation = 0;
    this.rotationSpeed = rotationSpeed;
    this.vertices = [];
    this.edges = [];
    
    this.updateGeometry();
  }

  /**
   * 更新六边形的几何信息
   */
  private updateGeometry(): void {
    this.vertices = [];
    this.edges = [];

    // 计算六个顶点
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + this.rotation;
      const vertex = new Vector2D(
        this.center.x + this.radius * Math.cos(angle),
        this.center.y + this.radius * Math.sin(angle)
      );
      this.vertices.push(vertex);
    }

    // 计算六条边和法向量
    for (let i = 0; i < 6; i++) {
      const start = this.vertices[i];
      const end = this.vertices[(i + 1) % 6];
      
      // 计算边向量
      const edgeVector = end.subtract(start);
      
      // 计算指向内部的法向量（逆时针旋转90度）
      const normal = new Vector2D(-edgeVector.y, edgeVector.x).normalize();
      
      this.edges.push({
        start: start,
        end: end,
        normal: normal
      });
    }
  }

  /**
   * 更新六边形状态（主要是旋转）
   */
  update(deltaTime: number): void {
    this.rotation += this.rotationSpeed * deltaTime;
    
    // 保持角度在 0-2π 范围内
    if (this.rotation > 2 * Math.PI) {
      this.rotation -= 2 * Math.PI;
    } else if (this.rotation < 0) {
      this.rotation += 2 * Math.PI;
    }
    
    this.updateGeometry();
  }

  /**
   * 检测点是否在六边形内部
   */
  containsPoint(point: Vector2D): boolean {
    // 使用射线投射算法或者检查点是否在所有边的内侧
    for (const edge of this.edges) {
      const toPoint = point.subtract(edge.start);
      // 如果点在边的外侧（法向量指向内侧）
      if (toPoint.dot(edge.normal) < 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * 检测圆形物体与六边形的碰撞
   */
  checkCollision(
    ballPosition: Vector2D, 
    ballRadius: number
  ): { collision: boolean; edge?: HexagonEdge; penetration?: number; contactPoint?: Vector2D } {
    let minPenetration = Infinity;
    let collisionEdge: HexagonEdge | undefined;
    let contactPoint: Vector2D | undefined;

    for (const edge of this.edges) {
      // 计算球心到边的距离
      const edgeVector = edge.end.subtract(edge.start);
      const toBall = ballPosition.subtract(edge.start);
      
      // 计算投影参数
      const edgeLength = edgeVector.magnitudeSquared();
      if (edgeLength === 0) continue;
      
      const t = Math.max(0, Math.min(1, toBall.dot(edgeVector) / edgeLength));
      
      // 计算边上最近的点
      const closestPoint = edge.start.add(edgeVector.multiply(t));
      const distance = ballPosition.distanceTo(closestPoint);
      
      // 检查是否发生碰撞
      if (distance < ballRadius) {
        const penetration = ballRadius - distance;
        
        // 找到最小穿透深度的边
        if (penetration < minPenetration) {
          minPenetration = penetration;
          collisionEdge = edge;
          contactPoint = closestPoint;
        }
      }
    }

    if (collisionEdge && contactPoint) {
      return {
        collision: true,
        edge: collisionEdge,
        penetration: minPenetration,
        contactPoint: contactPoint
      };
    }

    return { collision: false };
  }

  /**
   * 获取六边形的顶点
   */
  getVertices(): Vector2D[] {
    return [...this.vertices];
  }

  /**
   * 获取六边形的边
   */
  getEdges(): HexagonEdge[] {
    return [...this.edges];
  }

  /**
   * 获取中心点
   */
  getCenter(): Vector2D {
    return this.center.clone();
  }

  /**
   * 获取半径
   */
  getRadius(): number {
    return this.radius;
  }

  /**
   * 获取当前旋转角度
   */
  getRotation(): number {
    return this.rotation;
  }

  /**
   * 设置旋转速度
   */
  setRotationSpeed(speed: number): void {
    this.rotationSpeed = speed;
  }

  /**
   * 获取旋转速度
   */
  getRotationSpeed(): number {
    return this.rotationSpeed;
  }

  /**
   * 设置中心位置
   */
  setCenter(center: Vector2D): void {
    this.center = center;
    this.updateGeometry();
  }

  /**
   * 设置半径
   */
  setRadius(radius: number): void {
    this.radius = radius;
    this.updateGeometry();
  }

  /**
   * 渲染六边形到Canvas
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // 绘制六边形边框
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    
    ctx.closePath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 可选：绘制中心点
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * 获取六边形的边界框
   */
  getBoundingBox(): { min: Vector2D; max: Vector2D } {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const vertex of this.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }
    
    return {
      min: new Vector2D(minX, minY),
      max: new Vector2D(maxX, maxY)
    };
  }
}

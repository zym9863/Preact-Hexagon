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
    
    // 绘制背景填充
    this.renderBackground(ctx);
    
    // 绘制发光边框
    this.renderGlowBorder(ctx);
    
    // 绘制主边框
    this.renderMainBorder(ctx);
    
    // 绘制顶点装饰
    this.renderVertexDecorations(ctx);
    
    // 绘制中心点
    this.renderCenter(ctx);
    
    ctx.restore();
  }

  /**
   * 渲染背景填充
   */
  private renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();
    
    // 创建径向渐变背景
    const gradient = ctx.createRadialGradient(
      this.center.x, this.center.y, 0,
      this.center.x, this.center.y, this.radius
    );
    gradient.addColorStop(0, 'rgba(26, 26, 46, 0.1)');
    gradient.addColorStop(0.7, 'rgba(22, 33, 62, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  /**
   * 渲染发光边框
   */
  private renderGlowBorder(ctx: CanvasRenderingContext2D): void {
    // 外层发光
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();
    
    const rotationFactor = Math.abs(this.rotationSpeed) / 2; // 旋转速度影响发光强度
    const glowAlpha = 0.3 + rotationFactor * 0.2;
    
    ctx.strokeStyle = `rgba(0, 255, 136, ${glowAlpha})`;
    ctx.lineWidth = 6 + rotationFactor * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * 渲染主边框
   */
  private renderMainBorder(ctx: CanvasRenderingContext2D): void {
    // 绘制渐变边框
    for (let i = 0; i < this.vertices.length; i++) {
      const start = this.vertices[i];
      const end = this.vertices[(i + 1) % this.vertices.length];
      
      // 为每条边创建不同的渐变
      const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
      const hue1 = (i * 60 + this.rotation * 180 / Math.PI) % 360;
      const hue2 = ((i + 1) * 60 + this.rotation * 180 / Math.PI) % 360;
      
      gradient.addColorStop(0, `hsl(${hue1}, 70%, 75%)`);
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, `hsl(${hue2}, 70%, 75%)`);
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  /**
   * 渲染顶点装饰
   */
  private renderVertexDecorations(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      
      // 绘制顶点发光点
      const gradient = ctx.createRadialGradient(
        vertex.x, vertex.y, 0,
        vertex.x, vertex.y, 8
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.6)');
      gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
      
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // 绘制顶点核心
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  /**
   * 渲染中心点
   */
  private renderCenter(ctx: CanvasRenderingContext2D): void {
    // 中心发光效果
    const centerGradient = ctx.createRadialGradient(
      this.center.x, this.center.y, 0,
      this.center.x, this.center.y, 10
    );
    centerGradient.addColorStop(0, 'rgba(255, 64, 87, 0.8)');
    centerGradient.addColorStop(0.7, 'rgba(255, 64, 87, 0.3)');
    centerGradient.addColorStop(1, 'rgba(255, 64, 87, 0)');
    
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    // 中心核心点
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff4057';
    ctx.fill();
    
    // 旋转指示器
    if (Math.abs(this.rotationSpeed) > 0.1) {
      const indicatorLength = 15;
      const indicatorAngle = this.rotation;
      const endX = this.center.x + Math.cos(indicatorAngle) * indicatorLength;
      const endY = this.center.y + Math.sin(indicatorAngle) * indicatorLength;
      
      ctx.beginPath();
      ctx.moveTo(this.center.x, this.center.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'rgba(255, 64, 87, 0.8)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
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

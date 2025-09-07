import { Vector2D } from './Vector2D';
import { Physics, DEFAULT_PHYSICS_CONFIG } from './Physics';
import type { PhysicsConfig } from './Physics';
import { Hexagon } from './Hexagon';
import { Ball } from './Ball';

/**
 * 游戏状态枚举
 */
export const GameState = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused'
} as const;

export type GameStateType = typeof GameState[keyof typeof GameState];

/**
 * 游戏引擎配置接口
 */
export interface GameEngineConfig {
  canvasWidth: number;
  canvasHeight: number;
  targetFPS: number;
  backgroundColor: string;
  showDebugInfo: boolean;
}

/**
 * 默认游戏引擎配置
 */
export const DEFAULT_GAME_CONFIG: GameEngineConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  targetFPS: 60,
  backgroundColor: '#1a1a2e',
  showDebugInfo: false
};

/**
 * 游戏引擎类，管理游戏循环、渲染和物理模拟
 */
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameEngineConfig;
  private physics: Physics;
  private hexagon!: Hexagon;
  private ball!: Ball;
  
  private gameState: GameStateType;
  private lastTime: number;
  private deltaTime: number;
  private frameCount: number;
  private fps: number;
  private fpsUpdateTime: number;
  
  private animationFrameId: number | null;

  constructor(
    canvas: HTMLCanvasElement,
    config: Partial<GameEngineConfig> = {},
    physicsConfig: Partial<PhysicsConfig> = {}
  ) {
    this.canvas = canvas;
    this.config = { ...DEFAULT_GAME_CONFIG, ...config };
    
    // 设置Canvas尺寸
    this.canvas.width = this.config.canvasWidth;
    this.canvas.height = this.config.canvasHeight;
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('无法获取Canvas 2D上下文');
    }
    this.ctx = context;
    
    // 初始化物理引擎
    this.physics = new Physics({ ...DEFAULT_PHYSICS_CONFIG, ...physicsConfig });
    
    // 初始化游戏对象
    this.initializeGameObjects();
    
    // 初始化游戏状态
    this.gameState = GameState.STOPPED;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTime = 0;
    this.animationFrameId = null;
    
    // 绑定事件
    this.bindEvents();
  }

  /**
   * 初始化游戏对象
   */
  private initializeGameObjects(): void {
    const centerX = this.config.canvasWidth / 2;
    const centerY = this.config.canvasHeight / 2;
    const hexagonRadius = Math.min(centerX, centerY) * 0.8;
    
    // 创建六边形
    this.hexagon = new Hexagon(
      new Vector2D(centerX, centerY),
      hexagonRadius,
      0.5 // 旋转速度 (弧度/秒)
    );
    
    // 创建小球（在六边形中心稍微偏上的位置）
    this.ball = new Ball(
      new Vector2D(centerX, centerY - 50),
      new Vector2D(100, 0) // 初始速度
    );
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 鼠标点击重置小球位置
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const clickPosition = new Vector2D(x, y);
      if (this.hexagon.containsPoint(clickPosition)) {
        this.ball.reset(clickPosition, new Vector2D(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        ));
      }
    });
    
    // 键盘事件
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          this.togglePause();
          break;
        case 'KeyR':
          this.reset();
          break;
      }
    });
  }

  /**
   * 开始游戏循环
   */
  start(): void {
    if (this.gameState === GameState.RUNNING) return;
    
    this.gameState = GameState.RUNNING;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  /**
   * 停止游戏循环
   */
  stop(): void {
    this.gameState = GameState.STOPPED;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 暂停/恢复游戏
   */
  togglePause(): void {
    if (this.gameState === GameState.RUNNING) {
      this.gameState = GameState.PAUSED;
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.RUNNING;
      this.lastTime = performance.now();
    }
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.initializeGameObjects();
    this.frameCount = 0;
    this.fps = 0;
  }

  /**
   * 主游戏循环
   */
  private gameLoop = (): void => {
    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
    this.lastTime = currentTime;
    
    // 限制deltaTime以避免大的时间跳跃
    this.deltaTime = Math.min(this.deltaTime, 1 / 30); // 最大30fps
    
    if (this.gameState === GameState.RUNNING) {
      this.update();
    }
    
    this.render();
    this.updateFPS();
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * 更新游戏逻辑
   */
  private update(): void {
    // 更新六边形
    this.hexagon.update(this.deltaTime);
    
    // 更新小球物理
    const ballPosition = this.ball.getPosition();
    const ballVelocity = this.ball.getVelocity();
    
    // 应用物理力
    const { position: newPosition, velocity: newVelocity } = this.physics.updateMotion(
      ballPosition,
      ballVelocity,
      this.deltaTime
    );
    
    // 检测碰撞
    const collision = this.hexagon.checkCollision(newPosition, this.ball.getRadius());
    
    if (collision.collision && collision.edge) {
      // 计算碰撞后的速度
      const collisionVelocity = this.physics.calculateCollisionVelocity(
        newVelocity,
        collision.edge.normal
      );
      
      // 解决穿透问题
      if (collision.penetration && collision.contactPoint) {
        this.ball.resolveCollision(
          collision.contactPoint,
          collision.edge.normal,
          collision.penetration
        );
      }
      
      this.ball.updatePhysics(this.ball.getPosition(), collisionVelocity);
    } else {
      this.ball.updatePhysics(newPosition, newVelocity);
    }
    
    // 更新小球状态
    this.ball.update(this.deltaTime);
  }

  /**
   * 渲染游戏画面
   */
  private render(): void {
    // 清空画布
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    
    // 渲染六边形
    this.hexagon.render(this.ctx);
    
    // 渲染小球
    this.ball.render(this.ctx);
    
    // 渲染调试信息
    if (this.config.showDebugInfo) {
      this.renderDebugInfo();
    }
  }

  /**
   * 渲染调试信息
   */
  private renderDebugInfo(): void {
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px monospace';
    
    const ballVelocity = this.ball.getVelocity();
    const ballPosition = this.ball.getPosition();
    const ballSpeed = this.ball.getSpeed();
    const ballEnergy = this.ball.getKineticEnergy();
    
    const debugInfo = [
      `FPS: ${this.fps.toFixed(1)}`,
      `位置: (${ballPosition.x.toFixed(1)}, ${ballPosition.y.toFixed(1)})`,
      `速度: (${ballVelocity.x.toFixed(1)}, ${ballVelocity.y.toFixed(1)})`,
      `速率: ${ballSpeed.toFixed(1)}`,
      `动能: ${ballEnergy.toFixed(1)}`,
      `六边形旋转: ${(this.hexagon.getRotation() * 180 / Math.PI).toFixed(1)}°`,
      `状态: ${this.gameState}`,
      `控制: 空格键暂停, R键重置, 点击重新定位小球`
    ];
    
    debugInfo.forEach((info, index) => {
      this.ctx.fillText(info, 10, 20 + index * 18);
    });
    
    this.ctx.restore();
  }

  /**
   * 更新FPS计算
   */
  private updateFPS(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * 获取当前游戏状态
   */
  getGameState(): GameStateType {
    return this.gameState;
  }

  /**
   * 获取物理引擎实例
   */
  getPhysics(): Physics {
    return this.physics;
  }

  /**
   * 获取六边形实例
   */
  getHexagon(): Hexagon {
    return this.hexagon;
  }

  /**
   * 获取小球实例
   */
  getBall(): Ball {
    return this.ball;
  }

  /**
   * 更新游戏配置
   */
  updateConfig(newConfig: Partial<GameEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 如果尺寸改变，更新Canvas
    if (newConfig.canvasWidth || newConfig.canvasHeight) {
      this.canvas.width = this.config.canvasWidth;
      this.canvas.height = this.config.canvasHeight;
      this.initializeGameObjects();
    }
  }

  /**
   * 销毁游戏引擎
   */
  destroy(): void {
    this.stop();
    // 移除事件监听器等清理工作
  }
}

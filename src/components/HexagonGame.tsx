import { useEffect, useRef, useState } from 'preact/hooks';
import { GameEngine } from '../utils/GameEngine';
import { ControlPanel } from './ControlPanel';

/**
 * 六边形物理模拟游戏主组件
 */
export function HexagonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化游戏引擎
  useEffect(() => {
    let mounted = true;
    
    const initializeGame = async () => {
      try {
        if (!mounted) return;

        // 等待Canvas元素渲染完成
        if (!canvasRef.current) {
          // Canvas应该已经渲染了，如果没有则等待更长时间
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!canvasRef.current) {
            throw new Error('Canvas元素未正确渲染');
          }
        }

        // 创建游戏引擎实例
        const engine = new GameEngine(
          canvasRef.current,
          {
            canvasWidth: 800,
            canvasHeight: 600,
            targetFPS: 60,
            backgroundColor: '#1a1a2e',
            showDebugInfo: false
          },
          {
            gravity: 500,
            friction: 0.98,
            restitution: 0.8,
            airResistance: 0.999,
            maxVelocity: 1000
          }
        );

        setGameEngine(engine);
        setIsLoading(false);

        // 自动开始游戏
        engine.start();

      } catch (err) {
        console.error('游戏初始化失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
        setIsLoading(false);
      }
    };

    initializeGame();

    // 清理函数
    return () => {
      mounted = false;
      if (gameEngine) {
        gameEngine.destroy();
      }
    };
  }, []);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (gameEngine && canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          const maxWidth = Math.min(containerWidth - 20, 800);
          const aspectRatio = 600 / 800;
          const newHeight = maxWidth * aspectRatio;
          
          gameEngine.updateConfig({
            canvasWidth: maxWidth,
            canvasHeight: newHeight
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始调用

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gameEngine]);

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>六边形物理模拟游戏</h1>
        <p>一个基于现代Web技术的实时物理模拟演示</p>
      </header>

      <div className="game-content">
        <div className="game-canvas-container">
          <canvas
            ref={canvasRef}
            className="game-canvas"
            tabIndex={0}
          />
          
          {/* 加载状态覆盖层 */}
          {isLoading && (
            <div className="canvas-overlay loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>正在加载物理模拟引擎...</p>
              </div>
            </div>
          )}
          
          {/* 错误状态覆盖层 */}
          {error && (
            <div className="canvas-overlay error-overlay">
              <div className="error-message">
                <h2>游戏加载失败</h2>
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  重新加载
                </button>
              </div>
            </div>
          )}
          
          {/* 性能信息覆盖层 */}
          {!isLoading && !error && (
            <div className="canvas-overlay">
              <div className="performance-info">
                <span id="fps-counter"></span>
              </div>
            </div>
          )}
        </div>

        <div className="game-controls">
          <ControlPanel gameEngine={gameEngine} />
        </div>
      </div>

      <footer className="game-footer">
        <div className="tech-info">
          <h3>技术特性</h3>
          <ul>
            <li>✅ 实时物理模拟（重力、摩擦力、弹性碰撞）</li>
            <li>✅ 精确的六边形碰撞检测</li>
            <li>✅ 旋转坐标系下的法向量计算</li>
            <li>✅ 60fps流畅渲染</li>
            <li>✅ 可调节物理参数</li>
            <li>✅ 轨迹追踪效果</li>
            <li>✅ 响应式设计</li>
          </ul>
        </div>
        
        <div className="controls-info">
          <h3>操作说明</h3>
          <ul>
            <li><kbd>点击</kbd> 六边形内部重新定位小球</li>
            <li><kbd>空格</kbd> 暂停/继续游戏</li>
            <li><kbd>R</kbd> 重置游戏状态</li>
            <li><kbd>滑块</kbd> 实时调节物理参数</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

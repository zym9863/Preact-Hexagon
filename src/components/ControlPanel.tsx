import { useState, useEffect } from 'preact/hooks';
import { GameEngine, GameState } from '../utils/GameEngine';
import type { GameStateType } from '../utils/GameEngine';
import type { PhysicsConfig } from '../utils/Physics';
import type { BallConfig } from '../utils/Ball';

interface ControlPanelProps {
  gameEngine: GameEngine | null;
}

/**
 * 控制面板组件，提供游戏参数调节功能
 */
export function ControlPanel({ gameEngine }: ControlPanelProps) {
  const [gameState, setGameState] = useState<GameStateType>(GameState.STOPPED);
  const [physicsConfig, setPhysicsConfig] = useState<PhysicsConfig>({
    gravity: 500,
    friction: 0.98,
    restitution: 0.8,
    airResistance: 0.999,
    maxVelocity: 1000
  });
  const [hexagonRotationSpeed, setHexagonRotationSpeed] = useState(0.5);
  const [ballConfig, setBallConfig] = useState<BallConfig>({
    radius: 15,
    mass: 1,
    color: '#00ff88',
    trailLength: 50,
    trailEnabled: true
  });
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // 监听游戏状态变化
  useEffect(() => {
    if (!gameEngine) return;

    const updateGameState = () => {
      setGameState(gameEngine.getGameState());
    };

    // 定期更新状态
    const interval = setInterval(updateGameState, 100);
    return () => clearInterval(interval);
  }, [gameEngine]);

  // 更新物理配置
  const updatePhysicsConfig = (key: keyof PhysicsConfig, value: number) => {
    const newConfig = { ...physicsConfig, [key]: value };
    setPhysicsConfig(newConfig);
    
    if (gameEngine) {
      gameEngine.getPhysics().updateConfig(newConfig);
    }
  };

  // 更新六边形旋转速度
  const updateHexagonRotationSpeed = (speed: number) => {
    setHexagonRotationSpeed(speed);
    
    if (gameEngine) {
      gameEngine.getHexagon().setRotationSpeed(speed);
    }
  };

  // 更新小球配置
  const updateBallConfig = (key: keyof BallConfig, value: any) => {
    const newConfig = { ...ballConfig, [key]: value };
    setBallConfig(newConfig);
    
    if (gameEngine) {
      gameEngine.getBall().updateConfig(newConfig);
    }
  };

  // 游戏控制函数
  const handleStart = () => {
    if (gameEngine) {
      gameEngine.start();
    }
  };

  const handleStop = () => {
    if (gameEngine) {
      gameEngine.stop();
    }
  };

  const handleTogglePause = () => {
    if (gameEngine) {
      gameEngine.togglePause();
    }
  };

  const handleReset = () => {
    if (gameEngine) {
      gameEngine.reset();
    }
  };

  const handleToggleDebug = () => {
    const newShowDebug = !showDebugInfo;
    setShowDebugInfo(newShowDebug);
    
    if (gameEngine) {
      gameEngine.updateConfig({ showDebugInfo: newShowDebug });
    }
  };

  return (
    <div className="control-panel">
      <h2>物理模拟控制面板</h2>
      
      {/* 游戏控制 */}
      <div className="control-section">
        <h3>游戏控制</h3>
        <div className="button-group">
          <button 
            onClick={handleStart}
            disabled={gameState === GameState.RUNNING}
            className="btn btn-primary"
          >
            开始
          </button>
          <button 
            onClick={handleTogglePause}
            disabled={gameState === GameState.STOPPED}
            className="btn btn-secondary"
          >
            {gameState === GameState.PAUSED ? '继续' : '暂停'}
          </button>
          <button 
            onClick={handleStop}
            disabled={gameState === GameState.STOPPED}
            className="btn btn-danger"
          >
            停止
          </button>
          <button 
            onClick={handleReset}
            className="btn btn-warning"
          >
            重置
          </button>
        </div>
        <div className="status">
          状态: <span className={`status-${gameState}`}>{gameState}</span>
        </div>
      </div>

      {/* 物理参数 */}
      <div className="control-section">
        <h3>物理参数</h3>
        
        <div className="control-item">
          <label>重力 ({physicsConfig.gravity})</label>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={physicsConfig.gravity}
            onChange={(e) => updatePhysicsConfig('gravity', Number(e.currentTarget.value))}
          />
        </div>

        <div className="control-item">
          <label>摩擦力 ({physicsConfig.friction.toFixed(3)})</label>
          <input
            type="range"
            min="0.9"
            max="1"
            step="0.001"
            value={physicsConfig.friction}
            onChange={(e) => updatePhysicsConfig('friction', Number(e.currentTarget.value))}
          />
        </div>

        <div className="control-item">
          <label>弹性系数 ({physicsConfig.restitution.toFixed(2)})</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={physicsConfig.restitution}
            onChange={(e) => updatePhysicsConfig('restitution', Number(e.currentTarget.value))}
          />
        </div>

        <div className="control-item">
          <label>空气阻力 ({physicsConfig.airResistance.toFixed(4)})</label>
          <input
            type="range"
            min="0.99"
            max="1"
            step="0.0001"
            value={physicsConfig.airResistance}
            onChange={(e) => updatePhysicsConfig('airResistance', Number(e.currentTarget.value))}
          />
        </div>

        <div className="control-item">
          <label>最大速度 ({physicsConfig.maxVelocity})</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={physicsConfig.maxVelocity}
            onChange={(e) => updatePhysicsConfig('maxVelocity', Number(e.currentTarget.value))}
          />
        </div>
      </div>

      {/* 六边形控制 */}
      <div className="control-section">
        <h3>六边形控制</h3>
        
        <div className="control-item">
          <label>旋转速度 ({hexagonRotationSpeed.toFixed(2)} rad/s)</label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={hexagonRotationSpeed}
            onChange={(e) => updateHexagonRotationSpeed(Number(e.currentTarget.value))}
          />
        </div>
      </div>

      {/* 小球设置 */}
      <div className="control-section">
        <h3>小球设置</h3>
        
        <div className="control-item">
          <label>半径 ({ballConfig.radius})</label>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={ballConfig.radius}
            onChange={(e) => updateBallConfig('radius', Number(e.currentTarget.value))}
          />
        </div>

        <div className="control-item">
          <label>质量 ({ballConfig.mass})</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={ballConfig.mass}
            onChange={(e) => updateBallConfig('mass', Number(e.currentTarget.value))}
          />
        </div>

        <div className="control-item">
          <label>颜色</label>
          <input
            type="color"
            value={ballConfig.color}
            onChange={(e) => updateBallConfig('color', e.currentTarget.value)}
          />
        </div>

        <div className="control-item">
          <label>轨迹长度 ({ballConfig.trailLength})</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={ballConfig.trailLength}
            onChange={(e) => updateBallConfig('trailLength', Number(e.currentTarget.value))}
          />
        </div>

        <div className="control-item">
          <label>
            <input
              type="checkbox"
              checked={ballConfig.trailEnabled}
              onChange={(e) => updateBallConfig('trailEnabled', e.currentTarget.checked)}
            />
            显示轨迹
          </label>
        </div>
      </div>

      {/* 调试选项 */}
      <div className="control-section">
        <h3>调试选项</h3>
        
        <div className="control-item">
          <label>
            <input
              type="checkbox"
              checked={showDebugInfo}
              onChange={handleToggleDebug}
            />
            显示调试信息
          </label>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="control-section">
        <h3>使用说明</h3>
        <ul className="instructions">
          <li>点击六边形内部重新定位小球</li>
          <li>空格键：暂停/继续</li>
          <li>R键：重置游戏</li>
          <li>调节参数实时生效</li>
        </ul>
      </div>
    </div>
  );
}

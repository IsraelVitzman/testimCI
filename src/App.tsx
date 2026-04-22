import React, { useCallback, useEffect } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Background, 
  Controls,
  MiniMap,
  type Connection 
} from 'reactflow';
import 'reactflow/dist/style.css';

const STORAGE_KEY = 'my-flow-data';

// הגדרת אזור יצירה בצד (Sidebar)
const SPAWN_X = 50; 
const SPAWN_Y_START = 50;

export default function App() {
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"nodes":[], "edges":[]}');
  const [nodes, setNodes, onNodesChange] = useNodesState(savedData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedData.edges);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const addNode = () => {
    const id = `node-${Date.now()}`;
    
    // לוגיקה למניעת חפיפה באזור היצירה:
    // אנחנו בודקים אם יש כבר אלמנט בנקודת היצירה. אם כן, נזיז את החדש קצת למטה.
    const nodesInSpawn = nodes.filter(n => n.position.x === SPAWN_X);
    const offset = nodesInSpawn.length * 40; 

    const newNode = {
      id,
      position: { x: SPAWN_X, y: SPAWN_Y_START + offset },
      data: { label: `אלמנט ${nodes.length + 1}` },
      style: { 
        background: '#fff', 
        border: '2px solid #007bff', 
        padding: '10px', 
        borderRadius: '8px',
        width: 150 
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      
      {/* 1. אזור יצירה - Sidebar בצד שמאל */}
      <div style={{ 
        width: '250px', 
        background: '#f0f0f0', 
        borderRight: '2px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        zIndex: 20
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>פס ייצור</h3>
        <button 
          onClick={addNode} 
          style={{
            padding: '15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}
        >
          ➕ צור אלמנט חדש
        </button>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          <p>האלמנטים מופיעים כאן בטור.</p>
          <p><strong>גרור אותם ימינה</strong> לתוך הלוח הראשי כדי להתחיל לחבר ביניהם.</p>
        </div>

        <hr style={{ width: '100%', margin: '20px 0' }} />
        
        <h4>קשרים:</h4>
        <div style={{ overflowY: 'auto', flexGrow: 1 }}>
          {edges.map(e => (
            <div key={e.id} style={{ fontSize: '11px', marginBottom: '5px', background: '#fff', padding: '5px' }}>
              {nodes.find(n => n.id === e.source)?.data.label} ➔ {nodes.find(n => n.id === e.target)?.data.label}
            </div>
          ))}
        </div>
      </div>

      {/* 2. הלוח הראשי */}
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          // מונע מהלוח "לברוח" הצידה מדי
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#ccc" gap={20} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
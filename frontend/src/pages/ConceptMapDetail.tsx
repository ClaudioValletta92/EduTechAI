import React, { useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  useStoreApi,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MIN_DISTANCE = 150;

const ConceptMap = () => {
  const store = useStoreApi();
  const { getInternalNode } = useReactFlow();

  const initialNodes = [
    { id: "1", data: { label: "Main Topic" }, position: { x: 250, y: 50 } },
    { id: "2", data: { label: "Subtopic A" }, position: { x: 100, y: 200 } },
    { id: "3", data: { label: "Subtopic B" }, position: { x: 400, y: 200 } },
  ];

  const initialEdges = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e1-3", source: "1", target: "3" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Function to find the closest node and create an edge
  const getClosestEdge = useCallback(
    (node) => {
      const { nodeLookup } = store.getState();
      const internalNode = getInternalNode(node.id);

      const closestNode = Array.from(nodeLookup.values()).reduce(
        (res, n) => {
          if (n.id !== internalNode.id) {
            const dx = n.internals.positionAbsolute.x - internalNode.internals.positionAbsolute.x;
            const dy = n.internals.positionAbsolute.y - internalNode.internals.positionAbsolute.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < res.distance && d < MIN_DISTANCE) {
              res.distance = d;
              res.node = n;
            }
          }
          return res;
        },
        { distance: Number.MAX_VALUE, node: null }
      );

      if (!closestNode.node) return null;

      const closeNodeIsSource =
        closestNode.node.internals.positionAbsolute.x < internalNode.internals.positionAbsolute.x;

      return {
        id: closeNodeIsSource ? `${closestNode.node.id}-${node.id}` : `${node.id}-${closestNode.node.id}`,
        source: closeNodeIsSource ? closestNode.node.id : node.id,
        target: closeNodeIsSource ? node.id : closestNode.node.id,
      };
    },
    [store, getInternalNode]
  );

  // Function to create a temporary edge while dragging
  const onNodeDrag = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");

        if (closeEdge && !nextEdges.find((ne) => ne.source === closeEdge.source && ne.target === closeEdge.target)) {
          closeEdge.className = "temp";
          nextEdges.push(closeEdge);
        }

        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  // Function to confirm the edge when dragging stops
  const onNodeDragStop = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");

        if (closeEdge && !nextEdges.find((ne) => ne.source === closeEdge.source && ne.target === closeEdge.target)) {
          nextEdges.push(closeEdge);
        }

        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  const addNewNode = useCallback(() => {
    setNodes((prevNodes) => {
      const newNode = {
        id: `${prevNodes.length + 1}`,
        data: { label: `New Node ${prevNodes.length + 1}` },
        position: { x: Math.random() * 600, y: Math.random() * 400 },
      };
      return [...prevNodes, newNode]; // ✅ Ensure state updates correctly
    });
  }, [setNodes]);
  
  

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Button to Add Nodes */}
      <button
  onClick={(event) => {
    event.stopPropagation(); // ✅ Prevent React Flow from capturing the click
    addNewNode();
  }}
  style={{
    position: "absolute",
    top: 10,
    right: 10,
    padding: "10px 15px",
    backgroundColor: "blue",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    zIndex: 10, // ✅ Ensures button is clickable
  }}
>
  + Add Node
</button>


      <div style={{ width: "100%", height: "500px" }}> {/* ✅ Ensure container has width & height */}
  <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onNodeDrag={onNodeDrag}
    onNodeDragStop={onNodeDragStop}
    onConnect={onConnect}
    fitView
    style={{ width: "100%", height: "100%" }} // ✅ Ensure ReactFlow expands fully
  >
    <Background />
  </ReactFlow>
</div>

    </div>
  );
};

// Wrap the Flow component inside ReactFlowProvider
export default () => (
  <ReactFlowProvider >
    <div style={{ display: "flex", flexDirection: "column", width:"100vw",height: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "1rem", background: "#fff" }}>
          <h2>Conceptual Map</h2>
          <ConceptMap />
        </main>
      </div>
    </div>
  </ReactFlowProvider>
);

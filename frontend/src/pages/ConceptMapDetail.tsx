import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  useStoreApi,
  useReactFlow,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";

const MIN_DISTANCE = 150;

/** Regular node (title, text) */
function CustomNode({ data }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "10px",
        background: "#fff",
        width: 140,
      }}
    >
      <h4 style={{ margin: 0 }}>{data.title}</h4>
      <p style={{ marginTop: "4px", fontSize: "0.85rem" }}>{data.text}</p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
/** Annotation node (level, label, optional arrow) */
function AnnotationNode({ data }) {
  return (
    <div style={{ position: "relative", width: 180, padding: 10 }}>
      <div
        style={{
          padding: 10,
          fontFamily: "'Tillana', serif", // ✅ Correct font-family syntax
          fontSize: "1.1rem",
          background: "#fff", // ✅ Add background to ensure visibility
        }}
      >
        <div className="annotation-text">Annotation {data.level}:</div>
        <div className="annotation-text">{data.label}</div> {/* ✅ Removed unnecessary class */}
      </div>

      {/* Optional arrow */}
      {data.arrowStyle && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: -20,
            fontSize: "1.5rem",
            ...data.arrowStyle,
          }}
        >
          ⤹
        </div>
      )}
    </div>
  );
}


function ConceptMap() {
  const store = useStoreApi();
  const { getInternalNode } = useReactFlow();

  // ========== EDGE EDITING STATE ==========
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState("");

  // ========== NODE EDITING STATE ==========
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);

  // For "customNode" fields
  const [nodeTitle, setNodeTitle] = useState("");
  const [nodeText, setNodeText] = useState("");

  // For "annotationNode" fields
  const [annotationLevel, setAnnotationLevel] = useState("");
  const [annotationLabel, setAnnotationLabel] = useState("");

  // Initial data
  const initialNodes = [
    {
      id: "1",
      type: "customNode",
      data: { title: "Main Topic", text: "Some details about Main Topic." },
      position: { x: 250, y: 50 },
    },
    {
      id: "2",
      type: "customNode",
      data: { title: "Subtopic A", text: "Explanatory text for Subtopic A." },
      position: { x: 100, y: 200 },
    },
    {
      id: "3",
      type: "customNode",
      data: { title: "Subtopic B", text: "Explanatory text for Subtopic B." },
      position: { x: 400, y: 200 },
    },
    // Example annotation node
    {
      id: "4",
      type: "annotationNode",
      data: {
        level: "1",
        label: "An example annotation",
        arrowStyle: { color: "red" },
      },
      position: { x: 150, y: 400 },
    },
  ];

  const initialEdges = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      label: "Edge to Subtopic A",
      type: "smoothstep",
      style: { stroke: "#ff0000", strokeWidth: 4 }, // Red color and 2px width
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      label: "Edge to Subtopic B",
      type: "smoothstep",
      style: { stroke: "#ff0000", strokeWidth: 4 }, // Red color and 2px width
    },

  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ========== CONNECTING EDGES ==========
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, label: "New Edge Label", type: "smoothstep" }, eds)
      ),
    [setEdges]
  );

  // ========== RIGHT-CLICK EDGE => EDIT ==========
  const onEdgeContextMenu = useCallback((evt, edge) => {
    evt.preventDefault();
    setSelectedEdge(edge);
    setEdgeLabel(edge.label || "");
    setIsEdgeModalOpen(true);
  }, []);

  const handleSaveEdgeLabel = () => {
    if (!selectedEdge) return;
    setEdges((eds) =>
      eds.map((e) => (e.id === selectedEdge.id ? { ...e, label: edgeLabel } : e))
    );
    setIsEdgeModalOpen(false);
    setSelectedEdge(null);
  };

  const handleCloseEdgeModal = () => {
    setIsEdgeModalOpen(false);
    setSelectedEdge(null);
  };

  // ========== RIGHT-CLICK NODE => EDIT ==========
  const onNodeContextMenu = useCallback((evt, node) => {
    evt.preventDefault();
    setSelectedNode(node);

    if (node.type === "customNode") {
      setNodeTitle(node.data.title || "");
      setNodeText(node.data.text || "");
      setAnnotationLevel(""); // clear these
      setAnnotationLabel("");
    } else if (node.type === "annotationNode") {
      setAnnotationLevel(node.data.level || "");
      setAnnotationLabel(node.data.label || "");
      setNodeTitle(""); // clear these
      setNodeText("");
    }
    setIsNodeModalOpen(true);
  }, []);

  const handleSaveNode = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== selectedNode.id) return n;

        // For a "customNode"
        if (n.type === "customNode") {
          return {
            ...n,
            data: {
              ...n.data,
              title: nodeTitle,
              text: nodeText,
            },
          };
        }

        // For an "annotationNode"
        if (n.type === "annotationNode") {
          return {
            ...n,
            data: {
              ...n.data,
              level: annotationLevel,
              label: annotationLabel,
            },
          };
        }

        return n;
      })
    );

    setIsNodeModalOpen(false);
    setSelectedNode(null);
  };

  const handleCloseNodeModal = () => {
    setIsNodeModalOpen(false);
    setSelectedNode(null);
  };

  // ========== AUTO-LINKING ==========
  const getClosestEdge = useCallback(
    (node) => {
      const { nodeLookup } = store.getState();
      const internalNode = getInternalNode(node.id);

      const closestNode = Array.from(nodeLookup.values()).reduce(
        (res, n) => {
          if (n.id !== internalNode.id) {
            const dx =
              n.internals.positionAbsolute.x -
              internalNode.internals.positionAbsolute.x;
            const dy =
              n.internals.positionAbsolute.y -
              internalNode.internals.positionAbsolute.y;
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
        closestNode.node.internals.positionAbsolute.x <
        internalNode.internals.positionAbsolute.x;

      return {
        id: closeNodeIsSource
          ? `${closestNode.node.id}-${node.id}`
          : `${node.id}-${closestNode.node.id}`,
        source: closeNodeIsSource ? closestNode.node.id : node.id,
        target: closeNodeIsSource ? node.id : closestNode.node.id,
        label: "Auto-Linked Edge",
        type: "smoothstep",
      };
    },
    [store, getInternalNode]
  );

  const onNodeDrag = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");
        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          closeEdge.className = "temp";
          nextEdges.push(closeEdge);
        }
        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");
        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          nextEdges.push(closeEdge);
        }
        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  // Add a new normal node
  const addNewNode = useCallback(() => {
    setNodes((prevNodes) => {
      const newId = `${prevNodes.length + 1}`;
      const newNode = {
        id: newId,
        type: "customNode",
        data: {
          title: `New Node ${newId}`,
          text: `Description for node ${newId}`,
        },
        position: { x: Math.random() * 600, y: Math.random() * 400 },
      };
      return [...prevNodes, newNode];
    });
  }, [setNodes]);

  // Add a new annotation node
  const addNewAnnotation = useCallback(() => {
    setNodes((prevNodes) => {
      const newId = `${prevNodes.length + 1}`;
      const newNode = {
        id: newId,
        type: "annotationNode",
        data: {
          level: newId,
          label: `Annotation text ${newId}`,
          arrowStyle: { color: "green" },
        },
        position: { x: Math.random() * 600, y: Math.random() * 400 },
      };
      return [...prevNodes, newNode];
    });
  }, [setNodes]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Buttons to add a normal node or an annotation node */}
      <button
        onClick={(event) => {
          event.stopPropagation();
          addNewNode();
        }}
        style={{
          position: "absolute",
          top: 10,
          right: 140,
          padding: "8px 12px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        + Add Node
      </button>

      <button
        onClick={(event) => {
          event.stopPropagation();
          addNewAnnotation();
        }}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "8px 12px",
          backgroundColor: "darkorange",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        + Add Annotation
      </button>

      <div style={{ width: "100%", height: "500px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          // Right-click a node => edit node
          onNodeContextMenu={onNodeContextMenu}
          // Right-click an edge => edit edge
          onEdgeContextMenu={onEdgeContextMenu}
          fitView
          style={{ width: "100%", height: "100%" }}
          nodeTypes={{
            customNode: CustomNode,
            annotationNode: AnnotationNode,
          }}
        >
          <Background />
        </ReactFlow>
      </div>

      {/* ========== MODAL for Edge Editing ========== */}
      <Modal isOpen={isEdgeModalOpen} onClose={handleCloseEdgeModal}>
        <h2>Edit Edge Label</h2>
        <input
          type="text"
          value={edgeLabel}
          onChange={(e) => setEdgeLabel(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button onClick={handleSaveEdgeLabel} style={{ marginRight: "0.5rem" }}>
          Save
        </button>
        <button onClick={handleCloseEdgeModal}>Cancel</button>
      </Modal>

      {/* ========== MODAL for Node Editing ========== */}
      <Modal isOpen={isNodeModalOpen} onClose={handleCloseNodeModal}>
        {selectedNode?.type === "customNode" && (
          <>
            <h2>Edit Regular Node</h2>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Title:
              </label>
              <input
                type="text"
                value={nodeTitle}
                onChange={(e) => setNodeTitle(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Text:
              </label>
              <textarea
                value={nodeText}
                onChange={(e) => setNodeText(e.target.value)}
                style={{ width: "100%", height: "80px" }}
              />
            </div>
          </>
        )}

        {selectedNode?.type === "annotationNode" && (
          <>
            <h2>Edit Annotation</h2>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Level:
              </label>
              <input
                type="text"
                value={annotationLevel}
                onChange={(e) => setAnnotationLevel(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Label:
              </label>
              <textarea
                value={annotationLabel}
                onChange={(e) => setAnnotationLabel(e.target.value)}
                style={{ width: "100%", height: "80px" }}
              />
            </div>
          </>
        )}

        <button onClick={handleSaveNode} style={{ marginRight: "0.5rem" }}>
          Save
        </button>
        <button onClick={handleCloseNodeModal}>Cancel</button>
      </Modal>
    </div>
  );
}

// Wrap with ReactFlowProvider
export default () => (
  <ReactFlowProvider>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "1rem", background: "#fff" }}>
          <h2>Concept Map: Right-Click Node/Edge & Annotation Support</h2>
          <ConceptMap />
        </main>
      </div>
    </div>
  </ReactFlowProvider>
);

import React from "react";
import { ReactFlow, Background } from "reactflow";
import "reactflow/dist/style.css";
import { Link } from "react-router-dom";
import { Handle, Position } from "reactflow";

function CustomNode({ data }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "10px",
        background: "#fff",
        width: 140,
        color: "#1d2125",
      }}
    >
      <h4 style={{ margin: 0 }}>{data.title}</h4>
      <p style={{ marginTop: "4px", fontSize: "0.85rem" }}>{data.text}</p>
      {/* Add Handles */}
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
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
          fontFamily: "'Tillana', serif",
          fontSize: "1.1rem",
        }}
      >
        <div>Annotation {data.level}:</div>
        <div>{data.label}</div>
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
        ></div>
      )}
    </div>
  );
}

interface ConceptMapViewProps {
  nodes: Array<{
    id: string;
    type: string;
    data: { title?: string; text?: string; level?: string; label?: string };
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    type?: string;
    style?: { stroke: string; strokeWidth: number };
  }>;
}

function ConceptMapView({ nodes, edges }: ConceptMapViewProps) {
  console.log("nodes", nodes);
  console.log("edges", edges);

  // Customize edge styles
  const styledEdges = edges.map((edge) => ({
    ...edge,
    style: {
      stroke: "white", // White color for edges
      strokeWidth: 2, // Adjust thickness as needed
    },
  }));

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Link to the full editor */}
      <Link
        to="/concept-map/edit" // Replace with your actual edit route
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "8px 12px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 10,
          textDecoration: "none",
        }}
      >
        Edit Concept Map
      </Link>

      {/* Concept Map */}
      <div style={{ width: "100%", height: "500px" }}>
        <ReactFlow
          nodes={nodes}
          edges={styledEdges} // Use the styled edges
          nodesDraggable={false} // Disable dragging
          nodesConnectable={false} // Disable connecting nodes
          elementsSelectable={false} // Disable selecting nodes/edges
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
    </div>
  );
}

export default ConceptMapView;

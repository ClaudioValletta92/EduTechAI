// CustomNode.js
import React from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data }) => {
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
};

export default CustomNode;

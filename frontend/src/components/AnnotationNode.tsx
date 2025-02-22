// src/components/AnnotationNode.js
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
 
function AnnotationNode({ data }) {
  return (
    <div style={{ position: "relative", width: 200, padding: 10 }}>
      <div className="annotation-content" style={{ border: "1px solid #ccc", borderRadius: 6, padding: 10, background: "#fff" }}>
        <div className="annotation-level" style={{ fontWeight: "bold" }}>
          {data.level}.
        </div>
        <div>{data.label}</div>
      </div>

      {/* Optional arrow symbol/position */}
      {data.arrowStyle && (
        <div
          className="annotation-arrow"
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

      {/* If you still want to connect edges from an annotation node, keep handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
 
export default memo(AnnotationNode);

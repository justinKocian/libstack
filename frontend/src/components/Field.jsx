import React from "react";

export default function Field({ label, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

export function getTheme(dark) {
  if (dark) {
    return {
      bg: "#0b0f14",
      fg: "#e6edf3",
      muted: "#9aa4af",
      border: "#263142",
      card: "#111827",
      buttonBg: "#1f2937",
      buttonFg: "#e6edf3",
      codeBg: "#0f172a",
      sidebarBg: "#0c1220",
      sidebarItemHover: "#111b2d",
      accent: "#60a5fa",
      warn: "#f59e0b",
      danger: "#fb7185",
      success: "#34d399",
      rowHover: "#0f172a",
      rowSelected: "#111b2d",
    };
  }

  return {
    bg: "#ffffff",
    fg: "#111827",
    muted: "#4b5563",
    border: "#e5e7eb",
    card: "#ffffff",
    buttonBg: "#111827",
    buttonFg: "#ffffff",
    codeBg: "#f3f4f6",
    sidebarBg: "#f9fafb",
    sidebarItemHover: "#f3f4f6",
    accent: "#2563eb",
    warn: "#b45309",
    danger: "#e11d48",
    success: "#059669",
    rowHover: "#f9fafb",
    rowSelected: "#eef2ff",
  };
}

export function getStyles(theme) {
  const headerButtonStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    background: theme.card,
    color: theme.fg,
    cursor: "pointer",
  };

  const primaryButtonStyle = {
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.buttonBg,
    color: theme.buttonFg,
    cursor: "pointer",
  };

  const dangerButtonStyle = {
    ...primaryButtonStyle,
    background: theme.danger,
    border: `1px solid ${theme.danger}`,
  };

  const disabledButtonStyle = {
    opacity: 0.55,
    cursor: "not-allowed",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.card,
    color: theme.fg,
    outline: "none",
  };

  return {
    headerButtonStyle,
    primaryButtonStyle,
    dangerButtonStyle,
    disabledButtonStyle,
    inputStyle,
  };
}

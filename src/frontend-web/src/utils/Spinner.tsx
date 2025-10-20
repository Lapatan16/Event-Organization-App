const Spinner = () => (
  <div style={overlayStyle}>
    <div style={spinnerStyle}></div>
    <p style={textStyle}>Učitavanje...</p>
  </div>
);

const overlayStyle: React.CSSProperties = {
  position: 'absolute', // KEY CHANGE: fixed -> absolute
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  // backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backgroundColor: 'rgba(255, 255, 255, 0.0)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10, // just needs to be above your content
};


const spinnerStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  border: '6px solid #ccc',
  borderTop: '6px solid #0d6efd',
  // borderTop: '6px solid #3A66E5',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const textStyle: React.CSSProperties = {
  marginTop: '1rem',
  fontSize: '1.2rem',
  color: '#555',
};

// Add the keyframes manually
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default Spinner;

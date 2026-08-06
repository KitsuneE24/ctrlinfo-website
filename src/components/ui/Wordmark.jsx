// Logotype « Alert NC ».
export default function Wordmark({ size = 20, withLogo = true }) {
  return (
    <span className="wordmark">
      {withLogo && (
        <img
          src="/Logo_alerte_NC-02.png"
          alt=""
          aria-hidden="true"
          className="wordmark__logo"
          style={{ width: size + 6, height: size + 6 }}
        />
      )}
      <span className="wordmark__text" style={{ fontSize: size }}>
        Alert NC
      </span>
    </span>
  )
}

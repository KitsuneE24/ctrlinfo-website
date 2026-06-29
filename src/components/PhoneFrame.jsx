export default function PhoneFrame({ children }) {
  // Fills the parent container exactly (used inside the game window).
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">{children}</div>
  )
}

export default function PhoneFrame({ children }) {
  return (
    <div className="md:min-h-screen md:flex md:items-center md:justify-center md:bg-[#f0eff4]">
      <div className="relative w-full h-dvh md:w-[375px] md:h-[720px] md:rounded-[36px] md:border-[6px] md:border-[#1a1a1a] md:bg-black md:shadow-[0_24px_64px_rgba(0,0,0,0.30)]">
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[10px] bg-[#1a1a1a] rounded-b-[12px] z-20" />
        <div className="w-full h-full md:rounded-[28px] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

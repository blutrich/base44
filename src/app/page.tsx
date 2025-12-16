import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <main className="h-full w-full p-2 sm:p-4 md:p-6 flex flex-col overflow-hidden">
      {/* Animated Background Orbs - Desktop Only */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block -z-10">
        {/* Primary orange orb - top left */}
        <div
          className="bg-orb bg-orb-orange w-[500px] h-[500px] -top-48 -left-24 animate-subtle-float"
          style={{ animationDelay: '0s' }}
        />
        {/* Blue orb - bottom right */}
        <div
          className="bg-orb bg-orb-blue w-[600px] h-[600px] -bottom-64 -right-32 animate-subtle-float"
          style={{ animationDelay: '2s' }}
        />
        {/* Green orb - center right */}
        <div
          className="bg-orb bg-orb-green w-[400px] h-[400px] top-1/3 -right-20 animate-subtle-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Mobile Background - Simpler for performance */}
      <div className="fixed inset-0 sm:hidden -z-10 bg-gradient-to-br from-[#E8F4FD] via-[#FDF2E8] to-[#E8FDF4]" />

      {/* Content Container */}
      <div className="relative w-full max-w-2xl mx-auto flex flex-col flex-1 min-h-0">
        {/* Header Branding - Compact on mobile */}
        <header className="flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 flex-shrink-0 animate-fade-in-up">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <img
              src="/logo.png"
              alt="Community Knowledge"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md"
            />
          </div>

          {/* Brand Text */}
          <div className="text-center sm:text-right">
            <h1 className="font-display font-semibold text-[#1A1A2E] text-sm sm:text-base leading-tight">
              Base44
            </h1>
            <p className="text-[#6B7280] text-[10px] sm:text-xs">
              Community Q&A
            </p>
          </div>
        </header>

        {/* Chat Window - Takes remaining space */}
        <div className="flex-1 min-h-0 animate-fade-in-up delay-100">
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}

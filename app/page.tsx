export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <iframe
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        src="https://www.youtube.com/embed/KCVN-SuBBWM?autoplay=1&mute=1&loop=1&playlist=KCVN-SuBBWM&controls=0&playsinline=1&modestbranding=1&rel=0"
        title="Vídeo de fundo"
        allow="autoplay; encrypted-media"
      />
    </main>
  );
}

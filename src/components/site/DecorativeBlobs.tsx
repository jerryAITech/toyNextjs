export function DecorativeBlobs({ variant = "default" }: { variant?: "default" | "auth" }) {
  if (variant === "auth") {
    return (
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <svg className="absolute -left-24 -top-24 h-80 w-80 text-primary-100" viewBox="0 0 200 200" fill="currentColor">
          <path d="M45.3,-58.3C58.6,-49.5,69.2,-35.4,73.6,-19.7C78,-4,76.2,13.4,68.8,27.7C61.4,42,48.4,53.2,33.8,61.5C19.2,69.8,3,75.2,-13.6,74.3C-30.2,73.4,-47.2,66.2,-58.8,53.6C-70.4,41,-76.6,23,-77.1,4.6C-77.6,-13.8,-72.4,-32.6,-60.8,-45.8C-49.2,-59,-31.2,-66.6,-13.1,-68.4C5,-70.2,25.9,-67.1,45.3,-58.3Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute -bottom-32 -right-16 h-96 w-96 text-accent-100" viewBox="0 0 200 200" fill="currentColor">
          <path d="M39.6,-51.7C50.2,-42.6,56.6,-28.6,60.4,-13.6C64.2,1.5,65.4,17.6,59.1,30.6C52.8,43.6,39,53.5,23.9,60.1C8.8,66.7,-7.6,70,-22.9,66.1C-38.2,62.2,-52.4,51.1,-60.8,36.5C-69.2,21.9,-71.8,3.8,-68.1,-12.5C-64.4,-28.8,-54.4,-43.3,-41.4,-52.3C-28.4,-61.3,-14.2,-64.8,0.8,-66.1C15.8,-67.4,29,-60.8,39.6,-51.7Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute bottom-10 left-6 h-12 w-12 text-sun-300 sm:left-10" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2-6.3-4.5-6.3 4.5L8 13.6l-6-4.4h7.6z" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg className="absolute -left-16 -top-20 h-72 w-72 text-primary-100 sm:h-96 sm:w-96" viewBox="0 0 200 200" fill="currentColor">
        <path d="M44.9,-58.3C57.7,-49.4,67,-34.9,71.3,-19C75.6,-3.1,74.9,14.2,67.8,28.6C60.7,43,47.2,54.5,32.1,62C17,69.5,0.3,73,-16.4,71.3C-33.1,69.6,-49.8,62.7,-60.6,50.1C-71.4,37.5,-76.3,19.2,-76.1,1.2C-75.9,-16.9,-70.6,-33.8,-59.9,-43.4C-49.2,-53,-33.1,-55.3,-18.6,-62.5C-4.1,-69.7,8.8,-81.8,21.9,-79.9C35,-78,44.9,-67.2,44.9,-58.3Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute -right-20 top-10 h-64 w-64 text-accent-100 sm:h-80 sm:w-80" viewBox="0 0 200 200" fill="currentColor">
        <path d="M39.9,-51.6C51.4,-43.6,59.8,-30.5,63.9,-15.9C68,-1.3,67.8,14.8,61.4,28.2C55,41.6,42.4,52.3,28,58.8C13.6,65.3,-2.6,67.6,-18.1,64.2C-33.6,60.8,-48.4,51.7,-58.1,38.6C-67.8,25.5,-72.4,8.4,-70.2,-7.6C-68,-23.6,-59,-38.5,-46.4,-46.8C-33.8,-55.1,-17.6,-56.7,-1.1,-55.2C15.4,-53.7,28.4,-59.6,39.9,-51.6Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute bottom-0 left-1/4 h-10 w-10 text-sun-400 opacity-70" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2-6.3-4.5-6.3 4.5L8 13.6l-6-4.4h7.6z" />
      </svg>
      <svg className="absolute right-1/4 top-1/3 h-6 w-6 text-mint-400 opacity-60" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="12" />
      </svg>
    </div>
  );
}

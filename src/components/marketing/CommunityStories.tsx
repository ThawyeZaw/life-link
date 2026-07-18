// CommunityStories — liquid glass testimonial grid with Myanmar donor stories
// Thinzar Kyaw — Frontend Domain

const STORIES = [
  {
    quote:
      "I got the ping at 2 AM — a CRITICAL O+ request at Yangon General Hospital. Twenty minutes later I was donating. That patient is alive today.",
    name: "Ko Aung",
    location: "Sanchaung, Yangon",
    initials: "KA",
  },
  {
    quote:
      "As an AB- donor, requests for my type are rare but desperate. LifeLink found me when Asia Royal Hospital had no stock left. I felt like a hero.",
    name: "Ma Thida",
    location: "Mingalar Taung Nyunt, Yangon",
    initials: "MT",
  },
  {
    quote:
      "My father needed three units after surgery. Two urgent requests, two donors matched within the hour. This platform saved my family.",
    name: "U Kyaw Zin",
    location: "Bahan, Yangon",
    initials: "KZ",
  },
];

export const CommunityStories = () => {
  return (
    <section className="bg-water-subtle water-ripple px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
            Stories from the community
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Real donors. Real hospitals. Real lives saved across Yangon.
          </p>
        </div>

        {/* Stories grid — liquid glass cards */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STORIES.map((story) => (
            <figure
              key={story.name}
              className="glass-elevated rounded-2xl p-8 transition-all duration-300 hover:float-card"
            >
              <blockquote className="leading-relaxed text-slate-700">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {story.initials}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{story.name}</p>
                  <p className="text-sm text-slate-500">{story.location}</p>
                </div>
              </figcaption>
              {/* Subtle top-edge light refraction */}
              <div className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

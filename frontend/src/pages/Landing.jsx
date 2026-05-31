import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const features = [
  {
    title: 'Urgent alerts',
    description: 'Hospitals broadcast critical blood needs; nearby donors get instant notifications.',
    icon: '🚨',
  },
  {
    title: 'Location-based matching',
    description: 'Geo search connects the right blood type with donors closest to the emergency.',
    icon: '📍',
  },
  {
    title: 'Eligibility tracking',
    description: 'Automatic 90-day cooldown after donations keeps donors safe and compliant.',
    icon: '✅',
  },
  {
    title: 'Real-time updates',
    description: 'Socket.io powers live request, response, and fulfillment notifications.',
    icon: '⚡',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <span className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-2xl">🩸</span>
            Emergency Blood Connector
          </span>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center lg:px-6 lg:py-28">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-red-400">
          Real-time emergency blood network
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Connect hospitals with verified donors{' '}
          <span className="text-red-500">when every minute counts</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          A bridge between healthcare facilities and local donors — urgent alerts,
          smart matching, and live coordination in one platform.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button className="px-8 py-3 text-base">Register as donor</Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" className="px-8 py-3 text-base">
              Register hospital
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-left"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Emergency Blood Connector · MERN stack · React + Tailwind + Socket.io
      </footer>
    </div>
  );
}

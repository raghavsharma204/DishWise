import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link className="text-sm underline underline-offset-4 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" href="/">
          Back to DishWise
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated September 17, 2026</p>
        <div className="mt-8 space-y-6 text-slate-700">
          <p>
            DishWise is currently a project preview. Recommendations, accounts, and Google sign-in are not available on this site yet. This policy describes the preview as it exists today and will be updated before those features become available.
          </p>
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Information used by this preview</h2>
            <p className="mt-2">
              The page requests the DishWise API health endpoint to show whether it responds. You do not enter a name, location, craving, or food preference here. DishWise does not currently collect Google account data through this site.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Hosting</h2>
            <p className="mt-2">
              The web and API hosting providers may process technical request information, such as an IP address, to deliver the site and API response. DishWise does not use that information to build a food preference profile in this preview.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">
              DishWise is maintained by Raghav Sharma. Contact the project owner through the public {" "}
              <a className="underline underline-offset-4 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" href="https://github.com/raghavsharma204/DishWise/issues">
                GitHub issues page
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

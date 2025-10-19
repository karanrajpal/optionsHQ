import Link from "next/link";

export const metadata = {
    title: "About · Options Journal",
    description:
        "Options Journal — view historical performance and discover patterns and opportunities in option strategies.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        About OptionsHQ
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                        A lightweight journal for option strategies — built to view historical
                        performance and help identify great opportunities and repeatable patterns.
                    </p>
                </header>

                <section className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            What this is
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            OptionsHQ catalogs trade outcomes, visualizes historical results,
                            and makes it easier to analyze which setups, timing, and adjustments
                            have worked best over time.
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            Key benefits
                        </h3>
                        <ul className="mt-3 list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                            <li>Track historical performance of strategies and trades</li>
                            <li>Filter and search to find recurring patterns and edge</li>
                            <li>Quickly compare outcomes by market regime, underlying, and timeframe</li>
                            <li>Use insights to surface high-probability opportunities</li>
                        </ul>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>
                            If you have feedback or ideas for additional analyses, reach out — this
                            tool is meant to grow with your workflow.
                        </p>
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-block rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                        >
                            Back to dashboard
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
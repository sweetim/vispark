// https://img.youtube.com/vi/<VIDEO_ID>/mqdefault.jpg
const summaries = [
	{
		id: "1",
		videoTitle: "React Hooks Tutorial",
		summary:
			"A comprehensive guide to understanding and using React Hooks, including useState, useEffect, and custom hooks.",
		thumbnailUrl: "https://i.ytimg.com/vi/example1/hqdefault.jpg",
	},
	{
		id: "2",
		videoTitle: "Next.js vs. Remix: A Deep Dive",
		summary:
			"This video compares two popular React frameworks, Next.js and Remix, exploring their features, performance, and use cases.",
		thumbnailUrl: "https://i.ytimg.com/vi/example2/hqdefault.jpg",
	},
	{
		id: "3",
		videoTitle: "Building a REST API with Node.js and Express",
		summary:
			"Learn how to build a robust REST API from scratch using Node.js, Express, and MongoDB for data persistence.",
		thumbnailUrl: "https://i.ytimg.com/vi/example3/hqdefault.jpg",
	},
	{
		id: "4",
		videoTitle: "Mastering TypeScript in 2025",
		summary:
			"A complete guide to TypeScript, covering everything from basic types to advanced features like generics and decorators.",
		thumbnailUrl: "https://i.ytimg.com/vi/example4/hqdefault.jpg",
	},
];

const SummariesPage = () => {
	return (
		<div className="bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{summaries.map((summary) => (
						<div
							key={summary.id}
							className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
						>
							<img
								src={summary.thumbnailUrl}
								alt={summary.videoTitle}
								className="w-full h-48 object-cover"
							/>
							<div className="p-6">
								<h2 className="text-xl font-semibold text-white mb-2">
									{summary.videoTitle}
								</h2>
								<p className="text-gray-400 text-sm">{summary.summary}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default SummariesPage;

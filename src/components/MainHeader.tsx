import { Link } from "@heroui/react";

export function MainHeader() {
	return (
		<div className="flex justify-end px-2 py-2 md:px-4 md:py-4 lg:px-8 lg:py-8 xl:px-16">
			<Link
				href="https://github.com/matthiashermsen/kevin-chromik-hackathon-december-2025"
				target="blank_"
			>
				Repository
				<Link.Icon />
			</Link>
		</div>
	);
}

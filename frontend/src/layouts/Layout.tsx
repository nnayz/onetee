import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, matchPath } from "react-router-dom";

interface LayoutProps {
	children: React.ReactNode;
	hideFooter?: boolean;
	noFooterRoutes?: string[]; // e.g., ["/login", "/u/:username", "/thread/:id"]
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false, noFooterRoutes = [] }) => {
	const location = useLocation();
	const matchedNoFooter = noFooterRoutes.some((pattern) => !!matchPath(pattern, location.pathname));
	const shouldHideFooter = hideFooter || matchedNoFooter;

	return (
		<div className="flex flex-col min-h-screen bg-white">
			<Navbar />
				{children}
			{!shouldHideFooter && (
				<div className="flex-shrink-0">
					<Footer />
				</div>
			)}
		</div>
	);
};

export default Layout;
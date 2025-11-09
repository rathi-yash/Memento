import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NAV_HEIGHT } from "@/lib/constants";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Navbar />
            <Sidebar />

            <TooltipProvider>
                <main
                    style={{
                        paddingTop: NAV_HEIGHT + "px",
                    }}
                    className="w-screen overflow-x-hidden pl-16 bg-white"
                >
                    {children}
                </main>
            </TooltipProvider>
        </>
    );
};
export default Layout;

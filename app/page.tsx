import CompanionCard from "@/components/companionCard";
import CompanionsList from "@/components/companionList";
import CTA from "@/components/cta";
import {getAllCompanions, getRecentSessions} from "@/lib/actions/companion.actions";
import {getSubjectColor} from "@/lib/utils";

const Page = async () => {
    let companions = [];
    let recentSessionsCompanions = [];

    try {
        companions = await getAllCompanions({ limit: 3 });
    } catch (error) {
        console.error("Failed to fetch companions:", error);
    }

    try {
        recentSessionsCompanions = await getRecentSessions(10);
    } catch (error) {
        console.error("Failed to fetch recent sessions:", error);
    }

    return (
        <main>
            <h1>Popular Companions</h1>

            <section className="home-section">
                {companions && companions.length > 0 ? (
                    companions.map((companion) => (
                        <CompanionCard
                            {...companion}
                            key={companion.id}
                            color={getSubjectColor(companion.subject)}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No companions available yet. Create your first companion!</p>
                    </div>
                )}
            </section>

            <section className="home-section">
                <CompanionsList
                    title="Recently completed sessions"
                    companions={recentSessionsCompanions || []}
                    classNames="w-2/3 max-lg:w-full"
                />
                <CTA />
            </section>
        </main>
    )
}

export default Page
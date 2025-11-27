import CompanionCard from "@/components/companionCard";
import CompanionsList from "@/components/companionList";
import CTA from "@/components/cta";
import {recentSessions} from "@/constants";
import {getAllCompanions, getRecentSessions} from "@/lib/actions/companion.actions";
import {getSubjectColor} from "@/lib/utils";

const Page = async () => {
    const companions = await getAllCompanions({ limit: 3 });
    const recentSessionsCompanions = await getRecentSessions(10);

    return (
        <main>
            <h1>Popular Companions</h1>

            <section className="home-section">
                {companions.map((companion, ) => (
                    <CompanionCard
                        {...companion}
                        key={companion.id}
                        color={getSubjectColor(companion.subject)}
                    />
                ))}

            </section>

            <section className="home-section">
                <CompanionsList
                    title="Recently completed sessions"
                    companions={recentSessionsCompanions}
                    classNames="w-2/3 max-lg:w-full"
                />
                <CTA />
            </section>
        </main>
    )
}

export default Page
import CompanionCard from "@/components/companionCard";
import CompanionsList from "@/components/companionList";
import CTA from "@/components/cta";
import {recentSessions} from "@/constants";
// import {getAllCompanions, getRecentSessions} from "@/lib/actions/companion.actions";
import {getSubjectColor} from "@/lib/utils";

const Page = async () => {
    // const companions = await getAllCompanions({ limit: 3 });
    // const recentSessionsCompanions = await getRecentSessions(10);

    const companions = [{
        id:"123",
        name:"Neura the Brainy Explorer",
        topic:"Neural Network of the Brain",
        subject:"science",
        duration:45,
        color:"#ffda6e"

    },{
        id:"456",
        name:"Countsy the Number Wizard",
        topic:"Derivatives & Integrals",
        subject:"maths",
        duration:30,
        color:"#e5d0ff"
    }, {
        id:"789",
        name:"Verba the Vocabulary Builder",
        topic:"language",
        subject:"English Literature",
        duration:60,
        color:"#BDE7FF"
    }
    ]
    return (
        <main>
            <h1>Popular Companions</h1>

            <section className="home-section">
                {companions.map((companion, ) => (
                    <CompanionCard
                        id={companion.id}
                        bookmarked={false}
                        key={companion.id}
                        name={companion.name}
                        topic={companion.topic}
                        subject={companion.subject}
                        duration={companion.duration}
                        color={companion.color}
                    />
                ))}

            </section>

            <section className="home-section">Add commentMore actions
                <CompanionsList
                    title="Recently completed sessions"
                    companions={recentSessions}
                    classNames="w-2/3 max-lg:w-full"
                />
                <CTA />
            </section>
        </main>
    )
}

export default Page
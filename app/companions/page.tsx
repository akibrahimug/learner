import {getAllCompanions} from "@/lib/actions/companion.actions";
import CompanionCard from "@/components/companionCard";
import {getSubjectColor} from "@/lib/utils";
import SearchInput from "@/components/searchInput";
import SubjectFilter from "@/components/subjectFilter";
import Link from "next/link";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
    const filters = await searchParams;
    const subject = filters.subject ? filters.subject : '';
    const topic = filters.topic ? filters.topic : '';

    let companions = [];

    try {
        companions = await getAllCompanions({ subject, topic });
    } catch (error) {
        console.error('Error fetching companions:', error);
    }

    return (
        <main>
            <section className="flex justify-between gap-4 max-sm:flex-col">
                <h1>Companion Library</h1>
                <div className="flex gap-4">
                    <SearchInput />
                    <SubjectFilter />
                </div>
            </section>
            <section className="companions-grid">
                {companions && companions.length > 0 ? (
                    companions.map((companion) => (
                        <CompanionCard
                            key={companion.id}
                            {...companion}
                            color={getSubjectColor(companion.subject)}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 col-span-full">
                        <h2 className="text-2xl font-bold mb-4">No Companions Found</h2>
                        <p className="text-gray-600 mb-6">
                            {subject || topic
                                ? "Try adjusting your filters or create a new companion."
                                : "Be the first to create a companion!"}
                        </p>
                        <Link href="/companions/new" className="btn-primary inline-flex">
                            Create Your First Companion
                        </Link>
                    </div>
                )}
            </section>
        </main>
    )
}

export default CompanionsLibrary
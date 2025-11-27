import {PricingTable} from "@clerk/nextjs";
import { Suspense } from "react";

const PricingTableWrapper = () => {
    try {
        return <PricingTable />;
    } catch (error) {
        console.error("PricingTable error:", error);
        return <PricingTableFallback />;
    }
};

const PricingTableFallback = () => {
    return (
        <div className="max-w-4xl mx-auto p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
            <p className="text-lg text-gray-600 mb-8">
                Unlock unlimited companions and premium features with our Pro plan.
            </p>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <p className="text-gray-500">
                    Subscription plans are being configured. Please check back soon or contact support for assistance.
                </p>
            </div>
        </div>
    );
};

const LoadingFallback = () => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading subscription plans...</p>
            </div>
        </div>
    );
};

const Subscription = () => {
    return (
        <main>
            <Suspense fallback={<LoadingFallback />}>
                <PricingTableWrapper />
            </Suspense>
        </main>
    )
}

export default Subscription
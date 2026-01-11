'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient, createSupabaseServerClient} from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    try {
        const supabase = createSupabaseClient();

        let query = supabase.from('companions').select();

        if(subject && topic) {
            query = query.ilike('subject', `%${subject}%`)
                .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
        } else if(subject) {
            query = query.ilike('subject', `%${subject}%`)
        } else if(topic) {
            query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
        }

        query = query.range((page - 1) * limit, page * limit - 1);

        const { data: companions, error } = await query;

        if(error) {
            console.error('Error fetching companions:', error.message);
            return [];
        }

        return companions || [];
    } catch (error) {
        console.error('Unexpected error in getAllCompanions:', error);
        return [];
    }
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10) => {
    try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from('session_history')
            .select(`companions:companion_id (*)`)
            .order('created_at', { ascending: false })
            .limit(limit)

        if(error) {
            console.error('Error fetching recent sessions:', error.message);
            return [];
        }

        if (!data) return [];

        return data.map(({ companions }) => companions).filter(Boolean);
    } catch (error) {
        console.error('Unexpected error in getRecentSessions:', error);
        return [];
    }
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
    try {
        const { userId, has } = await auth();

        if (!userId) {
            console.error('No user ID found');
            return true; // Allow creation if auth check fails
        }

        const supabase = createSupabaseServerClient();
        let limit = 3; // Default limit for free users

        try {
            // Check if user has subscription features
            if(has && has({ plan: 'pro' })) {
                return true;
            } else if(has && has({ feature: "3_companion_limit" })) {
                limit = 3;
            } else if(has && has({ feature: "10_companion_limit" })) {
                limit = 10;
            }
        } catch (error) {
            // Fallback to default limit if Clerk subscription check fails
            console.error('Clerk subscription check failed, using default limit:', error);
        }

        const { data, error } = await supabase
            .from('companions')
            .select('id', { count: 'exact' })
            .eq('author', userId)

        if(error) {
            console.error('Error checking companion count:', error.message);
            return true; // Allow creation if database check fails
        }

        const companionCount = data?.length || 0;

        return companionCount < limit;
    } catch (error) {
        console.error('Unexpected error in newCompanionPermissions:', error);
        return true; // Fail open - allow creation on error
    }
}

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("bookmarks").insert({
        companion_id: companionId,
        user_id: userId,
    });
    if (error) {
        throw new Error(error.message);
    }
    // Revalidate the path to force a re-render of the page

    revalidatePath(path);
    return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("companion_id", companionId)
        .eq("user_id", userId);
    if (error) {
        throw new Error(error.message);
    }
    revalidatePath(path);
    return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from("bookmarks")
        .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
        .eq("user_id", userId);
    if (error) {
        throw new Error(error.message);
    }
    // We don't need the bookmarks data, so we return only the companions
    return data.map(({ companions }) => companions);
};
import { supabase } from "../../../services/supabase";

export async function joinCommunity(
  communityId,
  userId
) {
  const { data, error } =
    await supabase
      .from("community_members")
      .insert([
        {
          community_id: communityId,
          user_id: userId,
        },
      ]);

  return { data, error };
}

export async function getMembers(
  communityId
) {
  const { data, error } =
    await supabase
      .from("community_members")
      .select("*")
      .eq(
        "community_id",
        communityId
      );

  return { data, error };
}

export async function getUserCommunities(
  userId
) {
  const { data, error } =
    await supabase
      .from("community_members")
      .select(`
        community_id,
        communities (*)
      `)
      .eq("user_id", userId);

  if (error) {
    return { data: [], error };
  }

  return {
    data: data.map(
      (item) => item.communities
    ),
    error: null,
  };
}
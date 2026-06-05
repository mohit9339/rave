import { supabase } from "../../../services/supabase";

export async function createCommunity(
  communityData
) {
  const { data, error } =
    await supabase
      .from("communities")
      .insert([communityData])
      .select()
      .single();

  return { data, error };
}

export async function getCommunities() {
  const { data, error } =
    await supabase
      .from("communities")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return { data, error };
}

export async function getCommunityById(
  id
) {
  const { data, error } =
    await supabase
      .from("communities")
      .select("*")
      .eq("id", id)
      .single();

  return { data, error };
}

export async function getCommunityEvents(
  communityId
) {
  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq(
        "community_id",
        communityId
      );

  return { data, error };
}

export async function getCommunitiesForDropdown() {
  const { data, error } =
    await supabase
      .from("communities")
      .select("id,name")
      .order("name");

  return { data, error };
}
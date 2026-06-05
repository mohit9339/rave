import { supabase } from "../../../services/supabase";

export async function createPost(
  postData
) {
  const { data, error } =
    await supabase
      .from("community_posts")
      .insert([postData]);

  return { data, error };
}

export async function getPosts(
  communityId
) {
  const { data, error } =
    await supabase
      .from("community_posts")
      .select("*")
      .eq(
        "community_id",
        communityId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  return { data, error };
}
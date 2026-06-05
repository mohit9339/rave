import { supabase } from "../../../services/supabase";

export async function uploadEventImage(file) {
  const fileName =
    Date.now() + "-" + file.name;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(fileName, file);

  if (error) {
    return { error };
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("event-images")
    .getPublicUrl(fileName);

  return {
    publicUrl,
  };
}
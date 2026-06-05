import { supabase } from "../../../services/supabase";

export async function uploadVerificationFile(
  file
) {
  const fileName =
    Date.now() + "-" + file.name;

  const { error } =
    await supabase.storage
      .from("host-verification")
      .upload(fileName, file);

  if (error) {
    return { error };
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("host-verification")
    .getPublicUrl(fileName);

  return {
    publicUrl,
  };
}
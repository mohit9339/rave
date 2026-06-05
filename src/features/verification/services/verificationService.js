import { supabase } from "../../../services/supabase";

export async function submitVerification(
  verificationData
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "host_verifications"
    )
    .insert([
      verificationData,
    ])
    .select()
    .single();

  return {
    data,
    error,
  };
}

export async function getVerification(
  userId
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "host_verifications"
    )
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  return {
    data,
    error,
  };
}

export async function updateVerificationStatus(
  verificationId,
  status
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "host_verifications"
    )
    .update({
      status,
    })
    .eq(
      "id",
      verificationId
    )
    .select()
    .single();

  return {
    data,
    error,
  };
}
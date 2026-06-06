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

export async function getPendingVerifications() {
  return await supabase
    .from("host_verifications")
    .select("*")
    .eq("status", "pending");
}

export async function approveVerification(
  verificationId,
  userId
) {
  await supabase
    .from(
      "host_verifications"
    )
    .update({
      status:
        "approved",
    })
    .eq(
      "id",
      verificationId
    );

  return await supabase
    .from("users")
    .update({
      role: "host",
    })
    .eq("id", userId);
}


export async function rejectVerification(
  verificationId
) {
  return await supabase
    .from(
      "host_verifications"
    )
    .update({
      status:
        "rejected",
    })
    .eq(
      "id",
      verificationId
    );
}
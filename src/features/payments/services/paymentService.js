import { supabase } from "../../../services/supabase";

export async function submitPayment(paymentData) {
  const { data, error } = await supabase
    .from("payment_submissions")
    .insert([{ ...paymentData, status: "pending" }])
    .select()
    .single();

  return { data, error };
}

export async function getEventPayments(eventId) {
  const { data, error } = await supabase
    .from("payment_submissions")
    .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getUserPayments(userId) {
  const { data, error } = await supabase
    .from("payment_submissions")
    .select(`
      *,
      events (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function updatePaymentStatus(paymentId, status) {
  const { data, error } = await supabase
    .from("payment_submissions")
    .update({ status })
    .eq("id", paymentId)
    .select()
    .single();

  return { data, error };
}

export async function getPaymentById(paymentId) {
  const { data, error } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("id", paymentId)
    .single();

  return { data, error };
}

export async function hasSubmittedPayment(userId, eventId) {
  const { data, error } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  return { data, error };
}
import { supabase } from "../../../services/supabase";

export async function getHostedEvents(
  userId
) {
  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq("host_id", userId);

  return { data, error };
}

export async function getTicketsSold(
  eventId
) {
  const { count, error } =
    await supabase
      .from("tickets")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("event_id", eventId);

  return { count, error };
}
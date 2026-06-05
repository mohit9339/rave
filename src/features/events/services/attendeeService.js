import { supabase } from "../../../services/supabase";

export async function joinEvent(
  eventId,
  userId
) {
  const { data, error } =
    await supabase
      .from("attendees")
      .insert([
        {
          event_id: eventId,
          user_id: userId,
        },
      ]);

  return { data, error };
}

export async function getAttendees(
  eventId
) {
  const { data, error } =
    await supabase
      .from("attendees")
      .select("*")
      .eq("event_id", eventId);

  return { data, error };
}

export async function getJoinedEvents(
  userId
) {
  const { data, error } =
    await supabase
      .from("attendees")
      .select(`
        event_id,
        events (*)
      `)
      .eq("user_id", userId);

  if (error) {
    return { data: [], error };
  }

  return {
    data: data.map(
      (item) => item.events
    ),
    error: null,
  };
}

export async function getAttendeeCount(
  eventId
) {
  const { count, error } =
    await supabase
      .from("attendees")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("event_id", eventId);

  return { count, error };
}

export async function getEventAttendees(
  eventId
) {
  const { data, error } =
    await supabase
      .from("attendees")
      .select(`
        *,
        users (
          id,
          full_name,
          email,
          sex,
          date_of_birth
        )
      `)
      .eq("event_id", eventId);

  return { data, error };
}
export async function getJoinedEventIds(userId) {
  const { data, error } = await supabase
    .from("attendees")
    .select("event_id")
    .eq("user_id", userId);

  return {
    data: data ? data.map((r) => r.event_id) : [],
    error,
  };
}
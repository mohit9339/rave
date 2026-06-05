import { supabase } from "../../../services/supabase";

export async function createEvent(
  eventData
) {
  const { data, error } =
    await supabase
      .from("events")
      .insert([eventData])
      .select()
      .single();

  return { data, error };
}

export async function getEvents() {
  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq("is_cancelled", false)
      .order(
        "event_date",
        {
          ascending: true,
        }
      );

  return { data, error };
}

export async function getUpcomingEvents() {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq("is_cancelled", false)
      .gte(
        "event_date",
        today
      )
      .order(
        "event_date",
        {
          ascending: true,
        }
      );

  return { data, error };
}

export async function getPastEvents() {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq("is_cancelled", false)
      .lt(
        "event_date",
        today
      )
      .order(
        "event_date",
        {
          ascending: false,
        }
      );

  return { data, error };
}

export async function getEventById(
  id
) {
  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

  return { data, error };
}

export async function getHostedEvents(
  userId
) {
  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq(
        "host_id",
        userId
      )
      .order(
        "event_date",
        {
          ascending: true,
        }
      );

  return { data, error };
}

export async function getHostedUpcomingEvents(
  userId
) {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq(
        "host_id",
        userId
      )
      .gte(
        "event_date",
        today
      );

  return { data, error };
}

export async function getHostedPastEvents(
  userId
) {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .eq(
        "host_id",
        userId
      )
      .lt(
        "event_date",
        today
      );

  return { data, error };
}

export async function getEventFeatures(
  eventId
) {
  const { data, error } =
    await supabase
      .from("event_features")
      .select("*")
      .eq("event_id", eventId);

  return { data, error };
}

export async function cancelEvent(
  eventId
) {
  const { data, error } =
    await supabase
      .from("events")
      .update({
        is_cancelled: true,
      })
      .eq("id", eventId);

  return { data, error };
}

export async function updateEvent(
  eventId,
  updates
) {
  const { data, error } =
    await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .select()
      .single();

  return { data, error };
}

export async function restoreEvent(
  eventId
) {
  const { data, error } =
    await supabase
      .from("events")
      .update({
        is_cancelled: false,
      })
      .eq("id", eventId);

  return { data, error };
}

export async function duplicateEvent(
  event
) {
  const copy = {
    ...event,
  };

  delete copy.id;
  delete copy.created_at;

  copy.title =
    `${event.title} (Copy)`;

  const { data, error } =
    await supabase
      .from("events")
      .insert([copy])
      .select()
      .single();

  return { data, error };
}
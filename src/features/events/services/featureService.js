import { supabase } from "../../../services/supabase";

export async function saveFeatures(
  eventId,
  features
) {
  const rows = features.map(
    (feature) => ({
      event_id: eventId,
      feature_name: feature,
    })
  );

  const { data, error } =
    await supabase
      .from("event_features")
      .insert(rows);

  return { data, error };
}
import { connectDB } from "@/lib/db/connect";
import { SettingsModel } from "@/lib/models/Settings";

export async function getSettings() {
  await connectDB();
  let settings = await SettingsModel.findOne({ key: "singleton" });
  if (!settings) settings = await SettingsModel.create({ key: "singleton" });
  return settings;
}

export async function updateSettings(input: Record<string, unknown>) {
  await connectDB();
  const settings = await getSettings();
  Object.assign(settings, input);
  await settings.save();
  return settings;
}
